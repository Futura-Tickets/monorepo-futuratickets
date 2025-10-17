import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from "next/navigation";

// ANTD
import { LoadingOutlined } from '@ant-design/icons';

// STATE
import { useGlobalState } from './GlobalStateProvider/GlobalStateProvider';

// SERVICES
import { getEvent, validate } from './shared/services';

// STYLES
import './FuturaTickets.scss';

function FuturaTickets({ children }: { children: React.ReactNode }) {

    const searchParams = useSearchParams();
    const router = useRouter();

    const [state, dispatch] = useGlobalState();
    const [loader, setLoader] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    const setEvent = async(eventId: string): Promise<void> => {
        try {

            setLoader(true);

            const event = await getEvent(eventId);
            dispatch({ event });

            setLoader(false);

        } catch (error) {
            setError(true);
            setLoader(false);
        }
    };

    const setInitialState = async (): Promise<void> => {
        try {

            const code = searchParams.get('promoCode');
            const token = searchParams.get('token') as string || localStorage.getItem('token') as string;

            let accountData = undefined;
            
            if (token) {
                localStorage.setItem('token', token);
                
                const decodedToken = await validate(token);
                
                if (!decodedToken || !decodedToken.account) {
                    localStorage.removeItem('token');
                    router.push('/login');
                    return;
                }

                accountData = {
                    _id: decodedToken.account,
                    name: decodedToken.name,
                    lastName: decodedToken.lastName,
                    email: decodedToken.email,
                    role: decodedToken.role,
                    address: decodedToken.address
                };

            }

            dispatch({
                account: accountData || undefined,
                promoCode: code || undefined
            });

        } catch (error) {

        }
    };

    useEffect(() => {
        setInitialState();
        setEvent(process.env.NEXT_PUBLIC_EVENT_ID!);
    }, []);

    if (loader) {
        return (
            <div className="futura-tickets-container">
                <div className="futura-tickets-content">
                    <LoadingOutlined />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="futura-tickets-container">
                <div className="futura-tickets-content error">
                    <h1>There was an error loading your event</h1>
                    {/* <img src="/assets/images/futura-tickets-trans-black.png"/> */}
                </div>
            </div>
        )
    }

    return children;
    
}

export default FuturaTickets;