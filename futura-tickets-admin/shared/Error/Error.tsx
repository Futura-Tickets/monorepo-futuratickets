"use client";
import React from 'react';

// ANTD
import { BugOutlined } from '@ant-design/icons';

// STYLES
import './Error.scss';

export default function Error({ errorMsg }: { errorMsg: string}) {
    return (
        <div className="error-container">
            <div className="error-content">
                <h1><BugOutlined /> {errorMsg}</h1>
            </div>
        </div>
    );
}