import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// STATE
import { useGlobalState } from './GlobalStateProvider/GlobalStateProvider';

// SERVICES
import { validate } from './shared/services';

function FuturaTickets({ children }: any) {

    const [state, dispatch] = useGlobalState();
    const navigate = useNavigate();

    const checkAccount = async (): Promise<void> => {
        try {
            
            const token = localStorage.getItem('token') as string;
            
            if (token) {
                
                const decodedToken = await validate(token);

                if (!decodedToken || !decodedToken.account) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }

                dispatch({
                    account: {
                        _id: decodedToken.account,
                        name: decodedToken.name,
                        lastName: decodedToken.lastName,
                        email: decodedToken.email,
                        role: decodedToken.role,
                        address: decodedToken.address
                    }
                });

                return;

            }

        } catch (error) {
            
        }
    };

    useEffect(() => {
        checkAccount();
    }, [])

    return(children);
    
}

export default FuturaTickets;