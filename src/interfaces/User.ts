import { ObjectId } from "mongodb";
export interface AuthenticatedRequest extends Request {
  header: any;
  email?: string;
}
export interface IUser {
  _id: ObjectId;
  email: string; // that would be email in this case
  password: string;
  name: string;
  adminLogin?: boolean;
}
