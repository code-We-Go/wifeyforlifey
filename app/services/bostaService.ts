import BostaAuthService from './bostaAuthService';
import bostaLocationService, { BostaDistrict } from './bostaLocationService';

// Cache of Bosta districts per city (district list rarely changes)
const DISTRICTS_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const districtsCache = new Map<string, { at: number; data: BostaDistrict[] }>();

const normalizeName = (s?: string) =>
  (s || "").toString().trim().toLowerCase().replace(/\s+/g, " ");

type DropOffResolution =
  | { ok: true; zoneId?: string; districtId?: string; fixed: boolean; note?: string }
  | { ok: false; reason: string };

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
  reference?: string;
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
  private authService: BostaAuthService;
  private bostAPI: string;

  constructor() {
    this.baseUrl = "https://app.bosta.co/api/v2";
    this.authService = BostaAuthService.getInstance();
    this.bostAPI = process.env.BOSTA_API || "";
  }

  private async getCityDistricts(cityId: string): Promise<BostaDistrict[]> {
    const cached = districtsCache.get(cityId);
    if (cached && Date.now() - cached.at < DISTRICTS_CACHE_TTL_MS) return cached.data;
    const data = await bostaLocationService.getDistricts(cityId);
    if (data.length) districtsCache.set(cityId, { at: Date.now(), data });
    return data;
  }

  /**
   * Validates the order's Bosta zone/district against Bosta's live location data.
   * - Repairs records where districtId is wrong (e.g. the zoneId was saved as the districtId)
   *   by matching bostaDistrictName within the zone.
   * - Rejects areas Bosta does not deliver to (dropOffAvailability === false).
   * If Bosta's location API is unreachable, the original IDs are passed through untouched.
   */
  async resolveDropOffLocation(order: any): Promise<DropOffResolution> {
    const cityId: string | undefined = order?.bostaCity;
    const zoneId: string | undefined = order?.bostaZone;
    const districtId: string | undefined = order?.bostaDistrict;
    if (!cityId || !zoneId) return { ok: true, zoneId, districtId, fixed: false };

    const districts = await this.getCityDistricts(cityId);
    if (!districts.length) return { ok: true, zoneId, districtId, fixed: false };

    const inZone = districts.filter((d) => d.zoneId === zoneId);
    if (!inZone.length) {
      // Zone id doesn't belong to this city; try to recover via the district id
      const byId = districts.find((d) => d.districtId === districtId);
      if (!byId) return { ok: true, zoneId, districtId, fixed: false };
      if (byId.dropOffAvailability === false) {
        return { ok: false, reason: `Bosta does not deliver to "${byId.districtName}" (${byId.zoneName})` };
      }
      return { ok: true, zoneId: byId.zoneId, districtId: byId.districtId, fixed: true, note: "zone corrected from district" };
    }

    let match = inZone.find((d) => d.districtId === districtId);
    let note: string | undefined;
    if (!match && order?.bostaDistrictName) {
      const wanted = normalizeName(order.bostaDistrictName);
      match = inZone.find(
        (d) => normalizeName(d.districtName) === wanted || normalizeName(d.districtOtherName) === wanted
      );
      if (match) note = `district matched by name "${order.bostaDistrictName}"`;
    }
    if (!match) {
      match = inZone.find((d) => d.dropOffAvailability !== false);
      if (match) note = `district not found, fell back to first covered district "${match.districtName}"`;
    }

    if (!match || match.dropOffAvailability === false) {
      const zoneName = inZone[0]?.zoneName || order?.bostaZoneName || zoneId;
      const where = match ? `"${match.districtName}" (${zoneName})` : `zone "${zoneName}"`;
      return { ok: false, reason: `Bosta does not deliver to ${where}` };
    }

    return {
      ok: true,
      zoneId: match.zoneId,
      districtId: match.districtId,
      fixed: match.districtId !== districtId || match.zoneId !== zoneId,
      note,
    };
  }

  /**
   * @param order Optional source order/subscription. When provided, the drop-off
   *              zone/district are validated (and repaired if possible) before sending.
   */
  async createDelivery(payload: BostaDeliveryPayload, order?: any): Promise<any> {
    try {
      if (order) {
        const loc = await this.resolveDropOffLocation(order);
        if (!loc.ok) {
          console.error("Bosta drop-off validation failed:", loc.reason, "| ref:", payload.businessReference);
          return { success: false, error: loc.reason };
        }
        if (loc.fixed) {
          console.warn(
            `Bosta drop-off repaired for ${payload.businessReference}: ` +
              `zone ${payload.dropOffAddress.zoneId} -> ${loc.zoneId}, ` +
              `district ${payload.dropOffAddress.districtId} -> ${loc.districtId}` +
              (loc.note ? ` (${loc.note})` : "")
          );
          payload = {
            ...payload,
            dropOffAddress: {
              ...payload.dropOffAddress,
              zoneId: loc.zoneId || payload.dropOffAddress.zoneId,
              districtId: loc.districtId || payload.dropOffAddress.districtId,
            },
          };
        }
      }

      const send = (authorization: string) =>
        fetch(`${this.baseUrl}/deliveries?apiVersion=1`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorization,
          },
          body: JSON.stringify(payload),
        });

      let response = await send(await this.authService.getAuthHeader());

      // Token expired/revoked -> refresh once and retry
      if (response.status === 401) {
        console.warn("Bosta returned 401, refreshing auth and retrying once");
        response = await send(await this.authService.handleUnauthorized());
      }

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
    webhookUrl: string = `https://www.shopwifeyforlifey.com/api/webhooks/bosta`,
    subscriptionCount?: number
  ): BostaDeliveryPayload {
    const productCount =
      order.cart?.reduce(
        (total: number, item: any) => total + item.quantity,
        0
      ) || 0;

    let itemsCount = productCount;
    if (typeof subscriptionCount === "number" && subscriptionCount > 0) {
      itemsCount += subscriptionCount;
    }

    if (itemsCount === 0) {
      itemsCount = 2;
    }

    const cash = order.cash ? order.cash : "card";
    // const description =
    //   order.cart
    //     ?.map((item: any) => `${item.productName} (${item.quantity})`)
    //     .join(", ") || "Desc.";

    // console.log("description", description);

      const refId = order._id
        ? String(order._id)
        : (order.orderID || order.paymentID || order.referenceId || order.orderId || "43535252");

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
        notes: "",
        cod: cash === "cash" ? order.total : 0,
        dropOffAddress: {
          city: order.bostaCityName || order.billingCity || order.city || "Cairo",
          zoneId: order.bostaZone || "NQz5sDOeG",
          districtId: order.bostaDistrict || "aiJudRHeOt",
          firstLine: order.billingAddress || order.address || "Main Street",
          secondLine: order.billingApartment || order.apartment || "Apartment details",
          buildingNumber: "1",
          floor: "1",
          apartment: "1",
        },
        pickupAddress: {
          city: process.env.BOSTA_PICKUP_CITY || "Cairo",
          // Defaults must be real Bosta IDs (Helwan / ElArab Sharq - ElKobry); "1" triggers
          // "Uncovered drop off or pickup address" (4009)
          zoneId: process.env.BOSTA_PICKUP_ZONE_ID || "NQz5sDOeG",
          districtId: process.env.BOSTA_PICKUP_DISTRICT_ID || "aiJudRHeOt",
          firstLine: process.env.BOSTA_PICKUP_ADDRESS || "Main Street",
          secondLine: process.env.BOSTA_PICKUP_ADDRESS_2 || "Pickup location",
          buildingNumber: process.env.BOSTA_PICKUP_BUILDING || "1",
          floor: process.env.BOSTA_PICKUP_FLOOR || "1",
          apartment: process.env.BOSTA_PICKUP_APARTMENT || "1",
        },
        returnAddress: {
          city: process.env.BOSTA_RETURN_CITY || "Cairo",
          zoneId: process.env.BOSTA_RETURN_ZONE_ID || "NQz5sDOeG",
          districtId: process.env.BOSTA_RETURN_DISTRICT_ID || "aiJudRHeOt",
          firstLine: process.env.BOSTA_RETURN_ADDRESS || "Return Address",
          secondLine: process.env.BOSTA_RETURN_ADDRESS_2 || "Return details",
          buildingNumber: process.env.BOSTA_RETURN_BUILDING || "1",
          floor: process.env.BOSTA_RETURN_FLOOR || "1",
          apartment: process.env.BOSTA_RETURN_APARTMENT || "1",
        },
        businessReference: refId,
        reference: refId,
        receiver: {
        firstName: order.billingFirstName || order.firstName || "Sasuke",
        lastName: order.billingLastName || order.lastName || "Uchiha",
        phone: order.billingPhone || order.phone || "01065685435",
        email: order.email || "ahmed@ahmed.com",
      },
      webhookUrl,
    };
  }
}

export default BostaService;
export type { BostaDeliveryPayload, BostaDeliveryResponse, BostaAddress };
