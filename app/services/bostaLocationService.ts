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
  private baseUrl = "https://app.bosta.co/api/v2";
  public token = "2adb69c5b8bf76e2d49259310b692dc75ee8cd5ef2b3cbf4ffcf7a693928c439";

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
    };
  }

  private async makeRequest(
    endpoint: string
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
      });

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
