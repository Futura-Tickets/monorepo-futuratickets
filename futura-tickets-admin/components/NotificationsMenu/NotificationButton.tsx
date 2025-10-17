"use client";
import React from 'react';
import { GlobalOutlined } from "@ant-design/icons";
import Tooltip from "antd/es/tooltip";

// STATE
import { useGlobalState } from "../GlobalStateProvider/GlobalStateProvider";

// STYLES
import "./NotificationButton.scss";

const NotificationButton = () => {
  
  const [state, dispatch] = useGlobalState();

  const unreadCount = Array.isArray(state.notifications)
    ? state.notifications.filter(notification => !notification.readBy.find((userId: string) => userId == state.account?.account)).length
    : 0;
  
  const toggleNotificationsMenu = () => {
    if (state.notificationsMenuState) {
      document.getElementsByTagName('body')[0].className = '';
    } else {
      document.getElementsByTagName('body')[0].className = 'noscroll';
    }
    dispatch({ notificationsMenuState: !state.notificationsMenuState });
  };

  return (
    <Tooltip placement="bottom" title="Notificaciones" color="#333333">
      <div className={`notifications-header-action ${state.notificationsMenuState ? 'active' : ''}`} onClick={toggleNotificationsMenu}>
        <GlobalOutlined />
        {unreadCount > 0 && (
          <span className={`notification-badge ${unreadCount > 0 ? 'active' : ''}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    </Tooltip>
  );
};

export default NotificationButton;