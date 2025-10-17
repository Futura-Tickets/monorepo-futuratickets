"use client";
import React from 'react';

// ANTD
import { DiscordOutlined, GithubOutlined, XOutlined } from '@ant-design/icons';

// STYLES
import './Footer.scss';

export default function Footer() {
    return (
        <div className="footer-container">
            <div className="footer-content">
                <div className="footer-left-content">
                    <img src="/assets/images/futura-tickets-white.png"/>
                    <div className="footer-rrss">
                        <GithubOutlined />
                        <XOutlined />
                        <DiscordOutlined />
                    </div>
                </div>
                <div className="footer-right-content">
                    <div className="footer-item">
                        <h5>Company</h5>
                        <ul>
                            <li>About us</li>
                            <li>Career</li>
                        </ul>
                    </div>
                    <div className="footer-item">
                        <h5>Need Help</h5>
                        <ul>
                            <li>Help Center</li>
                            <li>Contact Us</li>
                            <li>Docs</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="footer-content">
                <div className="footer-left-content rights">
                    <h5>© 2024 - Futura Tickets</h5>
                </div>
                <div className="footer-right-content">
                    <h5>Privacy Policy</h5>
                </div>
            </div>
        </div>
    );
}