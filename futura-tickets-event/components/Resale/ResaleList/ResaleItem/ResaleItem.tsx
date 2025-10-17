"use client";

// ANTD
import Button from "antd/es/button";

// STATE
import { useGlobalState } from "@/components/GlobalStateProvider/GlobalStateProvider";

// INTERFACES
import { Item, Sale } from "@/components/shared/interfaces";

// STYLES
import "./ResaleItem.scss";

export default function ResaleItem({ resale }: { resale: Sale }) {

    const [state, dispatch] = useGlobalState();

    const addTicket = (sale: string, type: string, price: number): void => {
        if (state.resaleItems?.length == 0) {
            dispatch({ resaleItems: [{ sale, type, amount: 1, price }] });
        } else {
            dispatch({ resaleItems: [...state.resaleItems, { sale, type, amount: 1, price }] });
        }
    };

    const removeTicket = (sale: string): void => {
        dispatch({ resaleItems: state.resaleItems?.filter((item: Item) => item.sale != sale )});
    };

    return (
        <div className="resale-item-container">
            <div className="resale-item-content">
                <div className="token-id">
                    {resale.tokenId ? `#${resale.tokenId}` : 'N/A'}
                </div>
                <div className="client">
                    {resale.client.name} {resale.client.lastName}
                </div>
                <div className="type">
                    {resale.type}
                </div>
                <div className="price">
                    {resale.resale?.resalePrice} EUR
                </div>
                <div className="view">
                    {state.resaleItems.find((item: Item) => item.sale == resale._id) == undefined && <Button size="large" className="view-details" onClick={() => addTicket(resale._id, resale.type, resale.resale?.resalePrice!)}>Add to cart</Button>}
                    {state.resaleItems.find((item: Item) => item.sale == resale._id) != undefined && <Button  size="large" className="view-details" onClick={() => removeTicket(resale._id)}>Remove</Button>}
                </div>
            </div>
        </div>
    );
};