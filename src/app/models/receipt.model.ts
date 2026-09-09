import { FinancialCategory } from '../enums/financial-category.enum';

export interface LineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ParsedReceipt {
  id: string;
  merchant: string;
  subtotal: number;
  taxAmount: number;
  taxRatePercentage: number;
  tipAmount: number;
  totalAmount: number;
  currency: string;
  suggestedCategory: FinancialCategory;
  suggestedAccountId: string | null;
  lineItems: LineItem[];
  status: 'PARSED' | 'CONFIRMED' | 'REJECTED';
  createdAt: string;
}

export interface ConfirmReceiptPayload {
  accountId: string;
  category: FinancialCategory;
  amount: number;
  merchant: string;
  notes?: string;
}

export interface ReceiptScanSummary {
  id: string;
  merchant: string;
  totalAmount: number;
  currency: string;
  suggestedCategory: string;
  status: string;
  createdAt: string;
}
