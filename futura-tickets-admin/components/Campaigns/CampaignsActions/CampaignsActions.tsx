"use client";
import { Dispatch, SetStateAction } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// ANTD
import { DeleteOutlined, EditOutlined, FilterOutlined, InfoCircleOutlined, LoginOutlined, SwapOutlined } from '@ant-design/icons';
import Tooltip from 'antd/es/tooltip';

// COMPONENTS
import NotificationButton from '@/components/NotificationsMenu/NotificationButton';

// INTERFACES
export interface EventAvailableActions {
    launch?: boolean;
    filter?: boolean;
    access?: boolean;
    enableResale?: boolean;
    resale?: boolean;
    info?: boolean;
    notifications?: boolean;
    edit?: boolean;
    delete?: boolean;
}

// STYLES
import './CampaignsActions.scss';

const color = '#333333';

export default function CampaignsActions(
    { filterState, actions, setFilterState, setEventMintModal, setEnableResaleModal, setDisableResaleModal, setEventRemoveModal, setEventEditModal }: 
    { filterState?: boolean; actions: EventAvailableActions; setFilterState?: Dispatch<SetStateAction<boolean>>; setEnableResaleModal?: Dispatch<SetStateAction<boolean>>; setDisableResaleModal?: Dispatch<SetStateAction<boolean>>; setEventMintModal?: Dispatch<SetStateAction<boolean>>; setEventRemoveModal?: Dispatch<SetStateAction<boolean>>; setEventEditModal?: Dispatch<SetStateAction<boolean>>; }
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

    return (
        <div className="campaigns-header-actions">
            {actions.filter && (
                <Tooltip placement="bottom" title="Filter" color={color}>
                    <div className={"campaigns-header-action " + (filterState ? "active" : "")} onClick={() => setFilterState && setFilterState(!filterState)}>
                        <FilterOutlined />
                    </div>
                </Tooltip>
            )}
            {actions.access && (
                <Tooltip placement="bottom" title="Access" color={color}>
                    <div className={"campaigns-header-action " + setActiveAction('/access')} onClick={() => navigateTo(`/events/${pathname.split("/")[2]}/access`)}>
                        <LoginOutlined />
                    </div>
                </Tooltip>
            )}
            {actions.resale && (
                <Tooltip placement="bottom" title="Resales and Transfers" color={color}>
                    <div className={"campaigns-header-action " + setActiveAction('/resale')} onClick={() => navigateTo(`/events/${pathname.split("/")[2]}/resale`)}>
                        <SwapOutlined />
                    </div>
                </Tooltip>
            )}
            {actions.info && (
                <Tooltip placement="bottom" title="Event" color={color}>
                    <div className={"campaigns-header-action " + setActiveAction('/info')} onClick={() => navigateTo(`/events/${pathname.split("/")[2]}/info`)}>
                        <InfoCircleOutlined />
                    </div>
                </Tooltip>
            )}
            {actions.notifications && (
                <NotificationButton/>
            )}
            {actions.edit && (
                <Tooltip placement="bottom" title="Edit" color={color}>
                    <div className="campaigns-header-action" onClick={() => setEventEditModal && setEventEditModal(true)}>
                        <EditOutlined/>
                    </div>
                </Tooltip>
            )}
            {actions.delete && (
                <Tooltip placement="bottom" title="Delete" color={color}>
                    <div className="campaigns-header-action" onClick={() => setEventRemoveModal && setEventRemoveModal(true)}>
                        <DeleteOutlined />
                    </div>
                </Tooltip>
            )}
        </div>
    );

};