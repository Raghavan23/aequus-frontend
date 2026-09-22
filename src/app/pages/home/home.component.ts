import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClientService } from '../../services/client.service';
import { AuditService } from '../../services/audit.service';
import { Client } from '../../models/client.model';
import { AuditEntry } from '../../models/audit.model';
import { StatementImporterModalComponent } from '../../components/statement-importer-modal/statement-importer-modal.component';
import { InvoiceScannerModalComponent } from '../../components/invoice-scanner-modal/invoice-scanner-modal.component';

@Component({
  selector: 'aequus-home',
  standalone: true,
  imports: [CommonModule, RouterLink, StatementImporterModalComponent, InvoiceScannerModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly clientService = inject(ClientService);
  private readonly auditService = inject(AuditService);
  private readonly router = inject(Router);

  currentUser = this.authService.currentUser;
  clients: Client[] = [];
  auditLogs: AuditEntry[] = [];

  totalClients = 0;
  totalVolume = '₹42.50L';
  overallMatchRate = 94.2;
  pendingAnomalies = 6;

  showStatementModal = false;
  showInvoiceModal = false;
  isLoading = false;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.clientService.getAllClients().subscribe({
      next: (cls) => {
        this.clients = cls;
        this.totalClients = cls.length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });

    this.auditService.getRecentLogs().subscribe({
      next: (logs) => {
        this.auditLogs = logs;
      }
    });
  }

  openWorkspace(client: Client): void {
    this.router.navigate(['/reconciliation']);
  }
}
