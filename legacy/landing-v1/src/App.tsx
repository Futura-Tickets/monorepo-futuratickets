import React from 'react';

// ANTD
import { Button } from 'antd';

// STYLES
import './App.scss';
import Form from 'antd/es/form';
import Input from 'antd/es/input/Input';
import { CheckCircleOutlined } from '@ant-design/icons';

function App() {

  const [form] = Form.useForm();

  return (
    <div className="app-container">
      <header className="app-header-container">
        <img src="/assets/images/futura-tickets.png"/>
        <ul>
          <li>Home</li>
          <li>About</li>
          <li>Services</li>
          <li>Contact</li>
        </ul>
      </header>
      <main>
        <section className="revolutionize-container">
          <div className="revolutionize-content">
            <h1>Revolutionize<br/>Your Event Ticketing</h1>
            <p>Secure, scalable, and transparent blockchain-based ticketing solutions for every event.</p>
            <p>FuturaTickets leverages blockchain technology to provide unparalleled security, transparency, and efficiency in event ticketing.</p>
            <div>
              <Button size="large">Learn More</Button>
            </div>
          </div>
          <div className="revolutionize-media">
            <img src="/assets/images/futura-tickets.png"/>
          </div>
          <video src="/assets/images/party.mov" autoPlay muted loop/>
        </section>
        <section className="one-solution-container">
          <h2>One Solution for All Your Needs</h2>
          <div className="one-solution-content">
            <div className="one-solution-item">
              <img src="/assets/images/ticket-sale.png"/>
              <h5>Ticket Sales</h5>
            </div>
            <div className="one-solution-item">
              <img src="/assets/images/guest-list.png"/>
              <h5>Guest List</h5>
            </div>
            <div className="one-solution-item">
              <img src="/assets/images/analytics.png"/>
              <h5>Analytics</h5>
            </div>
            <div className="one-solution-item">
              <img src="/assets/images/security.png"/>
              <h5>Blockchain Security</h5>
            </div>
            <div className="one-solution-item">
              <img src="/assets/images/check-in.png"/>
              <h5>Check-in App</h5>
            </div>
            <div className="one-solution-item">
              <img src="/assets/images/marketing-tools.png"/>
              <h5>Marketing Tools</h5>
            </div>
            <div className="one-solution-item">
              <img src="/assets/images/dynamic-pricing.png"/>
              <h5>Dynamic Pricing</h5>
            </div>
            <div className="one-solution-item">
              <img src="/assets/images/ai-powered.png"/>
              <h5>AI-Powered Insights</h5>
            </div>
          </div>
        </section>
        <section className="blockchain-container">
          <div className="blockchain-content">
            <h2>Blockchain-Powered Ticketing</h2>
            <p>FuturaTickets leverages blockchain technology to provide unparalleled security, transparency, and efficiency in event ticketing.</p>
            <ul>
              <li><CheckCircleOutlined /> Prevent fraud and unauthorized resales</li>
              <li><CheckCircleOutlined /> Ensure ticket authenticity</li>
              <li><CheckCircleOutlined /> Enable secure peer-to-peer transfers</li>
              <li><CheckCircleOutlined /> Provide real-time tracking and analytics</li>
            </ul>
          </div>
          <div className="blockchain-media">
            <img src="/assets/images/futura-tickets-party.png"/>
          </div>
        </section>
        {/* <section className="trusted-leaders-container">
          <div className="trusted-leader-content">
            <img src=""/>
          </div>
          <div className="trusted-leader-content">
            <img src=""/>
          </div>
          <div className="trusted-leader-content">
            <img src=""/>
          </div>
          <div className="trusted-leader-content">
            <img src=""/>
          </div>
          <div className="trusted-leader-content">
            <img src=""/>
          </div>
        </section> */}
        <section className="institutional-container">
          <h2>Our Institutional Supporters</h2>
          <div className="institutional-content">
            <div className="institutional-item">
              <img src="/assets/images/marketing-tools.png"/>
              <h5>Ticket Sales</h5>
            </div>
            <div className="institutional-item">
              <img src="/assets/images/marketing-tools.png"/>
              <h5>Guest List</h5>
            </div>
            <div className="institutional-item">
              <img src="/assets/images/marketing-tools.png"/>
              <h5>Analytics</h5>
            </div>
          </div>
        </section>
        <section className="awards-container">
          <h2>Our Awards</h2>
          <div className="awards-content">
            <div className="award-item">
              <h2>Best Blockchain Startup 2023</h2>
              <p>Recognized for our outstanding contribution to the event ticketing industry through innovative blockchain solutions.</p>
            </div>
            <div className="award-item">
              <h2>Innovation in Ticketing Award 2022</h2>
              <p>Recognized for our outstanding contribution to the event ticketing industry through innovative blockchain solutions.</p>
            </div>
            <div className="award-item">
              <h2>Tech for Good Award 2023</h2>
              <p>Recognized for our outstanding contribution to the event ticketing industry through innovative blockchain solutions.</p>
            </div>
            <div className="award-item">
              <h2>Emerging Fintech Company of the Year 2022</h2>
              <p>Recognized for our outstanding contribution to the event ticketing industry through innovative blockchain solutions.</p>
            </div>
            <div className="award-item">
              <h2>Blockchain Excellence Award 2023</h2>
              <p>Recognized for our outstanding contribution to the event ticketing industry through innovative blockchain solutions.</p>
            </div>
            <div className="award-item">
              <h2>Customer Service Innovation 2022</h2>
              <p>Recognized for our outstanding contribution to the event ticketing industry through innovative blockchain solutions.</p>
            </div>
          </div>
        </section>
        {/* <section className="team-container">
          <h2>Meet our team</h2>
          <div className="team-content">
            <div>
              <img src=""/>
              <h2>Name Lastname</h2>
              <p>CTO</p>
            </div>
            <div>
              <img src=""/>
              <h2>Name Lastname</h2>
              <p>CTO</p>
            </div>
            <div>
              <img src=""/>
              <h2>Name Lastname</h2>
              <p>CTO</p>
            </div>
          </div>
        </section> */}
        <section className="equipment-container">
          <h2>Our Equipment</h2>
          <div className="equipment-content">
            <div className="equipment-item">
              <h2>AI-Powered Ticket Scanner</h2>
              <p>Ultra-fast QR code scanning with real-time validation.</p>
            </div>
            <div className="equipment-item">
              <h2>Blockchain Node Server</h2>
              <p>Secure, distributed ledger for immutable ticket records.</p>
            </div>
            <div className="equipment-item">
              <h2>Smart Wristbands</h2>
              <p>NFC-enabled wristbands for seamless event access and payments.</p>
            </div>
            <div className="equipment-item">
              <h2>Mobile Check-in Kiosks</h2>
              <p>Self-service stations for quick and easy event entry.</p>
            </div>
            <div className="equipment-item">
              <h2>Data Analytics Dashboard</h2>
              <p>Real-time insights and reporting for event organizers.</p>
            </div>
            <div className="equipment-item">
              <h2>Holographic Ticket Display</h2>
              <p>Cutting-edge technology for showcasing premium tickets.</p>
            </div>
          </div>
        </section>
        <section className="ai-container">
          <h2>AI-Powered Solutions</h2>
          <div className="ai-content">
            <div className="ai-item">
              <h2>Predictive Analytics</h2>
              <p>Forecast ticket sales and optimize pricing strategies.</p>
            </div>
            <div className="ai-item">
              <h2>Fraud Detection
              </h2>
              <p>Identify and prevent fraudulent ticket purchases in real-time.</p>
            </div>
            <div className="ai-item">
              <h2>Personalized Recommendations</h2>
              <p>Suggest events based on user preferences and behavior.</p>
            </div>
            <div className="ai-item">
              <h2>Chatbot Support</h2>
              <p>24/7 AI-powered customer service for quick issue resolution.</p>
            </div>
            <div className="ai-item">
              <h2>Dynamic Seat Allocation</h2>
              <p>Optimize seating arrangements for maximum venue utilization.</p>
            </div>
            <div className="ai-item">
              <h2>Sentiment Analysis</h2>
              <p>Analyze social media and reviews for event feedback.</p>
            </div>
          </div>
        </section>
        <section className="form-container">
          <h2>Ready to transform your events?</h2>
          <div className="form-content">
            <div>
              <Form form={form}>
                <Form.Item>
                  <Input/>
                </Form.Item>
                <Form.Item>
                  <Input/>
                </Form.Item>
                <Form.Item>
                  <Input/>
                </Form.Item>
                <Form.Item>
                  <Input/>
                </Form.Item>
                <Form.Item shouldUpdate>
                  {() => (
                    <Button size="large" disabled={form.getFieldValue('address')?.length == 0}>
                        Request demo
                    </Button>
                  )}
                </Form.Item>
              </Form>
            </div>
            <div>
              <h3>Why Choose FuturaTickets?</h3>
              <ul>
                <li><CheckCircleOutlined /> Blockchain-powered security</li>
                <li><CheckCircleOutlined /> Seamless integration with existing systems</li>
                <li><CheckCircleOutlined /> Real-time analytics and insights</li>
                <li><CheckCircleOutlined /> Customizable solutions for any event type</li>
                <li><CheckCircleOutlined /> 24/7 customer support</li>
                <li><CheckCircleOutlined /> AI-driven dynamic pricing</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer-container">
        <div className="footer-content">
          <ul>
            <li>About Us</li>
            <li>FuturaTickets: Revolutionizing event ticketing with blockchain technology.</li>
          </ul>
          <ul>
            <li>Quick Links</li>
            <li>Home</li>
            <li>About</li>
            <li>Services</li>
            <li>Contact</li>
          </ul>
          <ul>
            <li>Legal</li>
            <li>Privacy Policy</li>
            <li>Terms of use</li>
          </ul>
          <ul>
            <li>Connect with us</li>
            <li></li>
          </ul>
        </div>
        <div className="footer-content">
          <h5>© 2024 FuturaTickets. All rights reserved.</h5>
        </div>
      </footer>
    </div>
  );
}

export default App;
