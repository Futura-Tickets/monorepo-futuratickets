"use client";

// STYLES
import "./RecentActivityItem.scss";

export default function RecentActivityItem({ userActivity }: { userActivity: any }) {
    return (
        <div className="recent-activity-item-container">
            <div className="recent-activity-item-content">
                <div>
                    {userActivity.name}
                </div>
            </div>
        </div>
    );
};