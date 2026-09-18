import { Component, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Account } from '../../models/account.model';
import { ParsedReceipt, ConfirmReceiptPayload } from '../../models/receipt.model';
import { FinancialCategory, EXPENSE_CATEGORY_OPTIONS, categoryLabel } from '../../enums/financial-category.enum';
import { ReceiptService } from '../../services/receipt.service';

@Component({
  selector: 'app-receipt-scanner-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './receipt-scanner-modal.component.html',
  styleUrls: ['./receipt-scanner-modal.component.scss']
})
export class ReceiptScannerModalComponent {
  private receiptService = inject(ReceiptService);

  @Input() accounts: Account[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  isDragging = false;
  isScanning = false;
  isConfirming = false;
  errorMessage = '';

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  parsedResult: ParsedReceipt | null = null;

  // Form fields for verification
  editableMerchant = '';
  editableCategory: FinancialCategory = FinancialCategory.FOOD;
  editableAccountId = '';
  editableAmount = 0;
  editableNotes = '';

  readonly expenseCategoryOptions = EXPENSE_CATEGORY_OPTIONS;

  @HostListener('window:paste', ['$event'])
  handlePaste(event: ClipboardEvent): void {
    if (this.parsedResult || this.isScanning) return;
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            this.processFile(file);
            break;
          }
        }
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
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
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      this.errorMessage = 'Please upload a valid receipt image (PNG, JPG, WebP) or PDF.';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';
    this.parsedResult = null;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
    }

    this.startScan(file);
  }

  startScan(file: File): void {
    this.isScanning = true;
    this.errorMessage = '';

    this.receiptService.scanReceipt(file).subscribe({
      next: (result) => {
        this.isScanning = false;
        this.parsedResult = result;

        this.editableMerchant = result.merchant || 'Receipt Expense';
        this.editableCategory = result.suggestedCategory || FinancialCategory.FOOD;
        this.editableAmount = result.totalAmount;

        // Auto-select suggested account or first active account
        if (result.suggestedAccountId && this.accounts.some(a => a.id === result.suggestedAccountId)) {
          this.editableAccountId = result.suggestedAccountId;
        } else if (this.accounts.length > 0) {
          this.editableAccountId = this.accounts[0].id;
        }
      },
      error: (err) => {
        this.isScanning = false;
        this.errorMessage = err.error?.message || 'Failed to parse receipt image. Please try another clear photo.';
      }
    });
  }

  confirmAndLog(): void {
    if (!this.parsedResult) return;

    if (!this.editableAccountId) {
      this.errorMessage = 'Please select an account to debit this receipt.';
      return;
    }

    if (!this.editableAmount || this.editableAmount <= 0) {
      this.errorMessage = 'Valid total amount is required.';
      return;
    }

    this.isConfirming = true;
    this.errorMessage = '';

    const payload: ConfirmReceiptPayload = {
      accountId: this.editableAccountId,
      category: this.editableCategory,
      amount: this.editableAmount,
      merchant: this.editableMerchant,
      notes: this.editableNotes || `Auto-extracted from ${this.editableMerchant}`
    };

    this.receiptService.confirmReceipt(this.parsedResult.id, payload).subscribe({
      next: () => {
        this.isConfirming = false;
        this.confirmed.emit();
        this.close.emit();
      },
      error: (err) => {
        this.isConfirming = false;
        this.errorMessage = err.error?.message || 'Failed to log receipt to ledger. Please check input.';
      }
    });
  }

  resetScan(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.parsedResult = null;
    this.errorMessage = '';
  }

  categoryLabel(cat: FinancialCategory): string {
    return cat.replace(/_/g, ' ');
  }
}
