import { ObjectId } from "mongodb";
export interface ICart {
    _id: ObjectId;
    email: string;
    cartItems: ICartItem[];
}
export interface ICartItem {
    id?: string;
    src: string;
    description: string;
    title: string;
    price: number;
    quantity: number;
}
export interface IOrderHistoryColl {
    email: string;
    orderHistory: IOrderHistory[];
}
export interface IOrderHistory {
    date: string;
    cartItems: ICartItem[];
}
