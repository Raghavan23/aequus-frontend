import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { InvoiceService } from '../../services/invoice.service';
import { Client } from '../../models/client.model';
import { InvoiceRequest, ParsedInvoiceResponse } from '../../models/invoice.model';

@Component({
  selector: 'app-invoice-scanner-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-scanner-modal.component.html',
  styleUrls: ['./invoice-scanner-modal.component.scss']
})
export class InvoiceScannerModalComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly invoiceService = inject(InvoiceService);

  @Input() preselectedClientId = '';
  @Output() closed = new EventEmitter<void>();
  @Output() scanCompleted = new EventEmitter<void>();

  clients: Client[] = [];
  selectedClientId = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  isDragging = false;
  isScanning = false;
  isSaving = false;
  errorMessage = '';

  parsedInvoice: ParsedInvoiceResponse | null = null;

  // Manual entry / editable extracted values
  invoiceNumber = '';
  vendorName = '';
  vendorGstin = '';
  invoiceDate = '';
  dueDate = '';
  subtotal = 0;
  gstAmount = 0;
  totalAmount = 0;
  currency = 'INR';

  ngOnInit(): void {
    this.clientService.getAllClients(true).subscribe({
      next: (cls) => {
        this.clients = cls;
        if (this.preselectedClientId) {
          this.selectedClientId = this.preselectedClientId;
        } else if (cls.length > 0) {
          this.selectedClientId = cls[0].id;
        }
      }
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  processFile(file: File): void {
    if (!this.selectedClientId) {
      this.errorMessage = 'Please select a Client Company first.';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';
    this.isScanning = true;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => (this.previewUrl = e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
    }

    this.invoiceService.scanInvoice(this.selectedClientId, file).subscribe({
      next: (res) => {
        this.isScanning = false;
        this.parsedInvoice = res;

        this.invoiceNumber = res.invoiceNumber;
        this.vendorName = res.vendorName;
        this.vendorGstin = res.vendorGstin || '';
        this.invoiceDate = res.invoiceDate || '';
        this.dueDate = res.dueDate || '';
        this.subtotal = res.subtotal || 0;
        this.gstAmount = res.gstAmount || 0;
        this.totalAmount = res.totalAmount;
        this.currency = res.currency || 'INR';
      },
      error: (err) => {
        this.isScanning = false;
        this.errorMessage = err.error?.message || 'Failed to scan invoice via AI VLM.';
      }
    });
  }

  saveInvoice(): void {
    if (!this.selectedClientId || !this.vendorName || !this.invoiceNumber || this.totalAmount <= 0) {
      this.errorMessage = 'Please provide valid invoice number, vendor name, and total amount.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const req: InvoiceRequest = {
      clientId: this.selectedClientId,
      invoiceNumber: this.invoiceNumber,
      vendorName: this.vendorName,
      vendorGstin: this.vendorGstin || undefined,
      invoiceDate: this.invoiceDate || undefined,
      dueDate: this.dueDate || undefined,
      subtotal: this.subtotal,
      gstAmount: this.gstAmount,
      totalAmount: this.totalAmount,
      currency: this.currency,
      sourceType: this.parsedInvoice ? 'VLM_SCAN' : 'MANUAL'
    };

    this.invoiceService.createInvoice(req).subscribe({
      next: () => {
        this.isSaving = false;
        this.scanCompleted.emit();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to save invoice.';
      }
    });
  }

  closeModal(): void {
    this.closed.emit();
  }
}
