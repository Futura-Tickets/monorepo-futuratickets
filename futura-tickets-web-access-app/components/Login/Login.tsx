"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// ANTD
import Form from 'antd/es/form';
import Input from 'antd/es/input/Input';
import Button from 'antd/es/button';
import Checkbox from 'antd/es/checkbox';

// SERVICES
import { loginAccount } from '@/shared/services';

// INTERFACES
import { UserLogin } from '@/shared/interfaces';

// STYLES
import './Login.scss';

export default function Login() {
    
    const router = useRouter();
    
    const [state, dispatch] = useGlobalState();
    const [clientReady, setClientReady] = useState<boolean>(false);
    const [loader, setLoader] = useState<boolean>(false);
    const [rememberMe, setRememberMe] = useState<boolean>(false);

    const [form] = Form.useForm();

    const login = async () => {

        setLoader(true);

        try {

            const login: UserLogin = {
                email: form.getFieldValue('email'),
                password: form.getFieldValue('password')
            };

            const account = await loginAccount(login);
            if (account.token) {
                localStorage.setItem('token', account.token!);

                // Save Remember Me preference
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('userEmail', login.email);
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('userEmail');
                }

                // Set last activity time
                localStorage.setItem('lastActivity', Date.now().toString());

                dispatch({ account });
                router.push(`/qrcode`);
            }

            setLoader(false);

        } catch (error) {
            setLoader(false);
        }
    };

    useEffect(() => {
        setClientReady(true);

        // Check if Remember Me is enabled
        const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
        const savedEmail = localStorage.getItem('userEmail');

        if (savedRememberMe && savedEmail) {
            setRememberMe(true);
            form.setFieldValue('email', savedEmail);
        }
    }, [])

    return (
        <div className="login-container">
            <div className="login-content">
                <Form className="login-form" form={form} layout="vertical">
                    <h1>Access Control</h1>
                    <Form.Item label="Email" name="email" required>
                        <Input size="large"/>
                    </Form.Item>
                    <Form.Item label="Password" name="password" required>
                        <Input type="password" size="large"/>
                    </Form.Item>
                    <Form.Item>
                        <Checkbox
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        >
                            Recordarme
                        </Checkbox>
                    </Form.Item>
                    <Form.Item shouldUpdate>
                        {() => (
                            <div  className="form-actions">
                                <Button className="login-btn" type="primary" onClick={() => login()} loading={loader} disabled={!clientReady || !form.isFieldsTouched(true) || !!form.getFieldsError().filter(({ errors }) => errors.length).length}>
                                    Login
                                </Button>
                            </div>
                        )}
                    </Form.Item>
                </Form>
            </div>
            <div className="login-image">
                <img src="/assets/futura-tickets.png"/>
            </div>
        </div>
    );

};