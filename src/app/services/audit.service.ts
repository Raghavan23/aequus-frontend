import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditEntry } from '../models/audit.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/audit';

  getRecentLogs(): Observable<AuditEntry[]> {
    return this.http.get<AuditEntry[]>(this.baseUrl);
  }
}
