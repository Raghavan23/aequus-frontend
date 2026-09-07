import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { WaitlistService } from '../../services/waitlist.service';

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

  // Active time frame in preview console
  selectedTimeframe = signal<'Weekly' | 'Monthly' | 'Yearly'>('Yearly');

  // Active nav section
  activeNav = signal<string>('product-overview');

  // Early access form state
  emailInput = '';
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  setTimeframe(timeframe: 'Weekly' | 'Monthly' | 'Yearly'): void {
    this.selectedTimeframe.set(timeframe);
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

  submitEarlyAccess(): void {
    if (!this.emailInput || !this.emailInput.trim()) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.waitlistService.join(this.emailInput.trim()).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = res.message || 'Priority clearance confirmed. Check your inbox for the hardware enclave attestation key.';
        this.emailInput = '';
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Unable to register at this moment. Please try again.';
      }
    });
  }
}
