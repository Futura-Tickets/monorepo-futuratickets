import React from 'react';
import Link from 'next/link';

// ANTD
import ClockCircleOutlined from '@ant-design/icons/lib/icons/ClockCircleOutlined';
import UserOutlined from '@ant-design/icons/lib/icons/UserOutlined';

// INTERFACES
import { Notification } from '@/shared/interfaces';

const UserNotification =  ({ notification }: { notification: Notification }) => {
  return (
    <div className="notificationContent">
      <div className="notificationIcon">
        <UserOutlined />
      </div>
      <div className="notificationTextContainer">
        <p className="notificationMessage">
          New user registered:
          <br/>
          <Link href={`/clients/${notification?.userId?._id}`} className="clickableLink">
            {notification?.userId?.name} {notification?.userId?.lastName}
          </Link>
        </p>
        <p className="notification-date">
          <ClockCircleOutlined /> {new Date(notification.createdAt!).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default UserNotification;

