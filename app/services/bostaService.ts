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
      Authorization: `Bearer ${this.bostAPI}`,
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
    pickupAddress: BostaAddress,
    returnAddress: BostaAddress,
    webhookUrl: string
  ): BostaDeliveryPayload {
    const itemsCount =
      order.cart?.reduce(
        (total: number, item: any) => total + item.quantity,
        0
      ) || 1;
    const description =
      order.cart
        ?.map((item: any) => `${item.productName} (${item.quantity})`)
        .join(", ") || "Order items";

    return {
      type: 10,
      specs: {
        packageType: "Parcel",
        size: "MEDIUM",
        packageDetails: {
          itemsCount,
          description: description.substring(0, 100), // Limit description length
        },
      },
      notes: `Order #${order._id}`,
      cod: order.cash === "true" ? order.total : 0,
      dropOffAddress: {
        city: order.city || "",
        zoneId: "", // You'll need to map cities to zone IDs
        districtId: "", // You'll need to map addresses to district IDs
        firstLine: order.address || "",
        secondLine: order.apartment || "",
        buildingNumber: "",
        floor: "",
        apartment: order.apartment || "",
      },
      pickupAddress,
      returnAddress,
      businessReference: order._id,
      receiver: {
        firstName: order.firstName || "",
        lastName: order.lastName || "",
        phone: order.phone || "",
        email: order.email || "",
      },
      webhookUrl,
    };
  }
}

export default BostaService;
export type { BostaDeliveryPayload, BostaDeliveryResponse, BostaAddress };
