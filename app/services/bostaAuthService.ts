import axios from 'axios';

interface BostaAuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    refreshToken: string;
    user: any;
  };
}

class BostaAuthService {
  private static instance: BostaAuthService;
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  
  private constructor() {
    // Initialize with the token from env if available
    this.token = process.env.BOSTA_BEARER_TOKEN || null;
    
    // If we have a token, try to extract its expiry
    if (this.token) {
      this.extractTokenExpiry();
    }
  }
  
  public static getInstance(): BostaAuthService {
    if (!BostaAuthService.instance) {
      BostaAuthService.instance = new BostaAuthService();
    }
    return BostaAuthService.instance;
  }
  
  private extractTokenExpiry(): void {
    try {
      if (!this.token) return;
      
      // Extract the payload from JWT token
      const parts = this.token.split('.');
      if (parts.length !== 3) {
        // Invalid token format
        this.token = null;
        this.tokenExpiry = null;
        return;
      }
      
      const base64Payload = parts[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      
      // Get expiry timestamp
      if (payload.exp) {
        this.tokenExpiry = payload.exp * 1000; // Convert to milliseconds
      } else {
        // No expiry found in token
        this.tokenExpiry = null;
      }
    } catch (error) {
      console.error('Failed to extract token expiry:', error);
      // Reset token and expiry on error
      this.token = null;
      this.tokenExpiry = null;
    }
  }
  
  private isInvalidToken(): boolean {
    if (!this.token) return true;
    
    try {
      // Basic structure validation
      const parts = this.token.split('.');
      if (parts.length !== 3) return true;
      
      // Try to decode the payload
      const base64Payload = parts[1];
      JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      
      return false; // Token passed basic validation
    } catch (error) {
      console.error('Token validation failed:', error);
      return true; // Token is invalid
    }
  }
  
  // New method to check if token is expired
  public isTokenExpired(): boolean {
    if (!this.token || !this.tokenExpiry) return true;
    
    const now = Date.now();
    // Token is expired if current time is past expiry time
    return now >= this.tokenExpiry;
  }
  
  // New method to force token refresh for testing
  public async forceTokenRefresh(): Promise<string> {
    await this.refreshAuthToken();
    return this.token || '';
  }
  
  public async getToken(): Promise<string> {
    // Check if token is expired, about to expire (within 5 minutes), or invalid
    const now = Date.now();
    const isExpiringSoon = !this.tokenExpiry || now > this.tokenExpiry - 5 * 60 * 1000;
    const isInvalid = this.isInvalidToken();
    
    // Log token status for debugging
    if (isExpiringSoon) {
      console.log('Token is expired or expiring soon. Current time:', new Date(now).toISOString());
      if (this.tokenExpiry) {
        console.log('Token expiry:', new Date(this.tokenExpiry).toISOString());
      } else {
        console.log('Token expiry not found');
      }
    }
    
    if ((isExpiringSoon || isInvalid) && !this.isRefreshing) {
      console.log('Refreshing token due to:', isExpiringSoon ? 'expiration' : 'invalid format');
      await this.refreshAuthToken();
    }
    
    return this.token || '';
  }
  
  private async refreshAuthToken(): Promise<void> {
    this.isRefreshing = true;
    console.log('Starting token refresh process');
    
    try {
      const response = await axios.post<BostaAuthResponse>(
        'http://app.bosta.co/api/v2/users/login',
        {
          email: process.env.BOSTA_EMAIL,
          password: process.env.BOSTA_PASSWORD 
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      if (response.data.success && response.data.data && response.data.data.token) {
        // Extract just the token part without "Bearer "
        this.token = response.data.data.token.replace('Bearer ', '');
        this.refreshToken = response.data.data.refreshToken || null;
        
        // Update token expiry
        this.extractTokenExpiry();
        
        // Update the environment variable for other parts of the app
        if (this.token) {
          process.env.BOSTA_BEARER_TOKEN = this.token;
          console.log('Bosta token refreshed successfully');
          if (this.tokenExpiry) {
            console.log('New token expires at:', new Date(this.tokenExpiry).toISOString());
          }
        } else {
          console.error('Received empty token from Bosta API');
        }
      } else {
        console.error('Failed to refresh Bosta token:', response.data.message);
        this.token = null;
        this.tokenExpiry = null;
      }
    } catch (error) {
      console.error('Error refreshing Bosta token:', error);
      this.token = null;
      this.tokenExpiry = null;
    } finally {
      this.isRefreshing = false;
    }
  }
}

export default BostaAuthService;