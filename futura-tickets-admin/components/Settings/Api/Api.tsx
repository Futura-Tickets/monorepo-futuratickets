"use client";
import { useEffect, useState } from "react";

// ANTD
import { Switch } from "antd";
import Input from "antd/es/input";
import { InfoCircleOutlined } from "@ant-design/icons";

// STATE
import { useGlobalState } from "@/components/GlobalStateProvider/GlobalStateProvider";

// SERVICES
import { enableDisableApi, getFuturaApiSettings } from '../../../shared/services';

// INTERFACES
import { ApiSettings } from "@/shared/interfaces";

// STYLES
import './Api.scss';

export default function Api() {

    const [state, dispatch] = useGlobalState();

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [futuraApiSettingsStatus, setFuturaApiSettingsStatus] = useState<ApiSettings>();
    const [loader, setLoader] = useState<boolean>(false);

    const setFuturaAPISettings = async (): Promise<void> => {
        try {

            setLoader(true);

            const futuraApiSettings = await getFuturaApiSettings();
            setFuturaApiSettingsStatus(futuraApiSettings);

            setLoader(false);

        } catch (error) {
            setLoader(false);
        }
    };

    const enableDisableFuturaApi = async (): Promise<void> => {
        try {

            setLoader(true);
            
            const futuraApiSettings = await enableDisableApi(!futuraApiSettingsStatus?.isApiEnabled);
            setFuturaApiSettingsStatus(futuraApiSettings);

            setLoader(false);
        
        } catch (error) {
            setLoader(false);
        }
    };

    useEffect(() => {
        setFuturaAPISettings();
    }, []);

    return (
        <div className="api-container" id="api">
            <div className="api-header">
                <h1>API</h1>
            </div>
            <div className="api-content">
                <div className="api-desc">API Secret Key</div>
                <div className="api-secret">
                    {futuraApiSettingsStatus?.isApiEnabled ? (
                        <Input.Password value={futuraApiSettingsStatus?.apiKey} visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}/>
                    ) : (
                        <div><InfoCircleOutlined /> Futura API is disabled</div>
                    )}
                </div>
                <div className="api-switch"><Switch value={futuraApiSettingsStatus?.isApiEnabled} onChange={enableDisableFuturaApi} loading={loader}/></div>
            </div>
        </div>
    );
}