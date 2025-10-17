"use client";
import React from 'react';

// ANTD
import { LoadingOutlined } from '@ant-design/icons';

// STYLES
import './Loader.scss';

export default function Loader() {
    return (
        <div className="loader-container">
            <div className="loader-content">
                <LoadingOutlined />
            </div>
        </div>
    );

}