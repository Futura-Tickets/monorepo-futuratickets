'use client';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// COMPONENTS
import CouponsList from './CouponsList/CouponsList';
import PromoCodeList from './PromoCodeList/PromoCodeList';
import GoBack from '@/shared/GoBack/GoBack';
import InvitationsList from './InvitationsList/InvitationsList';
import NotificationButton from '../../NotificationsMenu/NotificationButton';

// STYLES
import './Invitations.scss';

export default function Invitations() {
  
  const pathname = usePathname();
  const eventId = pathname.split('/')[2];
  const [activeLink, setActiveLink] = useState<string>("invitations");

  const scrollTo = (section: string) => {
    setActiveLink(section);
  };

  return (
      <div className='invitations-container'>
        <div className='invitations-header'>
          <GoBack route={`/events/${eventId}`} />
          <h1>Invitations</h1>
          <div className='invitations-header-actions'>
            <NotificationButton />
          </div>
        </div>
        <div className='invitations-content-container'>
          <div className="invitations-menu">
            <ul>
              <li className={activeLink == "invitations" ? "active" : ""} onClick={() => scrollTo('invitations')}>Invitations</li>
              <li className={activeLink == "coupons" ? "active" : ""} onClick={() => scrollTo('coupons')}>Coupons</li>
              <li className={activeLink == "promoCodes" ? "active" : ""} onClick={() => scrollTo('promoCodes')}>Promo Codes</li>
            </ul>
          </div>
            
          <div className='content-container'>
            {activeLink === 'invitations' && <InvitationsList eventId={eventId} />}
            {activeLink === 'coupons' && <CouponsList eventId={eventId} />}
            {activeLink === 'promoCodes' && <PromoCodeList eventId={eventId} />}
          </div>
        </div>
      </div>
  );

}
