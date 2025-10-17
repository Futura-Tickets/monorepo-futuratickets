"use client";
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

// ANTD
import Input from 'antd/es/input';
import Select from 'antd/es/select';

// INTERFACES
import { FilterConfig, GroupBy } from '@/shared/interfaces';

// STYLES
import './EventFilters.scss';

export default function EventFilters({ 
  filterState, 
  setFilterConfig 
}: { 
  filterState: boolean; 
  setFilterConfig: Dispatch<SetStateAction<FilterConfig>>;
}) {
    const [currentGroupBy, setCurrentGroupBy] = useState<GroupBy>('sales');
    
    const salesStatusOptions = [
        { value: '', label: 'SHOW ALL' },
        { value: 'PENDING', label: 'PENDING' },
        { value: 'OPEN', label: 'OPEN' },
        { value: 'SALE', label: 'SALE' },
        { value: 'SOLD', label: 'SOLD' },
        { value: 'CLOSED', label: 'CLOSED' },
        { value: 'EXPIRED', label: 'EXPIRED' },
        { value: 'TRANSFERED', label: 'TRANSFERED' },
        { value: 'PROCESSING', label: 'PROCESSING' },
    ];
    
    const orderStatusOptions = [
        { value: '', label: 'SHOW ALL' },
        { value: 'PENDING', label: 'PENDING' },
        { value: 'SUCCEEDED', label: 'SUCCEEDED' },
        { value: 'PROCESSING', label: 'PROCESSING' },
        { value: 'FAILED', label: 'FAILED' },
    ];

    const [statusOptions, setStatusOptions] = useState(salesStatusOptions);
    
    const handleStatusChange = (value: string) => {
        setFilterConfig(prev => ({
            ...prev,
            status: value
        }));
    };

    const handleGroupByChange = (value: GroupBy) => {
        setCurrentGroupBy(value);
        
        setFilterConfig(prev => ({
            ...prev,
            type: value,
            status: ''
        }));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        console.log(`Searching: ${value}`);
        setFilterConfig(prev => ({
            ...prev,
            search: value
        }));
    };
    
    useEffect(() => {
        if (currentGroupBy === 'sales') {
            setStatusOptions(salesStatusOptions);
        } else {
            setStatusOptions(orderStatusOptions);
        }
    }, [currentGroupBy]);

    return (
        <div className={`event-filter-container ${filterState ? "active" : ""}`}>
            <div className="event-filter-content">
                <div className="event-filter-left-content">
                    <Select
                        defaultValue=""
                        style={{ width: 120 }}
                        onChange={handleStatusChange}
                        options={statusOptions}
                    />
                    <Select
                        defaultValue="sales"
                        style={{ width: 120 }}
                        onChange={handleGroupByChange}
                        options={[
                            { value: 'sales', label: 'SALES' },
                            { value: 'orders', label: 'ORDERS' }
                        ]}
                    />
                </div>
                <div className="event-filter-right-content">
                    <Input 
                        placeholder="Search" 
                        onChange={handleSearchChange}
                        style={{ width: 200 }} 
                        allowClear
                    />
                </div>
            </div>
        </div>
    );
};