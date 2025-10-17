"use client";
import { useEffect, useState } from 'react';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// INTERFACES
import { Notification, EmitResale, NotificationType } from '@/shared/interfaces';

// SERVICES
import { getNotifications, markAsRead as markNotificationAsRead, markAllAsRead as markAllNotificationsAsRead, getNotificationByOrderId, getNotificationsByClientId } from '@/shared/services';

// SOCKET
import { socket } from '@/components/Socket';
import { socketMarketPlace } from '@/components/SocketMarketPlace'; 

// COMPONENTS
import OrderNotification from './NotificationTypes/OrderNotification';
import UserNotification from './NotificationTypes/UserNotification';
import ResaleNotification from './NotificationTypes/ResaleNotification';
import TransferedNotification from './NotificationTypes/TransferedNotification';

// STYLES
import "./NotificationsMenu.scss";

let socketIsOrderSubscribed = false;
let socketIsResaleSubscribed = false;
let socketIsUserSubscribed = false;
let socketIsTransferSubscribed = false;

export default function NotificationsMenu() {

  const [state, dispatch] = useGlobalState();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleNotificationLinkClick = () => {
    if (state.notificationsMenuState) {
      document.getElementsByTagName('body')[0].className = '';
      dispatch({ notificationsMenuState: false });
    }
  };

  const fetchNotifications = async () => {

    setIsLoading(true);

    try {
      
      const notifications = await getNotifications();
      dispatch({ notifications });

      setIsLoading(false);

    } catch (error) {
      console.error('Error loading the notifications:', error);
      setError('Error loading the notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeOrderEvent = () => {
    socketIsOrderSubscribed = true;
    
    socket.on('order-created', async (orderId: string) => {
      try {
        const orderNotification = await getNotificationByOrderId(orderId);

        if (orderNotification && orderNotification._id) {
          const notificationExists = state.notifications?.some(
            notification => notification._id === orderNotification._id
          );
          
          if (!notificationExists) {
            dispatch({ 
              notifications: [orderNotification, ...(state.notifications || [])] 
            });
          }
        }
      } catch (error) {
        console.error('Error fetching order notification:', error);
      }
    });
  };

  const subscribeTransferEvent = () => {
    socketIsTransferSubscribed = true;
    
    socket.on('transfer-created', async (orderId: string) => {
      try {

        const orderNotification = await getNotificationByOrderId(orderId);

        if (orderNotification && orderNotification._id) {
          const notificationExists = state.notifications?.some(
            notification => notification._id === orderNotification._id
          );
          
          if (!notificationExists) {
            dispatch({ 
              notifications: [orderNotification, ...(state.notifications || [])] 
            });
          }
        }
      } catch (error) {
        console.error('Error fetching order notification:', error);
      }
    });
  };
  
  const subscribeResaleEvent = () => {
    socketIsResaleSubscribed = true;
    
    socket.on('ticket-resale', async (resale: EmitResale) => {
      try {
        const resaleNotification = await getNotificationByOrderId(resale._id);
        console.log('resaleNotification', resaleNotification);
        
        if (resaleNotification && resaleNotification._id) {
          const notificationExists = state.notifications?.some(
            notification => notification._id === resaleNotification._id
          );
          
          if (!notificationExists) {
            dispatch({ 
              notifications: [resaleNotification, ...(state.notifications || [])] 
            });
          }
        }
      } catch (error) {
        console.error('Error fetching resale notification:', error);
      }
    });
  };

  const subscribeUserEvent = () => {
    if (socketIsUserSubscribed) return;
    
    socketIsUserSubscribed = true;
    
    socketMarketPlace.on('user-created', async (userId: string) => {
      try {
        const userNotification = await getNotificationsByClientId(userId);
        
        if (userNotification && userNotification._id) {
          const notificationExists = state.notifications?.some(
            notification => notification._id === userNotification._id
          );
          
          if (!notificationExists) {
            dispatch({ 
              notifications: [userNotification, ...(state.notifications || [])] 
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user notification:', error);
      }
    });
  };
  
  const markAllAsRead = async () => {
    if (!state.notifications || state.notifications.length === 0) return;
    
    try {
      const response = await markAllNotificationsAsRead(state.account?.promoter?._id || '');
      
      if (response && response.success) {
        const updatedNotifications = state.notifications.map(notification => ({
          ...notification,
          readBy: notification.readBy.includes(state.account?.account || '') ? notification.readBy : [...notification.readBy, state.account?.account || '']
        }));

        dispatch({ notifications: updatedNotifications });

      } else {
        console.error("La respuesta del servidor no fue exitosa:", response);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const renderNotificationContent = (notification: Notification): React.JSX.Element | undefined => {
    switch (notification.type) {
      case NotificationType.ORDER:
        return <OrderNotification notification={notification}/>;
      case NotificationType.USER:
        return <UserNotification  notification={notification}/>;
      case NotificationType.RESALE:
        return <ResaleNotification notification={notification}/>;
      case NotificationType.TRANSFERED:
        return <TransferedNotification notification={notification}/>;
    }
  };

  const markAsRead = async (notification: Notification) => {
    if (!notification || notification.readBy.find((userId: string) => userId == state.account?.account)) return;
    if (!notification._id) {
      console.error("No se puede marcar como leída: ID no disponible", notification);
      return;
    }
    if (!state.account?.promoter?._id) {
      console.error("No promoter ID available");
      return;
    }
    
    try {
      const response = await markNotificationAsRead(notification._id, state.account.promoter._id);
      
      if (response) {
        const updatedNotifications = state.notifications.map(item => 
          item._id === notification._id ? 
            { 
              ...item, 
              readBy: [...item.readBy, state.account?.account || ''] 
            } : item
        );
        
        dispatch({ 
          notifications: [...updatedNotifications] 
        });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const addComponentClickListener = () => {
    const sidebar = document.getElementById('sidebar');
    document.addEventListener('click', (e: any) => {
      const className = typeof e.target.className === 'string' ? e.target.className : '';
      if ((!sidebar?.contains(e.target) && (className && !className.includes('notifications-header-action'))) || className.includes('clickableLink')) {
        document.getElementsByTagName('body')[0].className = '';
        dispatch({ notificationsMenuState: false });
      }
    });
  };

  useEffect(() => {
    addComponentClickListener();
    fetchNotifications();
  }, []);

  useEffect(() => {
    socket && !socketIsOrderSubscribed && subscribeOrderEvent();
    socket && !socketIsTransferSubscribed && subscribeTransferEvent();
    socket && !socketIsResaleSubscribed && subscribeResaleEvent();
    socketMarketPlace && !socketIsUserSubscribed && subscribeUserEvent(); 
  }, [socket, socketMarketPlace]);

  //const unreadCount = state.notifications?.filter(notification => notification.readBy.find((userId: string) => userId == state.account?.account) == undefined).length || 0;

  return (
    <>
      <div id="sidebar" className={`sidebar-menu ${state.notificationsMenuState ? 'active' : ''}`}>
        <div className="sidebar-content">
          {isLoading ? (
            <div className="empty-message">Loading notifications...</div>
          ) : error ? (
            <div className="empty-message">{error}</div>
          ) : !state.notifications || state.notifications.length === 0 ? (
            <div className="empty-message">There are no notifications yet</div>
          ) : (
            Array.isArray(state.notifications) && state.notifications.map((notification, index) => {
              return (
                <div key={index} className={`notification-item ${notification.readBy.find((userId: string) => userId == state.account?.account) == undefined ? 'unread' : ''}`} onMouseEnter={(e) => markAsRead(notification)}>
                  {renderNotificationContent(notification)}
                </div>
              )}
            )
          )}
        </div>
      </div>
      <div className={`notifications-menu-background ${state.notificationsMenuState ? 'active' : ''}`}></div>
    </>
  );
}