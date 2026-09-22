import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { StatementService } from '../../services/statement.service';
import { Client } from '../../models/client.model';
import {
  BankStatementParseResponse,
  ParsedBankStatementItem,
  ConfirmBankStatementImportRequest
} from '../../models/statement.model';
import { AccountingHead, TransactionType } from '../../models/bank-transaction.model';

@Component({
  selector: 'app-statement-importer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statement-importer-modal.component.html',
  styleUrls: ['./statement-importer-modal.component.scss']
})
export class StatementImporterModalComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly statementService = inject(StatementService);

  @Input() preselectedClientId = '';
  @Output() closed = new EventEmitter<void>();
  @Output() importCompleted = new EventEmitter<void>();

  clients: Client[] = [];
  selectedClientId = '';
  selectedFile: File | null = null;
  isDragging = false;
  isParsing = false;
  isConfirming = false;
  errorMessage = '';

  parseResult: BankStatementParseResponse | null = null;

  readonly accountingHeads: AccountingHead[] = [
    'SALES',
    'PURCHASE',
    'SALARY',
    'RENT',
    'UTILITIES',
    'PROFESSIONAL_FEES',
    'BANK_CHARGES',
    'INTEREST',
    'GST_INPUT',
    'GST_OUTPUT',
    'DIRECT_EXPENSE',
    'INDIRECT_EXPENSE',
    'MISC'
  ];

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
    this.isParsing = true;

    this.statementService.parseStatement(this.selectedClientId, file).subscribe({
      next: (res) => {
        this.isParsing = false;
        // Select all non-duplicate items by default
        res.items.forEach((item) => {
          item.selected = !item.isDuplicate;
        });
        this.parseResult = res;
      },
      error: (err) => {
        this.isParsing = false;
        this.errorMessage = err.error?.message || 'Failed to parse bank statement.';
      }
    });
  }

  toggleSelectAll(checked: boolean): void {
    if (this.parseResult) {
      this.parseResult.items.forEach((i) => (i.selected = checked));
    }
  }

  get selectedCount(): number {
    return this.parseResult ? this.parseResult.items.filter((i) => i.selected).length : 0;
  }

  confirmImport(): void {
    if (!this.parseResult || this.selectedCount === 0) return;

    this.isConfirming = true;
    this.errorMessage = '';

    const selectedItems = this.parseResult.items.filter((i) => i.selected);
    const request: ConfirmBankStatementImportRequest = {
      clientId: this.selectedClientId,
      sourceFilename: this.parseResult.filename,
      items: selectedItems.map((i) => ({
        date: i.date,
        narration: i.narration,
        referenceNumber: i.referenceNumber,
        type: i.type,
        accountingHead: i.accountingHead,
        amount: i.amount,
        balanceAfter: i.balanceAfter,
        rawLine: i.rawLine
      }))
    };

    this.statementService.confirmImport(request).subscribe({
      next: () => {
        this.isConfirming = false;
        this.importCompleted.emit();
      },
      error: (err) => {
        this.isConfirming = false;
        this.errorMessage = err.error?.message || 'Failed to import transactions.';
      }
    });
  }

  closeModal(): void {
    this.closed.emit();
  }
}
