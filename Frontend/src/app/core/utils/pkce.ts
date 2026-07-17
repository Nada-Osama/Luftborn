/**
 * Authorization Code + PKCE helpers, hand-written rather than pulled from a library,
 * so a dependency wouldn't save much, and writing it out is the clearest way
 * to show the flow actually being understood rather than configured.
 */

function base64UrlEncode(buffer: ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

/** RFC 7636 code_verifier: a random string, base64url-encoded. */
export function generateCodeVerifier(): string {
  return base64UrlEncode(randomBytes(32).buffer);
}

/** RFC 7636 code_challenge: SHA-256 of the verifier, base64url-encoded (S256 method). */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoded = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return base64UrlEncode(digest);
}

/** Anti-CSRF value round-tripped through the IdP and checked on callback. */
export function generateState(): string {
  return base64UrlEncode(randomBytes(16).buffer);
}
