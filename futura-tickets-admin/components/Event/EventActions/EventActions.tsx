"use client";
import { Dispatch, SetStateAction } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// ANTD
import { DeleteOutlined, EditOutlined, FilterOutlined, InfoCircleOutlined, RocketOutlined, SaveOutlined, ScanOutlined, SendOutlined, StopOutlined, SwapOutlined, TeamOutlined } from '@ant-design/icons';
import Tooltip from 'antd/es/tooltip';

// COMPONENTS
import ExportCsv from '@/shared/ExportEventCsv/ExportEventCsv';
import NotificationButton from "../../NotificationsMenu/NotificationButton";

// SERVICES
import { exportEventCSVRequest } from '@/shared/services';

// INTERFACES
import { Event } from '@/shared/interfaces';

export interface EventAvailableActions {
    launch?: boolean;
    filter?: boolean;
    access?: boolean;
    export?: boolean;
    accessAccounts?: boolean;
    scan?: boolean;
    enableResale?: boolean;
    resale?: boolean;
    info?: boolean;
    invitations?: boolean;
    notifications?: boolean;
    edit?: boolean;
    delete?: boolean;
}

// STYLES
import './EventActions.scss';

const color = '#333333';

export default function EventActions(
    { event, filterState, isEditMode, actions, setFilterState, setEventLaunchModal, setEnableResaleModal, setDisableResaleModal, setEventRemoveModal, setEventEditModal, setEditMode }: 
    { event?: Event; filterState?: boolean; isEditMode?: boolean; actions: EventAvailableActions; setFilterState?: Dispatch<SetStateAction<boolean>>; setEnableResaleModal?: Dispatch<SetStateAction<boolean>>; setDisableResaleModal?: Dispatch<SetStateAction<boolean>>; setEventLaunchModal?: Dispatch<SetStateAction<boolean>>; setEventRemoveModal?: Dispatch<SetStateAction<boolean>>; setEventEditModal?: Dispatch<SetStateAction<boolean>>; setEditMode?: Dispatch<SetStateAction<boolean>>; }
) {
    
    const router = useRouter();
    const pathname = usePathname();
    

    const navigateTo = (route: string): void => {
        router.push(route);
    };

    const setActiveAction = (route: string): string | undefined => {
        if (pathname.match(route)) return 'active';
        return '';
    };

    const exportCSV = async (): Promise<void> => {
        try {
          await exportEventCSVRequest(event?._id!);
        } catch (error) {

        }
    };

    return (
        <div className="event-header-actions">
            {actions.enableResale && event?.resale.isActive == false && (
                <Tooltip placement="bottom" title="Enable resale" color={color}>
                    <div className="event-header-action" onClick={() => setEnableResaleModal && setEnableResaleModal(true)}>
                        <RocketOutlined />
                    </div>
                </Tooltip>
            )}
            {actions.enableResale && event?.resale.isActive == true && (
                <Tooltip placement="bottom" title="Disable resale" color={color}>
                    <div className="event-header-action" onClick={() => setDisableResaleModal && setDisableResaleModal(true)}>
                        <StopOutlined />
                    </div>
                </Tooltip>
            )}
            {actions.launch && event?.status == 'HOLD' && (
                <Tooltip placement="bottom" title="Launch" color={color}>
                    <div className="event-header-action" onClick={() => setEventLaunchModal && setEventLaunchModal(true)}>
                        <RocketOutlined />
                    </div>
                </Tooltip>
            )}
            {actions.filter && (
                <Tooltip placement="bottom" title="Filter" color={color}>
                    <div className={`event-header-action ${filterState ? "active" : ""}`} onClick={() => setFilterState && setFilterState(!filterState)}>
                        <FilterOutlined />
                    </div>
                </Tooltip>
            )}
            {actions.access && event?.status != 'HOLD' && (
                <Tooltip placement="bottom" title="Access" color={color}>
                    <div className={"event-header-action " + setActiveAction('/access')} onClick={() => navigateTo(`/events/${pathname.split("/")[2]}/access`)}>
                        <ScanOutlined />
                    </div>
                </Tooltip>
            )}
            {actions.accessAccounts && event?.status != 'HOLD' && (
                <Tooltip placement="bottom" title="Access Accounts" color={color}>
                    <div className={"event-header-action " + setActiveAction('/access/accounts')} onClick={() => navigateTo(`/events/${pathname.split("/")[2]}/access/accounts`)}>
                        <TeamOutlined />
                    </div>
                </Tooltip>
            )}
            {actions.resale && event?.status != 'HOLD' && (
                <Tooltip placement="bottom" title="Resales and Transfers" color={color}>
                    <div className={"event-header-action " + setActiveAction('/resale')} onClick={() => navigateTo(`/events/${pathname.split("/")[2]}/resale`)}>
                        <SwapOutlined />
                    </div>
                </Tooltip>
            )}
            {actions.invitations && event?.status != 'HOLD' && (
                <Tooltip placement="bottom" title="Invitations and Coupons" color={color}>
                    <div className={"event-header-action " + setActiveAction('/invitations')} onClick={() => navigateTo(`/events/${pathname.split("/")[2]}/invitations`)}>
                        <SendOutlined />
                    </div>
                </Tooltip>
            )}
            {actions.export && (
                <ExportCsv exportRequest={exportCSV} title={"Export Event CSV"}/>
            )}
            {actions.info && (
                <Tooltip placement="bottom" title={"Event Info"} color={color}>
                    <div className={"event-header-action " + setActiveAction('/info')} onClick={() => navigateTo(`/events/${pathname.split("/")[2]}/info`)}>
                        <InfoCircleOutlined />
                    </div>
                </Tooltip>
            )}
            {actions.notifications && (
                <NotificationButton/>
            )}
            {actions.edit && (
                <Tooltip placement="bottom" title={isEditMode ? "End edition" : "Edit event"} color={color}>
                    <div className={`event-header-action ${isEditMode ? "active" : ""}`} onClick={() => setEditMode && setEditMode(!isEditMode)}>
                        {isEditMode ? <SaveOutlined /> : <EditOutlined />}
                    </div>
                </Tooltip>
            )}
            {actions.delete && (
                <Tooltip placement="bottom" title="Delete" color={color}>
                    <div className="event-header-action" onClick={() => setEventRemoveModal && setEventRemoveModal(true)}>
                        <DeleteOutlined />
                    </div>
                </Tooltip>
            )}
        </div>
    );

};