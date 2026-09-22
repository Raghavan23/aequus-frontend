import { BankTransaction } from './bank-transaction.model';
import { Invoice } from './invoice.model';

export type ReconciliationJobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type MatchType = 'EXACT' | 'FUZZY' | 'MANUAL' | 'AI_SUGGESTED';
export type MatchResultStatus = 'SUGGESTED' | 'ACCEPTED' | 'REJECTED';

export interface ReconciliationJob {
  id: string;
  organizationId: string;
  clientId: string;
  clientName: string;
  status: ReconciliationJobStatus;
  totalTransactions: number;
  matchedCount: number;
  anomalyCount: number;
  unmatchedCount: number;
  matchRatePercentage: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface MatchResult {
  id: string;
  jobId: string;
  transaction: BankTransaction;
  invoice?: Invoice;
  matchType: MatchType;
  confidenceScore: number;
  reasoning: string;
  status: MatchResultStatus;
  reviewedByUserId?: string;
  reviewedByUserName?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ReconciliationWorkspace {
  latestJob: ReconciliationJob | null;
  matches: MatchResult[];
  unmatchedTransactions: BankTransaction[];
  unmatchedInvoices: Invoice[];
}
