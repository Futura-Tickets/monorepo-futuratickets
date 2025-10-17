import React from 'react';
import Link from 'next/link';

// ANTD
import ClockCircleOutlined from '@ant-design/icons/lib/icons/ClockCircleOutlined';
import { SwapOutlined } from '@ant-design/icons';

// INTERFACES
import { Notification } from '@/shared/interfaces';

const ResaleNotification = ({ notification }: { notification: Notification }) => {

  const notificationDate = new Date(notification.createdAt!).toLocaleString();
  
  const userId = notification.orderId?.account?._id;
  const creatorFullName = `${notification.orderId?.account?.name} ${notification.orderId?.account?.lastName}`;
  const eventName = notification.orderId?.event?.name;
  const eventId = notification.orderId?.event?._id;
  const orderId = notification.orderId?._id;
  
  return (
    <div className="notificationContent">
      <div className="notificationIcon">
        <SwapOutlined />
      </div>
      <div className="notificationTextContainer">
        <p className="notificationMessage">
          <Link href={`/events/${eventId}/order/${orderId}`}  className="clickableLink">
            Resale
          </Link>{" "}
          by {" "}
          <Link href={`/clients/${userId}`} className="clickableLink">
            {creatorFullName}
          </Link>{" "}
          <br/>for event {" "}
          <Link href={`/events/${eventId}`} className="clickableLink">
            {eventName}
          </Link>
        </p>
        <p className="notification-date">
          <ClockCircleOutlined /> {notificationDate}
        </p>
      </div>
    </div>
  );
};

export default ResaleNotification;