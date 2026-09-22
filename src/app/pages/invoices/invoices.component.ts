import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../services/invoice.service';
import { ClientService } from '../../services/client.service';
import { Invoice } from '../../models/invoice.model';
import { Client } from '../../models/client.model';
import { MatchStatus } from '../../models/bank-transaction.model';
import { InvoiceScannerModalComponent } from '../../components/invoice-scanner-modal/invoice-scanner-modal.component';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, InvoiceScannerModalComponent],
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css']
})
export class InvoicesComponent implements OnInit {
  private readonly invoiceService = inject(InvoiceService);
  private readonly clientService = inject(ClientService);

  clients: Client[] = [];
  selectedClientId = '';
  invoices: Invoice[] = [];
  statusFilter: 'ALL' | 'UNMATCHED' | 'MATCHED' = 'ALL';

  isLoading = false;
  errorMessage = '';
  showScannerModal = false;

  ngOnInit(): void {
    this.clientService.getAllClients(true).subscribe({
      next: (cls) => {
        this.clients = cls;
        if (cls.length > 0) {
          this.selectedClientId = cls[0].id;
          this.loadInvoices();
        }
      }
    });
  }

  onClientChange(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    if (!this.selectedClientId) return;
    this.isLoading = true;
    const filter = this.statusFilter === 'ALL' ? undefined : (this.statusFilter as MatchStatus);

    this.invoiceService.getInvoicesByClient(this.selectedClientId, filter).subscribe({
      next: (invs) => {
        this.invoices = invs;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load invoices.';
      }
    });
  }

  setFilter(filter: 'ALL' | 'UNMATCHED' | 'MATCHED'): void {
    this.statusFilter = filter;
    this.loadInvoices();
  }

  deleteInvoice(inv: Invoice): void {
    if (confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
      this.invoiceService.deleteInvoice(inv.id).subscribe({
        next: () => this.loadInvoices()
      });
    }
  }

  onScanCompleted(): void {
    this.showScannerModal = false;
    this.loadInvoices();
  }
}
