"use client";
import React from 'react';

// ANTD
import Select from 'antd/es/select';
import Input, { SearchProps } from 'antd/es/input';

// STYLES
import './Filters.scss';

const { Search } = Input;

export default function Filter() {

    const handleChange = (value: string) => {
        console.log(`selected ${value}`);
    };
    
    const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);

    return (
        <div className="filters-container">
            <div className="filters-content">
                <Select
                    size="large"
                    defaultValue="lucy"
                    style={{ width: 120 }}
                    onChange={handleChange}
                    options={[
                        { value: 'jack', label: 'Jack' },
                        { value: 'lucy', label: 'Lucy' },
                        { value: 'Yiminghe', label: 'yiminghe' },
                        { value: 'disabled', label: 'Disabled', disabled: true },
                    ]}
                />
                <Search size="large" placeholder="input search text" onSearch={onSearch} style={{ width: 200 }} />
            </div>
        </div>
    );

}