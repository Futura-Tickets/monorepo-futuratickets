"use client";
import { useEffect } from "react";

// STATE
import { useGlobalState } from "@/components/GlobalStateProvider/GlobalStateProvider";

// STYLES
import './Notifications.scss';

export default function Notifications() {

    const [state, dispatch] = useGlobalState();

    useEffect(() => {

    }, []);

    return (
        <div className="notifications-container" id="notifications">
            <div className="notifications-header">
                <h1>Notifications</h1>
            </div>
            <div className="notifications-content">

            </div>
        </div>
    );
}