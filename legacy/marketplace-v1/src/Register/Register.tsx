"use client";
import { useNavigate } from 'react-router-dom';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// ANTD
import Form from 'antd/es/form';
import Input from 'antd/es/input/Input';
import Button from 'antd/es/button';

// SERVICES
import { createAccount } from '../shared/services';

// STYLES
import './Register.scss';

// INTERFACES
import { CreateAccount } from '../shared/interfaces';

export default function Register() {

    const [state, dispatch] = useGlobalState();

    const [form] = Form.useForm();
    const navigate = useNavigate();

    const redirect = () => {
        navigate("/login");
    };

    const register = async (): Promise<void> => {
        
        const newAccount: CreateAccount = {
            name: form.getFieldValue('name'),
            lastName: form.getFieldValue('name'),
            email: form.getFieldValue('email'),
            password: form.getFieldValue('password'),
        };

        try {
            const account = await createAccount(newAccount);

            localStorage.setItem('token', account.token!);

            dispatch({ account });

            navigate('/events');

        } catch (error) {
            console.log('There was an error creating your account!');
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
                    <Form.Item shouldUpdate>
                        {() => (
                            <div  className="form-actions">
                                <Button className="cancel-btn" type="primary" onClick={() => redirect()}>
                                    I already hace an account.
                                </Button>
                                <Button className="login-btn" type="primary" onClick={() => register()}>
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