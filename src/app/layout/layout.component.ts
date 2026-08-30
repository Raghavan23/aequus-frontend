import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'finz-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  searchQuery = '';
  showUserMenu = false;

  constructor(public authService: AuthService, private router: Router) {}

  get user() {
    return this.authService.currentUser();
  }

  get userName(): string {
    return this.user?.name || 'Emma Parson';
  }

  get userEmail(): string {
    return this.user?.email || 'emma.pars@gmail.com';
  }

  get initials(): string {
    const name = this.userName;
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
