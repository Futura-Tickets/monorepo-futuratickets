"use client";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

// STATE
import { useGlobalState } from "../GlobalStateProvider/GlobalStateProvider";

// ANTD
import Button from "antd/es/button";
import Form from 'antd/es/form';
import { PoweroffOutlined } from "@ant-design/icons";
import Input from "antd/es/input";

// COMPONENTS
import Error from "@/shared/Error/Error";
import Loader from "@/shared/Loader/Loader";

// SERVICES
import { checkExpiration } from "@/shared/services";

// STYLES
import "./Profile.scss";

// CONSTANTS
const PROFILE_ERROR = "There was an error loading your profile";

export default function Profile() {

    const router = useRouter();
    
    const [state, dispatch] = useGlobalState();
    const [profile, setProfileState] = useState<any>();

    const [accountForm] = Form.useForm();
    const [loader, setLoader] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    const setProfile = async (): Promise<void> => {
        try {

            setLoader(true);
            
            const profile = await checkExpiration();
            setProfileState(profile);
            
            setLoader(false);
        
        } catch (error) {
            setError(true);
            setLoader(false);
        }
    };

    const initForm = async (): Promise<void> => {
        accountForm.setFieldValue('name', state.account?.name);
        accountForm.setFieldValue('lastName', state.account?.lastName);
        accountForm.setFieldValue('email', state.account?.email);
    };

    const disconnect = (): void => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    useEffect(() => {
        setProfile();
    }, []);

    useEffect(() => {
        state.account && initForm();
    }, [state.account]);

    if (loader) return <Loader/>;
    if (error) return <Error errorMsg={PROFILE_ERROR}/>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Account</h1>
                <div className="profile-header-actions">
                    <div className="profile-header-action" onClick={() => disconnect()}>
                        <PoweroffOutlined />
                    </div>
                </div>
            </div>
            <div className="profile-content">
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
                    <Form.Item shouldUpdate>
                        {() => (
                            <div  className="form-actions">
                                <Button size="large" className="account-btn" type="primary">
                                    Save Account
                                </Button>
                            </div>
                        )}
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}

