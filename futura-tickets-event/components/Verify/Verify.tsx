"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// ANTD
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// SERVICES
import { verifyTicket } from '../shared/services';

// INTERFACES
import { TicketVerified } from '../shared/interfaces';

// STYLES
import './Verify.scss';
import { SecurityScanOutlined } from '@ant-design/icons';

export default function Verify() {

    const pathname = usePathname();

    const [state, dispatch] = useGlobalState();

    const [form] = Form.useForm();

    const [ticketVerified, setTicketVerified] = useState<TicketVerified>();

    const [loader, setLoader] = useState<boolean>(true);
    const [verifyLoader, setVerifyLoader] = useState<boolean>(false);
    const [verifyError, setVerifyError] = useState<boolean>(false);

    const verifySignature = async (event: string, signature: string): Promise<void> => {
        try {

            setVerifyLoader(true);

            const ticketVerified = await verifyTicket(event, signature);
            setTicketVerified(ticketVerified);

            setVerifyLoader(false);

        } catch (error) {
            setVerifyError(true);
            setVerifyLoader(false);
        }
    };

    useEffect(() => {
        const signature = pathname.split("/")[2];
        state.event && signature && verifySignature(state.event._id, signature);
    }, [state.event]);

    if (loader) {
        <div className="verify-container">
            <div className="verify-content">
                Loading ...
            </div>
        </div>
    }

    return (
        <div className="verify-container">
            <div className="verify-content">
                <div className="verify-form">
                    <h1>Ticket Verification</h1>
                    <p>Futura Tickets allows you to validate the <br/><strong>authenticity, ownership and status</strong> of your tickets<br/>based in cryptographic technology.</p>
                    <Form form={form} layout="vertical">
                        <Form.Item label="Ticket Id" name="ticket" required>
                            <Input size="large"/>
                        </Form.Item>
                        <Form.Item label="Email" name="email" required>
                            <Input size="large"/>
                        </Form.Item>
                        <Form.Item label="Signature" name="signature" required>
                            <Input type="signature" size="large"/>
                        </Form.Item>
                        <Form.Item shouldUpdate>
                            {() => (
                                <div className="form-actions">
                                    <Button className="login-btn" type="primary" size="large" onClick={() => verifySignature(state.event?._id!, '')} loading={verifyLoader} disabled={verifyLoader}>
                                        <SecurityScanOutlined /> Verify Ticket
                                    </Button>
                                </div>
                            )}
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div> 
    );
}