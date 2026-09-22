import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice, InvoiceRequest, ParsedInvoiceResponse } from '../models/invoice.model';
import { MatchStatus } from '../models/bank-transaction.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/invoices';

  getInvoicesByClient(clientId: string, status?: MatchStatus): Observable<Invoice[]> {
    const url = status
      ? `${this.baseUrl}/client/${clientId}?status=${status}`
      : `${this.baseUrl}/client/${clientId}`;
    return this.http.get<Invoice[]>(url);
  }

  getInvoiceById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.baseUrl}/${id}`);
  }

  createInvoice(request: InvoiceRequest): Observable<Invoice> {
    return this.http.post<Invoice>(this.baseUrl, request);
  }

  scanInvoice(clientId: string, file: File): Observable<ParsedInvoiceResponse> {
    const formData = new FormData();
    formData.append('clientId', clientId);
    formData.append('file', file);
    return this.http.post<ParsedInvoiceResponse>(`${this.baseUrl}/scan`, formData);
  }

  deleteInvoice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
