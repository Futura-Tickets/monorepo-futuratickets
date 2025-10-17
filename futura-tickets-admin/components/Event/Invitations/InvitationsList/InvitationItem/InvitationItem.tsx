"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// ANTD
import Button from "antd/es/button";
import { ClockCircleOutlined, DeleteOutlined, ExclamationCircleOutlined, EyeOutlined, LoadingOutlined, MailOutlined } from "@ant-design/icons";
import Modal from "antd/es/modal";

// INTERFACES
import { Sale, TicketStatus } from "@/shared/interfaces";
import { deleteInvitation } from "@/shared/services";

// STYLES
import "./InvitationItem.scss";

export default function InvitationItem({ invitation }: { invitation: Sale }) {
    const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const router = useRouter();

    const viewTicketDetails = (route: string): void => {
        router.push(route);
    };

    function showDeleteConfirm(): void {
        setDeleteModalVisible(true);
    }

    const handleDeleteCancel = (): void => {
        setDeleteModalVisible(false);
    };

    const handleDelete = async (): Promise<void> => {
        setIsDeleting(true);
        try {
            await deleteInvitation(invitation.event.toString(), invitation._id);
            router.refresh();
        } catch (error) {
            console.error("Error deleting invitation:", error);
        } finally {
            setIsDeleting(false);
            setDeleteModalVisible(false);
        }
    };

    return (
        <>
            <div className="invitation-item-container">
                <div className="invitation-item-content">
                    <div className="order">
                        <MailOutlined onClick={() => viewTicketDetails(`/events/${invitation.event}/order/${invitation.order}`)}/>
                    </div>
                    <div>
                        {invitation.tokenId ? `#${invitation.tokenId}` : 'N/A'}
                    </div>
                    {/* <div className="client">
                        {invitation.client.name} {invitation.client.lastName}
                    </div> */}
                    <div>
                        {invitation.client.email}
                    </div>
                    <div>
                        {invitation.type}
                    </div>
                    <div className="status">
                        {invitation.status == TicketStatus.OPEN && <span className="granted">{invitation.status}</span>}
                        {invitation.status == TicketStatus.PROCESSING && <span className="processing">{invitation.status}<LoadingOutlined/></span>}
                        {invitation.status == TicketStatus.CLOSED && <span className="denied">{invitation.status}</span>}
                    </div>
                    <div>
                        <ClockCircleOutlined /> {new Date(invitation.createdAt).toLocaleDateString()}, {new Date(invitation.createdAt).toLocaleTimeString()}
                    </div>
                    <div className="view">
                        <Button className="view-details" onClick={() => viewTicketDetails(`/events/${invitation.event}/ticket/${invitation._id}`)}>
                            <EyeOutlined />
                        </Button>
                    </div>
                    <div className="view">
                        <Button className="view-details" onClick={() => showDeleteConfirm}>
                            <DeleteOutlined />
                        </Button>
                    </div>
                </div>
            </div>

            <Modal
                open={deleteModalVisible}
                onCancel={handleDeleteCancel}
                okText='Delete'
                confirmLoading={isDeleting}
                okButtonProps={{
                    danger: true,
                    style: { display: 'none' },
                }}
                cancelButtonProps={{
                    style: { display: 'none' },
                }}
                centered
                width={500}
            >
                <div className='delete-invitation-modal'>
                    <h2 className='modal-title'>REMOVE INVITATION</h2>
                    <p>
                        The invitation <strong>"{invitation.client.name} {invitation.client.lastName} #{invitation.tokenId}"</strong> will be
                    </p>
                    <p> deleted and all its related data.</p>
                    <p className='warning-text'>
                    You will not be able to recover the information.
                    </p>

                    <button
                        className='remove-invitation-btn'
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'DELETING...' : 'REMOVING INVITATION'}
                    </button>
                </div>
            </Modal>
        </>
    );
};

