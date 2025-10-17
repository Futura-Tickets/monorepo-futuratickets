'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import  { loadStripe, Stripe } from '@stripe/stripe-js';
import { useAuth } from '@/contexts/auth-context';

// PROVIDERS
import  { CartItem, useCart } from '@/contexts/cart-context';

// COMPONENTS
import { Header } from '@/components/header';
import { Contact } from '@/components/checkout/contact';
import { Payment } from '@/components/checkout/payment';
import { Summary } from '@/components/checkout/summary';

// SERVICES
import { createOrderReq, getPromoCodeInfo, getStripeConfig } from '../shared/services/services';

// INTERFACES
import type { CreateOrder, ContactFormData, Item } from '../shared/interface';

export default function CheckoutPage() {
  const router = useRouter();
  const { userData, isLoggedIn } = useAuth();
  const { items } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFormLocked, setIsFormLocked] = useState(false);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>();
  const [clientSecret, setClientSecret] = useState<string>();
  const [paymentId, setPaymentId] = useState<string>();
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number, eventId: string} | null>(null);
  const [initialFormData, setInitialFormData] = useState<ContactFormData | null>(null);

  useEffect(() => {
    if (isLoggedIn && userData) {
      
      const [firstName, ...lastNameParts] = userData.name.split(' ');
      const birthDate = userData.birthdate ? new Date(userData.birthdate) : null;
      
      setInitialFormData({
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        day: birthDate ? birthDate.getDate().toString().padStart(2, '0') : '',
        month: birthDate ? (birthDate.getMonth() + 1).toString().padStart(2, '0') : '',
        year: birthDate ? birthDate.getFullYear().toString() : ''
      });
    }
  }, [isLoggedIn, userData]);

  useEffect(() => {
    const savedPaymentId = sessionStorage.getItem('futura-payment-id');
    const savedClientSecret = sessionStorage.getItem('futura-client-secret');
    const savedOrderItems = sessionStorage.getItem('futura-order-items');
    const savedContactData = sessionStorage.getItem('futura-contact-data');
    const currentOrderItems = JSON.stringify(items);

   
    if (savedPaymentId && savedClientSecret && savedOrderItems === currentOrderItems) {
      setPaymentId(savedPaymentId);
      setClientSecret(savedClientSecret);
      if (savedContactData) {
        setInitialFormData(JSON.parse(savedContactData));
      }
      getStripeConfig().then(config => {
        if (config && config.config) {
          setStripePromise(loadStripe(config.config));
          setIsFormLocked(true);
        }
      });
    } else {
      
      sessionStorage.removeItem('futura-payment-id');
      sessionStorage.removeItem('futura-client-secret');
      sessionStorage.removeItem('futura-order-items');
    }
  }, [items]);

  const handleContactSubmit = async (formData: ContactFormData) => {
    try {
      setIsProcessing(true);
      
      const promoCodeValue = sessionStorage.getItem('futura-promo-code');
      
      let promoCode: { code: string, eventId: string } | null = null;
      
      if (promoCodeValue) {
        try {
          const promoInfo = await getPromoCodeInfo(promoCodeValue);
          promoCode = {
            code: promoCodeValue,
            eventId: promoInfo.eventId
          };
        } catch (error) {
          console.error('Error al obtener información del código promocional:', error);
        }
      }
      
      const eventItems: CreateOrder['orders'] = [];

      items.forEach((item: CartItem) => {
        if (eventItems.length === 0 && !item.resale) {
          eventItems.push({
            event: item.eventId,
            promoter: item.promoterId,
            promoCode: promoCode?.eventId === item.eventId ? promoCode.code : undefined,
            couponCode: appliedCoupon?.eventId === item.eventId ? appliedCoupon.code : undefined,
            items: [
              {
                type: item.ticketType,
                amount: item.quantity,
                price: item.price,
              },
            ],
            resaleItems: []
          });
          return;
        }

        if (eventItems.length === 0 && item.resale) {
          eventItems.push({
            event: item.eventId,
            promoter: item.promoterId,
            promoCode: promoCode?.eventId === item.eventId ? promoCode.code : undefined,
            couponCode: appliedCoupon?.eventId === item.eventId ? appliedCoupon.code : undefined,
            items: [],
            resaleItems: [
              {
                sale: item.resale,
                type: item.ticketType,
                amount: item.quantity,
                price: item.price,
              },
            ]
          });
          return;
        }

        if (eventItems.length > 0) {
          let eventFound = false;

          eventItems.forEach((eventItem: any) => {
            if (eventItem.event === item.eventId && !item.resale) {
              eventItem.items.push({
                type: item.ticketType,
                amount: item.quantity,
                price: item.price,
              });
              eventFound = true;
            }

            if (eventItem.event === item.eventId && item.resale) {
              if (!eventItem.resaleItems) {
                eventItem.resaleItems = [];
              }
              
              const resaleFound = eventItem.resaleItems.find((resaleItem: Item) => resaleItem.sale == item.resale);
              if (!resaleFound) {
                eventItem.resaleItems.push({
                  sale: item.resale,
                  type: item.ticketType,
                  amount: item.quantity,
                  price: item.price,
                });
              }
              eventFound = true;
            }
          });

          if (eventFound === false && !item.resale) {
            eventItems.push({
              event: item.eventId,
              promoter: item.promoterId,
              promoCode: promoCode?.eventId === item.eventId ? promoCode.code : undefined,
              couponCode: appliedCoupon?.eventId === item.eventId ? appliedCoupon.code : undefined,
              items: [
                {
                  type: item.ticketType,
                  amount: item.quantity,
                  price: item.price,
                },
              ],
              resaleItems: []
            });
          }

          if (eventFound === false && item.resale) {
            eventItems.push({
              event: item.eventId,
              promoter: item.promoterId,
              promoCode: promoCode?.eventId === item.eventId ? promoCode.code : undefined,
              couponCode: appliedCoupon?.eventId === item.eventId ? appliedCoupon.code : undefined,
              items: [],
              resaleItems: [
                {
                  sale: item.resale,
                  type: item.ticketType,
                  amount: item.quantity,
                  price: item.price,
                },
              ]
            });
          }
        }
      });

      const createOrderData: CreateOrder = {
        contactDetails: {
          name: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          birthdate: new Date(`${formData.year}-${formData.month}-${formData.day}`),
          phone: formData.phone
        },
        orders: eventItems,
      };

      const orderData = await createOrderReq(createOrderData);

      if (!orderData || !orderData.paymentId || !orderData.clientSecret) {
        throw new Error('Error al crear la orden: Datos de orden inválidos');
      }

      
      sessionStorage.setItem('futura-payment-id', orderData.paymentId);
      sessionStorage.setItem('futura-client-secret', orderData.clientSecret);
      sessionStorage.setItem('futura-order-items', JSON.stringify(items));
      sessionStorage.setItem('futura-contact-data', JSON.stringify(formData)); 

      const stripeConfig = await getStripeConfig();
      
      if (!stripeConfig || !stripeConfig.config) {
        throw new Error('Error al obtener la configuración de Stripe');
      }

      const stripe = loadStripe(stripeConfig.config);
      
      if (!stripe) {
        throw new Error('Error al inicializar Stripe');
      }

      setStripePromise(stripe);
      setPaymentId(orderData.paymentId);
      setClientSecret(orderData.clientSecret);
      setIsFormLocked(true);

    } catch (error) {
      console.error('Error en handleContactSubmit:', error);
      
      sessionStorage.removeItem('futura-payment-id');
      sessionStorage.removeItem('futura-client-secret');
      sessionStorage.removeItem('futura-order-items');
      
      setIsProcessing(false);
      setIsFormLocked(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white'>
      <Header isCartVisible={false}/>
      <div className='container mx-auto px-4 py-16'>
        <h1 className='text-3xl font-bold mb-8'>Checkout</h1>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2'>
            <Contact 
              onSubmit={handleContactSubmit}
              isProcessing={isProcessing}
              isFormLocked={isFormLocked}
              initialData={initialFormData}
            />
            {stripePromise && clientSecret && paymentId && (
              <Payment
                paymentId={paymentId}
                clientSecret={clientSecret}
                stripePromise={stripePromise as Promise<Stripe>}
              />
            )}
          </div>
          <div className='lg:col-span-1'>
            <Summary onCouponApplied={setAppliedCoupon} />
          </div>
        </div>
      </div>
    </div>
  );
}
