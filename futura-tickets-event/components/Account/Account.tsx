"use client";
import { useEffect, useState } from 'react';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// ANTD
import { CalendarOutlined, ClockCircleOutlined, CloseOutlined, InfoCircleOutlined, LoadingOutlined, SendOutlined, StopOutlined, SwapOutlined } from '@ant-design/icons';
import InputNumber from 'antd/es/input-number';
import Form from 'antd/es/form';
import Button from 'antd/es/button';
import Input from 'antd/es/input/Input';
import Modal from 'antd/es/modal';

// SERVICES
import { cancelResaleTicket, getAccountOrders, resaleTicket, transferTicket } from '../shared/services';

// INTERFACES
import { ActibeTab, Account as IAccount, Order as IOrder, OrderStatus, Payment, Sale, TicketStatus, TransferToTicket } from "../shared/interfaces";

// STYLES
import './Account.scss';

export default function Account() {

    const [state, dispatch] = useGlobalState();
    const [activeTab, setActiveTab] = useState<ActibeTab>('TICKETS');
    const [activeOrder, setActiveOrder] = useState<number>();
    const [activeTicket, setActiveTicket] = useState<Sale>();
    const [accountOrders, setAccountOrdersState] = useState<IOrder[]>([]);
    const [accountSales, setAccountSalesState] = useState<Sale[]>([]);

    const [infoModalState, setInfoModalState] = useState<boolean>(false);
    const [resaleModalState, setResaleModalState] = useState<boolean>(false);
    const [cancelResaleModalState, setCancelResaleModalState] = useState<boolean>(false);
    const [transferModalState, setTransferModalState] = useState<boolean>(false);

    const [resaleLoader, setResaleLoader] = useState<boolean>(false);
    const [cancelResaleLoader, setCancelResaleLoader] = useState<boolean>(false);
    const [transferLoader, setTransferLoader] = useState<boolean>(false);

    const [accountForm] = Form.useForm();
    const [bankForm] = Form.useForm();
    const [resaleForm] = Form.useForm();
    const [transferForm] = Form.useForm();

    const saveAccount = async () => {
        try {

            const account: IAccount = {
                name: accountForm.getFieldValue('name'),
                lastName: accountForm.getFieldValue('lastName'),
                gender: accountForm.getFieldValue('gender'),
                email: accountForm.getFieldValue('name'),
            };

            //const accountSave = await setAccount(account);

        } catch (error) {
            
        }
    };

    const savePayment = async () => {
        try {

            const payment: Payment = {
                bank: accountForm.getFieldValue('bank'),
                bankAddress: accountForm.getFieldValue('bankAddress'),
                iban: accountForm.getFieldValue('iban'),
                bic: accountForm.getFieldValue('bic'),
            };

            // const accountSave = await setAccount(payment);

        } catch (error) {
            
        }
    };

    const disconnect = (): void => {
        localStorage.removeItem('token');
        window.open(`${window.origin}`, '_self');
    };

    const initForm = async (): Promise<void> => {
        accountForm.setFieldValue('name', state.account?.name);
        accountForm.setFieldValue('lastName', state.account?.lastName);
        accountForm.setFieldValue('email', state.account?.email);
        accountForm.setFieldValue('address', state.account?.address);
        accountForm.setFieldValue('balance', `${new Intl.NumberFormat().format(state.account?.balance!)} LS`);
    };

    const resale = async (): Promise<void> => {
        try {

            setResaleLoader(true);

            setAccountSalesState(accountSales.map((accountSale: Sale) => {
                if (accountSale._id == activeTicket?._id) return { ...accountSale, status: TicketStatus.PROCESSING }
                return accountSale;
            }));
            
            await resaleTicket(activeTicket!._id, resaleForm.getFieldValue('price'));

            setAccountSalesState(accountSales.map((accountSale: Sale) => {
                if (accountSale._id == activeTicket?._id) return { ...accountSale, status: TicketStatus.SALE }
                return accountSale;
            }));

            setResaleLoader(false);
            closeResaleModal();
            
        } catch (error) {
            
        }
    };

    const cancelResale = async (): Promise<void> => {
        try {
            
            setCancelResaleLoader(true);

            await cancelResaleTicket(activeTicket!._id);

            setCancelResaleLoader(false);
            closeCancelResaleModal();
            
        } catch (error) {
            
        }
    };

    const transfer = async (): Promise<void> => {
        try {

            setTransferLoader(true);

            const transferTicketInfo: TransferToTicket = {
                name: transferForm.getFieldValue('name'),
                lastName: transferForm.getFieldValue('lastName'),
                email: transferForm.getFieldValue('email'),
                phone: transferForm.getFieldValue('phone')
            };

            await transferTicket(activeTicket!._id, transferTicketInfo);

            setAccountSalesState(accountSales.map((accountSale: Sale) => {
                if (accountSale._id == activeTicket?._id) {
                    return {
                        ...accountSale,
                        status: TicketStatus.PROCESSING
                    }
                }
                return accountSale;
            }));

            setTransferLoader(false);
            closeTransferModal();


        } catch (error) {
            
        }
    };
    
    const setOrders = async (): Promise<void> => {
        try {

            const accountSales: Sale[] = [];

            const accountOrders = await getAccountOrders();

            accountOrders.forEach((accountOrders: IOrder) => {
                accountOrders.sales?.forEach((accountSale: Sale) => {
                    accountSales.push(accountSale);
                });
            });

            setAccountOrdersState(accountOrders);
            setAccountSalesState(accountSales);

        } catch (error) {
            
        }
    };

    const setInfoModal = (sale: Sale): void => {
        setInfoModalState(true);
        setActiveTicket(sale);
    };

    const setResaleModal = (sale: Sale): void => {
        setResaleModalState(true);
        setActiveTicket(sale);
    };

    const setCancelResaleModal = (sale: Sale): void => {
        setCancelResaleModalState(true);
        setActiveTicket(sale);
    };

    const setTransferModal = (sale: Sale): void => {
        setTransferModalState(true);
        setActiveTicket(sale);
    };

    const closeResaleModal = (): void => {
        setResaleModalState(false);
        setActiveTicket(undefined);
    };

    const closeCancelResaleModal = (): void => {
        setCancelResaleModalState(false);
        setActiveTicket(undefined);
    };

    const closeTransferModal = (): void => {
        setTransferModalState(false);
        setActiveTicket(undefined);
    };

    const closeInfoModal = (): void => {
        setInfoModalState(false);
        setActiveTicket(undefined);
    };

    useEffect(() => {
        state.account && initForm();
        state.account && setOrders();
    }, [state.account]);

    return (
        <>
            <div className="account-container">
                <div className="account-menu">
                    <ul>
                        <li onClick={() => setActiveTab('TICKETS')}>Tickets</li>
                        {/* <li onClick={() => setActiveTab('ORDERS')}>Orders</li> */}
                        <li onClick={() => setActiveTab('ACCOUNT')}>Account</li>
                        <li onClick={() => setActiveTab('PAYMENT')}>Payment</li>
                    </ul>
                </div>
                <div className="account-content">
                    {activeTab == 'TICKETS' && (
                        <div className="tickets-container">
                            <div className="tickets-header">
                                <h1>Tickets</h1>
                            </div>
                            {accountSales.length == 0 ? (
                                <div className="tickets-content">
                                    No tickets found
                                </div>
                            ) : (
                                <div className="tickets-list-container">
                                    <div className="tickets-list-content">
                                        {accountSales.map((accountSale: Sale, i: number) => {
                                            return <Ticket sale={accountSale} setInfoModal={setInfoModal} setResaleModal={setResaleModal} setCancelResaleModal={setCancelResaleModal} setTransferModal={setTransferModal} key={i}/>
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab == 'ORDERS' && (
                        <div className="tickets-container">
                            <div className="tickets-header">
                                <h1>Orders</h1>
                            </div>
                            {accountOrders.length == 0 ? (
                                <div className="tickets-content">
                                    No orders found
                                </div>
                            ) : (
                                <div className="orders-list-container">
                                    <div className="orders-list-content">
                                        {accountOrders.map((accountOrder: IOrder, i: number) => {
                                            return <Order order={accountOrder} key={i}/>
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab == 'ACCOUNT' && (
                        <div className="account-form-container">
                            <div className="account-form-header">
                                <h1>Account</h1>
                            </div>
                            <Form form={accountForm} layout="vertical">
                                <Form.Item label="Name" name="name">
                                    <Input size="large"/>
                                </Form.Item>
                                <Form.Item label="Lastname" name="lastName">
                                    <Input size="large"/>
                                </Form.Item>
                                <Form.Item label="Birth Date" name="birth">
                                    <Input size="large"/>
                                </Form.Item>
                                <Form.Item label="Gender" name="gender">
                                    <Input size="large"/>
                                </Form.Item>
                                <Form.Item label="Email" name="email">
                                    <Input size="large" disabled/>
                                </Form.Item>
                                <Form.Item label="Phone" name="phone">
                                    <Input size="large"/>
                                </Form.Item>
                                <Form.Item label="Address" name="address">
                                    <Input  size="large" disabled/>
                                </Form.Item>
                                <Form.Item shouldUpdate>
                                    {() => (
                                        <div className="form-actions">
                                            <Button size="large" className="account-btn" type="primary" onClick={() => saveAccount()}>
                                                Save Account
                                            </Button>
                                        </div>
                                    )}
                                </Form.Item>
                            </Form>
                        </div>
                    )}
                    {activeTab == 'PAYMENT' && (
                        <div className="account-form-container">
                            <div className="account-form-header">
                                <h1>Payment</h1>
                            </div>
                            <Form form={bankForm} layout="vertical">
                                <Form.Item label="Bank Name" name="bank">
                                    <Input size="large"/>
                                </Form.Item>
                                <Form.Item label="Bank Address" name="bankAddress">
                                    <Input size="large"/>
                                </Form.Item>
                                <Form.Item label="IBAN" name="iban">
                                    <Input size="large"/>
                                </Form.Item>
                                <Form.Item label="SWIFT/BIC" name="bic">
                                    <Input size="large"/>
                                </Form.Item>
                                <Form.Item shouldUpdate>
                                    {() => (
                                        <div className="form-actions">
                                            <Button size="large" className="account-btn" type="primary" onClick={() => savePayment()}>
                                                Save Payment
                                            </Button>
                                        </div>
                                    )}
                                </Form.Item>
                            </Form>
                        </div>
                    )}
                </div>
            </div>
            <Modal title={null} open={transferModalState} onCancel={() => closeTransferModal()} closable={true} footer={null} mask={true} centered>
                <div className="resale-modal-container">
                    <h1><SendOutlined/>Transfer Ticket</h1>
                    <div>
                        <p>Transfer your ticket to one of your friends.<br/>You will not be the owner of the ticket anymore.</p>
                    </div>
                    <Form form={transferForm} layout="vertical">
                        <Form.Item label="Name" name="name" rules={[{required: true, message: 'Name is required!'}]}>
                            <Input size="large"/>
                        </Form.Item>
                        <Form.Item label="Lastname" name="lastName" rules={[{required: true, message: 'Lastname is required!'}]}>
                            <Input size="large"/>
                        </Form.Item>
                        <Form.Item label="Email" name="email" rules={[{required: true, message: 'Email is required!'}]}>
                            <Input size="large"/>
                        </Form.Item>
                        <Form.Item label="Phone" name="phone">
                            <Input size="large"/>
                        </Form.Item>
                        <Form.Item shouldUpdate>
                            {() => (
                                <div  className="form-actions">
                                    <Button size="large" onClick={() => closeTransferModal()}>
                                        Close
                                    </Button>
                                    <Button size="large" className="login-btn" type="primary" onClick={() => transfer()} loading={resaleLoader} disabled={resaleLoader}>
                                        Transfer
                                    </Button>
                                </div>
                            )}
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
            <Modal title={null} open={resaleModalState} onCancel={() => closeResaleModal()} closable={true} footer={null} mask={true} centered>
                <div className="resale-modal-container">
                    <h1><SwapOutlined/>Resale Ticket</h1>
                    <div>
                        <p>Your ticket will be processed and placed for resale once the promoter enables the resale.<br/>Your will receive an email confirming the placement of your ticket.</p>
                    </div>
                    <Form form={resaleForm} layout="vertical">
                        <Form.Item label={`Price (Max Price: ${state.event?.resale.maxPrice} EUR)`} name="price" rules={[{ required: true, message: "You have reached the Maximum price"}]}>
                            <InputNumber max={state.event?.resale.maxPrice} controls={false} size="large"/>
                        </Form.Item>
                        <Form.Item shouldUpdate>
                            {() => (
                                <div className="form-actions">
                                    <Button size="large" onClick={() => closeResaleModal()}>
                                        Close
                                    </Button>
                                    <Button size="large" className="login-btn" type="primary" onClick={() => resale()} loading={resaleLoader} disabled={resaleLoader}>
                                        Resale
                                    </Button>
                                </div>
                            )}
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
            <Modal title={null} open={cancelResaleModalState} onCancel={() => closeCancelResaleModal()} closable={true} footer={null} mask={true} centered>
                <div className="resale-modal-container">
                    <h1><StopOutlined/>Cancel Resale</h1>
                    <div>
                        <p>Your ticket will not be longer available for resale.</p>
                    </div>
                    <div className="form-actions">
                        <Button size="large" onClick={() => closeCancelResaleModal()}>
                            Close
                        </Button>
                        <Button size="large" className="login-btn" type="primary" onClick={() => cancelResale()} loading={cancelResaleLoader} disabled={cancelResaleLoader}>
                            Cancel Resale
                        </Button>
                    </div>
                </div>
            </Modal>
            <Modal title={null} open={infoModalState} onCancel={() => closeInfoModal()} closable={true} footer={null} mask={true} centered>
                <div className="ticket-information-container">
                    <h1><InfoCircleOutlined/>Ticket Information</h1>
                    <ul className="ticket-information-content">
                        <li>
                            <label>Owner:</label>
                            <span>{activeTicket?.client.name} {activeTicket?.client.lastName}</span>
                        </li>
                        <li>
                            <label>Email:</label>
                            <span>{activeTicket?.client.email}</span>
                        </li>
                    </ul>
                    <ul className="ticket-information-content">
                        <li>
                            <label>Token ID:</label>
                            <span>#{activeTicket?.tokenId}</span>
                        </li>
                        <li>
                            <label>Type:</label>
                            <span>{activeTicket?.type}</span>
                        </li>
                    </ul>
                    <ul className="ticket-information-content">
                        <li>
                            <label><CalendarOutlined/>Start Date:</label>
                            <span>{new Date(activeTicket?.event?.dateTime.startDate!).toLocaleDateString()}</span>
                        </li>
                        <li>
                            <label><ClockCircleOutlined/>Start Time:</label>
                            <span>{new Date(activeTicket?.event?.dateTime.startTime!).toLocaleTimeString()}</span>
                        </li>
                        <li>
                            <label><CalendarOutlined/>End Date:</label>
                            <span>{new Date(activeTicket?.event?.dateTime.endDate!).toLocaleDateString()}</span>
                        </li>
                        <li>
                            <label><ClockCircleOutlined/>End Time:</label>
                            <span>{new Date(activeTicket?.event?.dateTime.endTime!).toLocaleTimeString()}</span>
                        </li>
                    </ul>
                    <ul className="ticket-information-content">
                        <li>
                            <label>Price:</label>
                            <span>{activeTicket?.price} EUR</span>
                        </li>
                        <li>
                            <label>Created: <CalendarOutlined /></label>
                            <span>{new Date(activeTicket?.createdAt!).toLocaleDateString()}, {new Date(activeTicket?.createdAt!).toLocaleTimeString()}</span>
                        </li>
                    </ul>
                </div>
            </Modal>
        </>
    );

};


export function Order({ order }: { order: IOrder }) {

    const [state, dispatch] = useGlobalState();

    return (
        <div className="order-container">
            <div className="ticket-content">
                <h2>{order.event}</h2>
                <div className="ticket-date-time">
                    <div><CalendarOutlined /> {new Date(state.event?.dateTime.startDate!).toLocaleDateString()}</div>
                    <div><ClockCircleOutlined /> {new Date(state.event?.dateTime.startTime!).toLocaleTimeString()}</div>
                </div>
                <div className="ticket-status">
                    {order.status == OrderStatus.PENDING && <div className="pending">{order.status}</div>}
                    {order.status == OrderStatus.SUCCEEDED && <div className="succeded">{order.status}</div>}
                </div>
                <div className="ticket-type">
                    ({order.sales?.length}) Tickets
                </div>
                <div>
                    {new Date(order.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    )
}

export function Ticket({ sale, setInfoModal, setResaleModal, setTransferModal, setCancelResaleModal }: {sale: Sale, setInfoModal: (sale: Sale) => void, setResaleModal: (sale: Sale) => void, setTransferModal: (sale: Sale) => void, setCancelResaleModal: (sale: Sale) => void}) {

    const [state, dispatch] = useGlobalState();

    return (
        <div className="ticket-container">
            <div className="ticket-image" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_BLOB_URL}/${state.event?.ticketImage})` }}>
                <div className="ticket-qr">
                    {(sale.status == TicketStatus.OPEN || sale.status == TicketStatus.SALE) && <img src={sale.qrCode}/>}
                    {sale.status == TicketStatus.PROCESSING && <LoadingOutlined />}
                    {sale.status == TicketStatus.SOLD && <CloseOutlined />}
                    {(sale.status == TicketStatus.CLOSED || sale.status == TicketStatus.EXPIRED) && <CloseOutlined />}
                    {sale.status == TicketStatus.PENDING && <CloseOutlined />}
                    {sale.status == TicketStatus.TRANSFERED && <CloseOutlined />}
                </div>
            </div>
            <div className="ticket-content">
                <h2>{sale.event.name}</h2>
                <div className="ticket-date-time">
                    <div><CalendarOutlined /> {new Date(state.event?.dateTime.startDate!).toLocaleDateString()}</div>
                    <div><ClockCircleOutlined /> {new Date(state.event?.dateTime.startTime!).toLocaleTimeString()}</div>
                </div>
                <div className="ticket-status">
                    {sale.status == TicketStatus.PENDING && <div className="pending">{sale.status}</div>}
                    {sale.status == TicketStatus.PROCESSING && <div className="processing">{sale.status}</div>}
                    {sale.status == TicketStatus.TRANSFERED && <div className="transfered">{sale.status}</div>}
                    {sale.status == TicketStatus.OPEN && <div className="open">{sale.status}</div>}
                    {(sale.status == TicketStatus.CLOSED || sale.status == TicketStatus.EXPIRED) && <div className="closed">{sale.status}</div>}
                    {sale.status == TicketStatus.SALE && <div className="sale">{sale.status}</div>}
                    {sale.status == TicketStatus.SOLD && <div className="sold">{sale.status}</div>}
                </div>
                <div className="ticket-type">
                    <div className="regular">{sale.type}</div>
                </div>
                <div className="ticket-actions">
                    <div className="ticket-action" onClick={() => setInfoModal(sale)}>
                        <InfoCircleOutlined />
                    </div>
                    <div className={"ticket-action " + ((sale.status != TicketStatus.OPEN) ? "disabled" : "")} onClick={() => setTransferModal(sale)}>
                        <SendOutlined />
                    </div>
                    {sale.status == TicketStatus.OPEN && (
                        <div className="ticket-action" onClick={() => setResaleModal(sale)}>
                            <SwapOutlined/>
                        </div>
                    )}
                    {sale.status == TicketStatus.SALE && (
                        <div className="ticket-action" onClick={() => setCancelResaleModal(sale)}>
                            <StopOutlined/>
                        </div>
                    )}
                    {sale.status != TicketStatus.OPEN && sale.status != TicketStatus.SALE && (
                        <div className="ticket-action disabled">
                            <SwapOutlined/>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}