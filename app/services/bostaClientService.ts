// Client-side service for Bosta API calls
export interface BostaCity {
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

export interface BostaZone {
  _id: string;
  name: string;
  nameAr: string;
  pickupAvailability: boolean;
  dropOffAvailability: boolean;
}

export interface BostaDistrict {
  zoneId: string;
  zoneName: string;
  zoneOtherName: string;
  districtId: string;
  districtName: string;
  districtOtherName: string;
  pickupAvailability: boolean;
  dropOffAvailability: boolean;
}

class BostaClientService {
  private baseUrl = '/api/bosta';

  async getCities(): Promise<BostaCity[]> {
    try {
      const response = await fetch(`${this.baseUrl}/cities`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch cities');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
  }

  async getZones(cityId: string): Promise<BostaZone[]> {
    try {
      const response = await fetch(`${this.baseUrl}/zones?cityId=${encodeURIComponent(cityId)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch zones');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching zones:', error);
      return [];
    }
  }

  async getDistricts(cityId: string): Promise<BostaDistrict[]> {
    try {
      const response = await fetch(`${this.baseUrl}/districts?cityId=${encodeURIComponent(cityId)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch districts');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  }

  async getDistrictsByZone(cityId: string, zoneId: string): Promise<BostaDistrict[]> {
    try {
      const response = await fetch(`${this.baseUrl}/districts?cityId=${encodeURIComponent(cityId)}&zoneId=${encodeURIComponent(zoneId)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch districts');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching districts by zone:', error);
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

const bostaClientService = new BostaClientService();
export default bostaClientService;
export { BostaClientService };