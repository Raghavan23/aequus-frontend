import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FinancialRecordService } from '../../services/financial-record.service';
import { FinancialRecord, FinancialRecordRequest } from '../../models/financial-record.model';
import { FinancialType } from '../../enums/financial-type.enum';
import {
  CategoryOption,
  EXPENSE_CATEGORY_OPTIONS,
  FinancialCategory,
  INCOME_CATEGORY_OPTIONS,
  categoryLabel
} from '../../enums/financial-category.enum';

type ViewMode = 'list' | 'choose-type' | 'choose-category' | 'enter-amount';

@Component({
  selector: 'finz-financial-records',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financial-records.component.html',
  styleUrl: './financial-records.component.scss'
})
export class FinancialRecordsComponent implements OnInit {
  readonly FinancialType = FinancialType;

  records: FinancialRecord[] = [];
  loading = true;
  errorMessage: string | null = null;

  mode: ViewMode = 'list';

  // Draft state while walking through the add/edit flow
  editingId: string | null = null;
  draftType: FinancialType | null = null;
  draftCategory: FinancialCategory | null = null;
  draftAmount: number | null = null;

  saving = false;
  deletingId: string | null = null;

  constructor(private financialRecordService: FinancialRecordService) {}

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.loading = true;
    this.financialRecordService.getAll().subscribe({
      next: (records) => {
        this.records = records;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load your financial records.';
        this.loading = false;
      }
    });
  }

  get categoryOptions(): CategoryOption[] {
    return this.draftType === FinancialType.INCOME ? INCOME_CATEGORY_OPTIONS : EXPENSE_CATEGORY_OPTIONS;
  }

  categoryLabel(category: FinancialCategory): string {
    return categoryLabel(category);
  }

  // -------------------- Add flow --------------------

  startAdd(): void {
    this.editingId = null;
    this.draftType = null;
    this.draftCategory = null;
    this.draftAmount = null;
    this.errorMessage = null;
    this.mode = 'choose-type';
  }

  chooseType(type: FinancialType): void {
    this.draftType = type;
    this.draftCategory = null;
    this.mode = 'choose-category';
  }

  chooseCategory(category: FinancialCategory): void {
    this.draftCategory = category;
    this.mode = 'enter-amount';
  }

  backToList(): void {
    this.mode = 'list';
    this.editingId = null;
  }

  backToType(): void {
    this.mode = 'choose-type';
  }

  backToCategory(): void {
    this.mode = 'choose-category';
  }

  // -------------------- Edit flow --------------------

  startEdit(record: FinancialRecord): void {
    this.editingId = record.id;
    this.draftType = record.type;
    this.draftCategory = record.category;
    this.draftAmount = record.amount;
    this.errorMessage = null;
    this.mode = 'enter-amount';
  }

  // -------------------- Save / Delete --------------------

  save(): void {
    if (!this.draftType || !this.draftCategory || !this.draftAmount || this.draftAmount <= 0) {
      this.errorMessage = 'Please enter a valid amount.';
      return;
    }

    const request: FinancialRecordRequest = {
      type: this.draftType,
      category: this.draftCategory,
      amount: this.draftAmount
    };

    this.saving = true;
    this.errorMessage = null;

    const request$ = this.editingId
      ? this.financialRecordService.update(this.editingId, request)
      : this.financialRecordService.create(request);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.mode = 'list';
        this.editingId = null;
        this.loadRecords();
      },
      error: () => {
        this.saving = false;
        this.errorMessage = 'Could not save this record. Please try again.';
      }
    });
  }

  delete(record: FinancialRecord, event: Event): void {
    event.stopPropagation();
    if (!confirm('Delete this record? This cannot be undone.')) {
      return;
    }

    this.deletingId = record.id;
    this.financialRecordService.delete(record.id).subscribe({
      next: () => {
        this.deletingId = null;
        this.loadRecords();
      },
      error: () => {
        this.deletingId = null;
        this.errorMessage = 'Could not delete this record. Please try again.';
      }
    });
  }

  deleteFromEdit(): void {
    if (!this.editingId) {
      return;
    }
    if (!confirm('Delete this record? This cannot be undone.')) {
      return;
    }

    this.financialRecordService.delete(this.editingId).subscribe({
      next: () => {
        this.mode = 'list';
        this.editingId = null;
        this.loadRecords();
      },
      error: () => {
        this.errorMessage = 'Could not delete this record. Please try again.';
      }
    });
  }
}
