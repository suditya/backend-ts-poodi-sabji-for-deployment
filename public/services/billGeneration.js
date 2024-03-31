"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = exports.formatCurrency = exports.generateHr = exports.generateTableRow = exports.generateInvoiceTable = exports.generateCustomerInformation = exports.generateHeader = void 0;
const path_1 = __importDefault(require("path"));
const imagePath = path_1.default.join(__dirname, "assets", "5528439.jpg");
const generateHeader = (doc) => {
    doc
        .image(imagePath, 50, 45, { width: 50 })
        .fillColor("#444444")
        .fontSize(20)
        .text("Poodi Sabji dot-com", 110, 57)
        .fontSize(10)
        .text("Lives in your heart and tummy", 200, 65, { align: "right" })
        .text("Tummy", 200, 80, { align: "right" })
        .moveDown();
};
exports.generateHeader = generateHeader;
const generateCustomerInformation = (doc) => {
    doc.fillColor("#444444").fontSize(20).text("Bill", 50, 160);
    (0, exports.generateHr)(doc, 185);
    const customerInformationTop = 200;
    doc
        .fontSize(10)
        .text("Bill no:", 50, customerInformationTop)
        .font("Helvetica-Bold")
        .text("#INV123456", 150, customerInformationTop)
        .font("Helvetica")
        .text("Bill Date:", 50, customerInformationTop + 15)
        .text((0, exports.formatDate)(new Date()), 150, customerInformationTop + 15)
        .font("Helvetica-Bold")
        .moveDown();
    (0, exports.generateHr)(doc, 252);
};
exports.generateCustomerInformation = generateCustomerInformation;
const generateInvoiceTable = (doc, bill) => {
    let i;
    const invoiceTableTop = 330;
    doc.font("Helvetica-Bold");
    (0, exports.generateTableRow)(doc, invoiceTableTop, "Item", "Unit Cost", "Quantity", "Line Total");
    (0, exports.generateHr)(doc, invoiceTableTop + 20);
    doc.font("Helvetica");
    let total = 0;
    for (i = 0; i < bill.items.length; i++) {
        const item = bill.items[i];
        const position = invoiceTableTop + (i + 1) * 30;
        const subTotal = item.price * item.quantity;
        total += subTotal;
        (0, exports.generateTableRow)(doc, position, item.title, (0, exports.formatCurrency)(item.price), item.quantity, (0, exports.formatCurrency)(subTotal));
        (0, exports.generateHr)(doc, position + 20);
    }
    const subtotalPosition = invoiceTableTop + (i + 1) * 30;
    (0, exports.generateTableRow)(doc, subtotalPosition, "", "Subtotal", "", (0, exports.formatCurrency)(total));
    const paidToDatePosition = subtotalPosition + 20;
    (0, exports.generateTableRow)(doc, paidToDatePosition, "", "Paid To Date", "", (0, exports.formatCurrency)(total));
    doc.font("Helvetica");
};
exports.generateInvoiceTable = generateInvoiceTable;
const generateTableRow = (doc, y, item, unitCost, quantity, lineTotal) => {
    doc
        .fontSize(10)
        .text(item, 50, y)
        // .text(description, 150, y)
        .text(unitCost, 280, y, { width: 90, align: "right" })
        .text(quantity.toString(), 370, y, { width: 90, align: "right" })
        .text(lineTotal, 0, y, { align: "right" });
};
exports.generateTableRow = generateTableRow;
const generateHr = (doc, y) => {
    doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
};
exports.generateHr = generateHr;
const formatCurrency = (val) => {
    // return "₹" + val;
    return `\u20B9 ${val}`;
};
exports.formatCurrency = formatCurrency;
const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return year + "/" + month + "/" + day;
};
exports.formatDate = formatDate;
