import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CurrentUser, OidcDiscoveryDocument, SsoConfig, TokenResponse } from '../models/auth.model';
import { generateCodeChallenge, generateCodeVerifier, generateState } from '../utils/pkce';

const SESSION_KEYS = {
  accessToken: 'luftborn.auth.accessToken',
  expiresAt: 'luftborn.auth.expiresAt',
  codeVerifier: 'luftborn.auth.codeVerifier',
  state: 'luftborn.auth.state',
  returnUrl: 'luftborn.auth.returnUrl',
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly configSignal = signal<SsoConfig>({ enabled: false, authority: '', clientId: '' });
  private readonly accessTokenSignal = signal<string | null>(sessionStorage.getItem(SESSION_KEYS.accessToken));
  private readonly userSignal = signal<CurrentUser>({ authenticated: false, name: null });

  readonly ssoEnabled = computed(() => this.configSignal().enabled);
  readonly isAuthenticated = computed(() => this.accessTokenSignal() !== null && !this.isTokenExpired());
  readonly currentUser = computed(() => this.userSignal());

  private discoveryDocument: OidcDiscoveryDocument | null = null;

  /** Called once at app startup via provideAppInitializer - see app.config.ts. */
  async init(): Promise<void> {
    const config = await firstValueFrom(this.http.get<SsoConfig>(`${environment.apiBaseUrl}/Auth/Config`));
    this.configSignal.set(config);

    if (config.enabled && this.isAuthenticated()) {
      await this.refreshCurrentUser();
    }
  }

  /** Redirects the browser to the IdP's login page. Call from a guard or a "Sign in" button. */
  async login(returnUrl = '/products'): Promise<void> {
    const config = this.configSignal();
    if (!config.enabled) {
      return;
    }

    const discovery = await this.getDiscoveryDocument();
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = generateState();

    sessionStorage.setItem(SESSION_KEYS.codeVerifier, verifier);
    sessionStorage.setItem(SESSION_KEYS.state, state);
    sessionStorage.setItem(SESSION_KEYS.returnUrl, returnUrl);

    const redirectUri = `${window.location.origin}/auth-callback`;
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: redirectUri,
      scope: 'openid profile email',
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    window.location.href = `${discovery.authorization_endpoint}?${params.toString()}`;
  }

  /**
   * Called by AuthCallbackComponent once the IdP redirects back with ?code=...&state=.... 
   * Exchanges the code for tokens and returns the return-url to send the user back to.
   */
  async handleCallback(code: string, state: string): Promise<string> {
    const expectedState = sessionStorage.getItem(SESSION_KEYS.state);
    const verifier = sessionStorage.getItem(SESSION_KEYS.codeVerifier);
    const returnUrl = sessionStorage.getItem(SESSION_KEYS.returnUrl) ?? '/products';

    if (!expectedState || state !== expectedState || !verifier) {
      throw new Error('Login could not be verified (state mismatch). Please try signing in again.');
    }

    const discovery = await this.getDiscoveryDocument();
    const config = this.configSignal();
    const redirectUri = `${window.location.origin}/auth-callback`;

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: config.clientId,
      code_verifier: verifier,
    });

    const token = await firstValueFrom(
      this.http.post<TokenResponse>(discovery.token_endpoint, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    );

    this.storeToken(token);
    sessionStorage.removeItem(SESSION_KEYS.codeVerifier);
    sessionStorage.removeItem(SESSION_KEYS.state);
    sessionStorage.removeItem(SESSION_KEYS.returnUrl);

    await this.refreshCurrentUser();

    return returnUrl;
  }

  /** Clears the local session and redirects to the IdP's logout endpoint (RP-initiated logout) if it advertises one. */
  async logout(): Promise<void> {
    const discovery = await this.getDiscoveryDocument().catch(() => null);

    sessionStorage.removeItem(SESSION_KEYS.accessToken);
    sessionStorage.removeItem(SESSION_KEYS.expiresAt);
    this.accessTokenSignal.set(null);
    this.userSignal.set({ authenticated: false, name: null });

    if (discovery?.end_session_endpoint) {
      const params = new URLSearchParams({ post_logout_redirect_uri: window.location.origin });
      window.location.href = `${discovery.end_session_endpoint}?${params.toString()}`;
    } else {
      window.location.href = '/products';
    }
  }

  getAccessToken(): string | null {
    return this.isTokenExpired() ? null : this.accessTokenSignal();
  }

  private async refreshCurrentUser(): Promise<void> {
    try {
      const me = await firstValueFrom(this.http.get<CurrentUser>(`${environment.apiBaseUrl}/Auth/Me`));
      this.userSignal.set(me);
    } catch {
      // Token likely expired/invalid server-side; treat as signed out locally too.
      this.accessTokenSignal.set(null);
      this.userSignal.set({ authenticated: false, name: null });
    }
  }

  private storeToken(token: TokenResponse): void {
    const expiresAt = Date.now() + token.expires_in * 1000;
    sessionStorage.setItem(SESSION_KEYS.accessToken, token.access_token);
    sessionStorage.setItem(SESSION_KEYS.expiresAt, String(expiresAt));
    this.accessTokenSignal.set(token.access_token);
  }

  private isTokenExpired(): boolean {
    const expiresAt = Number(sessionStorage.getItem(SESSION_KEYS.expiresAt) ?? 0);
    return expiresAt === 0 || Date.now() >= expiresAt;
  }

  private async getDiscoveryDocument(): Promise<OidcDiscoveryDocument> {
    if (this.discoveryDocument) {
      return this.discoveryDocument;
    }

    const authority = this.configSignal().authority.replace(/\/+$/, '');
    const doc = await firstValueFrom(
      this.http.get<OidcDiscoveryDocument>(`${authority}/.well-known/openid-configuration`),
    );
    this.discoveryDocument = doc;
    return doc;
  }
}
