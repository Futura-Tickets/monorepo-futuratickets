"use client";
import { useRouter } from 'next/navigation';

// ANTD
import { ScanOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';

// STYLES
import './Menu.scss';

export default function Menu() {

    const router = useRouter();

    const navigateTo = (route: string): void => {
        router.push(route);
    };

    return (
        <div className="menu-container">
            <div className="menu-content">
                <div className="menu-item" onClick={() => navigateTo('/qrcode')}>
                    <ScanOutlined />
                </div>
                <div className="menu-item" onClick={() => navigateTo('/attendants')}>
                    <TeamOutlined />
                </div>
                <div className="menu-item" onClick={() => navigateTo('/account')}>
                    <UserOutlined />
                </div>
            </div>
        </div>
    );
}