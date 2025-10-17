'use client';
import { useEffect, useState } from 'react';

// ANTD
import Button from 'antd/es/button';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import Modal from 'antd/es/modal';

// UTILS
import { copyToClipboard } from '@/shared/utils/utils';

// INTERFACES
import { PromoCode } from '@/shared/interfaces';

// STYLES
import './PromoCodeItem.scss';

export default function PromoCodeItem({ promoCode, eventUrl, onDelete }: { promoCode: PromoCode; eventUrl: string, onDelete?: (promoCodeId: string) => Promise<void>; }) {

  
  const [promoCodeUrl, setPromoCodeUrlState] = useState<string>();
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
        await onDelete(promoCode._id);
      }
    } catch (error) {
      console.error('Error deleting promo code:', error);
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const setPromoCodeUrl = (promoCode: string, eventUrl: string): void => {
    setPromoCodeUrlState(`${process.env.NEXT_PUBLIC_MARKET_PLACE}/events/${eventUrl}?promoCode=${promoCode}`);
  };

  useEffect(() => {
    promoCode.code && eventUrl && setPromoCodeUrl(promoCode.code, eventUrl);
  }, [eventUrl]);

  return (
    <>
      <div className='promo-code-item-container'>
        <div className='promo-code-item-content'>
          <div className='code'>
            <span className='url' onClick={() => copyToClipboard(promoCodeUrl!)}>{promoCodeUrl}</span>
            <CopyOutlined onClick={() => copyToClipboard(promoCodeUrl!)}/>
          </div>
          <div className='email'>{promoCode.email}</div>
          <div className='created'>{formatDate(promoCode.createdAt)}</div>
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
        <div className='delete-promo-code-modal'>
          <h2 className='modal-title'>ELIMINAR CÓDIGO PROMOCIONAL</h2>
          <p>
            El código promocional <strong>"{promoCode.code}"</strong> será
          </p>
          <p>eliminado junto con todos sus datos relacionados.</p>
          <p className='warning-text'>
            No podrás recuperar esta información.
          </p>

          <button
            className='remove-promo-code-btn'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'ELIMINANDO...' : 'ELIMINAR CÓDIGO'}
          </button>
        </div>
      </Modal>
    </>
  );
}
