import { useEffect, useState } from "react";

// GOOGLE CHARTS
import Chart from "react-google-charts";

// ANTD
import { LoadingOutlined } from "@ant-design/icons";

// STATE
import { useGlobalState } from "@/components/GlobalStateProvider/GlobalStateProvider";

// STYLES
import './LineChart.scss';

export default function LineChart({ data, options }: { data: any, options: any }) {

    const [state, dispatch] = useGlobalState();
    const [chartLoader, setChartLoader] = useState<boolean>(false);

    function resize () {
        setChartLoader(true);
        setTimeout(() => setChartLoader(false), 1000);
    };

    useEffect(() => {
        window.onresize = () => { resize() };
        resize();
    }, [state.menuState]);

    return (
        <div className="line-chart-container">
            {chartLoader ? (
                <div className="line-chart-content">
                    <LoadingOutlined />
                </div>
            ): (
                <div className="line-chart-content">
                    <Chart width="100%" chartType="AreaChart" data={data} options={options}/>
                </div>
            )}
        </div>
    )
}