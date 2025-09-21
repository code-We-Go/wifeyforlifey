/**
 * Device fingerprinting utility for login tracking
 */
import DeviceDetector from "device-detector-js";

/**
 * Generates a device fingerprint based on browser and device characteristics
 * @returns An object containing device information and a fingerprint string
 */
export const generateDeviceFingerprint = () => {
  if (typeof window === "undefined") return null;

  try {
    const userAgent = navigator.userAgent;
    const deviceDetector = new DeviceDetector();
    const result = deviceDetector.parse(userAgent);

    // Extract device information
    const deviceType = result.device ? result.device.type : "desktop";
    const deviceBrand = result.device ? result.device.brand || "" : "";
    const deviceModel = result.device ? result.device.model || "" : "";

    // Extract browser information
    const browserName = result.client ? result.client.name || "" : "";
    const browserVersion = result.client ? result.client.version || "" : "";

    // Extract OS information
    const osName = result.os ? result.os.name || "" : "";
    const osVersion = result.os ? result.os.version || "" : "";

    // Create a more robust fingerprint
    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    console.log("deviceModel" + deviceModel, deviceType);
    // Combine all factors into a fingerprint
    const fingerprintComponents = [
      browserName,
      browserVersion,
      osName,
      osVersion,
      deviceType,
      deviceBrand,
      deviceModel,
      screenInfo,
      timeZone,
      language,
    ]
      .filter(Boolean)
      .join("-");

    // Create a hash-like string (not cryptographically secure, but good enough for fingerprinting)
    const simpleHash = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash).toString(36);
    };

    const fingerprint = simpleHash(fingerprintComponents);

    return {
      userAgent,
      deviceType,
      deviceBrand,
      deviceModel,
      browserName,
      browserVersion,
      osName,
      osVersion,
      fingerprint,
    };
  } catch (error) {
    console.error("Error generating device fingerprint:", error);
    return null;
  }
};
