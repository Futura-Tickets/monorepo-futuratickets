"use client";
import { useEffect, useState } from 'react';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// ANTD
import Form from 'antd/es/form';
import Input from 'antd/es/input/Input';
import Button from 'antd/es/button';

// SERVICES
import { loginAccount, setAccount } from '../shared/services';

// INTERFACES
import { ActibeTab, Account as IAccount } from "../shared/interfaces";

// STYLES
import './Account.scss';

export default function Account() {

    const [state, dispatch] = useGlobalState();
    const [activeTab, setActiveTab] = useState<ActibeTab>('ACCOUNT');

    const [accountForm] = Form.useForm();
    const [addressForm] = Form.useForm();
    const [paymentForm] = Form.useForm();

    const save = async () => {
        try {

            const account: IAccount = {
                name: accountForm.getFieldValue('name'),
                lastName: accountForm.getFieldValue('lastName'),
                email: accountForm.getFieldValue('name'),
            };

            const accountSave = await setAccount(account);

        } catch (error) {
            
        }
    };

    const disconnect = (): void => {
        localStorage.removeItem('token');
        window.open(`${window.origin}/events`, '_self');
    };

    const initForm = async (): Promise<void> => {
        accountForm.setFieldValue('name', state.account?.name);
        accountForm.setFieldValue('lastName', state.account?.lastName);
        accountForm.setFieldValue('email', state.account?.email);
        accountForm.setFieldValue('address', state.account?.address);
        accountForm.setFieldValue('balance', `${new Intl.NumberFormat().format(state.account?.balance!)} LS`);
    };

    const saveAccount = async (): Promise<void> => {

    };

    const saveAddress = async (): Promise<void> => {

    };

    const savePayment = async (): Promise<void> => {

    };
     
    useEffect(() => {
        state.account && initForm();
    }, [state.account]);

    return (
        <div className="account-container">
            <div className="account-content">
                <div className="account-menu">
                    <ul>
                        <li onClick={() => setActiveTab('ACCOUNT')}>Account</li>
                        <li onClick={() => setActiveTab('PAYMENT')}>Payment</li>
                    </ul>
                </div>
                {activeTab == 'ACCOUNT' ? (
                    <>
                        <h1>Account</h1>
                        <div className="account-form">
                            <Form form={accountForm} layout="vertical">
                                <Form.Item label="Name" name="name">
                                    <Input size="large"/>
                                </Form.Item>
                                <Form.Item label="Lastname" name="lastName">
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
                                        <div  className="form-actions">
                                            <Button size="large" className="account-btn" type="primary" onClick={() => saveAccount()}>
                                                Save Account
                                            </Button>
                                        </div>
                                    )}
                                </Form.Item>
                            </Form>
                        </div>
                        <div className="account-disconnect">
                            <Button size="large" className="account-btn" type="primary" onClick={() => disconnect()}>
                                Disconnect
                            </Button>
                        </div>
                    </>
                ) : null}
                {activeTab == 'PAYMENT' ? (
                    <>
                    <h1>Payment</h1>
                    <div className="account-form">
                        <Form  form={paymentForm} layout="vertical">
                            <Form.Item label="Card holder name" name="card_holder">
                                <Input size="large"/>
                            </Form.Item>
                            <Form.Item label="Card number" name="card_number">
                                <Input size="large"/>
                            </Form.Item>
                            <div className="expire-date-container">
                                <label>Expire Date</label>
                                <div  className="expire-date-content">
                                    <Form.Item name="month">
                                        <Input size="large" placeholder='01'/>
                                    </Form.Item>
                                    <div className="bar">/</div>
                                    <Form.Item name="year">
                                        <Input size="large" placeholder='10'/>
                                    </Form.Item>
                                </div>
                            </div>
                            <Form.Item shouldUpdate>
                                {() => (
                                    <div  className="form-actions">
                                        <Button size="large" className="account-btn" type="primary" onClick={() => savePayment()}>
                                            Save Payment
                                        </Button>
                                    </div>
                                )}
                            </Form.Item>
                        </Form>
                    </div>
                </>
                ) : null}
            </div>
        </div>
    );

};