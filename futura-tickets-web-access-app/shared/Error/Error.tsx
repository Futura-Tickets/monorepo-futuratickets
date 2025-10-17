"use client";

// STYLES
import './Error.scss';

export default function Error({ errorMsg }: { errorMsg: string }) {
    return (
        <div className="error-container">
            <div className="error-content">
                {errorMsg}
            </div>
        </div>
    );
}