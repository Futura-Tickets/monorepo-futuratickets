"use client";
import { useState } from 'react';

// ANTD
import Tooltip from 'antd/es/tooltip';

// ICONS
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';

// STYLES
import './ExportEventCsv.scss';

const color = '#333333';

export default function ExportCsv({ title, exportRequest }: { title: string; exportRequest: () => Promise<void>; }) {

    const [loader, setLoader] = useState<boolean>(false);

    const exportCSV = async (): Promise<void> => {
        try {

            setLoader(true);

            await exportRequest();

            setLoader(false);

        } catch (error) {
            console.log('ERROR!');
            setLoader(false);
        }
    };

    return (
        <Tooltip placement="bottom" title={title} color={color}>
            <div className="export-csv-action" onClick={() => exportCSV()}>
                {loader ? <LoadingOutlined /> : <DownloadOutlined />}
            </div>
        </Tooltip>
    );
    
};
