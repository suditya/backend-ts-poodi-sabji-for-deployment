import { ObjectId } from "mongodb";
export interface AuthenticatedRequest extends Request {
    header: any;
    email?: string;
}
export interface IUser {
    _id: ObjectId;
    email: string;
    password: string;
    name: string;
    adminLogin?: boolean;
}
