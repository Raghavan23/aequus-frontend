import { MatchStatus } from './bank-transaction.model';

export type InvoiceSourceType = 'MANUAL' | 'VLM_SCAN' | 'TALLY';

export interface ParsedInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  gstRate: number;
}

export interface Invoice {
  id: string;
  organizationId: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  vendorName: string;
  vendorGstin?: string;
  invoiceDate?: string;
  dueDate?: string;
  subtotal?: number;
  gstAmount?: number;
  totalAmount: number;
  currency: string;
  matchStatus: MatchStatus;
  matchedTxnId?: string;
  sourceType: InvoiceSourceType;
  rawExtractedJson?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface InvoiceRequest {
  clientId: string;
  invoiceNumber: string;
  vendorName: string;
  vendorGstin?: string;
  invoiceDate?: string;
  dueDate?: string;
  subtotal?: number;
  gstAmount?: number;
  totalAmount: number;
  currency?: string;
  sourceType?: InvoiceSourceType;
}

export interface ParsedInvoiceResponse {
  invoiceId: string;
  clientId: string;
  invoiceNumber: string;
  vendorName: string;
  vendorGstin?: string;
  invoiceDate?: string;
  dueDate?: string;
  subtotal?: number;
  gstAmount?: number;
  totalAmount: number;
  currency: string;
  items: ParsedInvoiceItem[];
  rawJson?: string;
  confidenceScore: number;
}
