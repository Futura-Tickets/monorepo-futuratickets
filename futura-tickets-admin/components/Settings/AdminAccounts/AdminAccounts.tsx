"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

// ANTD
import { CloseOutlined, PlusOutlined, TeamOutlined } from "@ant-design/icons";
import Button from "antd/es/button";
import Form from "antd/es/form";
import Input from "antd/es/input";
import Modal from "antd/es/modal";
import Select from "antd/es/select";

// SERVICES
import { createPromoterAccount, deleteAdminAccount, getAdminAccounts } from "@/shared/services";

// INTERACES
import { Account, CreateAccount } from "@/shared/interfaces";

// STYLES
import "./AdminAccounts.scss";

export function AdminAccount(
    { adminAccount, setActiveAdminAccount, setAdminAccountRemoveModal }:
    { adminAccount: Account, setActiveAdminAccount: Dispatch<SetStateAction<Account | undefined>>, setAdminAccountRemoveModal: Dispatch<SetStateAction<boolean>> }
) {
    
    const removeAdminAccount = (adminAccount: Account): void => {
        setActiveAdminAccount(adminAccount);
        setAdminAccountRemoveModal(true);
    };
    
    return (
        <div className="admin-account-container">
            <div className="admin-account-content">
                <div className="admin-accounts-name">{adminAccount.name} {adminAccount.lastName}</div>
                <div className="admin-accounts-address">{adminAccount.email}</div>
                <div className="admin-accounts-role">
                    <div className="role">{adminAccount.role}</div>
                </div>
                <div className="admin-accounts-action">
                    <span onClick={() => removeAdminAccount(adminAccount)}><CloseOutlined /></span>
                </div>
            </div>
        </div>
    );
}

export default function AdminAccounts() {

    const [form] = Form.useForm();

    const [adminAccounts, setAdminAccountsState] = useState<Account[]>([]);
    const [adminAccountsRemoveModal, setAdminAccountRemoveModal] = useState<boolean>(false);
    const [activeAdminAccount, setActiveAdminAccount] = useState<Account>();
    const [addAccountModal, setAccountModal] = useState<boolean>(false);

    const [loader, setLoader] = useState<boolean>();
    const [error, setError] = useState<boolean>();

    const setAdminAccounts = async(): Promise<void> => {
        try {
    
          setLoader(true);
    
          const adminAccounts = await getAdminAccounts();
          setAdminAccountsState(adminAccounts);
    
          setLoader(false);
    
        } catch (error) {
          setError(false);
          setLoader(false);
        }
    };

    const createAccount = async(): Promise<void> => {
        try {
      setLoader(true);

      const adminAccount: CreateAccount = {
        name: form.getFieldValue('name'),
        lastName: form.getFieldValue('lastName'),
        email: form.getFieldValue('email'),
        password: form.getFieldValue('password'),
        role: form.getFieldValue('role')
      };

      const newAccount = await createPromoterAccount(adminAccount);
      
      setAdminAccountsState([newAccount, ...adminAccounts]);

      setLoader(false);
      handleAddAccountCancel();
      
    } catch (error) {
        setLoader(false);
        setError(false);
    }
    };

    const removeAdminAccount = async (adminAccount: string): Promise<void> => {
        try {

            setLoader(true);

            await deleteAdminAccount(adminAccount);

            setLoader(false);
            handleAdminAccountsRemoveCancel();

        } catch (error) {
            setError(false);
            setLoader(false);
        }
    };

    const handleAddAccountCancel = (): void => {
        setAccountModal(false);
    };

    const handleAdminAccountsRemoveCancel = (): void => {
        setAdminAccountRemoveModal(false);
        setActiveAdminAccount(undefined);
    };

    const handleChange = async (accountType: any): Promise<void> => {
        form.setFieldValue('role', accountType);
    };

    useEffect(() => {
        setAdminAccounts();
        // Inicializar form solo cuando se haya montado
        if (addAccountModal) {
            form.setFieldValue('role', 'ADMIN');
        }
    }, [addAccountModal])

    return (
        <>
            <div className="admin-accounts-container" id="accounts">
                <div className="admin-accounts-header">
                    <h1><TeamOutlined />Admin Accounts ({adminAccounts?.length || 0})</h1>
                    <div className="admin-accounts-header-actions">
                        <Button size="large" className="view-details" onClick={() => setAccountModal(true)}>
                            <PlusOutlined /> Add Account
                        </Button>
                    </div>
                </div>
                <div className="admin-accounts-content">
                    <div className="admin-accounts-content-header">
                        <div className="admin-accounts-name">Name</div>
                        <div className="admin-accounts-address">Email</div>
                        <div className="admin-accounts-role">Role</div>
                        <div></div>
                    </div>
                    {(!adminAccounts || adminAccounts.length === 0) && (
                        <div className="admin-accounts-not-found">
                            No admin accounts found
                        </div>
                    )}
                    {Array.isArray(adminAccounts) && adminAccounts.map((adminAccount: Account, i: number) => {
                        return <AdminAccount adminAccount={adminAccount} setActiveAdminAccount={setActiveAdminAccount} setAdminAccountRemoveModal={setAdminAccountRemoveModal} key={i}/>
                    })}
                </div>
            </div>
            <Modal title={null} open={addAccountModal} onCancel={handleAddAccountCancel} closable={true} footer={null} mask={true} centered>
                <div className="add-account-container">
                <div className="add-account-header">
                    <h2>Add Account</h2>
                </div>
                <div className="add-account-content">
                    <Form form={form} layout="vertical" preserve={false}>
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
                        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                            <Select size="large" onChange={handleChange} defaultValue="PROMOTER" style={{ width: "100%" }}>
                                <Select.Option value="PROMOTER">PROMOTER</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item shouldUpdate>
                            {() => (
                            <Button size="large" className="account-btn" type="primary" onClick={() => createAccount()} loading={loader}>
                                Add Account
                            </Button>
                            )}
                        </Form.Item>
                    </Form>
                </div>
                </div>
            </Modal>
            <Modal title={null} open={adminAccountsRemoveModal} onCancel={handleAdminAccountsRemoveCancel} closable={true} footer={null} mask={true} centered>
                <div className="admin-account-remove-modal-container">
                    <div className="admin-account-remove-modal-content">
                        <h2>Remove Account</h2>
                        <p>The Admin Account <strong>"{activeAdminAccount?.email}"</strong> will be deleted and all its related data.</p>
                        <p>You will not be able to recover the information.</p>
                        <div className="season-remove-modal-action">
                            <Button size="large" type="primary" onClick={() => activeAdminAccount && removeAdminAccount(activeAdminAccount._id!)} loading={loader}>Remove Admin Account</Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}