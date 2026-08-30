import { FinancialCategory } from '../enums/financial-category.enum';
import { FinancialType } from '../enums/financial-type.enum';

export interface FinancialRecord {
  id: string;
  type: FinancialType;
  category: FinancialCategory;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialRecordRequest {
  type: FinancialType;
  category: FinancialCategory;
  amount: number;
}
