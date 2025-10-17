"use client";
import { useEffect, useState } from 'react';

// ANTD
import Input, { SearchProps } from 'antd/es/input';
import Button from 'antd/es/button';

// STYLES
import './AttendantsList.scss';

// INTERFACES
import { Attendant, TicketStatus } from '@/shared/interfaces';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';

// UTILS
import { exportAttendantsToCSV } from '@/shared/utils/csv';

export default function AttendantsList({ attendants }: { attendants: Attendant[] }) {

    const [attendantFilter, setAttendantFilter] = useState<string>('');

    const onSearch = (value: any): void => {
        setAttendantFilter(value.target.value)
    };

    const filterAttendant = (attendant: Attendant, attendantFilter: string) => {
        if (attendantFilter == '') return true;
        if ((attendant.client.name).toLocaleLowerCase().includes(attendantFilter.toLocaleLowerCase())) return true;
        if ((attendant.client.lastName).toLocaleLowerCase().includes(attendantFilter.toLocaleLowerCase())) return true;
        if ((attendant.client.email).toLocaleLowerCase().includes(attendantFilter.toLocaleLowerCase())) return true;
        if ((attendant.type).toLocaleLowerCase().includes(attendantFilter.toLocaleLowerCase())) return true;
        if ((attendant.status).toLocaleLowerCase().includes(attendantFilter.toLocaleLowerCase())) return true;
    };
 
    useEffect(() => {

    }, []);

    const handleExportCSV = () => {
        exportAttendantsToCSV(attendants, 'evento');
    };

    return (
        <div className="attendants-list-container">
            <div className="attendants-list-header">
                <Input className="attendants-search" placeholder="Buscar asistente" size="large" onChange={(value: any) => onSearch(value)}/>
                <SearchOutlined/>
                <Button
                    className="export-button"
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleExportCSV}
                    size="middle"
                >
                    CSV
                </Button>
            </div>
            <div className="attendants-list-content">
                {attendants?.filter((attendant: Attendant) => filterAttendant(attendant, attendantFilter)).map((attendant: Attendant, i: number) => {
                    return <AttendantItem attendant={attendant} key={i}/>
                })}
            </div>
        </div>
    )
}

function AttendantItem({ attendant }: { attendant: Attendant })  {
    return (
        <div className="attendants-item-container">
            <div className="attendants-item-content">
                <div>
                    {attendant.client.name} {attendant.client.lastName}
                </div>
                <div>
                    {attendant.type}
                </div>
                {attendant.status == TicketStatus.OPEN && <div className="open">{attendant.status}</div>}
                {attendant.status == TicketStatus.CLOSED && <div className="closed">{attendant.status}</div>}
            </div>
        </div>
    );
}