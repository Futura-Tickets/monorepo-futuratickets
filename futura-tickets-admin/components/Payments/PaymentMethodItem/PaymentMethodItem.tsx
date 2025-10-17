'use client';
import { useState } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import './PaymentMethodItem.scss';

interface PaymentMethod {
  _id?: string;
  type: 'bank' | 'card';
  name: string;
  number: string;
  accountNumber?: string;
  expiryDate?: string;
  createdAt: string;
}

export default function PaymentMethodItem({
  paymentMethod,
  onDelete,
}: {
  paymentMethod: PaymentMethod;
  onDelete?: (paymentMethodId: string) => Promise<void>;
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
      console.log("Intentando eliminar método de pago:", paymentMethod._id);
      if (onDelete && paymentMethod._id) {
        await onDelete(paymentMethod._id);
        console.log("Método de pago eliminado con éxito");
      } else {
        console.error("Error: onDelete no está definido o paymentMethod.id es null");
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const formatExpiryDate = (dateString: string | Date | undefined) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; 
  };

  return (
    <>
      <div className='payment-method-item-container'>
        <div className='payment-method-item-content'>
          <div className='type'>{paymentMethod.type === 'card' ? 'Credit Card' : 'Bank Account'}</div>
          <div className='name'>{paymentMethod.name}</div>
          <div className='number'>{paymentMethod.number || 'N/A'}</div>
          <div className='expiry'>{formatExpiryDate(paymentMethod.expiryDate)}</div>
          <div className='created'>{formatDate(paymentMethod.createdAt)}</div>
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
        <div className='delete-payment-method-modal'>
          <h2 className='modal-title'>DELETE PAYMENT METHOD</h2>
          <p>
            The payment method <strong>"{paymentMethod.name}"</strong> will be
          </p>
          <p>deleted along with all related data.</p>
          <p className='warning-text'>
            You will not be able to recover this information.
          </p>

          <button
            className='remove-payment-method-btn'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'DELETING...' : 'DELETE PAYMENT METHOD'}
          </button>
        </div>
      </Modal>
    </>
  );
}