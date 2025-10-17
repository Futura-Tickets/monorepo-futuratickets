"use client";
import { useEffect, useState } from 'react';

// ANTD
import { LoadingOutlined } from '@ant-design/icons';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// COMPONENTS
import AttendantsList from './AttendantsList/AttendantsList';
import Menu from '@/shared/Menu/Menu';

// SERVICES
import { getAttendants } from '@/shared/services';

// STYLES
import './Attendants.scss';

// INTERFACES
import { Attendant } from '@/shared/interfaces';

// CONSTANTS
const ATTENDANTS_ERROR = 'There was an error loading your attendants';

export default function Attendants() {

    const [state, dispatch] = useGlobalState();

    const [attendants, setAttendantsState] = useState<Attendant[]>([]);
    const [loader, setLoader] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    const setAttendants = async (event: string): Promise<void> => {
        try {

            setLoader(true);

            const attendants = await getAttendants(event);
            setAttendantsState(attendants);

            setLoader(false);

        } catch (error) {
            setLoader(false);
            setError(true);
        }
    };

    useEffect(() => {
        state.account && state.account.accessEvent._id && setAttendants(state.account.accessEvent._id);
    }, [state.account])

    return (
        <div className="attendants-container">
            <div className="attendants-content">
                {loader && (
                    <div className="attendants-loader-container">
                        <div className="attendants-loader-content">
                            <LoadingOutlined />
                        </div>
                    </div>
                )}
                {!loader && <AttendantsList attendants={attendants}/>}
            </div>
            <Menu/>
        </div>
    )
}