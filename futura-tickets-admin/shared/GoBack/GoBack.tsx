"use client";
import React from 'react';
import { useRouter } from "next/navigation";

// STATE
import { useGlobalState } from '@/components/GlobalStateProvider/GlobalStateProvider';

// ANTD
import { CaretLeftOutlined } from '@ant-design/icons';

// STYLES
import './GoBack.scss';

export default function GoBack({ route }: { route: string }) {

    const router = useRouter();
    const [state, dispatch] = useGlobalState();

    const navigateTo = (route: string): void => {
        router.push(state.goBackRoute ? state.goBackRoute : route);
    };

    return (
        <div className="go-back-container" onClick={() => navigateTo(route)}>
            <CaretLeftOutlined />
        </div>
    );

}