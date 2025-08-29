interface BostaCity {
  _id: string;
  name: string;
  nameAr: string;
  code: string;
  alias: string;
  hub: {
    _id: string;
    name: string;
  };
  sector: number;
  pickupAvailability: boolean;
  dropOffAvailability: boolean;
  showAsDropOff: boolean;
  showAsPickup: boolean;
}

interface BostaZone {
  _id: string;
  name: string;
  nameAr: string;
  pickupAvailability: boolean;
  dropOffAvailability: boolean;
}

interface BostaDistrict {
  zoneId: string;
  zoneName: string;
  zoneOtherName: string;
  districtId: string;
  districtName: string;
  districtOtherName: string;
  pickupAvailability: boolean;
  dropOffAvailability: boolean;
}

interface BostaAuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    user: any;
  };
}

interface BostaCitiesResponse {
  success: boolean;
  message: string;
  data: {
    list: BostaCity[];
  };
}

interface BostaZonesResponse {
  success: boolean;
  message: string;
  data: BostaZone[];
}

interface BostaDistrictsResponse {
  success: boolean;
  message: string;
  data: BostaDistrict[];
}

class BostaLocationService {
  private baseUrl = "http://app.bosta.co/api/v2";
  private email = process.env.BOSTA_EMAIL || "";
  private password = process.env.BOSTA_PASSWORD || "";
  private token: string | null = null;
  private refreshToken: string | null = null;

  private async authenticate(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data: BostaAuthResponse = await response.json();
      if (data.success) {
        this.token = data.data.token;
        this.refreshToken = data.data.refreshToken;
      } else {
        throw new Error(`Authentication failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Bosta authentication error:", error);
      throw error;
    }
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: this.token || "",
    };
  }

  private async makeRequest(
    endpoint: string,
    retryOnAuth = true
  ): Promise<any> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token || "",
        },
      });

      if (response.status === 401 && retryOnAuth) {
        // Token expired, try to refresh
        await this.authenticate();
        return this.makeRequest(endpoint, false);
      }

      if (!response.ok) {
        throw new Error(`Bosta API error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("Bosta API request error:", error);
      throw error;
    }
  }

  async getCities(): Promise<BostaCity[]> {
    try {
      const response = await this.makeRequest("/cities");
      return response.data?.list || [];
    } catch (error) {
      console.error("Error fetching cities:", error);
      return [];
    }
  }

  async getZones(cityId: string): Promise<BostaZone[]> {
    try {
      const response = await this.makeRequest(`/cities/${cityId}/zones`);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching zones:", error);
      return [];
    }
  }

  async getDistricts(cityId: string): Promise<BostaDistrict[]> {
    try {
      const response = await this.makeRequest(`/cities/${cityId}/districts`);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching districts:", error);
      return [];
    }
  }

  // Get districts filtered by zone
  async getDistrictsByZone(
    cityId: string,
    zoneId: string
  ): Promise<BostaDistrict[]> {
    try {
      const allDistricts = await this.getDistricts(cityId);
      return allDistricts.filter((district) => district.zoneId === zoneId);
    } catch (error) {
      console.error("Error fetching districts by zone:", error);
      return [];
    }
  }

  // Calculate shipping cost based on city sector
  calculateShippingCost(city: BostaCity): number {
    // Basic shipping cost calculation based on sector
    // You can adjust these rates based on your business needs
    const baseCost = 50;
    const sectorMultiplier = city.sector || 1;

    return baseCost + sectorMultiplier * 10;
  }
}

const bostaLocationService = new BostaLocationService();
export default bostaLocationService;
export { BostaLocationService };
export type { BostaCity, BostaZone, BostaDistrict };
