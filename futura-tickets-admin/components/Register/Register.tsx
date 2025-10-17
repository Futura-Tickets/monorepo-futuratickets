"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// ANTD
import Form from 'antd/es/form';
import Input from 'antd/es/input/Input';
import Button from 'antd/es/button';

// SERVICES
import { createAccount } from '@/shared/services';

// STYLES
import './Register.scss';

// INTERFACES
import { CreateAccount } from '@/shared/interfaces';

export default function Register() {

    const [state, dispatch] = useGlobalState();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const [form] = Form.useForm();
    const router = useRouter();

    const redirect = () => {
        router.push("/login");
    };

    const register = async (): Promise<void> => {

        setLoading(true);
        setError('');

        const newAccount: CreateAccount = {
            name: form.getFieldValue('name'),
            lastName: form.getFieldValue('lastname'),
            email: form.getFieldValue('email'),
            password: form.getFieldValue('password'),
        };

        try {
            const account = await createAccount(newAccount);

            if (!account || !account.token) {
                throw new Error('Invalid response from server');
            }

            localStorage.setItem('token', account.token);

            dispatch({ account });

            router.push('/events');

        } catch (error: any) {
            console.error('Registration error:', error);
            setError(error.message || 'Registration failed. Please try again.');
            setLoading(false);
        }

    };

    return (
        <div className="register-container">
            <div className="register-content">
                <Form className="register-form" form={form} layout="vertical">
                    <h1>Register</h1>
                    <Form.Item label="Name" name="name" required>
                        <Input size="large"/>
                    </Form.Item>
                    <Form.Item label="Lastname" name="lastname" required>
                        <Input size="large"/>
                    </Form.Item>
                    <Form.Item label="Email" name="email" required>
                        <Input size="large"/>
                    </Form.Item>
                    <Form.Item label="Password" name="password" required>
                        <Input type="password" size="large"/>
                    </Form.Item>
                    {error && (
                        <div style={{ color: '#ff4d4f', marginBottom: '16px', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}
                    <Form.Item shouldUpdate>
                        {() => (
                            <div  className="form-actions">
                                <Button className="cancel-btn" type="primary" onClick={() => redirect()}>
                                    I already have an account.
                                </Button>
                                <Button
                                    className="login-btn"
                                    type="primary"
                                    onClick={() => register()}
                                    loading={loading}
                                    disabled={!form.isFieldsTouched(true) || !!form.getFieldsError().filter(({ errors }) => errors.length).length}
                                >
                                    Register
                                </Button>
                            </div>
                        )}
                    </Form.Item>
                </Form>
            </div>
        </div>
    );

};