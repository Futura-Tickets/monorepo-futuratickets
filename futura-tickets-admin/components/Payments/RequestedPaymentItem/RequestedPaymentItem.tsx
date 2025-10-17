'use client';
import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import './RequestedPaymentItem.scss';
import { RequestedPayment } from '@/shared/interfaces';

export default function RequestedPaymentItem({
  requestedPayment,
  onDelete,
}: {
  requestedPayment: RequestedPayment;
  onDelete?: (requestId: string) => Promise<void>;
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
      if (onDelete && requestedPayment._id) {
        await onDelete(requestedPayment._id);
      }
    } catch (error) {
      console.error('Error deleting payment request:', error);
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const renderAccount = () => {
    if (!requestedPayment.account) return 'N/A';
    
    if (typeof requestedPayment.account === 'object') {
      return `${requestedPayment.account.email}`;
    }
    
    return requestedPayment.account;
  };

  return (
    <>
      <div className='requested-payment-item-container'>
        <div className='requested-payment-item-content'>
          <div className='account'>{renderAccount()}</div>
          <div className='amount'>€{requestedPayment.amount}</div>
          <div className='status'>
            {requestedPayment.status === 'pending' && <span className="status-badge pending">{requestedPayment.status}</span>}
            {requestedPayment.status === 'approved' && <span className="status-badge approved">{requestedPayment.status}</span>}
            {requestedPayment.status === 'rejected' && <span className="status-badge rejected">{requestedPayment.status}</span>}
          </div>
          <div className='payment-method'>{requestedPayment.paymentMethod.name}</div>
          <div className='date'>{formatDate(requestedPayment.date)}</div>
          <div className='view'>
            <Button className='delete-btn' onClick={showDeleteConfirm} danger>
              <DeleteOutlined />
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={deleteModalVisible}
        onCancel={handleDeleteCancel}
        footer={null}
        centered
        width={500}
      >
        <div className='delete-payment-request-modal'>
          <h2 className='modal-title'>DELETE PAYMENT REQUEST</h2>
          <p>
            The payment request for <strong>€{requestedPayment.amount}</strong> will be
          </p>
          <p>deleted along with all related data.</p>
          <p className='warning-text'>
            You will not be able to recover this information.
          </p>

          <button
            className='remove-payment-request-btn'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'DELETING...' : 'DELETE PAYMENT REQUEST'}
          </button>
        </div>
      </Modal>
    </>
  );
}