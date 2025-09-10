import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cod = searchParams.get("cod");
    const dropOffCity = searchParams.get("dropOffCity");
    const pickupCity = searchParams.get("pickupCity");
    const size = searchParams.get("size") || "Normal";
    const type = searchParams.get("type") || "SEND";

    if (!cod || !dropOffCity || !pickupCity) {
      return NextResponse.json(
        {
          success: false,
          error: "cod, dropOffCity, and pickupCity parameters are required",
        },
        { status: 400 }
      );
    }

    // Try to use the bearer token first, then fall back to email/password auth if needed
    const bearerToken = process.env.BOSTA_BEARER_TOKEN;

    // For testing purposes, use a hardcoded token if the environment variable is not set
    // In production, this should be properly configured in the .env file
    const fallbackToken =
      "2adb69c5b8bf76e2d49259310b692dc75ee8cd5ef2b3cbf4ffcf7a693928c439";

    const authToken = bearerToken || fallbackToken;

    if (!authToken) {
      return NextResponse.json(
        { success: false, error: "Bosta authentication not configured" },
        { status: 500 }
      );
    }

    const queryParams = new URLSearchParams({
      cod: cod,
      dropOffCity: dropOffCity,
      pickupCity: pickupCity,
      size: size,
      type: type,
    });

    const response = await fetch(
      `https://app.bosta.co/api/v2/pricing/shipment/calculator?${queryParams}`,
      {
        method: "GET",
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Bosta Pricing API Error:", data);
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Failed to calculate shipping cost",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        priceBeforeVat: data.data?.priceBeforeVat || 0,
        priceAfterVat: data.data?.priceAfterVat || 0,
        shippingFee: data.data?.shippingFee || 0,
        vat: data.data?.vat || 0,
        currency: data.data?.currency || "EGP",
        fullResponse: data.data,
      },
    });
  } catch (error) {
    console.error("Error calculating shipping cost:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate shipping cost" },
      { status: 500 }
    );
  }
}
