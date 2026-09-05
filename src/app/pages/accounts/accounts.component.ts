import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { Account, AccountRequest, AccountSummary, AccountType } from '../../models/account.model';

@Component({
  selector: 'aequus-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss'
})
export class AccountsComponent implements OnInit {
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);

  accounts: Account[] = [];
  summary: AccountSummary | null = null;
  loading = true;
  saving = false;
  errorMessage: string | null = null;

  selectedFilter: 'ALL' | AccountType = 'ALL';
  showModal = false;
  isEditing = false;
  editingAccountId: string | null = null;
  deletingAccount: Account | null = null;

  accountForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    type: ['SAVINGS' as AccountType, [Validators.required]],
    balance: [0, [Validators.required]],
    institutionName: [''],
    accountNumberMask: [''],
    color: ['#3b82f6'],
    currency: ['INR']
  });

  colorPresets = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#6366f1', // Indigo
    '#64748b'  // Slate
  ];

  accountTypes: { value: AccountType; label: string; icon: string; desc: string }[] = [
    { value: 'SAVINGS', label: 'Savings Account', icon: 'savings', desc: 'Keep money, earn interest, use UPI/ATM/debit card' },
    { value: 'CURRENT', label: 'Current Account', icon: 'account_balance', desc: 'Frequent transactions & business operations' },
    { value: 'SALARY', label: 'Salary Account', icon: 'payments', desc: 'Salary credits & employee payroll benefits' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = null;

    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load accounts.';
        this.loading = false;
      }
    });

    this.accountService.getSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
      },
      error: () => {}
    });
  }

  get filteredAccounts(): Account[] {
    if (this.selectedFilter === 'ALL') {
      return this.accounts;
    }
    return this.accounts.filter(a => a.type === this.selectedFilter);
  }

  get netWorthClass(): string {
    if (!this.summary) return '';
    return this.summary.netWorth >= 0 ? 'text-emerald' : 'text-rose';
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingAccountId = null;
    this.accountForm.reset({
      name: '',
      type: 'SAVINGS',
      balance: 0,
      institutionName: '',
      accountNumberMask: '',
      color: '#3b82f6',
      currency: 'INR'
    });
    this.showModal = true;
  }

  openEditModal(account: Account): void {
    this.isEditing = true;
    this.editingAccountId = account.id;
    this.accountForm.patchValue({
      name: account.name,
      type: account.type,
      balance: account.balance,
      institutionName: account.institutionName ?? '',
      accountNumberMask: account.accountNumberMask ?? '',
      color: account.color ?? '#3b82f6',
      currency: account.currency ?? 'INR'
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingAccountId = null;
  }

  saveAccount(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formVal = this.accountForm.value;
    const request: AccountRequest = {
      name: formVal.name,
      type: formVal.type,
      balance: Number(formVal.balance),
      institutionName: formVal.institutionName || undefined,
      accountNumberMask: formVal.accountNumberMask || undefined,
      color: formVal.color,
      currency: formVal.currency
    };

    if (this.isEditing && this.editingAccountId) {
      this.accountService.updateAccount(this.editingAccountId, request).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadData();
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.error?.message ?? 'Failed to update account.';
        }
      });
    } else {
      this.accountService.createAccount(request).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadData();
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.error?.message ?? 'Failed to create account.';
        }
      });
    }
  }

  confirmDelete(account: Account): void {
    this.deletingAccount = account;
  }

  cancelDelete(): void {
    this.deletingAccount = null;
  }

  executeDelete(): void {
    if (!this.deletingAccount) return;
    const id = this.deletingAccount.id;
    this.accountService.deleteAccount(id).subscribe({
      next: () => {
        this.deletingAccount = null;
        this.loadData();
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Failed to delete account.';
        this.deletingAccount = null;
      }
    });
  }

  setFilter(filter: 'ALL' | AccountType): void {
    this.selectedFilter = filter;
  }

  selectType(type: AccountType): void {
    this.accountForm.patchValue({ type });
  }

  getAccountCountByType(type: AccountType): number {
    return this.accounts.filter(a => a.type === type).length;
  }

  selectColor(color: string): void {
    this.accountForm.patchValue({ color });
  }

  getTypeBadgeClass(type: AccountType): string {
    switch (type) {
      case 'SAVINGS': return 'badge-savings';
      case 'CURRENT': return 'badge-current';
      case 'SALARY': return 'badge-salary';
      default: return 'badge-default';
    }
  }
}
