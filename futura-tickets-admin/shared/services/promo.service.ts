'use client';
import { Coupon, PromoCode } from '../interfaces';

const API_URL = process.env.NEXT_PUBLIC_FUTURA;

// COUPONS

/**
 * Create a new coupon for an event
 */
export async function createCoupon(
  eventId: string,
  couponData: any
): Promise<Coupon> {
  return await fetch(`${API_URL}/api/coupons/create`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ eventId, ...couponData }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error creating coupon:', err);
      throw err;
    });
}

/**
 * Get all coupons for an event
 */
export const getCoupons = async (eventId: string): Promise<Coupon[]> => {
  return await fetch(`/api/coupons/${eventId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching coupons:', err);
      return [];
    });
};

/**
 * Delete a coupon
 */
export async function deleteCoupon(
  eventId: string,
  couponCode: string
): Promise<any> {
  return await fetch(
    `${API_URL}/api/coupons/${eventId}/${couponCode}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  )
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error deleting coupon:', err);
      throw err;
    });
}

// PROMO CODES

/**
 * Get all promo codes for an event
 */
export const getPromoCodes = async (eventId: string): Promise<PromoCode[]> => {
  return await fetch(`/api/promocodes/${eventId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching promo codes:', err);
      return [];
    });
};

/**
 * Create a new promo code for an event
 */
export async function createPromoCode(
  eventId: string,
  promoCodeData: any
): Promise<PromoCode> {
  return await fetch(`/api/promocodes/create`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ eventId, ...promoCodeData }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error creating promo code:', err);
      throw err;
    });
}

/**
 * Delete a promo code
 */
export async function deletePromoCode(
  eventId: string,
  promoCodeId: string
): Promise<any> {
  return await fetch(`/api/promocodes/${eventId}/${promoCodeId}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error deleting promo code:', err);
      throw err;
    });
}
