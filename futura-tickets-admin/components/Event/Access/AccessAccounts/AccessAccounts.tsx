"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// ANTD
import { PlusOutlined, TeamOutlined } from "@ant-design/icons";
import Modal from "antd/es/modal";
import Button from "antd/es/button";
import Form from "antd/es/form";
import Input from "antd/es/input";

// STATE
import { useGlobalState } from "@/components/GlobalStateProvider/GlobalStateProvider";

// COMPONENTS
import AccessAccountsList from "./AccessAccountsList/AccessAccountsList";
import Error from "@/shared/Error/Error";
import EventActions from "../../EventActions/EventActions";
import GoBack from "@/shared/GoBack/GoBack";
import Loader from "@/shared/Loader/Loader";

// SERVICES
import { createAccessAccount, getEventAccessAccounts } from "@/shared/services";

// INTERFACES
import { Account, CreateAccess, Event } from "@/shared/interfaces";

// STYLES
import "./AccessAccounts.scss";

// CONSTANTS
const ACCESS_ERROR = "There was an error loading your data";

export default function AccessAccounts() {

    const pathname = usePathname();
    const [state, dispatch] = useGlobalState();

    const [form] = Form.useForm();

    const [accessAccounts, setAccessAccountsState] = useState<Account[]>([]);
    const [eventAccess, setEventAccessState] = useState<Event>();

    const [addAccessAccountModal, setAccessAccountModal] = useState<boolean>(false);
    const [modalLoader, setModalLoader] = useState<boolean>(false);

    const [loader, setLoader] = useState<boolean>(true);
    const [error, setError] = useState<boolean>();

    const setEventAccess = async(eventId: string): Promise<void> => {
        try {

            setLoader(true);

            const eventAccessAccounts = await getEventAccessAccounts(eventId);
            setAccessAccountsState(eventAccessAccounts);

            setLoader(false);

        } catch (error) {
            setError(true);
            setLoader(false);
        }
    };

    const addAccessAccount = async(): Promise<void> => {
        try {
    
          setModalLoader(true);
    
          const accessAccount: CreateAccess = {
            name: form.getFieldValue('name'),
            lastName: form.getFieldValue('lastName'),
            email: form.getFieldValue('email'),
            password: form.getFieldValue('password'),
            event: form.getFieldValue('event')
          };
    
          const account = await createAccessAccount(accessAccount);

          setAccessAccountsState([...accessAccounts, account ]);
    
          setModalLoader(false);
          handleAddAccessAccountCancel();
          
        } catch (error) {
            setLoader(false);
            setError(false);
        }
    };

    const handleAddAccessAccountCancel = (): void => {
        setAccessAccountModal(false);
    };

    const initForm = (event: string): void => {
        form.setFieldsValue({ 'event': event });
    };

    useEffect(() => {
        const eventId = pathname.split("/")[2];
        eventId && setEventAccess(eventId);
        eventId && initForm(eventId);
        state.goBackRoute && dispatch({ goBackRoute: undefined });
    }, []);

    if (loader) return <Loader/>;
    if (error) return <Error errorMsg={ACCESS_ERROR}/>;

    return (
        <>
            <div className="access-accounts-container">
                <div className="access-accounts-header">
                    <GoBack route={`/events/${pathname.split("/")[2]}/access`}/>
                    <h1>Access Accounts</h1>
                    <EventActions actions={{ info: true, notifications: true }}/>
                </div>
                <div className="access-accounts-content">
                    <div className="access-accounts-content-header">
                        <h1><TeamOutlined />Access Accounts ({accessAccounts?.length || 0})</h1>
                        <div className="admin-accounts-header-actions">
                            <Button size="large" className="view-details" onClick={() => setAccessAccountModal(true)}>
                                <PlusOutlined /> Add Access
                            </Button>
                        </div>
                    </div>
                    <AccessAccountsList accessAccounts={accessAccounts} setAccessAccountsState={setAccessAccountsState}/>
                </div>
            </div>
            <Modal title={null} open={addAccessAccountModal} onCancel={handleAddAccessAccountCancel} closable={true} footer={null} mask={true} centered>
                <div className="add-account-container">
                    <div className="add-account-header">
                        <h2>Add Access Account</h2>
                    </div>
                    <div className="add-account-content">
                        <Form form={form} layout="vertical">
                            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                                <Input size="large" placeholder="Name"/>
                            </Form.Item>
                            <Form.Item name="lastName" label="Lastname" rules={[{ required: true }]}>
                                <Input size="large" placeholder="Lastname"/>
                            </Form.Item>
                            <Form.Item name="email" label="Email" rules={[{ required: true }]}>
                                <Input size="large" placeholder="Email"/>
                            </Form.Item>
                            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                                <Input size="large" placeholder="Password"/>
                            </Form.Item>
                            <Form.Item shouldUpdate>
                                {() => (
                                    <Button size="large" className="account-btn" type="primary" onClick={() => addAccessAccount()} loading={modalLoader}>
                                        Add Access
                                    </Button>
                                )}
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </Modal>
        </>
    );
}