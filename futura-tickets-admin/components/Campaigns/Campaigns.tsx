"use client";
import { useEffect, useState } from "react";

// ANTD
import { BarChartOutlined } from "@ant-design/icons";

// COMPONENTS
import Error from "@/shared/Error/Error";
import Loader from "@/shared/Loader/Loader";

// SERVICES
import { getCampaigns } from "@/shared/services";

// INTERFACES
import { Order } from "@/shared/interfaces";

// STYLES
import "./Campaigns.scss";
import CampaignsActions from "./CampaignsActions/CampaignsActions";

// CONSTANTS
const ANALYTICS_ERROR = "There was an error loading your data";

export default function Campaigns() {

  const [campaigns, setCampaignsState] = useState<Order[]>([]);

  const [loader, setLoader] = useState<boolean>(false);
  const [error, setError] = useState<boolean>();

  const setCampaigns = async(): Promise<void> => {
    try {

        setLoader(true);

        const campaigns = await getCampaigns();
        setCampaignsState(campaigns);

        setLoader(false);

    } catch (error) {
      setError(true);
      setLoader(false);
    }
  };

  useEffect(() => {
    //setCampaigns();
  }, []);

  if (loader) return <Loader/>;
  if (error) return <Error errorMsg={ANALYTICS_ERROR}/>;

  return (
    <div className="campaigns-container">
      <div className="campaigns-header">
        <h1><BarChartOutlined/> Campaigns</h1>
        <CampaignsActions actions={{ launch: true, filter: true, access: true, resale: true, info: true, notifications: true }} />
      </div>
    </div>
  );
}