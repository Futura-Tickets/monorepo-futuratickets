"use client";
import { useRouter } from 'next/navigation';

// GOOGLE
import { useGoogleLogin } from '@react-oauth/google';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// ANTD
import Form from 'antd/es/form';
import Input from 'antd/es/input/Input';
import Button from 'antd/es/button';
import { GoogleOutlined } from '@ant-design/icons';

// SERVICES
import { createAccount, loginGoogle } from '../shared/services';

// STYLES
import './Register.scss';

// INTERFACES
import { CreateAccount } from '../shared/interfaces';

export default function Register() {

    const [state, dispatch] = useGlobalState();

    const [form] = Form.useForm();
    const router = useRouter();

    const redirect = () => {
        router.push("/login");
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

            router.push('/');

        } catch (error) {
            console.log('There was an error creating your account!');
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

    return (
        <div className="register-container">
            <div className="register-content">
                <Form className="register-form" form={form} layout="vertical">
                    <h1>Register</h1>
                    <Form.Item label="Name" name="name" required>
                        <Input size="large"/>
                    </Form.Item>
                    <Form.Item label="Lastname" name="lastName" required>
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
                                <Button className="cancel-btn" onClick={() => redirect()}>
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
            <div>
                <Button size="large" className="login-btn" type="primary" onClick={() => signInGoogle()}>
                    <GoogleOutlined /> Register with Google
                </Button>
            </div>
        </div>
    );

};