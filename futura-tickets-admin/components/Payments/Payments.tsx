"use client";
import { useState, useEffect } from 'react';

// ANTD
import { CreditCardOutlined, WarningOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Empty, Modal, Form, Input, Select, DatePicker } from "antd";

// COMPONENTS
import Error from "@/shared/Error/Error";
import Loader from "@/shared/Loader/Loader";
import PaymentsActions from "./PaymentsActions/PaymentsActions";
import PaymentMethodItem from "./PaymentMethodItem/PaymentMethodItem";
import RequestedPaymentItem from "./RequestedPaymentItem/RequestedPaymentItem";

// SERVICES
import { 
  getPaymentMethods, 
  createPaymentMethod as createPaymentMethodService, 
  deletePaymentMethod as deletePaymentMethodService,
  getPaymentRequests,
  createPaymentRequest as createPaymentRequestService,
  deletePaymentRequest as deletePaymentRequestService
} from "@/shared/services";

// STYLES
import "./Payments.scss";

// INTERFACES
import type { PaymentMethod, RequestedPayment } from "@/shared/interfaces";

// CONSTANTS
const PAYMENTS_ERROR = "There was an error loading your payment methods";
const REQUESTED_PAYMENTS_ERROR = "There was an error loading your payment requests";
const { Option } = Select;

// Import the useGlobalState hook
import { useGlobalState } from "../GlobalStateProvider/GlobalStateProvider";

export default function Payments() {
  // Add global state
  const [state, dispatch] = useGlobalState();

  // Navigation menu
  const [activeSection, setActiveSection] = useState<string>("payment-methods");

  // States for Payment Methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [addPaymentMethodModal, setAddPaymentMethodModal] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'bank' | 'card'>('card');

  // States for Requested Payments
  const [requestedPayments, setRequestedPayments] = useState<RequestedPayment[]>([]);
  const [requestedLoading, setRequestedLoading] = useState<boolean>(false);
  const [addRequestModal, setAddRequestModal] = useState<boolean>(false);
  const [requestLoader, setRequestLoader] = useState<boolean>(false);
  const [requestForm] = Form.useForm();
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestModalError, setRequestModalError] = useState<string | null>(null);

  const scrollTo = (section: string): void => {
    setActiveSection(section);
  };

  // Methods for Payment Methods
  const fetchPaymentMethods = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getPaymentMethods();

      // Si es un array (incluso vacío), es válido
      if (Array.isArray(data)) {
        const sortedPaymentMethods = data.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPaymentMethods(sortedPaymentMethods);
        return;
      }

      // Solo mostrar error si hay un error explícito
      if (data && typeof data === 'object' && 'error' in data) {
        setError((data as any)?.error || 'Failed to load payment methods');
        setPaymentMethods([]);
        return;
      }

      // Si no es array ni error, tratar como vacío
      setPaymentMethods([]);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setError((error as Error).message);
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestedPayments = async () => {
    setRequestedLoading(true);
    setRequestError(null);

    try {
      const data = await getPaymentRequests();
      console.log('Requested Payments:', data);
      
      if ('error' in data) {
        setError(data.error as string);
        return;
      }
      
      const sortedRequestedPayments = data.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setRequestedPayments(sortedRequestedPayments);
    } catch (error) {
      console.error('Error loading payment requests:', error);
      setRequestError((error as Error).message);
    } finally {
      setRequestedLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
    fetchRequestedPayments();
  }, []);

  const handleAddPaymentMethodOpen = () => {
    setModalError(null);
    setAddPaymentMethodModal(true);
    
    form.setFieldsValue({ type: 'card' });
    setPaymentType('card');
  };

  const handleAddPaymentMethodCancel = () => {
    setModalError(null);
    form.resetFields();
    setAddPaymentMethodModal(false);
  };

  const createPaymentMethod = async (): Promise<void> => {
    setLoader(true);
    setModalError(null);

    try {
      const values = await form.validateFields();
      let expiryDate = undefined;
      if (values.type === 'card' && values.expiryDate) {
        if (values.expiryDate.toDate) {
          expiryDate = values.expiryDate.toDate();
        } 
        else if (values.expiryDate instanceof Date) {
          expiryDate = values.expiryDate;
        }
      }
      
      const paymentMethodData = {
        type: values.type || paymentType,
        name: values.name,
        number: values.type === 'card' || values.type === 'bank' ? values.number : undefined,
        expiryDate
      };
      
      const response = await createPaymentMethodService(paymentMethodData);
      
      if ('error' in response) {
        setModalError(response.error as string);
        return;
      }

      const newPaymentMethod = {
        ...response
      };

      setPaymentMethods(prevMethods => [newPaymentMethod, ...prevMethods]);
      
      form.resetFields();
      setAddPaymentMethodModal(false);
    } catch (error) {
      console.error('Error creating payment method:', error);
      setModalError((error as Error).message);
    } finally {
      setLoader(false);
    }
  };

  const handleAddRequestOpen = () => {
    setRequestModalError(null);
    setAddRequestModal(true);
  };

  const handleAddRequestCancel = () => {
    setRequestModalError(null);
    requestForm.resetFields();
    setAddRequestModal(false);
  };

  const createPaymentRequest = async (): Promise<void> => {
    setRequestLoader(true);
    setRequestModalError(null);

    try {
      const values = await requestForm.validateFields();
      
      const requestData = {
        amount: values.amount,
        account: state.account?.account,
        paymentMethod: values.paymentMethodId,
        status: 'pending' as const
      };
      
      const response = await createPaymentRequestService(requestData);
      
      if ('error' in response) {
        setRequestModalError(response.error as string);
        return;
      }

      const newRequest = {
        ...response
      };

      setRequestedPayments(prevRequests => [newRequest, ...prevRequests]);
      
      requestForm.resetFields();
      setAddRequestModal(false);
    } catch (error) {
      console.error('Error creating payment request:', error);
      setRequestModalError((error as Error).message);
    } finally {
      setRequestLoader(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string): Promise<void> => {
    try {
      const response = await deletePaymentMethodService(id);
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      setPaymentMethods(prevMethods => prevMethods.filter(method => method._id !== id));
    } catch (error) {
      console.error('Error deleting payment method:', error);
      setError((error as Error).message);
    }
  };

  const handleDeleteRequest = async (id: string): Promise<void> => {
    try {
      const response = await deletePaymentRequestService(id);
      
      if (response.error) {
        setRequestError(response.error);
        return;
      }
      
      setRequestedPayments(prevRequests => prevRequests.filter(request => request._id !== id));
    } catch (error) {
      console.error('Error deleting payment request:', error);
      setRequestError((error as Error).message);
    }
  };

  if (loading && activeSection === "payment-methods" && paymentMethods.length === 0) return <Loader />;
  if (requestedLoading && activeSection === "requested-payments" && requestedPayments.length === 0) return <Loader />;
  if (error && !loading && activeSection === "payment-methods") return <Error errorMsg={PAYMENTS_ERROR} />;
  if (requestError && !requestedLoading && activeSection === "requested-payments") return <Error errorMsg={REQUESTED_PAYMENTS_ERROR} />;

  return (
    <div className="payments-container">
      <div className="payments-header">
        <h1><CreditCardOutlined /> Payment Methods</h1>
        <div className="payments-header-actions">
          <PaymentsActions actions={{ launch: false, filter: false, access: false, resale: false, info: false, notifications: true }} />
        </div>
      </div>

      <div className="payments-content-container">
        <div className="payments-menu">
          <ul>
            <li 
              className={activeSection === "payment-methods" ? "active" : ""} 
              onClick={() => scrollTo('payment-methods')}
            >
              Payment Methods
            </li>
            <li 
              className={activeSection === "requested-payments" ? "active" : ""} 
              onClick={() => scrollTo('requested-payments')}
            >
              Payment Requests
            </li>
          </ul>
        </div>

        <div className="payments-content">
          {activeSection === "payment-methods" && (
            <div className="payment-methods-list-container">
              <div className="payment-methods-header">
                <h2>Payment Methods</h2>
                <Button 
                  size="large"
                  className="view-details"
                  onClick={handleAddPaymentMethodOpen}
                >
                  Add Payment Method
                </Button>
              </div>

              <div className="payment-methods-list-info-content">
                <div className="payment-methods-list-info-header">
                  <div className="type">Type</div>
                  <div className="name">Name</div>
                  <div className="number">Number</div>
                  <div className="expiry">Expiry Date</div>
                  <div className="created">Created</div>
                  <div></div>
                </div>
                
                <div className="payment-methods-list-content">
                  {loading ? (
                    <div className="no-payment-methods">Loading payment methods...</div>
                  ) : error ? (
                    <div className="error-state">
                      <Empty
                        image={<WarningOutlined className="error-icon" />}
                        imageStyle={{ height: 'auto' }}
                        className="error-empty"
                        description={
                          <div className="error-content">
                            <p>Could not load payment methods</p>
                            <Button
                              icon={<ReloadOutlined />}
                              onClick={fetchPaymentMethods}
                              type="primary"
                              size="middle"
                              className="retry-button"
                            >
                              Retry
                            </Button>
                          </div>
                        }
                      />
                    </div>
                  ) : paymentMethods.length > 0 ? (
                    paymentMethods.map((paymentMethod: PaymentMethod, i: number) => {
                      return (
                        <PaymentMethodItem
                          paymentMethod={paymentMethod}
                          key={i}
                          onDelete={handleDeletePaymentMethod}
                        />
                      );
                    })
                  ) : (
                    <div className="no-payment-methods">No payment methods available</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === "requested-payments" && (
            <div className="payment-methods-list-container">
              <div className="payment-methods-header">
                <h2>Payment Requests</h2>
                <Button 
                  size="large"
                  className="view-details"
                  onClick={handleAddRequestOpen}
                >
                  New Request
                </Button>
              </div>

              <div className="payment-methods-list-info-content">
                <div className="payment-methods-list-info-header">
                  <div className="account">Account</div>
                  <div className="amount">Amount</div>
                  <div className="status">Status</div>
                  <div className="payment-method">Payment Method</div>
                  <div className="date">Date</div>
                  <div></div>
                </div>
                
                <div className="payment-methods-list-content">
                  {requestedLoading ? (
                    <div className="no-payment-methods">Loading payment requests...</div>
                  ) : requestError ? (
                    <div className="error-state">
                      <Empty
                        image={<WarningOutlined className="error-icon" />}
                        imageStyle={{ height: 'auto' }}
                        className="error-empty"
                        description={
                          <div className="error-content">
                            <p>Could not load payment requests</p>
                            <Button
                              icon={<ReloadOutlined />}
                              onClick={fetchRequestedPayments}
                              type="primary"
                              size="middle"
                              className="retry-button"
                            >
                              Retry
                            </Button>
                          </div>
                        }
                      />
                    </div>
                  ) : requestedPayments.length > 0 ? (
                    requestedPayments.map((request: RequestedPayment, i: number) => {
                      return (
                        <RequestedPaymentItem
                          requestedPayment={request}
                          key={i}
                          onDelete={handleDeleteRequest}
                        />
                      );
                    })
                  ) : (
                    <div className="no-payment-methods">No payment requests available</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        title={null}
        open={addPaymentMethodModal}
        onCancel={handleAddPaymentMethodCancel}
        closable={true}
        footer={null}
        mask={true}
        centered
      >
        <div className="add-payment-method-container">
          <div className="add-payment-method-header">
            <h2>Create new payment method</h2>
          </div>
          <div className="add-payment-method-content">
            {modalError && <div className="error-message">{modalError}</div>}
            <Form form={form} layout="vertical">
              <Form.Item
                name="type"
                label="Type"
                rules={[{ required: true, message: "Please select a payment type" }]}
                initialValue="card"
              >
                <Select onChange={(value) => setPaymentType(value)}>
                  <Option value="card">Credit Card</Option>
                  <Option value="bank">Bank Account</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please enter a name" }]}
              >
                <Input size="large" placeholder="Name for this payment method" />
              </Form.Item>

              {paymentType === 'card' && (
                <>
                  <Form.Item
                    name="number"
                    label="Card Number"
                    rules={[{ required: true, message: "Please enter a card number" }]}
                    normalize={(value) => {
                      return value ? value.replace(/\s/g, '') : value;
                    }}
                  >
                    <Input 
                      size="large" 
                      placeholder="Card number"
                      onChange={(e) => {
                        const input = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                        const parts = [];
                        for (let i = 0; i < input.length && i < 16; i += 4) {
                          parts.push(input.substring(i, i + 4));
                        }
                        const formatted = parts.join(' ');
                        form.setFieldsValue({ number: formatted });
                      }}
                      maxLength={19}
                    />
                  </Form.Item>

                  <Form.Item
                    name="expiryDate"
                    label="Expiry Date"
                    rules={[{ required: true, message: "Please enter an expiry date" }]}
                  >
                    <DatePicker 
                      size="large" 
                      placeholder="Select expiry date" 
                      format="MM/YY"
                      picker="month" 
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </>
              )}

              {paymentType === 'bank' && (
                <Form.Item
                  name="number"
                  label="Account Number"
                  rules={[{ required: true, message: "Please enter an account number" }]}
                >
                  <Input size="large" placeholder="Account number" />
                </Form.Item>
              )}

              <Form.Item shouldUpdate>
                {() => (
                  <Button
                    size="large"
                    className="payment-method-btn"
                    type="primary"
                    onClick={createPaymentMethod}
                    loading={loader}
                    disabled={
                      !form.isFieldsTouched(true) ||
                      !!form.getFieldsError().filter(({ errors }) => errors.length).length
                    }
                    style={{ width: '100%' }}
                  >
                    Create payment method
                  </Button>
                )}
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>
      <Modal
        title={null}
        open={addRequestModal}
        onCancel={handleAddRequestCancel}
        closable={true}
        footer={null}
        mask={true}
        centered
      >
        <div className="add-payment-method-container">
          <div className="add-payment-method-header">
            <h2>Create payment request</h2>
          </div>
          <div className="add-payment-method-content">
            {requestModalError && <div className="error-message">{requestModalError}</div>}
            <Form form={requestForm} layout="vertical">
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true, message: "Please enter an amount" }]}
              >
                <Input size="large" placeholder="Amount" type="number" prefix="€" />
              </Form.Item>

              <Form.Item
                name="paymentMethodId"
                label="Payment Method"
                rules={[{ required: true, message: "Please select a payment method" }]}
              >
                <Select size="large" placeholder="Select payment method">
                  {paymentMethods.map((method) => (
                    <Option key={method._id} value={method._id}>
                      {method.name} ({method.type === 'card' ? 'Credit Card' : 'Bank Account'})
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item shouldUpdate>
                {() => (
                  <Button
                    size="large"
                    className="payment-method-btn" 
                    type="primary"
                    onClick={createPaymentRequest}
                    loading={requestLoader}
                    disabled={
                      !requestForm.isFieldsTouched(['amount', 'paymentMethodId']) ||
                      !!requestForm.getFieldsError().filter(({ errors }) => errors.length).length
                    }
                    style={{ width: '100%' }}
                  >
                    Create request
                  </Button>
                )}
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>
    </div>
  );
}