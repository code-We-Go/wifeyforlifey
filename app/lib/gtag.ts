export const GA_ID = "G-38ZSYFKE86";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const sendEvent = (event: string, params?: any) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, params);
  }
};