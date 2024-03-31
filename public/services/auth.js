"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, _next) => {
    const token = req.header("Authorization");
    console.log(token, " verification token ");
    if (!token)
        return res.status(401).json({ error: "Access denied" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, "suditya-gupta");
        console.log(decoded, " decoded token");
        req.email = decoded.email;
        _next();
    }
    catch (error) {
        console.log("invalid token", error);
        res.status(401).json(error);
    }
};
exports.verifyToken = verifyToken;
