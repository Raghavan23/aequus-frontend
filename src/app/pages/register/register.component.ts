import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../services/auth.service';
import { passwordsMatchValidator } from '../../validators/form.validators';

@Component({
  selector: 'finz-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  loading = false;
  errorMessage: string | null = null;
  showPassword = false;
  showConfirmPassword = false;

  form = this.fb.group(
    {
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator('password', 'confirmPassword') }
  );

  constructor(private authService: AuthService, private router: Router) {}

  get name() {
    return this.form.controls.name;
  }

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const { name, email, password } = this.form.getRawValue();

    this.authService
      .register({ name: name!, email: email!, password: password! })
      .subscribe({
        next: () => this.router.navigate(['/home']),
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = err.error?.message ?? 'Could not create your account.';
        }
      });
  }
}
