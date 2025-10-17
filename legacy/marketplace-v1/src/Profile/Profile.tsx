"use client";
import { useEffect } from 'react';


// STYLES
import './Profile.scss';

export default function Profile() {

    return (

        <div className="profile-container">
            <div className="profile-content">
                <ul>
                    <li>name</li>
                    <li>email</li>
                    <li>how many tokens</li>
                    <li>your collection</li>
                </ul>
            </div>
        </div>
        
    );

};