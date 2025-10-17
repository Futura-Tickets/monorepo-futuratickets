"use client";
import { Dispatch, SetStateAction, useState } from 'react';

// ANTD
import Button from "antd/es/button";
import Modal from "antd/es/modal";

// ICONS
import { RetweetOutlined } from '@ant-design/icons';

// SERVICES
import { resendEmailOrder } from "../services";

// STYLES
import './ResendOrderModal.scss';

export default function ResendOrderModal({ orderId, resendOrderModal, setResendOrderModal }: { orderId: string, resendOrderModal: boolean, setResendOrderModal: Dispatch<SetStateAction<boolean>> }) {

    const [resendOrderLoader, setResendOrderLoader] = useState<boolean>(false);
    const [resendOrderError, setResendOrderError] = useState<boolean>(false);
    
    const resendOrder = async (orderId: string): Promise<void> => {
        try {

            setResendOrderLoader(true);

            await resendEmailOrder(orderId);

            setResendOrderLoader(false);
            setResendOrderModal(false);

        } catch (error) {
            console.log('error');
            setResendOrderLoader(false);
            setResendOrderError(true);
        }
    }

    return (
        <Modal title={null} open={resendOrderModal} onCancel={() => setResendOrderModal(false)} closable={!resendOrderLoader} footer={null} mask={true} centered>
            <div className='resend-order-modal'>
                <h2 className='modal-title'><RetweetOutlined /> RESEND ORDER</h2>
                <p>Are you sure you want to resend the order?</p>
                <Button type='primary' size='large' className='remove-coupon-btn' onClick={() => resendOrder(orderId)} loading={resendOrderLoader}>
                    {resendOrderLoader ? 'SENDING ORDER...' : 'SEND ORDER'}
                </Button>
            </div>
        </Modal>
    );
}
