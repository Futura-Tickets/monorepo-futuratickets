"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ANTD
import Button from 'antd/es/button';
import { CaretLeftOutlined, CloseOutlined, SwapOutlined } from '@ant-design/icons';
import { DatePicker, message } from 'antd';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import dayjs from 'dayjs';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// SERVICES
import { validateCoupon } from '../shared/services';

// INTERFACES
import { Item } from '../shared/interfaces';

// STYLES
import './Cart.scss';

export default function Cart() {

    const [state, dispatch] = useGlobalState();
    
    const router = useRouter();

    const [form] = Form.useForm();
    const [totalAmount, setTotalAmount] = useState<number>();
    const [clientReady, setClientReady] = useState<boolean>(false);
    const [showCouponInput, setShowCouponInput] = useState<boolean>(false);
    const [couponCode, setCouponCode] = useState<string>("");
    const [couponDiscount, setCouponDiscount] = useState<number>(0);
    const [couponLoader, setCouponLoader] = useState<boolean>(false);
    const [couponError, setCouponError] = useState<string>("");

    const removeItem = (index: number): void => {
        dispatch({ items: state.items?.filter((item: Item, i: number) => (index != i || (index == i && item.amount > 1))).map((item: Item, i: number) => {
            if (item.amount > 1) return { ...item, amount: item.amount - 1 };
            return item;
        })});
    };

    const removeResaleItem = (sale: string): void => {
        dispatch({ resaleItems: state.resaleItems?.filter((item: Item, i: number) => item.sale != sale) });
    };

    const calculatePrice = (type: string, amount: number, price: number): number => {
        return amount * price;
    };

    const calculateTotalPrice = (): number => {
        return (state.items.reduce((accumulator, item: Item) => accumulator + (item.price * item.amount), 0) || 0) + (state.resaleItems.reduce((accumulator, item: Item) => accumulator + (item.price * item.amount), 0) || 0);
    };

    const calculateAdministrationFees = (): number => {
        const totalPrice = (state.items.reduce((accumulator, item: Item) => accumulator + (item.price * item.amount), 0) || 0) + (state.resaleItems.reduce((accumulator, item: Item) => accumulator + (item.price * item.amount), 0) || 0);
        return totalPrice * (state.event!.commission / 100);
    };

    const calculateFinalPrice = (): number => {
        return calculateTotalPrice() + calculateAdministrationFees() - couponDiscount;
    };

    const applyCoupon = async (): Promise<void> => {
        try {

            setCouponLoader(true);
            
            const result = await validateCoupon(couponCode, state.event?._id!);
            const discount = calculateTotalPrice() * (result.discount! / 100);

            setCouponDiscount(discount);

            dispatch({ couponCode: result.code });

            message.success("Coupon applied successfully");

        } catch (error: any) {
            setCouponError(error.message);
        } finally {
            setCouponLoader(false);
        }
    };

    const removeCoupon = (): void => {
        setCouponDiscount(0);
        setCouponCode("");
        setCouponError("");
    };

    const checkout = async(): Promise<void> => {
        dispatch({ 
            clientDetails: {
                name: form.getFieldValue('name'),
                lastName: form.getFieldValue('lastName'),
                birthday: form.getFieldValue('birthday'),
                email: form.getFieldValue('email'),
                phone: form.getFieldValue('phone')
            },
            couponInfo: couponDiscount > 0 ? {
                code: couponCode,
                discount: couponDiscount
            } : null
        });
        router.push('/cart/checkout');
    };

    const backToEvent = async(): Promise<void> => {
        router.push('/');
    };

    const initForm = (): void => {
        form.setFieldsValue({
            name: state.account?.name,
            lastName: state.account?.lastName,
            email: state.account?.email,
            phone: state.account?.phone || ''
        });
    };

    useEffect(() => {
        setClientReady(true);
    }, []);

    useEffect(() => {
        initForm();
    }, [state.account])

    if (state.items.length == 0 && state.resaleItems.length == 0) {
        return (
            <div className="cart-container">
                <div className="cart-image-container">
                    <div className="cart-image" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_BLOB_URL}/${state.event?.image})` }}></div>
                </div>
                <div className="cart-content-container">
                    <div className="cart-content">
                        <div className="cart-info">
                            <div>
                                <Button size="large" className="account-btn" type="primary" onClick={() => backToEvent()}>
                                    <CaretLeftOutlined />Back to event
                                </Button>
                            </div>
                        </div>
                        <div className="contact-details empty">
                            <h1>Your cart is empty</h1>
                        </div>
                        <div>&nbsp;</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <div className="cart-image-container">
                <div className="cart-image" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_BLOB_URL}/${state.event?.image})` }}></div>
            </div>
            <div className="cart-content-container">
                <Form form={form} layout="vertical">
                    <div className="cart-content">
                        <div className="cart-info">
                            <div>
                                <Button size="large" className="account-btn" type="primary" onClick={() => backToEvent()}>
                                    <CaretLeftOutlined />Back to event
                                </Button>
                            </div>
                        </div>
                        <div className="contact-details">
                            <h1>Client Details</h1>
                            <Form.Item label="Name" name="name" rules={[{ required: true, message: "Name is required" }]}>
                                <Input size="large"/>
                            </Form.Item>
                            <Form.Item label="Lastname" name="lastName" rules={[{ required: true, message: "Lastname is required" }]}>
                                <Input size="large"/>
                            </Form.Item>
                            <Form.Item label="Birthdate" name="birthdate" rules={[{ required: true, message: "Birthdate is required" }]}>
                                <DatePicker size="large" style={{ width: '100%' }}/>
                            </Form.Item>
                            <Form.Item label="Email" name="email" rules={[{ required: true, message: "Email is required" }]}>
                                <Input size="large"/>
                            </Form.Item>
                            <Form.Item label="Phone" name="phone">
                                <Input size="large"/>
                            </Form.Item>
                        </div>
                        <div className="summary-content">
                            <h1>Order Summary</h1>
                            <div className="cart-items">
                                {state.items!.map((item: Item, i: number) => 
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
                                            <span className="currency">{calculatePrice(item.type, item.amount, item.price)} EUR</span>
                                        </div>
                                        <div className="cart-item-remove">
                                            <Button size="large" className="remove" onClick={() => removeItem(i)}>
                                                <CloseOutlined />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {state.resaleItems!.map((item: Item, i: number) => 
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
                                            <span className="currency">{calculatePrice(item.type, item.amount, item.price)} EUR</span>
                                        </div>
                                        <div className="cart-item-remove">
                                            <Button size="large" className="remove" onClick={() => removeResaleItem(item.sale!)}>
                                                <CloseOutlined />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="cart-item coupon-row">
                                    <div className="cart-item-info coupon-container">
                                        {couponDiscount === 0 ? (
                                            <>
                                                {!showCouponInput ? (
                                                    <div className="coupon-text" onClick={() => setShowCouponInput(true)}>
                                                        Got a coupon? Click here to enter your code
                                                    </div>
                                                ) : (
                                                    <div className="coupon-input-container">
                                                        <Input
                                                            size="large"
                                                            placeholder="Enter your coupon"
                                                            value={couponCode}
                                                            onChange={(e) => setCouponCode(e.target.value)}
                                                            disabled={couponLoader}
                                                        />
                                                        <Button 
                                                            size="large" 
                                                            className="coupon-btn" 
                                                            onClick={applyCoupon}
                                                            disabled={!couponCode.trim() || couponLoader}
                                                            loading={couponLoader}
                                                        >
                                                            Apply
                                                        </Button>
                                                    </div>
                                                )}
                                                {couponError && <div className="coupon-error">{couponError}</div>}
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="administration-fees">
                                Administration Fees: <span className="amount">{calculateAdministrationFees().toFixed(2)} EUR</span>
                            </div>
                            {couponDiscount > 0 && (
                                <div className="coupon-discount">
                                    Applied coupon:&nbsp;<span className="amount">-{couponDiscount.toFixed(2)} EUR</span>
                                    <CloseOutlined 
                                        className="coupon-close-icon" 
                                        onClick={removeCoupon} 
                                        style={{ 
                                            marginLeft: '10px', 
                                            cursor: 'pointer',
                                        }} 
                                    />
                                </div>
                            )}
                            <div className="total-amount">
                                Total:&nbsp; {couponDiscount > 0 ? (
                                    <>
                                        <span className="original-price" style={{ textDecoration: 'line-through', marginRight: '10px', opacity: 0.7 }}>
                                            {(calculateTotalPrice() + calculateAdministrationFees()).toFixed(2)} EUR
                                        </span>
                                        <span className="amount">{calculateFinalPrice().toFixed(2)} EUR</span>
                                    </>
                                ) : (
                                    <span className="amount">{calculateFinalPrice().toFixed(2)} EUR</span>
                                )}
                            </div>
                            <div className="cart-checkout">
                                <Form.Item shouldUpdate>
                                    {() => (
                                        <Button 
                                            size="large" 
                                            className="account-btn" 
                                            type="primary" 
                                            disabled={
                                                !clientReady || 
                                                !form.isFieldsTouched(true) || 
                                                !!form.getFieldsError().filter(({ errors }) => errors.length).length ||
                                                couponLoader
                                            } 
                                            onClick={() => checkout()}
                                        >
                                            Checkout
                                        </Button>
                                    )}
                                </Form.Item>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
};