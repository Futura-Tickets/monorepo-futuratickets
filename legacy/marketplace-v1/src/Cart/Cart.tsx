"use client";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ANTD
import { CloseOutlined, QrcodeOutlined } from '@ant-design/icons';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// COMPONENTS
import Summary from '../Summary/Summary';

// INTERFACES
import { EventTicket } from '../shared/interfaces';

// STYLES
import './Cart.scss';

export default function Cart() {

    const [state, dispatch] = useGlobalState();
    
    const navigate = useNavigate();

    const [totalAmount, setTotalAmount] = useState<number>();

    const checkout = async(): Promise<void> => {
        navigate('/cart/checkout');
    };

    const removeItem = (index: number): void => {
        // dispatch({ cart: state.cart.filter((wine: EventTicket, i: number) => i != index) });
    };

    if (state.cart == undefined) {
        return (
            <div className="cart-container empty">
                <div className="cart-content">
                    <h1>Your cart is empty</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <div className="cart-content">
                <div className="cart-items">
                    {/* {state.cart.map((wine: EventTicket, i: number) => {
                        return (
                            <div className="cart-item" key={i}>
                                <div className="cart-item-id">
                                    <QrcodeOutlined/>
                                </div>
                                <div className="cart-item-info">
                                    <div>{wine.owner.name}</div>
                                </div>
                                <div className="cart-item-currency">
                                    <span className="currency">100 EUR</span>
                                </div>
                                <div className="remove-item">
                                    <CloseOutlined onClick={() => removeItem(i)}/>
                                </div>
                            </div>
                        );
                    })} */}
                </div>
            </div>
            <Summary/>
        </div>
    );

};