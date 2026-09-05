import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

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

import { AccountService } from '../../services/account.service';
import { Account } from '../../models/account.model';

@Component({
  selector: 'aequus-financial-records',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './financial-records.component.html',
  styleUrl: './financial-records.component.scss'
})
export class FinancialRecordsComponent implements OnInit {
  private financialRecordService = inject(FinancialRecordService);
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  readonly FinancialType = FinancialType;
  readonly FinancialCategory = FinancialCategory;

  records: FinancialRecord[] = [];
  accounts: Account[] = [];
  loading = true;
  saving = false;
  errorMessage: string | null = null;

  // Filter state
  selectedTypeFilter: 'ALL' | FinancialType = 'ALL';
  selectedAccountFilter: string = 'ALL';

  // Modal state
  showModal = false;
  isEditing = false;
  editingId: string | null = null;
  deletingRecord: FinancialRecord | null = null;

  recordForm: FormGroup = this.fb.group({
    type: [FinancialType.EXPENSE, [Validators.required]],
    category: [FinancialCategory.FOOD, [Validators.required]],
    accountId: ['', [Validators.required]],
    amount: [null, [Validators.required, Validators.min(0.01)]]
  });

  ngOnInit(): void {
    this.loadData();
    this.checkQueryParams();
  }

  private checkQueryParams(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['action'] === 'add') {
        const accId = params['accountId'] || null;
        this.openCreateModal(accId);
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = null;

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

    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
      },
      error: () => {}
    });
  }

  get filteredRecords(): FinancialRecord[] {
    return this.records.filter((rec) => {
      const matchesType = this.selectedTypeFilter === 'ALL' || rec.type === this.selectedTypeFilter;
      const matchesAccount =
        this.selectedAccountFilter === 'ALL' || rec.accountId === this.selectedAccountFilter;
      return matchesType && matchesAccount;
    });
  }

  get totalIncome(): number {
    return this.records
      .filter((r) => r.type === FinancialType.INCOME)
      .reduce((sum, r) => sum + Number(r.amount), 0);
  }

  get totalExpense(): number {
    return this.records
      .filter((r) => r.type === FinancialType.EXPENSE)
      .reduce((sum, r) => sum + Number(r.amount), 0);
  }

  get netCashFlow(): number {
    return this.totalIncome - this.totalExpense;
  }

  get currentCategoryOptions(): CategoryOption[] {
    const currentType = this.recordForm.get('type')?.value;
    return currentType === FinancialType.INCOME ? INCOME_CATEGORY_OPTIONS : EXPENSE_CATEGORY_OPTIONS;
  }

  categoryLabel(category: FinancialCategory): string {
    return categoryLabel(category);
  }

  openCreateModal(preselectedAccountId: string | null = null): void {
    this.isEditing = false;
    this.editingId = null;
    const defaultAccId = preselectedAccountId || (this.accounts.length > 0 ? this.accounts[0].id : '');
    this.recordForm.reset({
      type: FinancialType.EXPENSE,
      category: FinancialCategory.FOOD,
      accountId: defaultAccId,
      amount: null
    });
    this.showModal = true;
  }

  openEditModal(record: FinancialRecord): void {
    this.isEditing = true;
    this.editingId = record.id;
    this.recordForm.patchValue({
      type: record.type,
      category: record.category,
      accountId: record.accountId,
      amount: record.amount
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingId = null;
  }

  setType(type: FinancialType): void {
    this.recordForm.patchValue({
      type,
      category: type === FinancialType.INCOME ? FinancialCategory.ACTIVE_INCOME : FinancialCategory.FOOD
    });
  }

  setCategory(category: FinancialCategory): void {
    this.recordForm.patchValue({ category });
  }

  saveRecord(): void {
    if (this.accounts.length === 0) {
      this.errorMessage = 'Please create an account first before adding transactions.';
      return;
    }

    if (this.recordForm.invalid) {
      this.recordForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const val = this.recordForm.value;
    const request: FinancialRecordRequest = {
      type: val.type,
      category: val.category,
      accountId: val.accountId,
      amount: Number(val.amount)
    };

    if (this.isEditing && this.editingId) {
      this.financialRecordService.update(this.editingId, request).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadData();
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.error?.message ?? 'Failed to update transaction.';
        }
      });
    } else {
      this.financialRecordService.create(request).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadData();
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.error?.message ?? 'Failed to create transaction.';
        }
      });
    }
  }

  confirmDelete(record: FinancialRecord, event?: Event): void {
    if (event) event.stopPropagation();
    this.deletingRecord = record;
  }

  cancelDelete(): void {
    this.deletingRecord = null;
  }

  executeDelete(): void {
    if (!this.deletingRecord) return;
    const id = this.deletingRecord.id;
    this.financialRecordService.delete(id).subscribe({
      next: () => {
        this.deletingRecord = null;
        this.loadData();
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Failed to delete record.';
        this.deletingRecord = null;
      }
    });
  }
}
