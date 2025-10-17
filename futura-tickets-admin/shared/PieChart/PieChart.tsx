import { useEffect, useState } from "react";

// GOOGLE CHARTS
import Chart from "react-google-charts";

// ANTD
import { LoadingOutlined } from "@ant-design/icons";

// STATE
import { useGlobalState } from "@/components/GlobalStateProvider/GlobalStateProvider";

// STYLES
import './PieChart.scss';

export default function PieChart({ data, options }: { data: any, options: any }) {

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
        <div className="pie-chart-container">
            {chartLoader ? (
                <div className="pie-chart-content">
                    <LoadingOutlined />
                </div>
            ): (
                <div className="pie-chart-content">
                    <Chart width={"320px"} height={"320px"} chartType="PieChart" data={data} options={options}/>
                </div>
            )}
        </div>
    )
}