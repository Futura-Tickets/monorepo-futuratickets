"use client";
import { useEffect, useState } from 'react';

// STRIPE
import { Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// ANTD
import { Button, Form } from 'antd';
import Input from 'antd/es/input/Input';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// COMPONENY
import Payment from '../Payment/Payment';
import Summary from '../Summary/Summary';

// SERVICES
import { createOrder, getStripeConfig } from '../shared/services';

// STYLES
import './CheckOut.scss';
import { CreateOrder } from '../shared/interfaces';

export function MakePayment() {

    const stripe = useStripe();
    const elements = useElements();

    const pay = async(): Promise<void> => {
        const payment = await stripe?.confirmPayment({
            elements: elements!,
            confirmParams: {
                return_url: `${window.origin}/thank-you`
            }
        });

        if(payment?.error) console.log('error!');
    };

    return (
        <div className="cart-checkout">
            <Button size="large" className="account-btn" type="primary" onClick={() => pay()}>
                Make Payment
            </Button>
        </div>
    )
}

export default function CheckOut() {

    const [state, dispatch] = useGlobalState();

    const [stripePromise, setStripePromise] = useState<any>();
    const [clientSecret, setClientSecret] = useState<string>();
    const [loader, setLoader] = useState<boolean>(true);

    const [form] = Form.useForm();

    const setStripeConfig = async(): Promise<void> => {
        try {

            const stripeConfig = await getStripeConfig();

            setStripePromise(loadStripe(stripeConfig));

            await paymentIntent();

        } catch (error) {
            
        }
    };

    const paymentIntent = async(): Promise<void> => {
        try {

            const order: CreateOrder = {
                contactDetails: {
                    name: form.getFieldValue('name'),
                    lastName: form.getFieldValue('lastName'),
                    email: form.getFieldValue('email'),
                    phone: form.getFieldValue('phone')
                },
                items: []
            }

            const paymentIntent = await createOrder(order);

            setClientSecret(paymentIntent.clientSecret);

            setLoader(false);

        } catch (error) {
            console.log(error)
        }
    };

    useEffect(() => {
        setStripeConfig();
    }, []);

    if (loader) {
        return (
            <div className="payment-container">
                <div className="payment-content">
                    Loading ...
                </div>
            </div>
        )
    }

    return (
        <Elements stripe={stripePromise} options={{clientSecret}}>
            <div className="checkout-container">
                <div className="checkout-content">
                    <h1>Contact Details</h1>
                    <Form  form={form} layout="vertical">
                        <Form.Item label="Name" name="name">
                            <Input size="large"/>
                        </Form.Item>
                        <Form.Item label="Lastname" name="lastName">
                            <Input size="large"/>
                        </Form.Item>
                        <Form.Item label="Email" name="email">
                            <Input size="large"/>
                        </Form.Item>
                        <Form.Item label="Phone" name="phone">
                            <Input size="large"/>
                        </Form.Item>
                    </Form>
                </div>
                <div className="checkout-content">
                    <h1>Payment</h1>
                    <Payment/>
                </div>
                <div className="checkout-content">
                    <Summary payment={true}/>
                    <MakePayment/>
                </div>
            </div>
        </Elements>
    );

};