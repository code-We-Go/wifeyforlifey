import axios from 'axios';
import { ConnectDB } from '@/app/config/db';
import settingsModel from '@/app/modals/settingsModel';

interface BostaAuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    refreshToken: string;
    user: any;
  };
}

export interface BostaAuthSettings {
  apiKey?: string;        // Static API key from Bosta dashboard (never expires) — preferred
  token?: string;         // Bearer token (fallback, auto-refreshed via login)
  refreshToken?: string;
  tokenExpiry?: number;   // ms timestamp
}

const SETTINGS_KEY = 'bosta_auth';
const CACHE_TTL_MS = 60 * 1000;           // re-read DB at most once a minute
const EXPIRY_BUFFER_MS = 5 * 60 * 1000;   // refresh 5 min before expiry

/**
 * Resolves the Bosta Authorization header.
 * Priority:
 *   1. apiKey stored in DB (settings.bosta_auth.apiKey)  -> "Authorization: <apiKey>"
 *   2. BOSTA_API_KEY env                                 -> "Authorization: <apiKey>"
 *   3. Valid bearer token stored in DB                   -> "Authorization: Bearer <token>"
 *   4. Login with BOSTA_EMAIL/BOSTA_PASSWORD, save new token to DB
 *   5. BOSTA_BEARER_TOKEN env (legacy fallback)
 */
class BostaAuthService {
  private static instance: BostaAuthService;
  private cache: BostaAuthSettings | null = null;
  private cacheLoadedAt = 0;
  private refreshPromise: Promise<string | null> | null = null;

  private constructor() {}

  public static getInstance(): BostaAuthService {
    if (!BostaAuthService.instance) {
      BostaAuthService.instance = new BostaAuthService();
    }
    return BostaAuthService.instance;
  }

  // ---------- DB helpers ----------

  private async loadSettings(force = false): Promise<BostaAuthSettings> {
    if (!force && this.cache && Date.now() - this.cacheLoadedAt < CACHE_TTL_MS) {
      return this.cache;
    }
    try {
      await ConnectDB();
      const doc: any = await settingsModel.findOne({ key: SETTINGS_KEY }).lean();
      this.cache = (doc?.value as BostaAuthSettings) || {};
    } catch (error) {
      console.error('Failed to load Bosta settings from DB:', error);
      this.cache = this.cache || {};
    }
    this.cacheLoadedAt = Date.now();
    return this.cache;
  }

  public async saveSettings(partial: BostaAuthSettings): Promise<BostaAuthSettings> {
    await ConnectDB();
    const $set: Record<string, any> = {};
    for (const [k, v] of Object.entries(partial)) {
      if (v !== undefined) $set[`value.${k}`] = v;
    }
    const doc: any = await settingsModel
      .findOneAndUpdate({ key: SETTINGS_KEY }, { $set }, { upsert: true, new: true })
      .lean();
    this.cache = (doc?.value as BostaAuthSettings) || {};
    this.cacheLoadedAt = Date.now();
    return this.cache;
  }

  public async getSettings(): Promise<BostaAuthSettings> {
    return this.loadSettings(true);
  }

  // ---------- Token helpers ----------

  private static decodeExpiry(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private static isTokenUsable(token?: string, expiry?: number): boolean {
    if (!token) return false;
    const exp = expiry || BostaAuthService.decodeExpiry(token);
    if (!exp) return false;
    return Date.now() < exp - EXPIRY_BUFFER_MS;
  }

  private async loginAndStore(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      if (!process.env.BOSTA_EMAIL || !process.env.BOSTA_PASSWORD) {
        console.error('BOSTA_EMAIL / BOSTA_PASSWORD not set; cannot refresh Bosta token');
        return null;
      }
      try {
        console.log('Refreshing Bosta token via login');
        const response = await axios.post<BostaAuthResponse>(
          'https://app.bosta.co/api/v2/users/login',
          { email: process.env.BOSTA_EMAIL, password: process.env.BOSTA_PASSWORD },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const rawToken = response.data?.data?.token;
        if (!response.data.success || !rawToken) {
          console.error('Failed to refresh Bosta token:', response.data?.message);
          return null;
        }

        const token = rawToken.replace(/^Bearer\s+/i, '');
        const tokenExpiry = BostaAuthService.decodeExpiry(token) || undefined;
        await this.saveSettings({
          token,
          refreshToken: response.data.data?.refreshToken,
          tokenExpiry,
        });
        console.log(
          'Bosta token refreshed and saved to DB',
          tokenExpiry ? `(expires ${new Date(tokenExpiry).toISOString()})` : ''
        );
        return token;
      } catch (error: any) {
        console.error('Error refreshing Bosta token:', error?.response?.data || error?.message);
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // ---------- Public API ----------

  /** Full value for the `Authorization` header. */
  public async getAuthHeader(): Promise<string> {
    const settings = await this.loadSettings();

    if (settings.apiKey) return settings.apiKey;
    if (process.env.BOSTA_API_KEY) return process.env.BOSTA_API_KEY;

    if (BostaAuthService.isTokenUsable(settings.token, settings.tokenExpiry)) {
      return `Bearer ${settings.token}`;
    }

    const fresh = await this.loginAndStore();
    if (fresh) return `Bearer ${fresh}`;

    const envToken = process.env.BOSTA_BEARER_TOKEN;
    return envToken ? `Bearer ${envToken}` : '';
  }

  /** True when auth is a static API key (no refresh needed). */
  public async usesApiKey(): Promise<boolean> {
    const settings = await this.loadSettings();
    return !!(settings.apiKey || process.env.BOSTA_API_KEY);
  }

  /** Call after a 401 from Bosta: forces a fresh login and returns the new header. */
  public async handleUnauthorized(): Promise<string> {
    if (await this.usesApiKey()) return this.getAuthHeader();
    const fresh = await this.loginAndStore();
    return fresh ? `Bearer ${fresh}` : '';
  }

  /** Forces a token refresh (login) and returns the new raw token. */
  public async forceTokenRefresh(): Promise<string> {
    return (await this.loginAndStore()) || '';
  }

  /** @deprecated use getAuthHeader(). Returns raw token/apiKey without "Bearer ". */
  public async getToken(): Promise<string> {
    return (await this.getAuthHeader()).replace(/^Bearer\s+/i, '');
  }
}

export default BostaAuthService;