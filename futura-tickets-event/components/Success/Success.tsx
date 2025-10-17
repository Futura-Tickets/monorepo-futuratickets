"use client";

import { CheckCircleFilled } from "@ant-design/icons";
// STATE
import { useGlobalState } from "../GlobalStateProvider/GlobalStateProvider";

// STYLES
import './Success.scss';
import { Item } from "../shared/interfaces";

export default function Page() {

    const [state, dispatch] = useGlobalState();

    const calculatePrice = (type: string, amount: number, price: number): number => {
        return amount * price;
    };

    return (
        <div className="success-container">
            <div className="cart-image-container">
                <div className="cart-image" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_BLOB_URL}/${state.event?.image})` }}></div>
                <img src={`${process.env.NEXT_PUBLIC_BLOB_URL}/${state.event?.image}`}/>
            </div>
            <div className="success-content">
                <CheckCircleFilled />
                <h2>Your order have been processed correctly</h2>
                <p>We have sent you an email with your tickets and the details of your order.</p>
                <p>For any questions or problems with your order, please feel free to reach us at</p>
                <div className="success-contact">
                    <strong>support@futuratickets.com</strong>
                </div>
                <div className="cart-items">
                    {state.items.map((item: Item, i: number) => (
                        <div className="cart-item" key={i}>
                            <div className="cart-item-info">
                                <div>{item.type}</div>
                            </div>
                            <div className="cart-item-currency">
                                <span className="currency">x{item.amount}</span>
                            </div>
                            <div className="cart-item-currency">
                                <span className="currency">{calculatePrice(item.type, item.amount, item.price)} EUR</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}