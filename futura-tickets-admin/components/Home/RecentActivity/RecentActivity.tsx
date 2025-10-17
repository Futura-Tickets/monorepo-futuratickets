"use client";
import { useEffect, useState } from "react";

// ANTD
import { CalendarOutlined, FireOutlined } from "@ant-design/icons";

// COMPONENTS
import RecentActivityItem from "./RecentActivityItem/RecentActivityItem";

// SERVICES
// import { getUserActivities } from "@/shared/services";

// STYLES
import "./RecentActivity.scss";

const userActivitiess = [
    {
        name: 'activity one'
    },
    {
        name: 'activity two'
    },
    {
        name: 'activity three'
    }
];

export default function RecentActivity() {

    const [userActivities, setUserActivitiesState] = useState<any[]>(userActivitiess);
    const [loader, setLoader] = useState<boolean>(false);
    
    const setRecentActivity = async(): Promise<void > => {
        try {

            setLoader(true);

            // const userActivities = await getUserActivities('address');
            // setUserActivitiesState(userActivities);
            
            setLoader(false);

        } catch (error) {
            setLoader(false);
        }
    };

    useEffect(() => {
    // setUserActivities(address);
    }, []);

    return (
        <div className="recent-activity-list-container">
            <div className="recent-activity-list-header">
                <div className="recent-activity-item-name">Name</div>
                <div className="recent-activity-item-action">Action</div>
                <div className="recent-activity-item-points">Points</div>
                <div className="recent-activity-item-date"><CalendarOutlined /> Date</div>
            </div>
            <div className="recent-activity-list-content">
                {userActivities.map((userActivity: any, i: number) => {
                    return <RecentActivityItem userActivity={userActivity} key={i}/>
                })}
            </div>
        </div>
    );
}