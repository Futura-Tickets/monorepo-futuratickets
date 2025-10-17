"use client";

// COMPONENTS
import ResaleItem from './ResaleItem/ResaleItem';

// INTERFACES
import { Sale } from '@/components/shared/interfaces';

// STYLES
import './ResaleList.scss';

export default function ResaleList({ eventResale }: { eventResale: Sale[]}) {

    if (eventResale.length == 0) {
        return (
            <div className="resale-list-container">
                <h2>No resale tickets found.</h2>
            </div>
        );
    }

    return (
        <div className="resale-list-container">
            {eventResale.map((resale: Sale, i: number) => {
                return (
                    <ResaleItem resale={resale} key={i}/>
                );
            })}
        </div>  
    )
}