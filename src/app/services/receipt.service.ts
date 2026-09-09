import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ConfirmReceiptPayload, ParsedReceipt, ReceiptScanSummary } from '../models/receipt.model';
import { FinancialRecord } from '../models/financial-record.model';

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  private readonly baseUrl = `${environment.apiUrl}/ai/receipts`;

  constructor(private http: HttpClient) {}

  scanReceipt(file: File): Observable<ParsedReceipt> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ParsedReceipt>(`${this.baseUrl}/scan`, formData);
  }

  confirmReceipt(scanId: string, payload: ConfirmReceiptPayload): Observable<FinancialRecord> {
    return this.http.post<FinancialRecord>(`${this.baseUrl}/${scanId}/confirm`, payload);
  }

  getRecentScans(): Observable<ReceiptScanSummary[]> {
    return this.http.get<ReceiptScanSummary[]>(this.baseUrl);
  }
}
