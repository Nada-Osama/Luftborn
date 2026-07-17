import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);

  if (!authService.ssoEnabled() || authService.isAuthenticated()) {
    return true;
  }

  await authService.login(state.url);
  return false;
};
