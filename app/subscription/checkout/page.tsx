"use client";

import { useCart } from "@/providers/CartProvider";
import { useSession } from "next-auth/react";
import { thirdFont } from "@/fonts";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef, Suspense } from "react";
import { X, ShoppingBag, Zap, CreditCard, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import LoyaltyPointsSection from "@/components/LoyaltyPointsSection";
import BostaLocationSelector from "../../checkout/components/BostaLocationSelector";
import {
  BostaCity,
  BostaZone,
  BostaDistrict,
} from "@/app/services/bostaLocationService";
import DiscountSection from "../components/DiscountSection";
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SubscriptionConfig {
  cartItemId: string;
  packageId: string;
  packageName: string;
  tier: "full" | "mini";
  duration: number;
  price: number;
  imageUrl: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsAppNumber: string;
  isGift: boolean;
  giftRecipientEmail: string;
  giftCardName: string;
  specialMessage: string;
}

// Utility function to calculate shipping rate
const calculateShippingRate = (
  countryID: number,
  state: string,
  states: any[],
  countries: any[],
  shippingZones: any[]
): number => {
  if (countryID === 65 && states.length > 0) {
    const selectedState = states.find((s) => s.name === state);
    let zone = null;
    zone = shippingZones.find((z) => z._id === selectedState?.shipping_zone?.toString() && z.localGlobal === "local");
    if (!zone) {
      zone = shippingZones.find((z) => z.states && z.states.includes(selectedState?._id) && z.localGlobal === "local");
    }
    if (!zone) {
      zone = shippingZones.find((z) => z.states && z.states.includes(selectedState?.id?.toString()) && z.localGlobal === "local");
    }
    return zone ? zone.zone_rate.local : 70;
  } else {
    const selectedCountry = countries.find((c) => c.id === countryID);
    let zone = null;
    zone = shippingZones.find((z) => z._id === selectedCountry?.shipping_zone?.toString() && z.localGlobal === "global");
    if (!zone) {
      zone = shippingZones.find((z) => z.countries && z.countries.includes(selectedCountry?.name) && z.localGlobal === "global");
    }
    if (!zone) {
      zone = shippingZones.find((z) => z.countries && z.countries.includes(selectedCountry?.id?.toString()) && z.localGlobal === "global");
    }
    return zone ? zone.zone_rate.global : 65;
  }
};

const UnifiedCheckoutPage = () => {
  const router = useRouter();
  const { subscriptionItems, items: cartProducts, totalPrice: cartTotalPrice, clearCart, updateSubscriptionQuantity, updateQuantity, isCartLoaded } = useCart();
  const { isAuthenticated, loyaltyPoints, user } = useAuth();

  const [configs, setConfigs] = useState<SubscriptionConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<"card" | "instapay">("card");
  const [instapayReciept, setInstapayReciept] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [saveShippingData, setSaveShippingData] = useState(false);
  const paymentCompletedRef = useRef(false);

  // Shared shipping/billing states
  const [countryID, setCountryID] = useState(65); // Default to Egypt
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [shippingZones, setShippingZones] = useState<any[]>([]);
  const [shipping, setShipping] = useState(0);
  const [useSameAsShipping, setUseSameAsShipping] = useState(true);

  const [bostaLocation, setBostaLocation] = useState<{
    city: BostaCity | null;
    zone: BostaZone | null;
    district: BostaDistrict | null;
    shippingCost: {
      priceBeforeVat: number;
      priceAfterVat: number;
      shippingFee: number;
    } | null;
  }>({
    city: null,
    zone: null,
    district: null,
    shippingCost: null,
  });

  const [formData, setFormData] = useState({
    email: "", // Purchaser contact email
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    postalZip: "",
    city: "",
    state: "Alexandria",
    phone: "",
    whatsAppNumber: "",
    pickupFromBazar: false,
    country: "EG",

    // Billing
    billingCountry: "EG",
    billingFirstName: "",
    billingLastName: "",
    billingAddress: "",
    billingApartment: "",
    billingPostalZip: "",
    billingCity: "",
    billingState: "",
    billingPhone: "",
    billingWhatsAppNumber: "",
  });

  // Discount & Loyalty states
  const [appliedDiscount, setAppliedDiscount] = useState<any | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  const [subTotal, setSubTotal] = useState(0);
  const [total, setTotal] = useState(0);

  // Sync subscription items to config forms
  useEffect(() => {
    setConfigs((prev) => {
      const newConfigs: SubscriptionConfig[] = [];

      subscriptionItems.forEach((item) => {
        for (let index = 0; index < item.quantity; index++) {
          const configId = item.quantity > 1 ? `${item.cartItemId}-instance-${index}` : item.cartItemId;
          const label = item.quantity > 1 ? `${item.packageName} (${index + 1})` : item.packageName;

          const existing = prev.find((c) => c.cartItemId === configId);
          if (existing) {
            newConfigs.push(existing);
          } else {
            newConfigs.push({
              cartItemId: configId,
              packageId: item.packageId,
              packageName: label,
              tier: item.tier,
              duration: item.duration,
              price: item.price,
              imageUrl: item.imageUrl,
              email: "",
              firstName: "",
              lastName: "",
              phone: "",
              whatsAppNumber: "",
              isGift: false,
              giftRecipientEmail: "",
              giftCardName: "",
              specialMessage: "",
            });
          }
        }
      });

      return newConfigs;
    });
  }, [subscriptionItems]);

  // Redirect if cart is empty
  useEffect(() => {
    if (isCartLoaded && subscriptionItems.length === 0 && !paymentCompletedRef.current) {
      router.replace("/cart");
    }
  }, [isCartLoaded, subscriptionItems, router]);

  // Load countries, states, shipping zones, and saved profile data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [zonesResponse, countriesResponse, statesResponse] =
          await Promise.all([
            axios.get("/api/shipping"),
            axios.get("/api/countries"),
            axios.get(`/api/states?countryID=${65}`),
          ]);

        setShippingZones(zonesResponse.data);
        setCountries(countriesResponse.data);
        setStates(statesResponse.data);

        // Autofill from user profile if authenticated
        if (isAuthenticated && user?.email) {
          const profileRes = await axios.get(`/api/user/profile?email=${user.email}`);
          if (profileRes.data.user?.shippingData) {
            const sd = profileRes.data.user.shippingData;
            setFormData((prev) => ({
              ...prev,
              email: sd.email || user.email || "",
              firstName: sd.firstName || "",
              lastName: sd.lastName || "",
              address: sd.address || "",
              apartment: sd.apartment || "",
              phone: sd.phone || "",
              whatsAppNumber: sd.whatsAppNumber || "",
              bostaCity: sd.bostaCity || "",
              bostaCityName: sd.bostaCityName || "",
              bostaZone: sd.bostaZone || "",
              bostaZoneName: sd.bostaZoneName || "",
              bostaDistrict: sd.bostaDistrict || "",
              bostaDistrictName: sd.bostaDistrictName || "",
            }));

            if (sd.bostaCity) {
              setBostaLocation((prev) => ({
                ...prev,
                city: sd.bostaCity ? ({ _id: sd.bostaCity, name: sd.bostaCityName || "" } as any) : null,
                zone: sd.bostaZone ? ({ _id: sd.bostaZone, name: sd.bostaZoneName || "" } as any) : null,
                district: sd.bostaDistrict ? ({ districtId: sd.bostaDistrict, districtName: sd.bostaDistrictName || "" } as any) : null,
              }));
            }
          } else {
            setFormData((prev) => ({ ...prev, email: user.email || "" }));
          }
        }
      } catch (error) {
        console.error("Error fetching setup data:", error);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);

  // Handle Bosta location updates
  const handleBostaLocationChange = (location: {
    city: BostaCity | null;
    zone: BostaZone | null;
    district: BostaDistrict | null;
    shippingCost: {
      priceBeforeVat: number;
      priceAfterVat: number;
      shippingFee: number;
    } | null;
  }) => {
    setBostaLocation(location);
    if (location.shippingCost) {
      setShipping(location.shippingCost.shippingFee);
    }
  };

  // Recalculate shipping based on state
  useEffect(() => {
    if (countryID !== 65 && shippingZones.length > 0 && countries.length > 0) {
      const rate = calculateShippingRate(countryID, formData.state, states, countries, shippingZones);
      setShipping(rate);
    }
  }, [countryID, formData.state, states, countries, shippingZones]);

  // Recalculate Subtotal, Discounts, Loyalty, and Final Total
  useEffect(() => {
    const subscriptionsSum = subscriptionItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const productsSum = cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const calculatedSubTotal = subscriptionsSum + productsSum;
    setSubTotal(calculatedSubTotal);

    // Shipping calculations (free shipping if subtotal > 2000 or full experience package ID present)
    const hasFreeShippingPackage = subscriptionItems.some(
      (item) => item.packageId === "687396821b4da119eb1c13fe" || item.packageId === "6965e63c6df4503dda02c12b"
    );
    const isFreeShipping = calculatedSubTotal > 2000 || hasFreeShippingPackage;

    let effectiveShipping = isFreeShipping ? 0 : shipping;
    let newDiscountAmount = 0;

    if (appliedDiscount) {
      if (appliedDiscount.calculationType === "PERCENTAGE") {
        newDiscountAmount = Math.round((calculatedSubTotal * appliedDiscount.value) / 100);
      } else if (appliedDiscount.calculationType === "FIXED_AMOUNT") {
        newDiscountAmount = appliedDiscount.value;
      } else if (appliedDiscount.calculationType === "FREE_SHIPPING") {
        effectiveShipping = 0;
        newDiscountAmount = shipping;
      }
    }
    setDiscountAmount(newDiscountAmount);

    let validRedeem = Math.max(
      0,
      Math.min(
        redeemPoints - (redeemPoints % 20),
        loyaltyPoints?.realLoyaltyPoints || 0
      )
    );
    const loyaltyLE = Math.floor(validRedeem / 20);
    setLoyaltyDiscount(loyaltyLE);

    // Selected Gift Cards cost (+20 LE per gift card checked)
    const giftCardsCost = configs.reduce((sum, item) => sum + (item.isGift && item.giftCardName ? 20 : 0), 0);

    const finalTotal = Math.max(
      0,
      calculatedSubTotal - newDiscountAmount - loyaltyLE + effectiveShipping + giftCardsCost
    );
    setTotal(finalTotal);
  }, [configs, cartProducts, shipping, appliedDiscount, redeemPoints, loyaltyPoints, subscriptionItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfigChange = (index: number, name: keyof SubscriptionConfig, value: any) => {
    setConfigs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [name]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Validate shared shipping address
    if (!formData.firstName || !formData.lastName || !formData.address || !formData.phone) {
      alert("Please fill in all shipping details.");
      setLoading(false);
      return;
    }

    // 1b. Validate Bosta location fields for Egypt
    if (countryID === 65) {
      if (!bostaLocation.city) {
        alert("Please select a Governorate.");
        setLoading(false);
        return;
      }
      if (!bostaLocation.zone) {
        alert("Please select a zone.");
        setLoading(false);
        return;
      }
      if (!bostaLocation.district) {
        alert("Please select a district.");
        setLoading(false);
        return;
      }
    }

    // 2. Validate individual subscription configs
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      const orderNum = i + 1;
      if (!config.isGift) {
        if (!config.email) {
          alert(`Please fill in the email for Subscription #${orderNum} (${config.packageName}).`);
          setLoading(false);
          return;
        }
        if (!config.firstName || !config.lastName) {
          alert(`Please fill in the name fields for Subscription #${orderNum}.`);
          setLoading(false);
          return;
        }
        if (!config.phone) {
          alert(`Please fill in the phone number for Subscription #${orderNum}.`);
          setLoading(false);
          return;
        }
      }
    }

    // 3. Instapay screenshot validation
    if (payment === "instapay" && !instapayReciept) {
      alert("Please upload your Instapay screenshot to proceed.");
      setLoading(false);
      return;
    }

    // 4. Map the payload
    const billingDetails = useSameAsShipping
      ? {
        billingCountry: formData.country,
        billingFirstName: formData.firstName,
        billingLastName: formData.lastName,
        billingAddress: formData.address,
        billingApartment: formData.apartment,
        billingPostalZip: formData.postalZip,
        billingCity: bostaLocation.city?.name || formData.city,
        billingState: bostaLocation.zone?.name || formData.state,
        billingPhone: formData.phone,
        billingWhatsAppNumber: formData.whatsAppNumber,
      }
      : {
        billingCountry: formData.billingCountry,
        billingFirstName: formData.billingFirstName,
        billingLastName: formData.billingLastName,
        billingAddress: formData.billingAddress,
        billingApartment: formData.billingApartment,
        billingPostalZip: formData.billingPostalZip,
        billingCity: formData.billingCity,
        billingState: formData.billingState,
        billingPhone: formData.billingPhone,
        billingWhatsAppNumber: formData.billingWhatsAppNumber,
      };

    const payload = {
      ...formData,
      ...billingDetails,
      city: bostaLocation.city?.name || formData.city,
      state: bostaLocation.zone?.name || formData.state,
      bostaCity: bostaLocation.city?._id || "",
      bostaCityName: bostaLocation.city?.name || "",
      bostaZone: bostaLocation.zone?._id || "",
      bostaZoneName: bostaLocation.zone?.name || "",
      bostaDistrict: bostaLocation.district?.districtId || "",
      bostaDistrictName: bostaLocation.district?.districtName || "",

      subscriptions: configs.map((c) => ({
        packageId: c.packageId,
        packageName: c.packageName,
        price: c.price,
        duration: c.duration,
        tier: c.tier,
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        whatsAppNumber: c.whatsAppNumber,
        isGift: c.isGift,
        giftRecipientEmail: c.isGift ? c.email : undefined,
        giftCardName: c.giftCardName,
        specialMessage: c.specialMessage,
      })),
      cart: cartProducts,
      paymentMethod: payment,
      cash: payment, // Aligning field naming conventions
      instapayReciept: payment === "instapay" ? instapayReciept : undefined,
      appliedDiscount: appliedDiscount?._id,
      appliedDiscountAmount: discountAmount,
      loyalty: {
        redeemedPoints: Math.max(
          0,
          Math.min(
            redeemPoints - (redeemPoints % 20),
            loyaltyPoints?.realLoyaltyPoints || 0
          )
        ),
        discount: loyaltyDiscount,
      },
      subTotal,
      shipping,
      total,
      currency: "EGP",
    };

    try {
      const res = await axios.post("/api/subscription-cart-payment", payload);

      // Save shipping profile if requested
      if (saveShippingData && isAuthenticated && user?.email) {
        await axios.put("/api/user/profile", {
          email: user.email,
          shippingData: {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            apartment: formData.apartment,
            phone: formData.phone,
            whatsAppNumber: formData.whatsAppNumber,
            bostaCity: bostaLocation.city?._id || "",
            bostaCityName: bostaLocation.city?.name || "",
            bostaZone: bostaLocation.zone?._id || "",
            bostaZoneName: bostaLocation.zone?.name || "",
            bostaDistrict: bostaLocation.district?.districtId || "",
            bostaDistrictName: bostaLocation.district?.districtName || "",
          },
        });
      }

      paymentCompletedRef.current = true;
      clearCart();
      setLoading(false);

      if (payment === "card") {
        const paymobUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${process.env.NEXT_PUBLIC_PaymobPublicKey}&clientSecret=${res.data.token}`;
        window.location.href = paymobUrl;
      } else if (payment === "instapay") {
        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201007728799";
        router.push(
          `/subscription/instapay-success?total=${total}&whatsapp=${whatsappNumber}&subscriptionId=${res.data.subscriptionId}`
        );
      }
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || error?.response?.data?.error || "Payment generation failed.");
      setLoading(false);
    }
  };

  return (
    <div className={`container-custom py-8 md:py-12 justify-between text-lovely min-h-screen bg-creamey flex flex-col`}>
      <h1 className={`${thirdFont.className} tracking-normal text-2xl text-lovely md:text-4xl mb-4 md:mb-8 font-semibold`}>
        Checkout

      </h1>
      {/* Subscription Checkout */}

      <div className="w-full flex flex-col-reverse lg:flex-row gap-8">
        {/* Left Side Forms */}
        <form onSubmit={handleSubmit} className="flex flex-col items-start w-full lg:w-5/7 gap-6">

          {/* Contact Info Section */}
          <div className="w-full">
            <h2 className={`${thirdFont.className} w-full text-lg lg:text-2xl border-b border-lovely pb-1 mb-1`}>
              Contact Info
            </h2>
            <p className="text-lovely/60 text-xs mb-4">Shipping company may contact you</p>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-lovely text-sm">Contact Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value.toLowerCase() }))}
                    className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base lowercase"
                    required
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-lovely text-sm">Receiver Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-lovely text-sm">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base"
                    required
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-lovely text-sm">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-lovely text-sm">WhatsApp Number (Optional)</label>
                <input
                  type="text"
                  name="whatsAppNumber"
                  value={formData.whatsAppNumber}
                  onChange={handleInputChange}
                  className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address Section */}
          <div className="w-full">
            <h2 className={`${thirdFont.className} w-full text-lg lg:text-2xl border-b border-lovely pb-1 mb-4`}>
              Shipping Address
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-lovely text-sm">Address Details</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base"
                  required
                />
              </div>

              {/* <div className="flex flex-col gap-1">
                <label className="text-lovely text-sm">Apartment, suite, etc. (Optional)</label>
                <input
                  type="text"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleInputChange}
                  className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base"
                />
              </div> */}

              {countryID === 65 ? (
                <BostaLocationSelector
                  onLocationChange={handleBostaLocationChange}
                  selectedCity={bostaLocation.city?._id}
                  selectedZone={bostaLocation.zone?._id}
                  selectedDistrict={bostaLocation.district?.districtId}
                  orderTotal={subTotal}
                />
              ) : (
                <div className="flex flex-col gap-1">
                  <label className="text-lovely text-sm">State/Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Subscriptions Settings Cards */}
          <div className="w-full space-y-6">
            <h2 className={`${thirdFont.className} w-full text-lg lg:text-2xl border-b border-lovely pb-1`}>
              Subscriptions Configuration
            </h2>
            {configs.map((config, index) => (
              <div
                key={config.cartItemId}
                className="w-full bg-creamey/30 rounded-2xl border-2 border-lovely/20 p-6 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-lovely/10 pb-2">
                  <h3 className="font-bold text-lovely text-base lg:text-lg">
                    ✨ Subscription #{index + 1}: {config.packageName}
                  </h3>
                  <span className="text-xs bg-lovely text-creamey px-2 py-0.5 rounded-full capitalize">
                    {config.tier} • {config.duration}m
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-lovely text-sm">Bride's Email</label>
                    <input
                      type="email"
                      value={config.email}
                      onChange={(e) => handleConfigChange(index, "email", e.target.value.toLowerCase())}
                      className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base lowercase"
                      required={!config.isGift}
                    />
                    {config.isGift && (
                      <p className="text-[11px] text-lovely/85 mt-1 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                        🤫 Don't worry, we will not send a mail to the bride and spoil the surprise!
                      </p>
                    )}
                    {config.isGift && (
                      <p className="text-[11px] text-lovely/85  font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                        if it's not available just let it empty.
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-lovely text-sm">Bride's Phone Number</label>
                    <input
                      type="text"
                      value={config.phone}
                      onChange={(e) => handleConfigChange(index, "phone", e.target.value)}
                      className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base"
                      required={!config.isGift}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-lovely text-sm">Bride's First Name</label>
                    <input
                      type="text"
                      value={config.firstName}
                      onChange={(e) => handleConfigChange(index, "firstName", e.target.value)}
                      className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base"
                      required={!config.isGift}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-lovely text-sm">Bride's Last Name</label>
                    <input
                      type="text"
                      value={config.lastName}
                      onChange={(e) => handleConfigChange(index, "lastName", e.target.value)}
                      className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base"
                      required={!config.isGift}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-lovely text-sm">Bride's WhatsApp (Optional)</label>
                  <input
                    type="text"
                    value={config.whatsAppNumber}
                    onChange={(e) => handleConfigChange(index, "whatsAppNumber", e.target.value)}
                    className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base"
                  />
                </div>

                {/* Gift Switch */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id={`gift-${config.cartItemId}`}
                    checked={config.isGift}
                    onChange={(e) => handleConfigChange(index, "isGift", e.target.checked)}
                    className="w-4 h-4 accent-lovely cursor-pointer"
                  />
                  <label htmlFor={`gift-${config.cartItemId}`} className="text-lovely text-sm font-semibold cursor-pointer">
                    Buy this specific subscription as a gift 🎁
                  </label>
                </div>

                {config.isGift && (
                  <div className="bg-lovely/5 p-4 rounded-xl border border-lovely/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {config.tier !== "mini" && (
                      <p className="text-sm text-lovely font-medium bg-lovely/10 p-3 rounded-lg border border-lovely/20">
                        Please notify us when the gift reaches the bride to add her in the whatsapp support group
                      </p>
                    )}

                    {/* <div className="flex flex-col gap-1">

                      <label className="text-lovely text-sm">Special Message for the Bride</label>
                      <textarea
                        value={config.specialMessage}
                        onChange={(e) => handleConfigChange(index, "specialMessage", e.target.value)}
                        className="w-full h-20 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base"
                        placeholder="Write a lovely note..."
                      />
                    </div> */}

                    {/* Gift Cards Cards Selector */}
                    <div className="space-y-2">
                      <label className="text-lovely text-sm block">Include a Gift Card (+20 LE)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: "Born to shine birthday gift card", label: "Birthday Card", src: "/giftCard/Born to shine birthday gift card.jpeg" },
                          { name: "The I love you more than words gift card", label: "Love Card", src: "/giftCard/The I love you more than words gift card.jpeg" },
                          { name: "The Wifey to be card", label: "Wifey to be", src: "/giftCard/The Wifey to be card.jpeg" },
                          { name: "Merry and Married", label: "Merry & Married", src: "/cristmas/merryAndMarried.jpeg" },
                        ].map((card) => (
                          <div
                            key={card.name}
                            onClick={() => handleConfigChange(
                              index,
                              "giftCardName",
                              config.giftCardName === card.name ? "" : card.name
                            )}
                            className={`cursor-pointer rounded-lg overflow-hidden border-2 p-1 relative ${config.giftCardName === card.name ? "border-lovely bg-lovely/5" : "border-transparent"
                              }`}
                          >
                            <img src={card.src} alt={card.label} className="w-full h-16 object-cover rounded" />
                            <div className="text-[10px] text-center text-lovely truncate mt-1">{card.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Payment Method Selector */}
          <div className="w-full">
            <h2 className={`${thirdFont.className} w-full text-lg lg:text-2xl border-b border-lovely pb-1 mb-4`}>
              Payment Method
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="paymob-card"
                  name="payment"
                  checked={payment === "card"}
                  onChange={() => setPayment("card")}
                  className="w-4 h-4 accent-lovely cursor-pointer"
                />
                <label htmlFor="paymob-card" className="text-base cursor-pointer">Pay with card / wallet</label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="instapay-pay"
                  name="payment"
                  checked={payment === "instapay"}
                  onChange={() => setPayment("instapay")}
                  className="w-4 h-4 accent-lovely cursor-pointer"
                />
                <label htmlFor="instapay-pay" className="text-base cursor-pointer">Pay with Instapay</label>
              </div>

              {payment === "instapay" && (
                <div className="mt-4 p-4 border border-lovely/20 rounded-xl bg-lovely/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 text-lovely font-semibold">
                    <span className="p-1 bg-lovely/10 rounded-full">💰</span>
                    <p className="text-sm">Instapay Instructions</p>
                  </div>
                  <div className="text-[13px] text-lovely space-y-2 bg-white/50 p-3 rounded-lg border border-lovely/10">
                    <p className="flex gap-2">
                      <span className="font-bold text-lovely">1.</span>
                      <span>Open <b>Instapay</b> app and choose <b>"Send Money"</b></span>
                    </p>
                    <p className="flex gap-2">
                      <span className="font-bold text-lovely">2.</span>
                      <span>Select <b>"Bank Account"</b></span>
                    </p>
                    <p className="flex gap-2">
                      <span className="font-bold text-lovely">3.</span>
                      <span>Enter Account: <b className="font-mono text-sm select-all bg-lovely/10 px-1 rounded">15018180131666</b></span>
                    </p>
                    <p className="flex gap-2">
                      <span className="font-bold text-lovely">4.</span>
                      <span>Select <b>Credit Agricole</b> as bank</span>
                    </p>
                    <p className="flex gap-2">
                      <span className="font-bold text-lovely">5.</span>
                      <span>Receiver Name: <b>Wifey</b></span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-lovely">Upload Receipt Screenshot</label>
                    <CldUploadWidget
                      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"}
                      onSuccess={(result: any) => {
                        if (result.info && typeof result.info !== "string") {
                          setInstapayReciept(result.info.secure_url);
                        }
                      }}
                    >
                      {({ open }) => (
                        <button
                          type="button"
                          onClick={() => open()}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-lovely/30 text-lovely rounded-xl hover:bg-lovely/5 hover:border-lovely/50 transition-all text-sm font-medium"
                        >
                          {instapayReciept ? "✓ Receipt Uploaded (Change)" : "📸 Upload Receipt"}
                        </button>
                      )}
                    </CldUploadWidget>

                    {instapayReciept && (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-lovely/20 mt-2">
                        <Image src={instapayReciept} alt="Instapay Receipt" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Billing Section */}
          {/* <div className="w-full">
            <h2 className={`${thirdFont.className} w-full text-lg lg:text-2xl border-b border-lovely pb-1 mb-4`}>
              Billing Address
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="billingAddress"
                    checked={useSameAsShipping}
                    onChange={() => setUseSameAsShipping(true)}
                    className="w-4 h-4 accent-lovely cursor-pointer"
                  />
                  <span>Same as shipping address</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="billingAddress"
                    checked={!useSameAsShipping}
                    onChange={() => setUseSameAsShipping(false)}
                    className="w-4 h-4 accent-lovely cursor-pointer"
                  />
                  <span>Use a different billing address</span>
                </label>
              </div>

              {!useSameAsShipping && (
                <div className="space-y-4 border border-lovely/20 p-4 rounded-2xl bg-lovely/5 transition-all duration-300">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-grow flex flex-col gap-1">
                      <label className="text-lovely text-sm">First Name</label>
                      <input
                        type="text"
                        name="billingFirstName"
                        value={formData.billingFirstName}
                        onChange={handleInputChange}
                        className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base"
                      />
                    </div>
                    <div className="flex-grow flex flex-col gap-1">
                      <label className="text-lovely text-sm">Last Name</label>
                      <input
                        type="text"
                        name="billingLastName"
                        value={formData.billingLastName}
                        onChange={handleInputChange}
                        className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-lovely text-sm">Address</label>
                    <input
                      type="text"
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                      className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-lovely text-sm">City</label>
                      <input
                        type="text"
                        name="billingCity"
                        value={formData.billingCity}
                        onChange={handleInputChange}
                        className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-lovely text-sm">State</label>
                      <input
                        type="text"
                        name="billingState"
                        value={formData.billingState}
                        onChange={handleInputChange}
                        className="w-full h-10 bg-creamey border border-pinkey rounded-2xl py-2 px-3 text-base"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Terms & Submit */}
          <div className="w-full space-y-4 mt-4">
          {isAuthenticated && (
            <div className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                id="save-profile"
                checked={saveShippingData}
                onChange={(e) => setSaveShippingData(e.target.checked)}
                className="w-4 h-4 accent-lovely cursor-pointer"
              />
              <label htmlFor="save-profile" className="text-sm cursor-pointer">
                Save my shipping data for next time
              </label>
            </div>
          )}
            <div className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                id="accept-terms"
                checked={acceptedTerms}
                onChange={() => setAcceptedTerms(!acceptedTerms)}
                className="w-4 h-4 accent-lovely cursor-pointer"
              />
              <label htmlFor="accept-terms" className="text-sm cursor-pointer">
                By checking, you agree to the{" "}
                <Link href="/policies?terms-and-conditions" className="underline font-bold" target="_blank">
                  terms and conditions
                </Link>
              </label>
            </div>


            <button
              type="submit"
              disabled={loading || !acceptedTerms}
              className={`w-full py-4 text-base font-bold tracking-wider rounded-2xl transition duration-300 ${loading || !acceptedTerms
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-lovely text-creamey hover:bg-lovely/90 cursor-pointer shadow-lg shadow-lovely/10"
                }`}
            >
              {loading ? "PROCESSING..." : "PROCEED TO PAYMENT"}
            </button>
          </div>
        </form>

        {/* Right Side Summary */}
        <div className="w-full lg:w-2/7 py-1">
          <div className="lg:border-l border-lovely/30 lg:pl-6 sticky top-4 space-y-6">

            {/* Products & Subscriptions summary list */}
            <div className="bg-pinkey text-lovely rounded-2xl p-6 border border-lovely shadow-md">
              <h3 className={`${thirdFont.className} text-xl tracking-wide font-bold mb-4 border-b border-lovely/20 pb-2`}>
                Order Summary
              </h3>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {subscriptionItems.map((sub, idx) => (
                  <div key={sub.cartItemId} className="flex   gap-3 text-sm">
                    <div className="relative w-12 h-12 border-lovely/80 border-2 rounded overflow-hidden flex-shrink-0">
                      <Image src={sub.imageUrl} alt={sub.packageName} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{sub.packageName}</p>
                      <div className="flex flex-col gap-0.5">
                        {sub.duration > 0 && (
                          <p className="text-xs text-creamey/85">{sub.duration}m Subscription</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => updateSubscriptionQuantity(sub.cartItemId, sub.quantity - 1)}
                            className="w-5 h-5 rounded-full border border-lovely/30 flex items-center justify-center text-xs hover:bg-lovely hover:text-creamey transition-colors"
                          >
                            -
                          </button>
                          <span className="text-xs font-semibold">{sub.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateSubscriptionQuantity(sub.cartItemId, sub.quantity + 1)}
                            className="w-5 h-5 rounded-full border border-lovely/30 flex items-center justify-center text-xs hover:bg-lovely hover:text-creamey transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="font-semibold text-right">LE {sub.price * sub.quantity}</p>
                  </div>
                ))}

                {cartProducts.map((prod, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      <Image src={prod.imageUrl} alt={prod.productName} fill className="object-cover border-lovely/80 border-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{prod.productName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(prod.productId, prod.quantity - 1, prod.variant, prod.attributes)}
                          className="w-5 h-5 rounded-full border border-lovely/30 flex items-center justify-center text-xs hover:bg-lovely hover:text-creamey transition-colors"
                        >
                          -
                        </button>
                        <span className="text-xs font-semibold">{prod.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(prod.productId, prod.quantity + 1, prod.variant, prod.attributes)}
                          className="w-5 h-5 rounded-full border border-lovely/30 flex items-center justify-center text-xs hover:bg-lovely hover:text-creamey transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className="font-semibold text-right">LE {prod.price * prod.quantity}</p>
                  </div>
                ))}
              </div>
            </div>

            <DiscountSection
              redeemType="Subscription"
              onDiscountApplied={setAppliedDiscount}
              packagePrice={subscriptionItems.reduce((sum, item) => sum + item.price * item.quantity, 0)}
            />

            <LoyaltyPointsSection
              loyaltyPoints={loyaltyPoints}
              redeemPoints={redeemPoints}
              setRedeemPoints={setRedeemPoints}
              loyaltyDiscount={loyaltyDiscount}
              setLoyaltyDiscount={setLoyaltyDiscount}
              isAuthenticated={isAuthenticated}
              showTooltip={showTooltip}
              setShowTooltip={setShowTooltip}
            />

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-lovely pt-4 border-t border-lovely/10">
              <div className="flex justify-between text-base">
                <span>Subtotal</span>
                <span>{subTotal} LE</span>
              </div>

              {appliedDiscount && (
                <div className="flex justify-between text-base text-green-600">
                  <span>Discount ({appliedDiscount.code})</span>
                  <span>
                    {appliedDiscount.calculationType === "FREE_SHIPPING"
                      ? `-${shipping} LE (Free Shipping)`
                      : `-${discountAmount} LE`}
                  </span>
                </div>
              )}

              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-base text-green-600">
                  <span>Loyalty Points Redeem</span>
                  <span>-{loyaltyDiscount} LE</span>
                </div>
              )}

              <div className="flex justify-between text-base">
                {appliedDiscount?.calculationType === "FREE_SHIPPING" || subTotal > 2000 || subscriptionItems.some((item) => item.packageId === "687396821b4da119eb1c13fe" || item.packageId === "6965e63c6df4503dda02c12b") ? (
                  <>
                    <span className="line-through">Shipping</span>
                    <span className="line-through">{shipping} LE</span>
                  </>
                ) : (
                  <>
                    <span>Shipping</span>
                    <span>{shipping} LE</span>
                  </>
                )}
              </div>

              {configs.reduce((sum, item) => sum + (item.isGift && item.giftCardName ? 20 : 0), 0) > 0 && (
                <div className="flex justify-between text-base">
                  <span>Gift Cards cost</span>
                  <span>+{configs.reduce((sum, item) => sum + (item.isGift && item.giftCardName ? 20 : 0), 0)} LE</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-lovely">
                <span>Total</span>
                <span>{total} LE</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default function CheckoutPageWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-128px)] flex w-full justify-center items-center text-lovely">
          Loading Checkout ...
        </div>
      }
    >
      <UnifiedCheckoutPage />
    </Suspense>
  );
}
