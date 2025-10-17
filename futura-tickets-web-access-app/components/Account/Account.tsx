"use client";
import { useRouter } from 'next/navigation';

// ANTD
import Button from 'antd/es/button';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// COMPONENTS
import Menu from '@/shared/Menu/Menu';

// STYLES
import './Account.scss';

export default function Account() {

    const [state, dispatch] = useGlobalState();
    const router = useRouter();

    const disconnect = (): void => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <div className="account-container">
            <div className="account-content">                
                <ul>
                    <li>{state.account?.name} {state.account?.lastName}</li>
                    <li>{state.account?.email}</li>
                </ul>
                <Button type="primary" onClick={() => disconnect()}>Disconnect</Button>
            </div>
            <Menu/>
        </div>
    )
}