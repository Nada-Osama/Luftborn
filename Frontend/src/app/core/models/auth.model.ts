export interface SsoConfig {
  enabled: boolean;
  authority: string;
  clientId: string;
}

export interface OidcDiscoveryDocument {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
}

export interface CurrentUser {
  authenticated: boolean;
  name: string | null;
}

export interface TokenResponse {
  access_token: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
}
