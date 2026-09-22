import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BankStatementParseResponse,
  ConfirmBankStatementImportRequest,
  BankStatementImportResultResponse
} from '../models/statement.model';

@Injectable({
  providedIn: 'root'
})
export class StatementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/statements';

  parseStatement(clientId: string, file: File): Observable<BankStatementParseResponse> {
    const formData = new FormData();
    formData.append('clientId', clientId);
    formData.append('file', file);
    return this.http.post<BankStatementParseResponse>(`${this.baseUrl}/parse`, formData);
  }

  confirmImport(request: ConfirmBankStatementImportRequest): Observable<BankStatementImportResultResponse> {
    return this.http.post<BankStatementImportResultResponse>(`${this.baseUrl}/confirm`, request);
  }
}
