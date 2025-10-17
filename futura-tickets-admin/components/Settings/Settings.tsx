"use client";
import { useState } from "react";

// ANTD
import { GlobalOutlined, SettingOutlined } from "@ant-design/icons";

// COMPONENTS
import AdminAccounts from "./AdminAccounts/AdminAccounts";
import Api from "./Api/Api";
import Notifications from "./Notifications/Notifications";
import NotificationButton from "../NotificationsMenu/NotificationButton";

// INTERFACES
import { Account, Roles } from '@/shared/interfaces'

// STYLES
import "./Settings.scss";

export interface CreateAccount {
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  registered?: boolean;
  role: Roles;
}

export default function Settings() {

  const [activeLink, setActiveLink] = useState<string>("accounts");

  const scrollTo = (section: string): void => {
    const element = document.getElementById(section);
    element && window.scrollTo({ top: element.getBoundingClientRect().y + window.scrollY - 190 });
    element && setActiveLink(section);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1><SettingOutlined /> Settings</h1>
        <div className="settings-header-actions">
          <NotificationButton />
        </div>
      </div>
      <div className="settings-content-container">
        <div className="settings-menu">
          <ul>
            <li className={activeLink == "accounts" ? "active" : ""} onClick={() => scrollTo('accounts')}>Admin Account</li>
            <li className={activeLink == "api" ? "active" : ""} onClick={() => scrollTo('api')}>API</li>
            <li className={activeLink == "notifications" ? "active" : ""} onClick={() => scrollTo('notifications')}>Notifications</li>
          </ul>
        </div>
        <div className="settings-content">
          <AdminAccounts/>
          <Api/>
          <Notifications/>
        </div>
      </div>
    </div>
  );
}
