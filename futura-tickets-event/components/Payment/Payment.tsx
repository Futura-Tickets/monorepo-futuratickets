"use client";

// STRIPE
import { PaymentElement } from '@stripe/react-stripe-js';

// STYLES
import './Payment.scss';

export default function Payment() {
    return (
        <div className="payment-container">
            <div className="payment-content">
                <PaymentElement/>
            </div>
        </div>
    );
};