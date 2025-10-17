'use client';
import { useState, useEffect } from 'react';
import {
  getCoupons,
  createCoupon as createCouponService,
  deleteCoupon,
} from '@/shared/services';

// COMPONENTS
import CouponItem from './CouponItem/CouponItem';

// INTERFACES
import type { Coupon } from '@/shared/interfaces';

// ANTD
import { Button, Form, DatePicker, InputNumber, Empty } from 'antd';
import Input from 'antd/es/input/Input';
import Modal from 'antd/es/modal';
import { WarningOutlined, ReloadOutlined } from '@ant-design/icons';

// STYLES
import './CouponsList.scss';

interface CouponsListProps {
  eventId: string;
}

const CouponsList = ({ eventId }: CouponsListProps) => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [addCouponModal, setAddCouponModal] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCoupons(eventId);

      if ('error' in data) {
        setError(data.error as string);
        return;
      }

      const sortedCoupons = data.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
      setCoupons(sortedCoupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchCoupons();
    }
  }, [eventId]);

  const handleAddCouponOpen = () => {
    setModalError(null); 
    setAddCouponModal(true);
  };

  const handleAddCouponCancel = () => {
    setModalError(null); 
    form.resetFields();
    setAddCouponModal(false);
  };

  const createCoupon = async (): Promise<void> => {
    setLoader(true);
    setModalError(null); 

    try {
      const values = form.getFieldsValue();
      const couponData = {
        code: values.code,
        discount: values.discountValue,
        expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
        maxUses: values.maxUses || null,
      };

      const response = await createCouponService(eventId, couponData);

      if ('error' in response) {
        setModalError(response.error as string);
        return;
      }
      const couponWithCreatedDate = {
        ...response,
        created: new Date().toISOString(),
      };

      setCoupons([couponWithCreatedDate, ...coupons]);
      form.resetFields();
      setAddCouponModal(false);
    } catch (error) {
      console.error('Error creating coupon:', error);
      setModalError((error as Error).message);
    } finally {
      setLoader(false);
    }
  };

  const handleDeleteCoupon = async (code: string): Promise<void> => {
    try {
      const response = await deleteCoupon(eventId, code);

      if (response && !response.error) {
        setCoupons(coupons.filter((coupon) => coupon.code !== code));
      } else {
        throw new Error(response?.error || `Failed to delete coupon ${code}`);
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      setError((error as Error).message);
    }
  };

  return (
    <div className='coupons-list-container'>
      <div className='coupons-header'>
        <h2>Coupons</h2>
        <Button
          size='large'
          className='view-details'
          onClick={handleAddCouponOpen}
        >
          Create Coupon
        </Button>
      </div>

      <div className='coupons-list-info-content'>
        <div className='coupons-list-info-header'>
          <div className='code'>Code</div>
          <div className='discount'>Discount</div>
          <div className='created'>Created</div>
          <div className='expiration'>Expiration</div>
          <div className='maxUses'>Max uses</div>
        </div>
        <div className='coupons-list-content'>
          {loading ? (
            <div className='no-coupons'>Loading coupons...</div>
          ) : error ? (
            <div className='error-state'>
              <Empty
                image={<WarningOutlined className='error-icon' />}
                imageStyle={{ height: 'auto' }}
                className='error-empty'
                description={
                  <div className='error-content'>
                    <p>Couldn't load any coupons</p>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={fetchCoupons}
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
          ) : coupons.length > 0 ? (
            coupons.map((coupon: Coupon, i: number) => {
              return (
                <CouponItem
                  coupon={coupon}
                  key={i}
                  onDelete={handleDeleteCoupon}
                />
              );
            })
          ) : (
            <div className='no-coupons'>No coupons available</div>
          )}
        </div>
      </div>

      <Modal
        title={null}
        open={addCouponModal}
        onCancel={handleAddCouponCancel}
        closable={true}
        footer={null}
        mask={true}
        centered
      >
        <div className='add-coupon-container'>
          <div className='add-coupon-header'>
            <h2>Create new coupon</h2>
          </div>
          <div className='add-coupon-content'>
            {modalError && <div className='error-message'>{modalError}</div>}
            <Form form={form} layout='vertical'>
              <Form.Item
                name='code'
                label='Coupon Code'
                rules={[
                  {
                    required: true,
                    message: 'Introduce the coupon code',
                  },
                ]}
              >
                <Input size='large' placeholder='Example: WELCOME20' />
              </Form.Item>

              <Form.Item
                name='discountValue'
                label='Discount percentage'
                rules={[
                  {
                    required: true,
                    message: 'Introduce the discount percentage',
                  },
                ]}
              >
                <InputNumber
                  size='large'
                  placeholder='Example: 20%'
                  min={1}
                  max={100}
                  controls={false}
                  formatter={(value) => `${value}%`}
                  className='full-width-input'
                />
              </Form.Item>

              <Form.Item
                name='expiryDate'
                label='Expiration date'
                rules={[
                  {
                    required: true,
                    message: 'Select the expiration date',
                  },
                ]}
              >
                <DatePicker size='large' className='full-width-input' />
              </Form.Item>

              <Form.Item
                name='maxUses'
                label='Max uses'
                rules={[{ required: false }]}
              >
                <InputNumber
                  size='large'
                  placeholder='Unlimited if empty'
                  controls={false}
                  min={1}
                  className='full-width-input'
                />
              </Form.Item>

              <Form.Item shouldUpdate>
                {() => (
                  <Button
                    size='large'
                    className='coupon-btn'
                    type='primary'
                    onClick={createCoupon}
                    loading={loader}
                    disabled={
                      !form.isFieldsTouched(true) ||
                      !!form
                        .getFieldsError()
                        .filter(({ errors }) => errors.length).length
                    }
                  >
                    Create coupon
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

export default CouponsList;
