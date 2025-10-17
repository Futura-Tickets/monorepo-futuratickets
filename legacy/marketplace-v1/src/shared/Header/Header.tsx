"use client";
import { useNavigate } from 'react-router-dom';

// ANTD
import { ShoppingFilled } from '@ant-design/icons';

// STATE
import { useGlobalState } from '../../GlobalStateProvider/GlobalStateProvider';

// STYLES
import './Header.scss';

export default function Header() {

    const [state, dispatch] = useGlobalState();

    const navigate = useNavigate();

    return (
        <div className="header-container">
            <div className="header-content">
                <div className="header-actions left">
                    <img src="/assets/images/futura-tickets.png" onClick={() => navigate('/events')}/>
                    <ul>
                        <li onClick={() => navigate('/events')}>Events</li>
                    </ul>
                </div>
                <div className="header-actions right">
                    <ul>
                        <li onClick={() => navigate('/cart')}>
                            <ShoppingFilled /> {state.cart && Object.keys(state.cart).reduce((accumulator, eventId: string) => accumulator + state.cart![eventId].reduce((accumulator, cartEvent: { type: string; amount: number; }) => accumulator + cartEvent.amount, 0), 0)}
                        </li>
                        {state.account ? (
                            <li onClick={() => navigate('/account')}>Account</li>
                        ) : (
                            <li onClick={() => navigate('/login')}>Connect</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};