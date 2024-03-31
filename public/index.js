"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongodb_1 = require("mongodb");
const validation_1 = require("./services/validation");
// const DB_NAME = "sample_mflix";
const DB_NAME = "PoodiSabjiDotCom";
// const uri = `mongodb://0.0.0.0:27017/${DB_NAME}`;
// const uri =
//   "mongodb+srv://suditya:Suditya%40123@poodisabjidotcom.jjmenhc.mongodb.net/PoodiSabjiDotCom?retryWrites=true&w=majority&appName=PoodiSabjiDotCom";
const uri = "mongodb+srv://suditya:Suditya%40123@poodisabjidotcom.jjmenhc.mongodb.net/?retryWrites=true&w=majority&appName=PoodiSabjiDotCom";
const client = new mongodb_1.MongoClient(uri, {});
const db = client.db(DB_NAME);
const usersColl = db.collection("users");
const cartItemsColl = db.collection("cartItems");
const inventoryColl = db.collection("inventory");
const orderHistoryColl = db.collection("orderHistory");
const pdfkit_1 = __importDefault(require("pdfkit"));
const auth_1 = require("./services/auth");
const billGeneration_1 = require("./services/billGeneration");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware to parse JSON bodies
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "src")));
// Middleware to parse URL-encoded bodies
app.use(express_1.default.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;
app.get("/test", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield db.collection("users").findOne({});
    console.log(users);
    res.status(200).send("testing the mongodb server");
}));
app.get("/", (_req, res) => {
    res.send("Hello World From Nodejs Server And Typescript");
});
app.post("/api/inventory", auth_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inventory = req.body.inventory;
        const response = yield inventoryColl.updateOne({}, { $set: { inventory: inventory } }, { upsert: true });
        return res.status(200).json({ message: "successuffy updated inventory" });
    }
    catch (error) {
        console.log(error);
        return res.send(`Internal Server Error: ${error}`).status(500);
    }
}));
const deleteAndSendCartItems = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = (yield cartItemsColl.findOne({ email: email }));
        // deleting from cart items
        yield cartItemsColl.deleteOne({ email });
        return order;
    }
    catch (error) {
        throw new Error(`Not able to delete and cartItems due to:${error}`);
    }
});
const getOrderHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { email } = req;
        const orders = (yield orderHistoryColl.findOne({
            email: email,
        }));
        const orderHistory = (_a = orders.orderHistory) !== null && _a !== void 0 ? _a : [];
        return res.status(200).send({ orderHistory });
    }
    catch (error) {
        return res.status(500).send({ error });
    }
});
const placeOrderHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { email } = req;
        // Delete and send cart items
        const cart = yield deleteAndSendCartItems(email);
        if (cart) {
            const cartItems = (_b = cart === null || cart === void 0 ? void 0 : cart.cartItems) !== null && _b !== void 0 ? _b : [];
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
            const response = yield orderHistoryColl.updateOne({ email }, { $push: { orderHistory: order } }, { upsert: true });
            // Send success response
            return res.status(200).send(response);
        }
        else {
            return res.status(404).send({ message: "Cart Items is empty" });
        }
    }
    catch (error) {
        // Handle errors
        console.error(error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
});
app.post("/api/place-order", auth_1.verifyToken, placeOrderHandler);
app.get("/api/order-history", auth_1.verifyToken, getOrderHistory);
app.get("/api/inventory", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inventory = yield inventoryColl.findOne({});
        return res.send(inventory).status(200);
    }
    catch (error) {
        return res.send(`Internal error: ${error}`).status(500);
    }
}));
app.post("/api/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, adminLogin } = req.body;
    try {
        const user = yield usersColl.findOne({
            email: email,
        });
        // console.log(user);
        if (user) {
            const isEqual = yield bcryptjs_1.default.compare(password, user.password);
            if (!isEqual) {
                return res.status(400).send({ message: "InvalidPassword" });
            }
            if (adminLogin && !user.adminLogin) {
                return res.status(400).send({ message: "You dont have admin access!" });
            }
            const token = jsonwebtoken_1.default.sign({ email }, "suditya-gupta", {
                expiresIn: "8h",
            });
            console.log(token, " authenticated ");
            return res.status(200).json({
                message: `Successfully logged in! ${adminLogin ? " as a admin!" : ""}`,
                token: token,
            });
        }
        else {
            return res.status(401).send({ message: "User does not exists!" });
        }
    }
    catch (error) {
        return res.status(500).send({ message: "Something went wrong" });
    }
}));
app.post("/api/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("got the request", req.body);
    const { email, password, name } = req.body;
    const validationErrors = (0, validation_1.validateCredentials)(email, password);
    if (validationErrors) {
        return res
            .status(400)
            .send({ message: "Validation error : " + validationErrors });
    }
    else {
        try {
            const existingUser = yield usersColl.findOne({ email: email });
            if (existingUser) {
                // console.log(existingUser);
                // throw new Error("Email already exists");
                return res.status(400).json({ message: "Email already exists" });
            }
            const salt = 10;
            const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
            // const user = new User({ email, hashedPassword });
            // console.log(hashedPassword);
            const document = { email, password: hashedPassword, name: name };
            const result = yield usersColl.insertOne(document);
            // JWT token creation
            const token = jsonwebtoken_1.default.sign({ email, password }, "suditya_gupta", {
                expiresIn: "4h",
            });
            // Send back as a cookie
            return res
                .status(200)
                .cookie("token", token, { httpOnly: true })
                .json({ message: "User created successfully!", result: result });
        }
        catch (error) {
            // console.log(error);
            return res.status(500).json({
                message: "Internal Server Error due to: " + error,
            });
        }
    }
}));
app.get("/api/get-cart", auth_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("get cart called", req);
    const { email } = req;
    console.log(email, " from token ");
    try {
        const cart = (yield cartItemsColl.findOne({ email: email }));
        return res.status(200).json({ cartItems: cart.cartItems });
    }
    catch (error) {
        return res.send(`Error: ${error}`).status(500);
    }
}));
app.post("/api/add-to-cart", auth_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cartItems = req.body.cartItems;
    const email = req.body.email;
    const doc = {
        cartItems: cartItems,
        email: email,
    };
    console.log(doc);
    try {
        const response = yield cartItemsColl.updateOne({ email: email }, { $set: { cartItems: cartItems } }, { upsert: true });
        console.log(response);
        return res.send("Successfully Inserted Cart Items").status(200);
    }
    catch (error) {
        return res.send(`Failed to insert due to ${error}`).status(500);
    }
}));
app.get("/api/generate-pdf", auth_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("got the request for pdf ");
        const { email } = req;
        const orderHistoryDoc = (yield orderHistoryColl.findOne({
            email: email,
        }));
        const orderHistory = orderHistoryDoc.orderHistory;
        const orderHistoryLength = orderHistory.length;
        const lastOrderHistory = orderHistory[orderHistoryLength - 1];
        const lastCartItems = lastOrderHistory.cartItems;
        console.log(orderHistory, " order history length: " + orderHistoryLength);
        const bill = {
            invoiceNumber: "#INV123456",
            client: email,
            items: lastCartItems,
        };
        const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
        (0, billGeneration_1.generateHeader)(doc);
        (0, billGeneration_1.generateCustomerInformation)(doc);
        (0, billGeneration_1.generateInvoiceTable)(doc, bill);
        res.setHeader("Content-Type", "application/pdf");
        doc.pipe(res);
        doc.end();
    }
    catch (error) {
        return res.status(500).send({ message: `Pdf Error due to ${error}` });
        // console.log(error);
    }
}));
// export { generateBillPdf, Invoice, InvoiceItem, Client };
app.listen(PORT, () => {
    console.log("backend listening on PORT : " + PORT);
});
