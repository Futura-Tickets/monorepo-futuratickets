"use client";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// ANTD
import Form from 'antd/es/form';
import Input from 'antd/es/input/Input';
import Button from 'antd/es/button';

// SERVICES
import { loginAccount } from '../shared/services';

// STYLES
import './Login.scss';

export interface UserLogin {
    email: string;
    password: string;
};

export default function Login() {

    const [state, dispatch] = useGlobalState();
    const [loader, setLoader] = useState<boolean>(false);

    const [form] = Form.useForm();
    const navigate = useNavigate();

    const redirect = () => {
        navigate('/register');
    };

    const login = async () => {

        setLoader(true);

        try {

            const login: UserLogin = {
                email: form.getFieldValue('email'),
                password: form.getFieldValue('password')
            };

            const account = await loginAccount(login);

            console.log(account);

            localStorage.setItem('token', account.token!);

            dispatch({ account });

            setLoader(false);

            navigate(`/events`);

        } catch (error) {
            setLoader(false);
        }

    };

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
                                <Button className="cancel-btn" type="primary" onClick={() => redirect()}>
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
        </div>
    );

};