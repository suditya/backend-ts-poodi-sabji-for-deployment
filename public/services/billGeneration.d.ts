/// <reference types="pdfkit" />
import { Invoice } from "../interfaces/Invoices";
export declare const generateHeader: (doc: PDFKit.PDFDocument) => void;
export declare const generateCustomerInformation: (doc: PDFKit.PDFDocument) => void;
export declare const generateInvoiceTable: (doc: PDFKit.PDFDocument, bill: Invoice) => void;
export declare const generateTableRow: (doc: PDFKit.PDFDocument, y: number, item: string, unitCost: string, quantity: number | string, lineTotal: string) => void;
export declare const generateHr: (doc: PDFKit.PDFDocument, y: number) => void;
export declare const formatCurrency: (val: number) => string;
export declare const formatDate: (date: Date) => string;
