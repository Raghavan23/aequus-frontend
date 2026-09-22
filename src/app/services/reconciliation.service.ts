import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  MatchResult,
  MatchResultStatus,
  ReconciliationJob,
  ReconciliationWorkspace
} from '../models/reconciliation.model';

@Injectable({
  providedIn: 'root'
})
export class ReconciliationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/reconciliation';

  runReconciliation(clientId: string): Observable<ReconciliationJob> {
    return this.http.post<ReconciliationJob>(`${this.baseUrl}/run`, { clientId });
  }

  getWorkspace(clientId: string): Observable<ReconciliationWorkspace> {
    return this.http.get<ReconciliationWorkspace>(`${this.baseUrl}/workspace/${clientId}`);
  }

  reviewMatch(matchResultId: string, action: MatchResultStatus): Observable<MatchResult> {
    return this.http.post<MatchResult>(`${this.baseUrl}/matches/${matchResultId}/review`, { action });
  }
}
