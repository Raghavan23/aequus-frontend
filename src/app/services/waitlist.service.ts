import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WaitlistRequest {
  email: string;
}

export interface WaitlistResponse {
  id: string;
  email: string;
  message: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class WaitlistService {
  private readonly baseUrl = `${environment.apiUrl}/waitlist`;

  constructor(private http: HttpClient) {}

  join(email: string): Observable<WaitlistResponse> {
    return this.http.post<WaitlistResponse>(this.baseUrl, { email });
  }
}
