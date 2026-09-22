import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { ReconciliationService } from '../../services/reconciliation.service';
import { BankTransactionService } from '../../services/bank-transaction.service';
import { InvoiceService } from '../../services/invoice.service';
import { Client } from '../../models/client.model';
import {
  MatchResult,
  MatchResultStatus,
  ReconciliationJob,
  ReconciliationWorkspace
} from '../../models/reconciliation.model';
import { BankTransaction, MatchStatus, TransactionSummary } from '../../models/bank-transaction.model';
import { Invoice } from '../../models/invoice.model';
import { StatementImporterModalComponent } from '../../components/statement-importer-modal/statement-importer-modal.component';
import { InvoiceScannerModalComponent } from '../../components/invoice-scanner-modal/invoice-scanner-modal.component';

@Component({
  selector: 'app-reconciliation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatementImporterModalComponent,
    InvoiceScannerModalComponent
  ],
  templateUrl: './reconciliation.component.html',
  styleUrls: ['./reconciliation.component.css']
})
export class ReconciliationComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly reconciliationService = inject(ReconciliationService);
  private readonly bankTransactionService = inject(BankTransactionService);

  clients: Client[] = [];
  selectedClientId: string = '';
  selectedClient: Client | null = null;

  workspace: ReconciliationWorkspace | null = null;
  summary: TransactionSummary | null = null;
  transactions: BankTransaction[] = [];
  matches: MatchResult[] = [];

  activeTxnFilter: 'ALL' | 'UNMATCHED' | 'MATCHED' | 'ANOMALY' = 'ALL';
  isReconciling = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  showStatementModal = false;
  showInvoiceModal = false;

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getAllClients(true).subscribe({
      next: (clients) => {
        this.clients = clients;
        if (clients.length > 0) {
          this.selectClient(clients[0].id);
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load client list.';
      }
    });
  }

  onClientChange(): void {
    if (this.selectedClientId) {
      this.selectClient(this.selectedClientId);
    }
  }

  selectClient(clientId: string): void {
    this.selectedClientId = clientId;
    this.selectedClient = this.clients.find((c) => c.id === clientId) || null;
    this.loadWorkspace();
    this.loadSummary();
    this.loadTransactions();
  }

  loadWorkspace(): void {
    if (!this.selectedClientId) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.reconciliationService.getWorkspace(this.selectedClientId).subscribe({
      next: (ws) => {
        this.workspace = ws;
        this.matches = ws.matches || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load reconciliation workspace.';
      }
    });
  }

  loadTransactions(): void {
    if (!this.selectedClientId) return;
    const filter = this.activeTxnFilter === 'ALL' ? undefined : (this.activeTxnFilter as MatchStatus);
    this.bankTransactionService.getTransactionsByClient(this.selectedClientId, filter).subscribe({
      next: (txns) => {
        this.transactions = txns;
      }
    });
  }

  loadSummary(): void {
    if (!this.selectedClientId) return;
    this.bankTransactionService.getClientSummary(this.selectedClientId).subscribe({
      next: (sum) => {
        this.summary = sum;
      }
    });
  }

  setFilter(filter: 'ALL' | 'UNMATCHED' | 'MATCHED' | 'ANOMALY'): void {
    this.activeTxnFilter = filter;
    this.loadTransactions();
  }

  runReconciliation(): void {
    if (!this.selectedClientId || this.isReconciling) return;
    this.isReconciling = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.reconciliationService.runReconciliation(this.selectedClientId).subscribe({
      next: (job) => {
        this.isReconciling = false;
        this.successMessage = `Reconciliation complete: ${job.matchedCount} matched, ${job.anomalyCount} anomalies, ${job.unmatchedCount} unmatched.`;
        this.loadWorkspace();
        this.loadSummary();
        this.loadTransactions();
      },
      error: (err) => {
        this.isReconciling = false;
        this.errorMessage = 'Reconciliation execution failed. Please check transactions and invoices.';
      }
    });
  }

  reviewMatch(match: MatchResult, action: MatchResultStatus): void {
    this.reconciliationService.reviewMatch(match.id, action).subscribe({
      next: (updated) => {
        match.status = updated.status;
        this.loadSummary();
        this.loadTransactions();
      },
      error: () => {
        this.errorMessage = `Failed to ${action.toLowerCase()} match.`;
      }
    });
  }

  onStatementImportSuccess(): void {
    this.showStatementModal = false;
    this.loadWorkspace();
    this.loadSummary();
    this.loadTransactions();
  }

  onInvoiceScanSuccess(): void {
    this.showInvoiceModal = false;
    this.loadWorkspace();
    this.loadSummary();
    this.loadTransactions();
  }
}
