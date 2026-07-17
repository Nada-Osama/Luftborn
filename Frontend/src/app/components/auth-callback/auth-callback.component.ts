import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Landing page for the IdP's redirect_uri. 
 * Immediately forwards to wherever the user was trying to go, showing an error with a retry link only if that exchange fails.
 */
@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.scss',
})
export class AuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  errorMessage: string | null = null;

  async ngOnInit(): Promise<void> {
    const params = this.route.snapshot.queryParamMap;
    const code = params.get('code');
    const state = params.get('state');
    const idpError = params.get('error_description') ?? params.get('error');

    if (idpError) {
      this.errorMessage = idpError;
      return;
    }

    if (!code || !state) {
      this.errorMessage = 'Missing login response from the identity provider.';
      return;
    }

    try {
      const returnUrl = await this.authService.handleCallback(code, state);
      this.router.navigateByUrl(returnUrl);
    } catch (err) {
      this.errorMessage = err instanceof Error ? err.message : 'Sign-in failed.';
    }
  }

  retry(): void {
    this.authService.login('/products');
  }
}
