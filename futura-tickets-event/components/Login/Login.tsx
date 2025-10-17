"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// GOOGLE SIGN IN
import { useGoogleLogin } from '@react-oauth/google';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// ANTD
import Form from 'antd/es/form';
import Input from 'antd/es/input/Input';
import Button from 'antd/es/button';
import { GoogleOutlined } from '@ant-design/icons';

// SERVICES
import { loginAccount, loginGoogle } from '../shared/services';

// STYLES
import './Login.scss';

export interface UserLogin {
    email: string;
    password: string;
};

export default function Login() {

    const [state, dispatch] = useGlobalState();
    const [loader, setLoader] = useState<boolean>(false);
    const [clientReady, setClientReady] = useState<boolean>(false);

    const [form] = Form.useForm();
    const router = useRouter();

    const redirect = () => {
        router.push('/register');
    };

    const login = async () => {

        setLoader(true);

        try {

            const login: UserLogin = {
                email: form.getFieldValue('email'),
                password: form.getFieldValue('password')
            };

            const account = await loginAccount(login);

            localStorage.setItem('token', account.token!);

            dispatch({ account });

            setLoader(false);

            router.push(`/`);

        } catch (error) {
            setLoader(false);
        }

    };

    const signInGoogle = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            const account = await loginGoogle(codeResponse.access_token);

            localStorage.setItem('token', account.token!);

            dispatch({ account });
            
            router.push(`/`);
        },
        flow: 'implicit',
    });

    useEffect(() => {
        setClientReady(true);
    }, [])

    return (
        <div className="login-container">
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
                    <Form.Item shouldUpdate>
                        {() => (
                            <div  className="form-actions">
                                <Button className="cancel-btn" onClick={() => redirect()}>
                                    I dont have an account.
                                </Button>
                                <Button className="login-btn" type="primary" onClick={() => login()} loading={loader} disabled={loader}>
                                    Login
                                </Button>
                            </div>
                        )}
                    </Form.Item>
                </Form>
            </div>
            <div>
                <Button size="large" className="login-btn" type="primary" onClick={() => signInGoogle()}>
                    <GoogleOutlined /> Login with Google
                </Button>
            </div>
        </div>
    );

};