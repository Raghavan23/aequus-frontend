import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Root guard:
 * If user is already authenticated, redirects root access to /home.
 * If user is unauthenticated, lets them see the pre-login dashboard/landing page.
 */
export const rootGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return router.createUrlTree(['/home']);
  }

  return true;
};
