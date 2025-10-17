"use client";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';

// ANTD
import { BarChartOutlined, CalendarOutlined, CreditCardOutlined, DashboardOutlined, PoweroffOutlined, SettingOutlined, TeamOutlined } from "@ant-design/icons";
import Tooltip from "antd/es/tooltip";

// STATE
import { useGlobalState } from "@/components/GlobalStateProvider/GlobalStateProvider";

// STYLES
import "./Menu.scss";

const color = '#333333';

export default function Menu() {

    const router = useRouter();
    const pathname = usePathname();

    const [state, dispatch] = useGlobalState();

    const setMenuState = (): void => {
        dispatch({ menuState: !state.menuState });
    };

    const setActiveMenu = (route: string): string | undefined => {
        if (pathname.match(route) || (pathname.split('/')[1] == '' && route == '/dashboard')) return 'active';
        return '';
    };

    const navigateTo = (route: string): void => {
        router.push(route);
    };

    return (
        <div className={`menu-container ${state.menuState ? "active": ""}`}>
            <div className="menu-content">
                <div className="menu-image" onClick={() => setMenuState()}>
                    <img src={`${process.env.NEXT_PUBLIC_BLOB_URL}/${state.account?.promoter?.icon || 'default-icon.png'}`} className="futura-logo"/>
                    <img src={`${process.env.NEXT_PUBLIC_BLOB_URL}/${state.account?.promoter?.image || 'default-image.png'}`} className="futura-logo-large"/>
                </div>
                <div className="menu-items">
                    <Link className={"menu-item " + setActiveMenu('/dashboard')}  href="/">
                        <Tooltip placement="right" title={state.menuState ? "" : "Dashboard"} color={color}>
                            <div className="menu-icon">
                                <DashboardOutlined />
                            </div>
                        </Tooltip>
                        <span>Dashboard</span>
                    </Link>
                    <Link className={"menu-item " + setActiveMenu('/events')}  href="/events">
                        <Tooltip placement="right" title={state.menuState ? "" : "Events"} color={color}>
                            <div className="menu-icon">
                                <CalendarOutlined />
                            </div>
                        </Tooltip>
                        <span>Events</span>
                    </Link>
                    <Link className={"menu-item " + setActiveMenu('/clients')} href="/clients">
                        <Tooltip placement="right" title={state.menuState ? "" : "Clients"} color={color}>
                            <div className="menu-icon">
                                <TeamOutlined />
                            </div>
                        </Tooltip>
                        <span>Clients</span>
                    </Link>
                    {/* <Link className={"menu-item " + setActiveMenu('/campaigns')} href="/campaigns">
                        <Tooltip placement="right" title={state.menuState ? "" : "Campaigns"} color={color}>
                            <div className="menu-icon">
                                <NotificationOutlined />
                            </div>
                        </Tooltip>
                        <span>Campaigns</span>
                    </Link> */}
                    <Link className={"menu-item " + setActiveMenu('/analytics')} href="/analytics">
                        <Tooltip placement="right" title={state.menuState ? "" : "Analytics"} color={color}>
                            <div className="menu-icon">
                                <BarChartOutlined />
                            </div>
                        </Tooltip>
                        <span>Analytics</span>
                    </Link>
                    <Link className={"menu-item " + setActiveMenu('/payments')} href="/payments">
                        <Tooltip placement="right" title={state.menuState ? "" : "Payments"} color={color}>
                            <div className="menu-icon">
                                <CreditCardOutlined />
                            </div>
                        </Tooltip>
                        <span>Payments</span>
                    </Link>
                    <Link className={"menu-item " + setActiveMenu('/settings')} href="/settings">
                        <Tooltip placement="right" title={state.menuState ? "" : "Settings"} color={color}>
                            <div className="menu-icon">
                                <SettingOutlined />
                            </div>
                        </Tooltip>
                        <span>Settings</span>
                    </Link>
                    {state.isConnected ? (
                        <div className="menu-item account" onClick={() => navigateTo('/account')}>
                            <div className="menu-icon image">
                                <span>{state.account?.name?.substring(0, 1) || 'U'}</span>
                            </div>
                            <div className="account-info">
                                <div>{state.account?.name} {state.account?.lastName}</div>
                                <div>{state.account?.email}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="menu-item account" onClick={() => navigateTo('/login')}>
                            <div className="menu-icon">
                                <PoweroffOutlined/>
                            </div>
                            <span>Connect</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}