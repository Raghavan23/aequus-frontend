import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BankTransaction,
  BankTransactionRequest,
  MatchStatus,
  AccountingHead,
  TransactionSummary
} from '../models/bank-transaction.model';

@Injectable({
  providedIn: 'root'
})
export class BankTransactionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/transactions';

  getTransactionsByClient(clientId: string, status?: MatchStatus): Observable<BankTransaction[]> {
    const url = status
      ? `${this.baseUrl}/client/${clientId}?status=${status}`
      : `${this.baseUrl}/client/${clientId}`;
    return this.http.get<BankTransaction[]>(url);
  }

  getClientSummary(clientId: string): Observable<TransactionSummary> {
    return this.http.get<TransactionSummary>(`${this.baseUrl}/client/${clientId}/summary`);
  }

  createTransaction(request: BankTransactionRequest): Observable<BankTransaction> {
    return this.http.post<BankTransaction>(this.baseUrl, request);
  }

  updateAccountingHead(id: string, head: AccountingHead): Observable<BankTransaction> {
    return this.http.patch<BankTransaction>(`${this.baseUrl}/${id}/accounting-head?head=${head}`, {});
  }

  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
