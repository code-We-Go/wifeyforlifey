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
  message?: string;
  data?: {
    _id: string;
    trackingNumber: string;
    businessReference: string;
    sender: {
      _id: string;
      phone: number;
      name: string;
      type: string;
    };
    message: string;
    state: {
      code: number;
      value: string;
    };
    creationSrc: string;
  };
  error?: string;
}

class BostaService {
  private baseUrl: string;
  private bearerToken: string;
  private bostAPI: string;

  constructor() {
    this.baseUrl = "https://app.bosta.co/api/v2";
    this.bearerToken = process.env.BOSTA_BEARER_TOKEN || "";
    this.bostAPI = process.env.BOSTA_API || "";
  }

  async createDelivery(payload: BostaDeliveryPayload): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/deliveries?apiVersion=1`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.bearerToken,
        },
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

      return data;
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
    webhookUrl: string = `https://www.shopwifeyforlifey.com/api/webhooks/bosta`
  ): BostaDeliveryPayload {
    const itemsCount =
      order.cart?.reduce(
        (total: number, item: any) => total + item.quantity,
        0
      ) || 2;
    const cash = order.cash ? order.cash : "card";
    // const description =
    //   order.cart
    //     ?.map((item: any) => `${item.productName} (${item.quantity})`)
    //     .join(", ") || "Desc.";

    // console.log("description", description);

    return {
      type: 10,
      specs: {
        packageType: "Parcel",
        size: "MEDIUM",
        packageDetails: {
          itemsCount,
          description: "Desc.",
        },
      },
      notes: "Welcome Note",
      cod: cash === "cash" ? order.total : 0,
      dropOffAddress: {
        city: order.bostaCityName || order.city || "Cairo",
        zoneId: order.bostaZone || "NQz5sDOeG",
        districtId: order.bostaDistrict || "aiJudRHeOt",
        firstLine: order.address || "Main Street",
        secondLine: order.apartment || "Apartment details",
        buildingNumber: "1",
        floor: "1",
        apartment: "1",
      },
      pickupAddress: {
        city: process.env.BOSTA_PICKUP_CITY || "Cairo",
        zoneId: process.env.BOSTA_PICKUP_ZONE_ID || "1",
        districtId: process.env.BOSTA_PICKUP_DISTRICT_ID || "1",
        firstLine: process.env.BOSTA_PICKUP_ADDRESS || "Main Street",
        secondLine: process.env.BOSTA_PICKUP_ADDRESS_2 || "Pickup location",
        buildingNumber: process.env.BOSTA_PICKUP_BUILDING || "1",
        floor: process.env.BOSTA_PICKUP_FLOOR || "1",
        apartment: process.env.BOSTA_PICKUP_APARTMENT || "1",
      },
      returnAddress: {
        city: process.env.BOSTA_RETURN_CITY || "Cairo",
        zoneId: process.env.BOSTA_RETURN_ZONE_ID || "1",
        districtId: process.env.BOSTA_RETURN_DISTRICT_ID || "1",
        firstLine: process.env.BOSTA_RETURN_ADDRESS || "Return Address",
        secondLine: process.env.BOSTA_RETURN_ADDRESS_2 || "Return details",
        buildingNumber: process.env.BOSTA_RETURN_BUILDING || "1",
        floor: process.env.BOSTA_RETURN_FLOOR || "1",
        apartment: process.env.BOSTA_RETURN_APARTMENT || "1",
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
