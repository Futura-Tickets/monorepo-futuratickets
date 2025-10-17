"use client";
import { Dispatch, SetStateAction, useState } from "react";

// ANTD
import Button from "antd/es/button";
import { CloseOutlined } from "@ant-design/icons";
import Input from "antd/es/input";
import Modal from "antd/es/modal";

// SERVICES
import { deleteAdminAccount } from "@/shared/services";

// INTERACES
import { Account } from "@/shared/interfaces";

// STYLES
import "./AccessAccountsList.scss";

export function AccessAccountItem(
    { accessAccount, setActiveAdminAccount, setAdminAccountRemoveModal }:
    { accessAccount: Account, setActiveAdminAccount: Dispatch<SetStateAction<Account | undefined>>, setAdminAccountRemoveModal: Dispatch<SetStateAction<boolean>> }
) {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const removeAdminAccount = (accessAccount: Account): void => {
        setActiveAdminAccount(accessAccount);
        setAdminAccountRemoveModal(true);
    };
    
    return (
        <div className="access-account-item-container">
            <div className="access-account-item-name">{accessAccount.name} {accessAccount.lastName}</div>
            <div className="access-account-item-email">{accessAccount.email}</div>
            <div className="access-account-item-password">
                <Input.Password placeholder="input password" value={accessAccount.accessPass} visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}/>
            </div>
            <div className="access-account-item-action">
                <span onClick={() => removeAdminAccount(accessAccount)}><CloseOutlined /></span>
            </div>
        </div>
    );
}

export default function AccessAccountsList({ accessAccounts, setAccessAccountsState }: { accessAccounts: Account[], setAccessAccountsState: Dispatch<SetStateAction<Account[]>> }) {

    const [adminAccountsRemoveModal, setAdminAccountRemoveModal] = useState<boolean>(false);
    const [activeAdminAccount, setActiveAdminAccount] = useState<Account>();

    const [loader, setLoader] = useState<boolean>();
    const [error, setError] = useState<boolean>();

    const removeAdminAccount = async (adminAccount: string): Promise<void> => {
        try {

            setLoader(true);

            await deleteAdminAccount(adminAccount);

            setAccessAccountsState([...accessAccounts.filter((accessAccount: Account) => accessAccount._id != adminAccount)]);

            setLoader(false);
            handleAdminAccountsRemoveCancel();

        } catch (error) {
            setError(false);
            setLoader(false);
        }
    };

    const handleAdminAccountsRemoveCancel = (): void => {
        setAdminAccountRemoveModal(false);
        setActiveAdminAccount(undefined);
    };

    return (
        <>
            <div className="access-accounts-list-container">
                <div className="access-accounts-list-content-header">
                    <div className="access-accounts-name">Name</div>
                    <div className="access-accounts-address">Email</div>
                    <div className="access-accounts-passwprd">Password</div>
                </div>
                <div className="access-accounts-list-content">
                    {accessAccounts?.map((accessAccount: Account, i: number) => {
                        return <AccessAccountItem accessAccount={accessAccount} setActiveAdminAccount={setActiveAdminAccount} setAdminAccountRemoveModal={setAdminAccountRemoveModal} key={i}/>
                    })}
                </div>
            </div>
            <Modal title={null} open={adminAccountsRemoveModal} onCancel={handleAdminAccountsRemoveCancel} closable={true} footer={null} mask={true} centered>
                <div className="access-account-remove-modal-container">
                    <div className="access-account-remove-modal-content">
                        <h2>Remove Access Account</h2>
                        <p>The Access Account <strong>"{activeAdminAccount?.email}"</strong> will be deleted and all its related data.</p>
                        <p>You will not be able to recover the information.</p>
                        <div className="season-remove-modal-action">
                            <Button size="large" type="primary" onClick={() => activeAdminAccount && removeAdminAccount(activeAdminAccount._id!)} loading={loader}>Remove Access Account</Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}