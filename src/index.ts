import { Request, Response } from "express";

import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";
import { IUser } from "./interfaces/User";
import { validateCredentials } from "./services/validation";

// const DB_NAME = "sample_mflix";
const DB_NAME = "PoodiSabjiDotCom";

// const uri = `mongodb://0.0.0.0:27017/${DB_NAME}`;
// const uri =
//   "mongodb+srv://suditya:Suditya%40123@poodisabjidotcom.jjmenhc.mongodb.net/PoodiSabjiDotCom?retryWrites=true&w=majority&appName=PoodiSabjiDotCom";

const uri =
  "mongodb+srv://suditya:Suditya%40123@poodisabjidotcom.jjmenhc.mongodb.net/?retryWrites=true&w=majority&appName=PoodiSabjiDotCom";

const client = new MongoClient(uri, {});
const db = client.db(DB_NAME);
const usersColl = db.collection("users");
const cartItemsColl = db.collection("cartItems");
const inventoryColl = db.collection("inventory");
const orderHistoryColl = db.collection("orderHistory");
interface AuthenticatedRequest extends Request {
  email?: string;
}

import PDFDocument from "pdfkit";
import { ICart, IOrderHistoryColl } from "./interfaces/Cart";
import { verifyToken } from "./services/auth";
import {
  generateCustomerInformation,
  generateHeader,
  generateInvoiceTable,
} from "./services/billGeneration";
import path from "path";
dotenv.config();

const app = express();
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, "src")));

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

app.get("/test", async (_req, res) => {
  const users = await db.collection("users").findOne({});
  console.log(users);
  res.status(200).send("testing the mongodb server");
});

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World From Nodejs Server And Typescript");
});

app.post("/api/inventory", verifyToken, async (req, res) => {
  try {
    const inventory = req.body.inventory;
    const response = await inventoryColl.updateOne(
      {},
      { $set: { inventory: inventory } },
      { upsert: true }
    );
    return res.status(200).json({ message: "successuffy updated inventory" });
  } catch (error) {
    console.log(error);
    return res.send(`Internal Server Error: ${error}`).status(500);
  }
});

const deleteAndSendCartItems = async (email?: string): Promise<ICart> => {
  try {
    const order = (await cartItemsColl.findOne({ email: email })) as ICart;
    // deleting from cart items
    await cartItemsColl.deleteOne({ email });
    return order;
  } catch (error) {
    throw new Error(`Not able to delete and cartItems due to:${error}`);
  }
};

const getOrderHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email } = req;
    const orders = (await orderHistoryColl.findOne({
      email: email,
    })) as unknown as IOrderHistoryColl;
    const orderHistory = orders.orderHistory ?? [];
    return res.status(200).send({ orderHistory });
  } catch (error) {
    return res.status(500).send({ error });
  }
};

const placeOrderHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email } = req;

    // Delete and send cart items
    const cart = await deleteAndSendCartItems(email);
    if (cart) {
      const cartItems = cart?.cartItems ?? [];

      // Check if cart items are empty
      if (cartItems.length === 0) {
        throw new Error(`Cart items cannot be empty`);
      }

      // Get current Indian time
      const currentDate = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: true,
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      });

      // Create order object
      const order = { date: currentDate, cartItems };

      // Update order history in the database
      const response = await orderHistoryColl.updateOne(
        { email },
        { $push: { orderHistory: order } },
        { upsert: true }
      );
      // Send success response
      return res.status(200).send(response);
    } else {
      return res.status(404).send({ message: "Cart Items is empty" });
    }
  } catch (error) {
    // Handle errors
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

app.post("/api/place-order", verifyToken, placeOrderHandler);
app.get("/api/order-history", verifyToken, getOrderHistory);

app.get("/api/inventory", async (_req, res) => {
  try {
    const inventory = await inventoryColl.findOne({});
    return res.send(inventory).status(200);
  } catch (error) {
    return res.send(`Internal error: ${error}`).status(500);
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password, adminLogin } = req.body;
  try {
    const user = await usersColl.findOne<IUser>({
      email: email,
    });
    // console.log(user);
    if (user) {
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        return res.status(400).send({ message: "InvalidPassword" });
      }

      if (adminLogin && !user.adminLogin) {
        return res.status(400).send({ message: "You dont have admin access!" });
      }
      const token = jwt.sign({ email }, "suditya-gupta", {
        expiresIn: "8h",
      });
      console.log(token, " authenticated ");
      return res.status(200).json({
        message: `Successfully logged in! ${adminLogin ? " as a admin!" : ""}`,
        token: token,
      });
    } else {
      return res.status(401).send({ message: "User does not exists!" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Something went wrong" });
  }
});

app.post("/api/register", async (req, res) => {
  // console.log("got the request", req.body);
  const { email, password, name } = req.body as {
    email: string;
    password: string;
    name: string;
  };
  const validationErrors = validateCredentials(email, password);
  if (validationErrors) {
    return res
      .status(400)
      .send({ message: "Validation error : " + validationErrors });
  } else {
    try {
      const existingUser = await usersColl.findOne({ email: email });
      if (existingUser) {
        // console.log(existingUser);
        // throw new Error("Email already exists");
        return res.status(400).json({ message: "Email already exists" });
      }

      const salt = 10;
      const hashedPassword = await bcrypt.hash(password, salt);
      // const user = new User({ email, hashedPassword });
      // console.log(hashedPassword);
      const document = { email, password: hashedPassword, name: name } as IUser;
      const result = await usersColl.insertOne(document);

      // JWT token creation
      const token = jwt.sign({ email, password }, "suditya_gupta", {
        expiresIn: "4h",
      });

      // Send back as a cookie
      return res
        .status(200)
        .cookie("token", token, { httpOnly: true })
        .json({ message: "User created successfully!", result: result });
    } catch (error) {
      // console.log(error);
      return res.status(500).json({
        message: "Internal Server Error due to: " + error,
      });
    }
  }
});

app.get(
  "/api/get-cart",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response) => {
    console.log("get cart called", req);
    const { email } = req;
    console.log(email, " from token ");
    try {
      const cart = (await cartItemsColl.findOne({ email: email })) as ICart;
      return res.status(200).json({ cartItems: cart.cartItems });
    } catch (error) {
      return res.send(`Error: ${error}`).status(500);
    }
  }
);

app.post("/api/add-to-cart", verifyToken, async (req, res) => {
  const cartItems = req.body.cartItems;
  const email = req.body.email;
  const doc = {
    cartItems: cartItems,
    email: email,
  };
  console.log(doc);
  try {
    const response = await cartItemsColl.updateOne(
      { email: email },
      { $set: { cartItems: cartItems } },
      { upsert: true }
    );
    console.log(response);
    return res.send("Successfully Inserted Cart Items").status(200);
  } catch (error) {
    return res.send(`Failed to insert due to ${error}`).status(500);
  }
});

app.get(
  "/api/generate-pdf",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log("got the request for pdf ");
      const { email } = req;
      const orderHistoryDoc = (await orderHistoryColl.findOne({
        email: email,
      })) as unknown as IOrderHistoryColl;

      const orderHistory = orderHistoryDoc.orderHistory;
      const orderHistoryLength = orderHistory.length;
      const lastOrderHistory = orderHistory[orderHistoryLength - 1];
      const lastCartItems = lastOrderHistory.cartItems;

      console.log(orderHistory, " order history length: " + orderHistoryLength);
      const bill = {
        invoiceNumber: "#INV123456",
        client: email as string,
        items: lastCartItems,
      };
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      generateHeader(doc);
      generateCustomerInformation(doc);
      generateInvoiceTable(doc, bill);
      res.setHeader("Content-Type", "application/pdf");
      doc.pipe(res);
      doc.end();
    } catch (error) {
      return res.status(500).send({ message: `Pdf Error due to ${error}` });
      // console.log(error);
    }
  }
);

// export { generateBillPdf, Invoice, InvoiceItem, Client };

app.listen(PORT, () => {
  console.log("backend listening on PORT : " + PORT);
});
