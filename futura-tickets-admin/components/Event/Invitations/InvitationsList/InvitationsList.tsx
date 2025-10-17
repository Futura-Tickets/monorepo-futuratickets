'use client';
import { useState, useEffect } from 'react';

// ANTD
import { Button, Form, DatePicker, Select, InputNumber, Empty } from 'antd';
import Input from 'antd/es/input/Input';
import Modal from 'antd/es/modal';
import { WarningOutlined, ReloadOutlined, MailOutlined } from '@ant-design/icons';

// SOCKET
import { socket } from '@/components/Socket';

// COMPONENTS
import Error from '@/shared/Error/Error';
import InvitationItem from './InvitationItem/InvitationItem';
import Loader from '@/shared/Loader/Loader';

// SERVICES
import { getEventInvitations, createInvitation as createInvitationService, getEvent, deleteInvitation, getOrder } from '@/shared/services';

// INTERFACES
import { Sale, Event, CreateInvitation, Order } from '@/shared/interfaces';

// STYLES
import './InvitationsList.scss';

// CONSTANTS
const INVITATIONS_ERROR = 'There was an error loading your invitations';
let socketIsInvitationSubscribed = false;

export default function InvitationsList({ eventId }: { eventId: string }) {

  const [form] = Form.useForm();
  const [invitations, setInvitations] = useState<Sale[]>([]);
  const [addInvitationModal, setAddInvitationModal] = useState<boolean>(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [newInvitationState, setNewInvitationState] = useState<Order>();
  
  const [ticketTypes, setTicketTypes] = useState<{ type: string; price: number }[]>([]);

  const [loader, setLoader] = useState<boolean>(true);
  const [createInvitationLoader, setCreateInvitationLoader] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const fetchEventDetails = async () => {
    try {

      const eventData = await getEvent(eventId);
      setEvent(eventData);
      
      const ticketTypes = eventData.tickets.map(ticket => ({
        type: ticket.type,
        price: ticket.price
      }));

      setTicketTypes(ticketTypes);
      
    } catch (error) {
      console.error("Error fetching event details", error);
    }
  };

  const fetchInvitations = async (): Promise<void> => {
    try {
      setLoader(true);

      const eventInvitations = await getEventInvitations(eventId);
      setInvitations(eventInvitations);

      setLoader(false);
    } catch (error) {
      setError(true);
      setLoader(false);
    }
  };

  const createInvitation = async (): Promise<void> => {
    try {

      setCreateInvitationLoader(true);
      
      const values = form.getFieldsValue();
      
      const selectedTicket = ticketTypes.find(ticket => ticket.type === values.ticketType);
      
      const invitationData: CreateInvitation = {
        event: eventId,
        item: {
          type: values.ticketType,
          amount: values.amount || 1,
          price: selectedTicket?.price || 0,
        },
        contactDetails: {
          name: values.name,
          lastName: values.surname,
          email: values.email,
          phone: values.phone,
        }
      };

      const createdInvitation = await createInvitationService(invitationData);
      const newInvitations: Sale[] = createdInvitation.sales.map((sale: Sale) => sale);

      setInvitations([...newInvitations, ...invitations]);
      
      form.resetFields();

      setAddInvitationModal(false);
      setCreateInvitationLoader(false);

    } catch (error) {
      console.error('Error creating invitation:', error);
      setCreateInvitationLoader(false);
    }
  };

  const handleAddInvitationOpen = (): void => {
    setAddInvitationModal(true);
  };

  const handleAddInvitationCancel = (): void => {
    form.resetFields();
    setAddInvitationModal(false);
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    try {
      await deleteInvitation(eventId, invitationId);
      fetchInvitations();
    } catch (error) {
      console.error('Error deleting invitation:', error);
    }
  };

  const subscribeInvitationEvent = (): void => {
    console.log('Subscribed to sale!');

    socketIsInvitationSubscribed = true;

    socket.on('ticket-minted', async (orderId: string) => {
      console.log('new invitation!');
      
      try {
        const orderDetails = await getOrder(orderId);
        
        if (orderDetails && event?._id === orderDetails.event) {
          setNewInvitationState(orderDetails);
        }
      } catch (error) {
        console.error('Error fetching invitation details:', error);
      }
    });
  };

  const updateInvitationList = (invitationOrder: Order) => {
    const newInvitationList = invitations.map((invitation: Sale) => {
      if (invitation._id == invitationOrder.sales[0]._id) return invitationOrder.sales[0];
      return invitation;
    });
    setInvitations(newInvitationList);
  };
  

  useEffect(() => {
    if (eventId) {
      fetchInvitations();
      fetchEventDetails();
    }
  }, [eventId]);

  useEffect(() => {
    event && socket && !socketIsInvitationSubscribed && subscribeInvitationEvent();
  }, [event, socket]);

  useEffect(() => {
    newInvitationState && updateInvitationList(newInvitationState);
  }, [newInvitationState]);

 
  if (error) return <Error errorMsg={INVITATIONS_ERROR} />;

  return (
    <>
      <div className='invitations-list-container'>
        <div className='invitations-list-header'>
          <h2>Invitations</h2>
          <Button
            size='large'
            className='view-details'
            onClick={handleAddInvitationOpen}
          >
            Create Invitation
          </Button>
        </div>

        <div className='invitations-list-info-content'>
          <div className='invitations-list-info-header'>
            <div className="details"><MailOutlined /></div>
            <div className="token-id">ID</div>
            <div className="email">Email</div>
            <div className="type">Type</div>
            <div className="status">Status</div>
            <div className="created">Created</div>
          </div>
          <div className='invitations-list-content'>
            {loader && <div className='no-invitations'>Loading invitations...</div>}
            {error && (
              <div className='error-state'>
                <Empty
                  image={<WarningOutlined className='error-icon' />}
                  imageStyle={{ height: 'auto' }}
                  className='error-empty'
                  description={
                    <div className='error-content'>
                      <p>Couldn't load any invitations</p>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchInvitations}
                        type='primary'
                        size='middle'
                        className='retry-button'
                      >
                        Retry
                      </Button>
                    </div>
                  }
                />
              </div>
            )}
            {(invitations.length > 0 && !loader && !error)&& 
              invitations.map((invitation: Sale, i: number) => {
                return <InvitationItem invitation={invitation} key={i} />;
              })
            }
            {(invitations.length == 0 && !loader && !error) && (
              <div className='no-invitations'>No invitations available</div>
            )}
          </div>
        </div>
      </div>
      <Modal
        title={null}
        open={addInvitationModal}
        onCancel={handleAddInvitationCancel}
        closable={true}
        footer={null}
        mask={true}
        centered>
            <div className='add-invitation-container'>
              <div className='add-invitation-header'>
                <h2>Send Invitations</h2>
              </div>
              <div className='add-invitation-content'>
                <Form form={form} layout='vertical'>
                  <Form.Item
                    name='name'
                    label='Name'
                    rules={[
                      {
                        required: true,
                        message: 'Introduce the name',
                      },
                    ]}
                  >
                    <Input size='large' placeholder='Name' />
                  </Form.Item>
    
                  <Form.Item
                    name='surname'
                    label='Surname'
                    rules={[
                      {
                        required: true,
                        message: 'Introduce the surname',
                      },
                    ]}
                  >
                    <Input size='large' placeholder='Surname' />
                  </Form.Item>
                  
                  <Form.Item
                    name='email'
                    label='Email'
                    rules={[
                      {
                        required: true,
                        message: 'Introduce the email',
                        type: 'email',
                      },
                    ]}
                  >
                    <Input size='large' placeholder='Email' />
                  </Form.Item>
                  <Form.Item
                    name='birthdate'
                    label='Birthdate'
                    rules={[
                      {
                        required: true,
                        message: 'Select your birthdate',
                      },
                    ]}
                  >
                    <DatePicker size='large' className='full-width-input' style = {{width: '100%'}}/>
                  </Form.Item>
    
                  <Form.Item
                    name='phone'
                    label='Phone'
                  >
                    <Input size='large' placeholder='Phone number' />
                  </Form.Item>
    
                  <Form.Item
                    name='ticketType'
                    label='Ticket Type'
                    rules={[
                      {
                        required: true,
                        message: 'Select a ticket type',
                      },
                    ]}
                  >
                    <Select size='large' placeholder='Select ticket type'>
                      {ticketTypes.map(ticket => (
                        <Select.Option key={ticket.type} value={ticket.type}>
                          {ticket.type} - €{ticket.price}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
    
                  <Form.Item
                    name='amount'
                    label='Quantity'
                    initialValue={1}
                    rules={[
                      {
                        required: true,
                        message: 'Select your birthdate',
                      },
                    ]}
                  >
                    <InputNumber 
                      size='large' 
                      min={1} 
                      style={{ width: '100%' }}
                      controls={false}
                    />
                  </Form.Item>
  
                  <Form.Item shouldUpdate>
                    {() => (
                      <Button
                        size='large'
                        className='invitation-btn'
                        type='primary'
                        onClick={createInvitation}
                        loading={createInvitationLoader}
                        disabled={
                          !form.isFieldsTouched(['name', 'surname', 'email', 'ticketType']) ||
                          !!form.getFieldsError().filter(({ errors }) => errors.length).length
                        }
                        style={{ width: '100%' }}
                      >
                        Create invitation
                      </Button>
                    )}
                  </Form.Item>
                </Form>
              </div>
            </div>
      </Modal>
    </>
  );
}
