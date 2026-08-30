import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FinancialRecordService } from '../../services/financial-record.service';

interface BarData {
  month: string;
  value: number;
  heightPercent: number;
  growth?: string;
  sublabel?: string;
}

interface SpendingCategory {
  name: string;
  color: string;
  amount: number;
  percent: number;
}

interface InvoiceItem {
  date: string;
  dueLabel: string;
  status: 'Paid' | 'Unpaid' | 'Pending';
  customer: string;
  amount: number;
}

@Component({
  selector: 'aequus-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  selectedPeriod: 'Weekly' | 'Monthly' | 'Yearly' | 'Range' = 'Yearly';
  selectedSpendingTimeframe = 'Last 30 Days';
  aiPrompt = '';
  aiExpanded = false;
  aiResponse = '';

  // Revenue Bar Chart Data
  selectedMonthIndex = 2; // 'Sep' by default as in the design
  monthsData: BarData[] = [
    { month: 'Jul', value: 4900, heightPercent: 81 },
    { month: 'Aug', value: 3100, heightPercent: 52 },
    { month: 'Sep', value: 3900, heightPercent: 65, growth: '+12%', sublabel: '$1048' },
    { month: 'Oct', value: 5200, heightPercent: 86 },
    { month: 'Nov', value: 3300, heightPercent: 55 },
    { month: 'Dec', value: 5700, heightPercent: 95 },
    { month: 'Jan', value: 2200, heightPercent: 37 },
    { month: 'Feb', value: 4700, heightPercent: 78 },
    { month: 'Mar', value: 4100, heightPercent: 68 },
    { month: 'Apr', value: 5800, heightPercent: 96 },
    { month: 'May', value: 3000, heightPercent: 50 },
    { month: 'Jun', value: 4300, heightPercent: 72 }
  ];

  // Calendar State
  currentMonthName = 'January, 2026';
  selectedDay = 11;
  calendarDays = [
    { day: null, isHatched: true },
    { day: null, isHatched: true },
    { day: null, isHatched: true },
    { day: null, isHatched: true },
    { day: 1, isHatched: false },
    { day: 2, isHatched: false },
    { day: 3, isHatched: false },
    { day: 4, isHatched: false },
    { day: 5, isHatched: false },
    { day: 6, isHatched: false },
    { day: 7, isHatched: false },
    { day: 8, isHatched: false },
    { day: 9, isHatched: false },
    { day: 10, isHatched: false },
    { day: 11, isHatched: false, isSelected: true },
    { day: 12, isHatched: false },
    { day: 13, isHatched: false },
    { day: 14, isHatched: false },
    { day: 15, isHatched: false },
    { day: 16, isHatched: false },
    { day: 17, isHatched: false },
    { day: 18, isHatched: false },
    { day: 19, isHatched: false },
    { day: 20, isHatched: false },
    { day: 21, isHatched: false },
    { day: 22, isHatched: false },
    { day: 23, isHatched: false },
    { day: 24, isHatched: false },
    { day: 25, isHatched: false },
    { day: 26, isHatched: false },
    { day: 27, isHatched: false },
    { day: 28, isHatched: false },
    { day: 29, isHatched: false },
    { day: 30, isHatched: false },
    { day: null, isHatched: true }
  ];

  // Spending Categories
  hoveredCategory: SpendingCategory | null = {
    name: 'Internet&Telephone',
    color: '#a855f7',
    amount: 1840,
    percent: 16
  };

  categories: SpendingCategory[] = [
    { name: 'Activity', color: '#f97316', amount: 7886, percent: 28 },
    { name: 'Meals', color: '#22c55e', amount: 6760, percent: 24 },
    { name: 'Office supplies', color: '#94a3b8', amount: 3380, percent: 12 },
    { name: 'Rewards', color: '#38bdf8', amount: 4506, percent: 16 },
    { name: 'Internet&Telephone', color: '#a855f7', amount: 1840, percent: 16 },
    { name: 'Other', color: '#334155', amount: 1120, percent: 4 }
  ];

  // Invoices Data
  invoices: InvoiceItem[] = [
    { date: 'Aug 9', dueLabel: 'in 1 week', status: 'Unpaid', customer: 'Leonard Kim', amount: 130.00 },
    { date: 'Aug 24', dueLabel: 'in 2 week', status: 'Paid', customer: 'John Smith', amount: 220.00 },
    { date: 'Sep 9', dueLabel: 'in 1 month', status: 'Pending', customer: 'Anna Spirid', amount: 2080.00 }
  ];

  // Payment Score ticks count (35 total ticks)
  scoreTicks = Array.from({ length: 32 }, (_, i) => i);
  activeTicksCount = 24; // 76%

  constructor(
    public authService: AuthService,
    private recordService: FinancialRecordService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Optionally load user records to sync totals
    this.recordService.getAll().subscribe({
      next: (records) => {
        if (records && records.length > 0) {
          // If live records exist, keep design consistent while showing live data
        }
      },
      error: () => {}
    });
  }

  selectMonth(index: number): void {
    this.selectedMonthIndex = index;
  }

  selectPeriod(period: 'Weekly' | 'Monthly' | 'Yearly' | 'Range'): void {
    this.selectedPeriod = period;
  }

  selectCalendarDay(item: any): void {
    if (item.day) {
      this.selectedDay = item.day;
      this.calendarDays.forEach((d) => (d.isSelected = d.day === item.day));
    }
  }

  setHoveredCategory(cat: SpendingCategory | null): void {
    this.hoveredCategory = cat || {
      name: 'Internet&Telephone',
      color: '#a855f7',
      amount: 1840,
      percent: 16
    };
  }

  sendAiQuery(): void {
    if (!this.aiPrompt.trim()) return;
    const prompt = this.aiPrompt;
    this.aiPrompt = '';
    this.aiResponse = `Analyzing "${prompt}"... All financial trends look healthy. Projected growth is +8.3% this quarter.`;
    setTimeout(() => {
      this.aiResponse = '';
    }, 6000);
  }

  navigateToAddInvoice(): void {
    this.router.navigate(['/financial-records']);
  }
}
