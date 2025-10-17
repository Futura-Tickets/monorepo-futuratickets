import React from 'react';
import Link from 'next/link';

// ANTD
import ClockCircleOutlined from '@ant-design/icons/lib/icons/ClockCircleOutlined';
import ShoppingCartOutlined from '@ant-design/icons/lib/icons/ShoppingCartOutlined';

// INTERFACES
import { Notification } from '@/shared/interfaces';

const OrderNotification = ({ notification }: { notification: Notification }) => {

  const notificationDate = new Date(notification.createdAt!).toLocaleString();
  
  const creatorFullName = `${notification.orderId.account.name} ${notification.orderId.account.lastName}` || 'Unknown user';

  const accountId = notification.orderId?.account?._id || null;
  
  const eventName = notification.orderId?.event?.name || 'Unknown event';
  const eventId = notification.orderId?.event?._id || null;
  const orderId = notification.orderId?._id || null;
  
  return (
    <div className="notificationContent">
      <div className="notificationIcon">
        <ShoppingCartOutlined />
      </div>
      <div className="notificationTextContainer">
        <p className="notificationMessage">
          {eventId && orderId ? (
            <Link href={`/events/${eventId}/order/${orderId}`} className="clickableLink">
              New order
            </Link>
          ) : (
            "New order"
          )}{" "}
          by &nbsp;
          <Link href={`/clients/${accountId}`} className="clickableLink">
            {creatorFullName}
          </Link>
          <br/>
          for &nbsp;
          <Link href={`/events/${eventId}`} className="clickableLink">
            {eventName}
          </Link>
          &nbsp; event.
        </p>
        <p className="notification-date">
          <ClockCircleOutlined /> {notificationDate}
        </p>
      </div>
    </div>
  );
};

export default OrderNotification;