"use client";
import { useRouter } from 'next/navigation';

// ANTD
import { PoweroffOutlined, ShoppingFilled } from '@ant-design/icons';

// STATE
import { useGlobalState } from '../../GlobalStateProvider/GlobalStateProvider';

// INTERFACES
import { Item } from '../interfaces';

// STYLES
import './Header.scss';

export default function Header() {

    const [state, dispatch] = useGlobalState();

    const router = useRouter();

    const disconnect = (): void => {
        localStorage.removeItem('token');
        window.open(`${window.origin}`, '_self');
    };

    return (
        <div className="header-container">
            <div className="header-content">
                <div className="header-actions left">
                    <img src="/assets/images/futura-tickets-trans-black.png" onClick={() => router.push('/')}/>
                    <ul>
                        <li onClick={() => router.push('/')}>Event</li>
                        {state.event?.resale.isActive && <li onClick={() => router.push('/resale')}>Resale</li>}
                        {/* <li onClick={() => router.push('/verify')}>Verify</li> */}
                    </ul>
                </div>
                <div className="header-actions right">
                    <ul>
                        <li onClick={() => router.push('/cart')}>
                            <ShoppingFilled /> {(state.items?.reduce((accumulator, item: Item) => accumulator + item.amount, 0) || 0) + (state.resaleItems?.reduce((accumulator, item: Item) => accumulator + item.amount, 0) || 0)}
                        </li>
                        {state.account ? (
                            <>
                                <li onClick={() => router.push('/account')}>Account</li>
                                <li onClick={() => disconnect()} className="disconnect"><PoweroffOutlined /></li>
                            </>
                        ) : (
                            <li onClick={() => router.push('/login')}>Connect</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};