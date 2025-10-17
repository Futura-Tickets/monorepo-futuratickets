"use client";
import { useState } from "react";

// ANTD
import { DashboardOutlined, FilterOutlined, GlobalOutlined } from "@ant-design/icons";

// STATE
import { useGlobalState } from "@/components/GlobalStateProvider/GlobalStateProvider";

// COMPONENTS
import ColumnChart from "@/shared/ColumnChart/ColumnChart";
import Error from "@/shared/Error/Error";
import Loader from "@/shared/Loader/Loader";
import RecentActivity from "./RecentActivity/RecentActivity";

// SERVICES
import { getEvents } from "@/shared/services";

// STYLES
import "./Home.scss";

// CONSTANTS
const HOME_ERROR = "There was an error loading your data";

const chartData = [
  ["Day", "Users"],
  ["01", 1000],
  ["02", 1170],
  ["03", 660],
  ["04", 1030],
  ["05", 1000],
  ["06", 1170],
  ["07", 660],
  ["08", 1030],
  ["09", 1000],
  ["10", 1170],
  ["11", 660],
  ["12", 1030],
  ["13", 1000],
  ["14", 1170],
  ["15", 660],
  ["16", 1030],
  ["17", 1000],
  ["18", 1170],
  ["19", 660],
  ["20", 1030],
  ["21", 660],
  ["22", 1030],
  ["23", 1000],
  ["24", 1170],
  ["25", 660],
  ["26", 1030],
  ["27", 1000],
  ["28", 1170],
  ["29", 660],
  ["30", 1170],
  ["31", 660],
];

const columnChartOptions =  {
  height: 280,
  backgroundColor: '#fff',
  legend: { position: 'none' },
  chartArea: {
      width: '100%',
      height: '100%',
      left: 30,
      right: 15,
      top: 20,
      bottom: 30,
      stroke: '#fff',
      strokeWidth: 0
  },
  hAxis: {
      height: 100,
      minTextSpacing : 20,
      textStyle: {
          color: '#999',
          fontName: 'Arial',
          fontSize: 10,
          bold: false,
          italic: false
      }
  },
  vAxis: {
    viewWindowMode: "explicit",
    viewWindow:{ min: 0 },
    minValue: 10,
    baselineColor: '#e4e4e4',
    gridlines: {
      color: '#eaeaea',
      count: 4,
    },
    textStyle: {
      color: '#999',
      fontName: 'Arial',
      fontSize: 10,
      bold: false,
      italic: false
    }
  },
  bar: { groupWidth: "61.8%" },
  colors: ['#049b92'],
}

export default function Home() {

  const [state, dispatch] = useGlobalState();
  const [loader, setLoader] = useState<boolean>(false);

  const [error, setError] = useState<boolean>();
  const [errorMsg, setErrorMsg] = useState<string>();

  const setEvents = async(): Promise<void> => {
    try {

        setLoader(true);

        const events = await getEvents();

        setLoader(false);

    } catch (error) {
        setError(true);
        setLoader(false);
    }
  };

  if (loader) return <Loader/>;
  if (error) return <Error errorMsg={HOME_ERROR}/>;


  return (
    <div className="home-container">
      <div className="home-header">
          <h1><DashboardOutlined/> Dashboard</h1>
          <div className="home-header-actions">
            <div className="home-header-action">
              <FilterOutlined />
            </div>
            <div className="home-header-action">
              <GlobalOutlined />
            </div>
          </div>
      </div>
      <ColumnChart data={chartData} options={columnChartOptions}/>
      <div className="events-content">
        <RecentActivity/>
      </div>
    </div>
  );
}
