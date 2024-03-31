import path from "path";
import { Invoice } from "../interfaces/Invoices";
const imagePath = path.join(__dirname, "assets", "5528439.jpg");
export const generateHeader = (doc: PDFKit.PDFDocument) => {
  doc
    .image(
      imagePath,
      50,
      45,
      { width: 50 }
    )
    .fillColor("#444444")
    .fontSize(20)
    .text("Poodi Sabji dot-com", 110, 57)
    .fontSize(10)
    .text("Lives in your heart and tummy", 200, 65, { align: "right" })
    .text("Tummy", 200, 80, { align: "right" })
    .moveDown();
};

export const generateCustomerInformation = (doc: PDFKit.PDFDocument) => {
  doc.fillColor("#444444").fontSize(20).text("Bill", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Bill no:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text("#INV123456", 150, customerInformationTop)
    .font("Helvetica")
    .text("Bill Date:", 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)

    .font("Helvetica-Bold")
    .moveDown();

  generateHr(doc, 252);
};

export const generateInvoiceTable = (
  doc: PDFKit.PDFDocument,
  bill: Invoice
) => {
  let i;
  const invoiceTableTop = 330;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    "Unit Cost",
    "Quantity",
    "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");
  let total = 0;
  for (i = 0; i < bill.items.length; i++) {
    const item = bill.items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    const subTotal = item.price * item.quantity;
    total += subTotal;
    generateTableRow(
      doc,
      position,
      item.title,
      formatCurrency(item.price),
      item.quantity,
      formatCurrency(subTotal)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "Subtotal",
    "",
    formatCurrency(total)
  );

  const paidToDatePosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    paidToDatePosition,
    "",
    "Paid To Date",
    "",
    formatCurrency(total)
  );
  doc.font("Helvetica");
};

export const generateTableRow = (
  doc: PDFKit.PDFDocument,
  y: number,
  item: string,
  unitCost: string,
  quantity: number | string,
  lineTotal: string
) => {
  doc
    .fontSize(10)
    .text(item, 50, y)
    // .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity.toString(), 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
};

export const generateHr = (doc: PDFKit.PDFDocument, y: number) => {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
};

export const formatCurrency = (val: number) => {
  // return "₹" + val;
  return `\u20B9 ${val}`;
};

export const formatDate = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
};
