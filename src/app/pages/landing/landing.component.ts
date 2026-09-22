import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { WaitlistService } from '../../services/waitlist.service';

export interface DemoClient {
  id: string;
  name: string;
  industry: string;
  gstin: string;
  txCount: number;
  volume: string;
  matchRate: number;
  anomalies: number;
}

export interface DemoTransactionMatch {
  id: string;
  date: string;
  bankNarration: string;
  bankAmount: number;
  isDebit: boolean;
  invoiceNo?: string;
  vendorName?: string;
  matchType: 'EXACT_RULE' | 'LLM_FUZZY' | 'MULTI_SPLIT' | 'ANOMALY_DUPLICATE' | 'UNMATCHED';
  confidence: number;
  status: 'MATCHED' | 'REVIEW' | 'ANOMALY';
  auditHash: string;
}

@Component({
  selector: 'aequus-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  private authService = inject(AuthService);
  private waitlistService = inject(WaitlistService);
  private router = inject(Router);

  // Active navigation highlight
  activeNav = signal<string>('product-overview');

  // Interactive Client Selector for Console Simulation
  clients: DemoClient[] = [
    {
      id: 'alpha',
      name: 'Alpha Tech Labs Pvt Ltd',
      industry: 'Enterprise SaaS & Cloud',
      gstin: '27AABCA1234F1Z5',
      txCount: 1482,
      volume: '₹42.50L',
      matchRate: 99.4,
      anomalies: 3
    },
    {
      id: 'nexus',
      name: 'Nexus Freight & Logistics',
      industry: 'Supply Chain & Fleet Ops',
      gstin: '33AABCN9876K1Z2',
      txCount: 3240,
      volume: '₹1.15 Cr',
      matchRate: 98.6,
      anomalies: 6
    },
    {
      id: 'zenith',
      name: 'Zenith Retail Brands',
      industry: 'Multi-Store Omni D2C',
      gstin: '07AAACZ4321P1Z9',
      txCount: 4890,
      volume: '₹89.20L',
      matchRate: 99.7,
      anomalies: 2
    }
  ];

  selectedClientId = signal<string>('alpha');
  selectedClient = computed(() =>
    this.clients.find((c) => c.id === this.selectedClientId()) || this.clients[0]
  );

  // Active filter for transaction simulator
  activeFilter = signal<'ALL' | 'MATCHED' | 'REVIEW' | 'ANOMALY'>('ALL');

  // Autonomous Engine Simulation State
  isSimulating = signal<boolean>(false);
  simulationProgress = signal<number>(100);
  simulationStep = signal<string>('Autonomous Reconciliation Complete (99.4% Precision)');

  // Dynamic Pricing Slider (Monthly Transactions)
  txVolume = signal<number>(25000);
  ratePerTx = signal<number>(3); // ₹3 per match

  monthlyCostInr = computed(() => this.txVolume() * this.ratePerTx());
  monthlyCostUsd = computed(() => Math.round(this.monthlyCostInr() / 84));
  hoursSavedPerMonth = computed(() => Math.round(this.txVolume() * 0.0075));
  roiMultiplier = computed(() => '8.4x');

  // Sample Telemetry Stream
  allRecords: DemoTransactionMatch[] = [
    {
      id: 'TX-9041',
      date: '2026-09-20',
      bankNarration: 'NEFT/AWS CLOUD SVCS/002941/MUMBAI',
      bankAmount: 184500.0,
      isDebit: true,
      invoiceNo: 'INV-2026-AWS-912',
      vendorName: 'Amazon Web Services India',
      matchType: 'EXACT_RULE',
      confidence: 100,
      status: 'MATCHED',
      auditHash: '0x8f2a...7c91'
    },
    {
      id: 'TX-9042',
      date: '2026-09-21',
      bankNarration: 'UPI-RAZORPAYX-PAYOUT-INFRA-VENDOR-BLR',
      bankAmount: 45000.0,
      isDebit: true,
      invoiceNo: 'INV-BLR-8841',
      vendorName: 'Cloudflare Network Edge',
      matchType: 'LLM_FUZZY',
      confidence: 98.8,
      status: 'MATCHED',
      auditHash: '0x3b11...9a44'
    },
    {
      id: 'TX-9043',
      date: '2026-09-21',
      bankNarration: 'RTGS-VEND-PAY-MICROSOFT-INDIA-HYD',
      bankAmount: 92400.0,
      isDebit: true,
      invoiceNo: 'MS-CORP-4401',
      vendorName: 'Microsoft Corporation India',
      matchType: 'MULTI_SPLIT',
      confidence: 96.5,
      status: 'MATCHED',
      auditHash: '0x1c88...6f29'
    },
    {
      id: 'TX-9044',
      date: '2026-09-21',
      bankNarration: 'ACH-DEBIT-ZOOM-VIDEO-COMM-CALIF',
      bankAmount: 14200.0,
      isDebit: true,
      invoiceNo: 'ZM-US-89301',
      vendorName: 'Zoom Video Communications',
      matchType: 'ANOMALY_DUPLICATE',
      confidence: 42.0,
      status: 'ANOMALY',
      auditHash: '0xaa42...11d8'
    },
    {
      id: 'TX-9045',
      date: '2026-09-22',
      bankNarration: 'NEFT-CONSULTING-CHDR-PARTNERS-DELHI',
      bankAmount: 125000.0,
      isDebit: true,
      invoiceNo: undefined,
      vendorName: 'Chaudhry & Partners Legal',
      matchType: 'UNMATCHED',
      confidence: 25.0,
      status: 'REVIEW',
      auditHash: '0xdd90...88e2'
    },
    {
      id: 'TX-9046',
      date: '2026-09-22',
      bankNarration: 'CMS-COLL-CLIENT-SERVICENOW-RETAINER',
      bankAmount: 480000.0,
      isDebit: false,
      invoiceNo: 'REC-AR-2026-004',
      vendorName: 'ServiceNow Enterprise Client',
      matchType: 'EXACT_RULE',
      confidence: 100,
      status: 'MATCHED',
      auditHash: '0x7e29...4c19'
    }
  ];

  filteredRecords = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'ALL') return this.allRecords;
    return this.allRecords.filter((r) => r.status === filter);
  });

  // Early Access / CA Pilot Registration State
  firmEmail = '';
  firmName = '';
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  selectClient(clientId: string): void {
    this.selectedClientId.set(clientId);
  }

  setFilter(filter: 'ALL' | 'MATCHED' | 'REVIEW' | 'ANOMALY'): void {
    this.activeFilter.set(filter);
  }

  runAutonomousMatching(): void {
    if (this.isSimulating()) return;

    this.isSimulating.set(true);
    this.simulationProgress.set(15);
    this.simulationStep.set('1/4: Ingesting bank feeds & multi-line invoice PDFs...');

    setTimeout(() => {
      this.simulationProgress.set(45);
      this.simulationStep.set('2/4: Executing Spring Boot deterministic rules & date tolerance corridors...');
    }, 600);

    setTimeout(() => {
      this.simulationProgress.set(78);
      this.simulationStep.set('3/4: Invoking Claude Sonnet fuzzy alignment on multi-invoice splits...');
    }, 1200);

    setTimeout(() => {
      this.simulationProgress.set(100);
      this.simulationStep.set('4/4: Complete! Reconciled 1,479 of 1,482 items (99.4% precision) with SHA-256 audit log.');
      this.isSimulating.set(false);
    }, 1800);
  }

  scrollToSection(sectionId: string, navKey?: string): void {
    if (navKey) {
      this.activeNav.set(navKey);
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  handleLaunchApp(): void {
    if (this.isAuthenticated) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/register']);
    }
  }

  handleSignIn(): void {
    if (this.isAuthenticated) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  submitPilotRequest(): void {
    if (!this.firmEmail || !this.firmEmail.trim()) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.waitlistService.join(this.firmEmail.trim()).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage =
          res.message ||
          'CA Pilot Access Confirmed! Our onboarding engineering team will provision your multi-tenant tenant key within 24 hours.';
        this.firmEmail = '';
        this.firmName = '';
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage =
          err.error?.message || 'Unable to register at this moment. Please try again or reach out to support@aequus.ai';
      }
    });
  }
}
