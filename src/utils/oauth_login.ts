const CLIENT_ID = 'c0b0096f40b06ab09ba41ce11a64bbb9';
const CALLBACK_PATH = '/oauth/callback.html';
const STORAGE_KEY = 'oauth_request';

function base64url(data: Uint8Array): string {
  let bin = '';
  for (const byte of data) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function random_string(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return base64url(arr);
}

export async function oauth_login(): Promise<void> {
  const redirect_uri = location.origin + CALLBACK_PATH;
  const verifier = random_string(32);
  const state = random_string(16);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const search = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirect_uri,
    response_type: 'code',
    state: state,
    scope: 'profile',
    code_challenge: base64url(new Uint8Array(digest)),
    code_challenge_method: 'S256',
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    state: state,
    verifier: verifier,
    redirect_uri: redirect_uri,
    return_hash: location.hash.length > 1 ? location.hash : '#/',
  }));
  document.location.href = `${API_BASE}oauth/authorize?${search}`;
}
