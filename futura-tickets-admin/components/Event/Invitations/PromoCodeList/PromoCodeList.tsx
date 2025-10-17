'use client';
import { useState, useEffect } from 'react';

// ANTD
import { Button, Form, Empty } from 'antd';
import Input from 'antd/es/input/Input';
import Modal from 'antd/es/modal';
import { WarningOutlined, ReloadOutlined } from '@ant-design/icons';

// COMPONENTS
import PromoCodeItem from './PromoCodeItem/PromoCodeItem';

// SERVICES
import { getPromoCodes, createPromoCode as createPromoCodeService, deletePromoCode, getEvent } from '@/shared/services';

// INTERFACES
import type { PromoCode } from '@/shared/interfaces';

// STYLES
import './PromoCodeList.scss';

interface PromoCodeListProps {
  eventId: string;
}

const PromoCodeList = ({ eventId }: PromoCodeListProps) => {

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [addPromoCodeModal, setAddPromoCodeModal] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [eventUrl, setEventUrl] = useState<string>();

  const fetchPromoCodes = async (eventId: string): Promise<void> => {

    setLoading(true);
    setError(null);

    try {

      const data = await getPromoCodes(eventId);
      const eventInfo = await getEvent(eventId);

      if ('error' in data) {
        setError(data.error as string);
        return;
      }

      const sortedPromoCodes = data.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

      setPromoCodes(sortedPromoCodes);
      setEventUrl(eventInfo.url);

    } catch (error) {
      console.error('Error fetching promo codes:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromoCodeOpen = () => {
    setModalError(null);
    setAddPromoCodeModal(true);
  };

  const handleAddPromoCodeCancel = () => {
    setModalError(null);
    form.resetFields();
    setAddPromoCodeModal(false);
  };

  const createPromoCode = async (): Promise<void> => {

    setLoader(true);
    setModalError(null);

    try {

      const values = form.getFieldsValue();
      const promoCodeData = {
        code: values.code,
        name: values.name,
        lastName: values.lastName,
        email: values.email,
      };

      const createdPromoCode = await createPromoCodeService(eventId, promoCodeData);

      if ('error' in createdPromoCode) {
        setModalError(createdPromoCode.error as string);
        return;
      }

      setPromoCodes([createdPromoCode, ...promoCodes]);

      form.resetFields();
      setAddPromoCodeModal(false);
      
    } catch (error) {
      console.error('Error creating promo code:', error);
      setModalError((error as Error).message);
    } finally {
      setLoader(false);
    }
  };

  const handleDeletePromoCode = async (id: string): Promise<void> => {
    try {
      const response = await deletePromoCode(eventId, id);

      if (response && !response.error) {
        setPromoCodes(promoCodes.filter((promoCode) => promoCode._id !== id));
      } else {
        throw new Error(response?.error || `Failed to delete promo code ${id}`);
      }
    } catch (error) {
      console.error('Error deleting promo code:', error);
      setError((error as Error).message);
    }
  };

  useEffect(() => {
    eventId && fetchPromoCodes(eventId);
  }, [eventId]);

  return (
    <div className='promo-codes-list-container'>
      <div className='promo-codes-header'>
        <h2>Promo Codes</h2>
        <Button
          size='large'
          className='view-details'
          onClick={handleAddPromoCodeOpen}
        >
          Create Promo Code
        </Button>
      </div>

      <div className='promo-codes-list-info-content'>
        <div className='promo-codes-list-info-header'>
          <div className='code'>Code</div>
          <div className='email'>Email</div>
          <div className='created'>Created</div>
        </div>
        <div className='promo-codes-list-content'>
          {loading ? (
            <div className='no-promo-codes'>Loading promo codes...</div>
          ) : error ? (
            <div className='error-state'>
              <Empty
                image={<WarningOutlined className='error-icon' />}
                imageStyle={{ height: 'auto' }}
                className='error-empty'
                description={
                  <div className='error-content'>
                    <p>Couldn't load any promo codes</p>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => fetchPromoCodes(eventId)}
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
          ) : promoCodes.length > 0 ? (
            promoCodes.map((promoCode: PromoCode, i: number) => {
              return (
                <PromoCodeItem
                  promoCode={promoCode}
                  eventUrl={eventUrl!}
                  key={i}
                  onDelete={handleDeletePromoCode}
                />
              );
            })
          ) : (
            <div className='no-promo-codes'>No promo codes available</div>
          )}
        </div>
      </div>

      <Modal
        title={null}
        open={addPromoCodeModal}
        onCancel={handleAddPromoCodeCancel}
        closable={true}
        footer={null}
        mask={true}
        centered
      >
        <div className='add-promo-code-container'>
          <div className='add-promo-code-header'>
            <h2>Create new promo code</h2>
          </div>
          <div className='add-promo-code-content'>
            {modalError && <div className='error-message'>{modalError}</div>}
            <Form form={form} layout='vertical'>
              <Form.Item
                name='name'
                label='Nombre'
                rules={[
                  {
                    required: true,
                    message: 'Introduce el nombre',
                  },
                ]}
              >
                <Input size='large' placeholder='Nombre' />
              </Form.Item>

              <Form.Item
                name='lastName'
                label='Apellido'
                rules={[
                  {
                    required: true,
                    message: 'Introduce el apellido',
                  },
                ]}
              >
                <Input size='large' placeholder='Apellido' />
              </Form.Item>

              <Form.Item
                name='email'
                label='Email'
                rules={[
                  {
                    required: true,
                    message: 'Introduce el email',
                    type: 'email',
                  },
                ]}
              >
                <Input size='large' placeholder='Email' />
              </Form.Item>

              <Form.Item
                name='code'
                label='Código Promocional'
                rules={[
                  {
                    required: true,
                    message: 'Introduce el código promocional',
                  },
                ]}
              >
                <Input size='large' placeholder='Example: PROMO123' />
              </Form.Item>

              <Form.Item shouldUpdate>
                {() => (
                  <Button
                    size='large'
                    className='promo-code-btn'
                    type='primary'
                    onClick={createPromoCode}
                    loading={loader}
                    disabled={
                      !form.isFieldsTouched(true) ||
                      !!form
                        .getFieldsError()
                        .filter(({ errors }) => errors.length).length
                    }
                  >
                    Create promo code
                  </Button>
                )}
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PromoCodeList;
