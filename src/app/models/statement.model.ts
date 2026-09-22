import { TransactionType, AccountingHead } from './bank-transaction.model';

export interface ParsedBankStatementItem {
  id: string;
  date: string;
  narration: string;
  referenceNumber?: string;
  type: TransactionType;
  accountingHead?: AccountingHead;
  amount: number;
  balanceAfter?: number;
  isDuplicate: boolean;
  rawLine?: string;
  selected?: boolean;
}

export interface BankStatementParseResponse {
  filename: string;
  clientId: string;
  clientName: string;
  totalCount: number;
  newCount: number;
  duplicateCount: number;
  totalDebit: number;
  totalCredit: number;
  items: ParsedBankStatementItem[];
}

export interface BankImportItemRequest {
  date: string;
  narration: string;
  referenceNumber?: string;
  type: TransactionType;
  accountingHead?: AccountingHead;
  amount: number;
  balanceAfter?: number;
  rawLine?: string;
}

export interface ConfirmBankStatementImportRequest {
  clientId: string;
  items: BankImportItemRequest[];
  sourceFilename?: string;
}

export interface BankStatementImportResultResponse {
  clientId: string;
  importedCount: number;
  message: string;
}
