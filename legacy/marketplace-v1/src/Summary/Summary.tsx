"use client";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ANTD
import Button from 'antd/es/button';
import { QrcodeOutlined } from '@ant-design/icons';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// STYLES
import './Summary.scss';

export default function Summary({ payment }: { payment?: boolean }) {

    const [state, dispatch] = useGlobalState();
    const [totalAmount, setTotalAmount] = useState<number>();
    const navigate = useNavigate();

    const setTotal = () => {
        let total = 0;
        // state.cart.forEach((wine: EventTicket) => {
        //     total += wine.price!;
        // });
        setTotalAmount(total);
    };

    const checkout = async(): Promise<void> => {
        navigate('/cart/checkout');
    };

    useEffect(() => {
        setTotal();
    }, [state.cart]);

    return (
        <div className="summary-content">
            <h1>Order Summary</h1>
            <div className="cart-items">
                {state.cart && Object.keys(state.cart).map((eventId: string, i: number) => 
                    <div key={i}>
                        {state.cart![eventId].map((cartEvent: { type: string; amount: number; }, i: number) => 
                            (cartEvent.amount > 0 && 
                                <div className="cart-item" key={i}>
                                    <div className="cart-item-id">
                                        <QrcodeOutlined/>
                                    </div>
                                    <div className="cart-item-info">
                                        <div>{eventId}</div>
                                    </div>
                                    <div className="cart-item-currency">
                                        <span className="currency">{cartEvent.amount}</span>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
            <div className="total-amount">
                Total:<span className="amount">{totalAmount} Eur</span>
            </div>
            {!payment && (
                <div className="cart-checkout">
                    <Button size="large" className="account-btn" type="primary" onClick={() => checkout()}>
                        Checkout
                    </Button>
                </div>
            )}
        </div>
    )
}