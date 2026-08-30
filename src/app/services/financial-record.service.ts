import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { FinancialRecord, FinancialRecordRequest } from '../models/financial-record.model';

@Injectable({ providedIn: 'root' })
export class FinancialRecordService {
  private readonly baseUrl = `${environment.apiUrl}/financial-records`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<FinancialRecord[]> {
    return this.http.get<FinancialRecord[]>(this.baseUrl);
  }

  getById(id: string): Observable<FinancialRecord> {
    return this.http.get<FinancialRecord>(`${this.baseUrl}/${id}`);
  }

  create(request: FinancialRecordRequest): Observable<FinancialRecord> {
    return this.http.post<FinancialRecord>(this.baseUrl, request);
  }

  update(id: string, request: FinancialRecordRequest): Observable<FinancialRecord> {
    return this.http.put<FinancialRecord>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
