interface BostaAddress {
  city: string;
  zoneId: string;
  districtId: string;
  firstLine: string;
  secondLine: string;
  buildingNumber: string;
  floor: string;
  apartment: string;
}

interface BostaReceiver {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface BostaPackageDetails {
  itemsCount: number;
  description: string;
}

interface BostaSpecs {
  packageType: string;
  size: string;
  packageDetails: BostaPackageDetails;
}

interface BostaDeliveryPayload {
  type: number;
  specs: BostaSpecs;
  notes: string;
  cod: number;
  dropOffAddress: BostaAddress;
  pickupAddress: BostaAddress;
  returnAddress: BostaAddress;
  businessReference: string;
  receiver: BostaReceiver;
  webhookUrl: string;
}

interface BostaDeliveryResponse {
  success: boolean;
  data?: {
    trackingNumber: string;
    deliveryId: string;
    state: string;
  };
  error?: string;
}

class BostaService {
  private baseUrl: string;
  private bearerToken: string;
  private bostAPI: string;

  constructor() {
    this.baseUrl = "http://app.bosta.co/api/v2";
    this.bearerToken = process.env.BOSTA_BEARER_TOKEN || "";
    this.bostAPI = process.env.BOSTA_API || "";
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `${this.bostAPI}`,
    };
  }

  async createDelivery(
    payload: BostaDeliveryPayload
  ): Promise<BostaDeliveryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/deliveries?apiVersion=1`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Bosta API Error:", data);
        return {
          success: false,
          error: data.message || "Failed to create delivery",
        };
      }

      return {
        success: true,
        data: {
          trackingNumber: data.trackingNumber,
          deliveryId: data._id,
          state: data.state,
        },
      };
    } catch (error) {
      console.error("Bosta Service Error:", error);
      return {
        success: false,
        error: "Network error or service unavailable",
      };
    }
  }

  // Helper method to create delivery payload from order data
  createDeliveryPayload(
    order: any,
    webhookUrl: string = `${process.env.baseUrl}api/webhooks/bosta`
  ): BostaDeliveryPayload {
    const itemsCount =
      order.cart?.reduce(
        (total: number, item: any) => total + item.quantity,
        0
      ) || 2;
    const description =
      order.cart
        ?.map((item: any) => `${item.productName} (${item.quantity})`)
        .join(", ") || "Desc.";

    return {
      type: 10,
      specs: {
        packageType: "Parcel",
        size: "MEDIUM",
        packageDetails: {
          itemsCount,
          description: description.substring(0, 100) || "Desc.",
        },
      },
      notes: "Welcome Note",
      cod: order.cash === "true" ? order.total : 50,
      dropOffAddress: {
        city: order.city || "Helwan",
        zoneId: "NQz5sDOeG",
        districtId: "aiJudRHeOt",
        firstLine: order.address || "Helwan street x",
        secondLine: order.apartment || "Near to Bosta school",
        buildingNumber: "123",
        floor: "4",
        apartment: "2",
      },
      pickupAddress: {
        city: process.env.BOSTA_PICKUP_CITY || "Helwan",
        zoneId: process.env.BOSTA_PICKUP_ZONE_ID || "NQz5sDOeG",
        districtId: process.env.BOSTA_PICKUP_DISTRICT_ID || "aiJudRHeOt",
        firstLine: process.env.BOSTA_PICKUP_ADDRESS || "Helwan street x",
        secondLine: process.env.BOSTA_PICKUP_ADDRESS_2 || "Near to Bosta school",
        buildingNumber: process.env.BOSTA_PICKUP_BUILDING || "123",
        floor: process.env.BOSTA_PICKUP_FLOOR || "4",
        apartment: process.env.BOSTA_PICKUP_APARTMENT || "2",
      },
      returnAddress: {
        city: process.env.BOSTA_RETURN_CITY || "Helwan",
        zoneId: process.env.BOSTA_RETURN_ZONE_ID || "NQz5sDOeG",
        districtId: process.env.BOSTA_RETURN_DISTRICT_ID || "aiJudRHeOt",
        firstLine: process.env.BOSTA_RETURN_ADDRESS || "Maadi",
        secondLine: process.env.BOSTA_RETURN_ADDRESS_2 || "Nasr City",
        buildingNumber: process.env.BOSTA_RETURN_BUILDING || "123",
        floor: process.env.BOSTA_RETURN_FLOOR || "4",
        apartment: process.env.BOSTA_RETURN_APARTMENT || "2",
      },
      businessReference: order._id || "43535252",
      receiver: {
        firstName: order.firstName || "Sasuke",
        lastName: order.lastName || "Uchiha",
        phone: order.phone || "01065685435",
        email: order.email || "ahmed@ahmed.com",
      },
      webhookUrl,
    };
  }
}

export default BostaService;
export type { BostaDeliveryPayload, BostaDeliveryResponse, BostaAddress };
