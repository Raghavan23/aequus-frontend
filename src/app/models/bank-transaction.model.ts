export type TransactionType = 'DEBIT' | 'CREDIT';
export type MatchStatus = 'UNMATCHED' | 'MATCHED' | 'ANOMALY' | 'MANUAL';

export type AccountingHead =
  | 'SALES'
  | 'PURCHASE'
  | 'SALARY'
  | 'RENT'
  | 'UTILITIES'
  | 'PROFESSIONAL_FEES'
  | 'BANK_CHARGES'
  | 'INTEREST'
  | 'GST_INPUT'
  | 'GST_OUTPUT'
  | 'DIRECT_EXPENSE'
  | 'INDIRECT_EXPENSE'
  | 'MISC';

export interface BankTransaction {
  id: string;
  organizationId: string;
  clientId: string;
  clientName: string;
  transactionDate: string;
  narration: string;
  referenceNumber?: string;
  type: TransactionType;
  amount: number;
  balanceAfter?: number;
  accountingHead?: AccountingHead;
  matchStatus: MatchStatus;
  matchedInvoiceId?: string;
  sourceFile?: string;
  createdAt: string;
}

export interface BankTransactionRequest {
  clientId: string;
  transactionDate: string;
  narration: string;
  referenceNumber?: string;
  type: TransactionType;
  amount: number;
  balanceAfter?: number;
  accountingHead?: AccountingHead;
}

export interface TransactionSummary {
  totalCount: number;
  matchedCount: number;
  anomalyCount: number;
  unmatchedCount: number;
  totalDebitVolume: number;
  totalCreditVolume: number;
  matchRatePercentage: number;
}
