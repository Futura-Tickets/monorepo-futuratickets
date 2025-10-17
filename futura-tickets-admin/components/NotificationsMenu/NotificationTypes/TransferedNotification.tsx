import React from 'react';
import Link from 'next/link';

// ANTD
import ClockCircleOutlined from '@ant-design/icons/lib/icons/ClockCircleOutlined';
import { SendOutlined } from '@ant-design/icons';

// INTERFACES
import { Notification } from '@/shared/interfaces';

const TransferedNotification = ({ notification }: { notification: Notification }) => {

  const notificationDate = new Date(notification.createdAt!).toLocaleString();

  const transferEntry = notification.orderId?.sales?.[0]?.history?.find((entry: any) => entry.activity === "TRANSFERED");
  
  const senderId = transferEntry?.from?._id;
  const senderFullName = `${transferEntry?.from?.name} ${transferEntry?.from?.lastName}`;
  
  const receiverId = transferEntry?.to?._id;
  const receiverFullName = `${transferEntry?.to?.name} ${transferEntry?.to?.lastName}`;
  
  const eventId = notification.orderId?.event?._id;
  const saleId = notification.orderId?.sales?.[0]?._id;
  
  return (
    <div className="notificationContent">
      <div className="notificationIcon">
        <SendOutlined />
      </div>
      <div className="notificationTextContainer">
        <p className="notificationMessage">
          <Link href={`/events/${eventId}/ticket/${saleId}`}  className="clickableLink">
            Transfer
          </Link>{" "}
          by {" "}
          <Link href={`/clients/${senderId}`}  className="clickableLink">
            {senderFullName}
          </Link>{" "} <br/>
          to {" "}
          <Link href={`/clients/${receiverId}`}  className="clickableLink">
            {receiverFullName}
          </Link>
        </p>
        <p className="notification-date">
          <ClockCircleOutlined /> {notificationDate}
        </p>
      </div>
    </div>
  );
};

export default TransferedNotification;