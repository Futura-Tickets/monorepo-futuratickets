import { useNavigate } from 'react-router-dom';

// ANTD
import { CalendarOutlined, HomeOutlined } from '@ant-design/icons';

// INTERFACES
import { Event } from '../../shared/interfaces';

// STYLES
import './EventItem.scss';

export default function EventItem({ event }: { event: Event }) {

    const navigate = useNavigate();

    const navigateTo = (route: string): void => {
        navigate(route);
    };

    return (
        <div className="event-item-container">
            <div className="event-item-content" onClick={() => navigateTo(`/events/${event._id}`)}>
                <img src={`${process.env.REACT_APP_BLOB_URL}/${event.image}`}/>
                <div className="event-item-info">
                    <h2>{event.name} <span className="date"><CalendarOutlined />{`${new Date(event.date).getDate()}/${new Date(event.date).getMonth() + 1}/${new Date(event.date).getFullYear()}`}</span></h2>
                    <h5><HomeOutlined />{event.location.city}, {event.location.country}</h5>
                </div>
            </div>                          
        </div>
    );
}