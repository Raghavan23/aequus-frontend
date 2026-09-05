export type AccountType = 'SAVINGS' | 'CURRENT' | 'SALARY';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  institutionName?: string;
  accountNumberMask?: string;
  color: string;
  icon: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountRequest {
  name: string;
  type: AccountType;
  currency?: string;
  balance?: number;
  institutionName?: string;
  accountNumberMask?: string;
  color?: string;
  icon?: string;
}

export interface AccountSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  activeAccountsCount: number;
}
