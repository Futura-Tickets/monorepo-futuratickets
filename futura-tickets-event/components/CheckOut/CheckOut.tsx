"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

// STRIPE
import { Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { CaretLeftOutlined, LoadingOutlined, SwapOutlined } from '@ant-design/icons';

// ANTD
import { Button, Form } from 'antd';
import Input from 'antd/es/input/Input';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// COMPONENY
import Payment from '../Payment/Payment';

// SERVICES
import { createOrder, getStripeConfig } from '../shared/services';

// INTERFACES
import { CreateOrder, Item } from '../shared/interfaces';

// STYLES
import './CheckOut.scss';

// CONSTANTS
import { appearance } from './CheckOut.constants';

export function MakePayment({ paymentId }: { paymentId: string }) {

    const elements = useElements();
    const stripe = useStripe();

    const pay = async(): Promise<void> => {
    
        const payment = await stripe?.confirmPayment({
            elements: elements!,
            confirmParams: {
                return_url: `${window.location.origin}/success`
            }
        });


        if (payment?.error) console.log('error!');

        // const payment = await makePayment(paymentId);

        // console.log(payment);

        // if (payment?.error) console.log('error!');
    };

    return (
        <div className="cart-checkout">
            <Button size="large" className="account-btn" type="primary" onClick={() => pay()}>
                Make Payment
            </Button>
        </div>
    )
}

let config = false;

export default function CheckOut() {

    const [state, dispatch] = useGlobalState();
    const router = useRouter();

    const [stripePromise, setStripePromise] = useState<any>();

    const [totalAmount, setTotalAmount] = useState<number>();
    const [clientSecret, setClientSecret] = useState<string>();
    const [paymentId, setPaymentId] = useState<string>();
    const [loader, setLoader] = useState<boolean>(true);

    const [form] = Form.useForm();

    const setStripeConfig = async(): Promise<void> => {
        try {

            config = true;

            const stripeConfig = await getStripeConfig();

            setStripePromise(loadStripe(stripeConfig.config));

            await paymentIntent();

            config = false;

        } catch (error) {
            
        }
    };

    const paymentIntent = async(): Promise<void> => {
        try {

            const order: CreateOrder = {
                event: state.event?._id!,
                promoter: state.event?.promoter._id!,
                contactDetails: {
                    name: state.clientDetails?.name!,
                    lastName: state.clientDetails?.lastName!,
                    birthdate: state.clientDetails?.birthdate!,
                    email: state.clientDetails?.email!,
                    phone: state.clientDetails?.phone || ''
                },
                items: state.items!,
                resaleItems: state.resaleItems,
                couponCode: state.couponCode,
                promoCode: state.promoCode
            };

            const paymentIntent = await createOrder(order);

            setPaymentId(paymentIntent.paymentId)
            setClientSecret(paymentIntent.clientSecret);

            setLoader(false);

        } catch (error) {
            console.log(error)
        }
    };
    
    const calculatePrice = (amount: number, price: number): number => {
        return amount * price;
    };

    const calculateTotalPrice = (): number => {
        return (state.items.reduce((accumulator, item: Item) => accumulator + (item.price * item.amount), 0) || 0) + (state.resaleItems.reduce((accumulator, item: Item) => accumulator + (item.price * item.amount), 0) || 0);
    };

    const calculateAdministrationFees = (): number => {
        const totalPrice = (state.items.reduce((accumulator, item: Item) => accumulator + (item.price * item.amount), 0) || 0) + (state.resaleItems.reduce((accumulator, item: Item) => accumulator + (item.price * item.amount), 0) || 0);
        return totalPrice * (state.event!.commission / 100);
    };

    const initForm = (): void => {
        form.setFieldsValue({
            name: state.clientDetails?.name,
            lastName: state.clientDetails?.lastName,
            birthdate: state.clientDetails?.birthdate,
            email: state.clientDetails?.email,
            phone: state.clientDetails?.phone
        });
    };

    const backToCart = async(): Promise<void> => {
        router.push('/cart');
    };

    useEffect(() => {
        !config && setStripeConfig();
    }, []);

    useEffect(() => {
        form && initForm();
    }, [form]);

    if (loader) {
        return (
            <div className="checkout-container loading">
                <div className="checkout-content">
                    <LoadingOutlined />
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="checkout-image-container">
                <div className="cart-image" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_BLOB_URL}/${state.event?.image})` }}></div>
            </div>
            <div className="checkout-content-container">
                <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                    <div className="checkout-content">
                        <h1>Contact Details</h1>
                        <Form form={form} layout="vertical">
                            <Form.Item label="Name" name="name">
                                <Input size="large" disabled/>
                            </Form.Item>
                            <Form.Item label="Lastname" name="lastName">
                                <Input size="large" disabled/>
                            </Form.Item>
                            <Form.Item label="Birthdate" name="bithdate">
                                <Input size="large" disabled/>
                            </Form.Item>
                            <Form.Item label="Email" name="email">
                                <Input size="large" disabled/>
                            </Form.Item>
                            <Form.Item label="Phone" name="phone">
                                <Input size="large" disabled/>
                            </Form.Item>
                        </Form>
                        <div className="back-to-cart">
                            <Button size="large" className="account-btn" type="primary" onClick={() => backToCart()}>
                                <CaretLeftOutlined/> Back to cart
                            </Button>
                        </div>
                    </div>
                    <div className="checkout-content payment">
                        <h1>Payment</h1>
                        <Payment/>
                    </div>
                    <div className="summary-content">
                        <h1>Order Summary</h1>
                        <div className="cart-items">
                            {state.items.map((item: Item, i: number) => 
                                <div className="cart-item" key={i}>
                                    <div className="cart-item-resale">
                                        &nbsp;
                                    </div>
                                    <div className="cart-item-info">
                                        <div>{item.type}</div>
                                    </div>
                                    <div className="cart-item-currency">
                                        <span className="currency">x{item.amount}</span>
                                    </div>
                                    <div className="cart-item-currency">
                                        <span className="currency">{calculatePrice(item.amount, item.price)} EUR</span>
                                    </div>
                                </div>
                            )}
                            {state.resaleItems.map((item: Item, i: number) => 
                                <div className="cart-item" key={i}>
                                    <div className="cart-item-resale">
                                        <SwapOutlined />
                                    </div>
                                    <div className="cart-item-info">
                                        <div>{item.type}</div>
                                    </div>
                                    <div className="cart-item-currency">
                                        <span className="currency">x{item.amount}</span>
                                    </div>
                                    <div className="cart-item-currency">
                                        <span className="currency">{calculatePrice(item.amount, item.price)} EUR</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="administration-fees">
                            Administration Fees: <span className="amount">{calculateAdministrationFees().toFixed(2)} EUR</span>
                        </div>
                        <div className="total-amount">
                            Total:<span className="amount">{(calculateTotalPrice()  + calculateAdministrationFees()).toFixed(2)} EUR</span>
                        </div>
                        <MakePayment paymentId={paymentId!}/>
                    </div>
                </Elements>
            </div>
        </div>
    );

};