'use client';
import { useState } from 'react';

// ANTD
import Button from 'antd/es/button';
import { DeleteOutlined } from '@ant-design/icons';
import Modal from 'antd/es/modal';

// INTERFACES
import { Coupon } from '@/shared/interfaces';

// STYLES
import './CouponItem.scss';

export default function CouponItem({
  coupon,
  onDelete,
}: {
  coupon: Coupon;
  onDelete?: (couponCode: string) => Promise<void>; // Cambiar el tipo aquí
}) {
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const showDeleteConfirm = () => {
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(coupon.code);
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    return typeof date === 'string'
      ? new Date(date).toLocaleDateString()
      : date.toLocaleDateString();
  };

  return (
    <>
      <div className='coupon-item-container'>
        <div className='coupon-item-content'>
          <div className='code'>{coupon.code}</div>
          <div className='discount'>{coupon.discount}%</div>
          <div className='created'>{formatDate(coupon.created)}</div>
          <div className='expiration'>
            {formatDate(coupon.expiryDate)}
          </div>
            <div className='maxUses'>
            {coupon.maxUses || 'Unlimited'}
            </div>
          <div className='view'>
            <Button className='delete-btn' onClick={showDeleteConfirm} danger>
              <DeleteOutlined />
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={handleDeleteCancel}
        okText='Delete'
        confirmLoading={isDeleting}
        okButtonProps={{
          danger: true,
          style: { display: 'none' },
        }}
        cancelButtonProps={{
          style: { display: 'none' },
        }}
        centered
        width={500}
      >
        <div className='delete-coupon-modal'>
          <h2 className='modal-title'>REMOVE COUPON</h2>
          <p>
            The Coupon <strong>"{coupon.code}"</strong> will be
          </p>
          <p>deleted and all its related data.</p>
          <p className='warning-text'>
            You will not be able to recover the information.
          </p>

          <button
            className='remove-coupon-btn'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'DELETING...' : 'REMOVE COUPON'}
          </button>
        </div>
      </Modal>
    </>
  );
}
