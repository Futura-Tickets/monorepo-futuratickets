"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// GOOGLE SIGN IN
import { useGoogleLogin } from '@react-oauth/google';

// SOCKET
import { initSocket } from '../Socket';
import { initSocketMarketPlace } from '../SocketMarketPlace';
import { initSocketAccess } from '../SocketAccess';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// ANTD
import Form from 'antd/es/form';
import Input from 'antd/es/input/Input';
import Button from 'antd/es/button';
import { GoogleOutlined } from '@ant-design/icons';

// SERVICES
import { loginAccount, loginGoogle } from '@/shared/services';

// INTERFACES
import { UserLogin } from '@/shared/interfaces';

// STYLES
import './Login.scss';

export default function Login() {

    const router = useRouter();

    const [state, dispatch] = useGlobalState();
    const [clientReady, setClientReady] = useState<boolean>(false);
    const [loader, setLoader] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const [form] = Form.useForm();

    const login = async () => {

        setLoader(true);
        setError('');

        try {

            const loginData: UserLogin = {
                email: form.getFieldValue('email'),
                password: form.getFieldValue('password')
            };

            const account = await loginAccount(loginData);

            if (!account || !account.token) {
                throw new Error('Invalid response from server');
            }

            localStorage.setItem('token', account.token);
            dispatch({ isConnected: true, account });

            // Initialize sockets asynchronously without blocking login
            setTimeout(() => {
                try {
                    initSocket();
                    initSocketMarketPlace();
                    initSocketAccess();
                } catch (socketError) {
                    console.warn('Socket initialization failed:', socketError);
                }
            }, 100);

            // Redirect immediately
            router.push(`/`);

        } catch (error: any) {
            console.error('Login error:', error);
            setError(error.message || 'Login failed. Please check your credentials.');
            setLoader(false);
        }
    };

    const signInGoogle = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            try {
                const account = await loginGoogle(codeResponse.access_token);

                if (account && account.token) {
                    localStorage.setItem('token', account.token);
                    dispatch({ account });
                    router.push(`/events`);
                } else {
                    console.error('Login failed: No token received');
                }
            } catch (error) {
                console.error('Google login error:', error);
            }
        },
        onError: (error) => {
            console.error('Google OAuth error:', error);
        },
        flow: 'implicit',
    });

    useEffect(() => {
        setClientReady(true);
    }, [])

    return (
        <div className="login-container">
            <div className="login-image">
                <img src="/assets/images/exito-inolvidable-v3.jpeg"/>
            </div>
            <div className="login-content">
                {/* <img src="/assets/img/grapes-login.png"/> */}
                <Form className="login-form" form={form} layout="vertical">
                    <h1>Login</h1>
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
                                <Button className="login-btn" type="primary" onClick={() => login()} loading={loader} disabled={!clientReady || !form.isFieldsTouched(true) || !!form.getFieldsError().filter(({ errors }) => errors.length).length}>
                                    Login
                                </Button>
                            </div>
                        )}
                    </Form.Item>
                    <div className="separator">Or log in  with </div>
                    <Form.Item>
                        <Button className="google-login-btn" onClick={() => signInGoogle()}>
                        <GoogleOutlined /> Login with Google
                    </Button>
                    </Form.Item>
                    <div className="register-link" style={{ textAlign: 'center', marginTop: '20px' }}>
                        ¿No tienes cuenta? <a href="/register" style={{ color: '#00c8b3', fontWeight: 600 }}>Regístrate aquí</a>
                    </div>
                </Form>
            </div>
        </div>
    );

};