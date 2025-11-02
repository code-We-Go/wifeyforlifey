"use client";
// import BigCartItem from '@/app/components/BigCartItem';
import OrderSummaryItem from "./../components/OrderSummaryItem";
import { cartContext } from "@/app/context/cartContext";
import { CartProvider, useCart } from "@/providers/CartProvider";
import { useSession } from "next-auth/react";

import { userContext } from "@/app/context/userContext";
import { thirdFont } from "@/fonts";
import orderValidation from "@/lib/validations/orderValidation";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState, Suspense } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { X } from "lucide-react";
import { Discount } from "../../types/discount";
import CartItemSmall from "../../cart/CartItemSmall";
import { ShippingZone } from "../../interfaces/interfaces";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { Ipackage } from "@/app/interfaces/interfaces";
import WiigSpinner from "@/app/components/WiigSpinner";
import LoyaltyPointsSection from "@/components/LoyaltyPointsSection";
import BostaLocationSelector from "../../checkout/components/BostaLocationSelector";
import {
  BostaCity,
  BostaZone,
  BostaDistrict,
} from "@/app/services/bostaLocationService";
import DiscountSection from "../components/DiscountSection";

// Utility function to calculate shipping rate
const calculateShippingRate = (
  countryID: number,
  state: string,
  states: any[],
  countries: any[],
  shippingZones: ShippingZone[]
): number => {
  console.log("calculateShippingRate called with:", {
    countryID,
    state,
    statesCount: states.length,
    countriesCount: countries.length,
    shippingZonesCount: shippingZones.length,
  });

  if (countryID === 65 && states.length > 0) {
    // Local shipping - based on state
    const selectedState = states.find((s) => s.name === state);
    console.log("Selected state:", selectedState);

    // Try multiple matching strategies
    let zone = null;

    // Strategy 1: Match by _id with shipping_zone
    zone = shippingZones.find((z) => {
      console.log(
        "Strategy 1 - Checking zone:",
        z._id,
        "against state shipping_zone:",
        selectedState?.shipping_zone
      );
      return (
        z._id === selectedState?.shipping_zone.toString() &&
        z.localGlobal === "local"
      );
    });

    // Strategy 2: If not found, try matching by state name in states array
    if (!zone) {
      zone = shippingZones.find((z) => {
        console.log(
          "Strategy 2 - Checking zone states array:",
          z.states,
          "for state _id:",
          selectedState?._id
        );
        return (
          z.states &&
          z.states.includes(selectedState?._id) &&
          z.localGlobal === "local"
        );
      });
    }

    // Strategy 3: If still not found, try matching by state ID in states array
    if (!zone) {
      zone = shippingZones.find((z) => {
        console.log(
          "Strategy 3 - Checking zone states array:",
          z.states,
          "for state ID:",
          selectedState?.id
        );
        return (
          z.states &&
          z.states.includes(selectedState?.id.toString()) &&
          z.localGlobal === "local"
        );
      });
    }

    console.log("Found local zone:", zone);
    return zone ? zone.zone_rate.local : 70; // Default local rate
  } else {
    // Global shipping - based on country
    const selectedCountry = countries.find((c) => c.id === countryID);
    console.log("Selected country:", selectedCountry);

    // Try multiple matching strategies
    let zone = null;

    // Strategy 1: Match by _id with shipping_zone
    zone = shippingZones.find((z) => {
      console.log(
        "Strategy 1 - Checking zone:",
        z._id,
        "against country shipping_zone:",
        selectedCountry?.shipping_zone
      );
      return (
        z._id === selectedCountry?.shipping_zone?.toString() &&
        z.localGlobal === "global"
      );
    });

    // Strategy 2: If not found, try matching by country name in countries array
    if (!zone) {
      zone = shippingZones.find((z) => {
        console.log(
          "Strategy 2 - Checking zone countries array:",
          z.countries,
          "for country:",
          selectedCountry?.name
        );
        return (
          z.countries &&
          z.countries.includes(selectedCountry?.name) &&
          z.localGlobal === "global"
        );
      });
    }

    // Strategy 3: If still not found, try matching by country ID in countries array
    if (!zone) {
      zone = shippingZones.find((z) => {
        console.log(
          "Strategy 3 - Checking zone countries array:",
          z.countries,
          "for country ID:",
          selectedCountry?.id
        );
        return (
          z.countries &&
          z.countries.includes(selectedCountry?.id.toString()) &&
          z.localGlobal === "global"
        );
      });
    }

    console.log("Found global zone:", zone);
    return zone ? zone.zone_rate.global : 65; // Default global rate
  }
};

const SubscriptionPage = () => {
  // let subTotal=0;
  // let total = 0;
  // const []
  //  const[countries,setCountries]=useState([]);
  const { packageID } = useParams();
  const [packageData, setPackageData] = useState<Ipackage | null>(null);
  const [loadingPackage, setLoadingPackage] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const { isAuthenticated, loyaltyPoints } = useAuth();
  const [loading, setLoading] = useState(false);
  // const [shipping, setShipping] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [bostaLocation, setBostaLocation] = useState<{
    city: BostaCity | null;
    zone: BostaZone | null;
    district: BostaDistrict | null;
    shippingCost: {
      priceBeforeVat: number;
      priceAfterVat: number;
      shippingFee: number;
    };
  }>({
    city: null,
    zone: null,
    district: null,
    shippingCost: { priceBeforeVat: 70, priceAfterVat: 80, shippingFee: 70 },
  });
  const [payment, setPayment] = useState<"card" | "cash">("card");
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Package-specific modal content
  const getModalContent = (packageId: string) => {
    const packageContents = {
      "687396821b4da119eb1c13fe": {
        header: "Batch 3 is officially SOLD OUT!",
        content: `Please note that this order is a pre-order, and your planner will be shipped starting November 10th.

  While you wait for your gehaz bestie to arrive, you can already enjoy:
  ✨ Wifey's curated playlists
  ✨ Exclusive partner discounts
  ✨ Access to supportive Wifey circles

  Thank you for your patience and love — we can't wait for you to unwrap your planner! 💗`,
      },
      "68bf6ae9c4d5c1af12cdcd37": {
        header: "Batch 3 is officially SOLD OUT!",
        content: `Please note that this order is a pre-order, and your gehaz bestie planner will be shipped starting November 10th.

  After completing your purchase, you'll receive an email with a tracking link so you can follow your planner's journey.

  We're beyond excited to share this experience with you — your planner will be on its way very soon! ✨`,
      },
    };

    return packageContents[packageId as keyof typeof packageContents] || null;
  };
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    clearCart,
  } = useCart();
  const [countries, setCountries] = useState<Country[]>([]);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [summary, setSummary] = useState(false);
  const [subTotal, setSubTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [formErrors, setFormErrors] = useState<any>({});
  const [countryID, setCountryID] = useState(65);
  const [billingCountry, setBillingCountry] = useState(65);
  const [states, setStates] = useState<
    { name: string; shipping_zone: string }[]
  >([]);
  const [useSameAsShipping, setUseSameAsShipping] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // const [state,setState]=useState(states.length>0?states[0].name:'')
  const [state, setState] = useState("Alexandria"); // Default to the first state's name or an empty string
  const [billingState, setBillingState] = useState("Alexandria");
  const handleRedeemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value) || 0;
    setRedeemPoints(value);
  };
  const handleDiscountApplied = (discount: Discount | null) => {
    // alert(discount?.calculationType)
    setAppliedDiscount(discount);
    if (discount && discount.calculationType === "FREE_SHIPPING") {
      // Check if package price meets minimum order amount required for the discount
      if (
        !discount.conditions?.minimumOrderAmount ||
        (packageData?.price &&
          packageData.price >= discount.conditions.minimumOrderAmount)
      ) {
        setShipping(0);
      }
    }
  }; // Default to the first state's name or an empty string
  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      total: total,
      shipping: shipping,
      subTotal: subTotal,
      cart: items,
    }));
  }, [items]);
  useEffect(() => {
    const countryName = countries.find((countryy) => countryy.id === countryID);

    setFormData((prevFormData) => ({
      ...prevFormData,
      total: total,
      shipping: shipping,
      subTotal: subTotal,
      country: countryName ? countryName.name : "",
    }));
  }, [total, countryID, countries]);

  // Handle Bosta location changes
  const handleBostaLocationChange = (location: {
    city: BostaCity | null;
    zone: BostaZone | null;
    district: BostaDistrict | null;
    shippingCost: {
      priceBeforeVat: number;
      priceAfterVat: number;
      shippingFee: number;
    };
  }) => {
    setBostaLocation(location);
    // Always maintain shipping cost regardless of Bosta Zone selection
    // Only apply free shipping if discount is specifically for FREE_SHIPPING
    if (
      !appliedDiscount ||
      appliedDiscount.calculationType !== "FREE_SHIPPING" ||
      // Check if package price meets minimum order amount required for the discount
      (appliedDiscount.conditions?.minimumOrderAmount &&
        packageData?.price! < appliedDiscount.conditions.minimumOrderAmount)
    ) {
      // Keep the shipping cost even when Bosta Zone is selected
      // if (location.city && location.zone) {
      //   // Maintain shipping cost when zone is selected
      //   setShipping(location.shippingCost.priceBeforeVat);
      // }
      if (location.city) {
        // Set shipping when only city is selected
        setShipping(location.shippingCost.priceBeforeVat);
      }
    } else {
      // Ensure shipping is set to 0 when free shipping discount is applied
      // and package price meets minimum order amount
      setShipping(0);
    }

    // Update formData with Bosta location details
    setFormData((prevFormData) => ({
      ...prevFormData,
      state: location.city?._id || prevFormData.state,
      city: location.city?.name || prevFormData.city,
      zone: location.zone?._id || "",
      district: location.district?.districtId || "",
      shipping: shipping,
    }));
  };

  const [isGift, setIsGift] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    country: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    postalZip: "0000",
    city: "",
    cart: items,
    phone: "",
    whatsAppNumber: "", // Added WhatsApp number field
    subscription: packageID,
    state: bostaLocation.city?._id || "",
    zone: bostaLocation.zone?._id || "",
    district: bostaLocation.district?.districtId || "",
    cash: payment,
    total: total,
    shipping: shipping,
    isGift: false,
    giftRecipientEmail: "",
    specialMessage: "",
    giftCardName: "",
    redeemedLoyaltyPoints: Math.max(
      0,
      Math.min(
        redeemPoints - (redeemPoints % 20),
        loyaltyPoints.realLoyaltyPoints
      )
    ),

    billingCountry: "",
    billingFirstName: "",
    billingLastName: "",
    billingState: bostaLocation.city?._id || "",
    billingAddress: "",
    billingApartment: "",
    billingPostalZip: "0000",
    billingCity: "",
    billingPhone: "",
    billingWhatsAppNumber: "", // Added billing WhatsApp number field
    subTotal: subTotal,
    // currency:country===65?'LE':'USD'
    // Bosta location fields
    bostaCity: bostaLocation.city?._id || "",
    bostaCityName: bostaLocation.city?.name || "",
    bostaZone: bostaLocation.zone?._id || "",
    bostaZoneName: bostaLocation.zone?.name || "",
    bostaDistrict: bostaLocation.district?.districtId || "",
    bostaDistrictName: bostaLocation.district?.districtName || "",
    currency: "LE",
    // currency: user.userCountry === "EG" ? "LE" : "USD",
  });
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    console.log(value);
    setFormData({ ...formData, [name]: value });
  };

  // Separate handler for state changes to ensure shipping calculation triggers
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setState(value); // Update local state
    setFormData({ ...formData, state: value }); // Update formData
  };

  useEffect(() => {
    if (useSameAsShipping) {
      formData.billingState = formData.state;
      console.log("ya raaaab" + formData.billingState);
    }
  }, [formData.state]);
  useEffect(() => {
    const countryName = countries.find(
      (countryy) =>
        countryy.id === (useSameAsShipping ? countryID : billingCountry)
    );

    if (useSameAsShipping) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        billingCountry: prevFormData.country,
        billingFirstName: prevFormData.firstName,
        billingLastName: prevFormData.lastName,
        billingAddress: prevFormData.address,
        billingState: prevFormData.state,
        billingApartment: prevFormData.apartment,
        billingPostalZip: prevFormData.postalZip,
        billingCity: prevFormData.city,
        billingPhone: prevFormData.phone,
        billingWhatsAppNumber: prevFormData.whatsAppNumber,
      }));
    }
  }, [useSameAsShipping]);

  // Update formData when Bosta location changes
  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      bostaCity: bostaLocation.city?._id || "",
      bostaCityName: bostaLocation.city?.name || "",
      bostaZone: bostaLocation.zone?._id || "",
      bostaZoneName: bostaLocation.zone?.name || "",
      bostaDistrict: bostaLocation.district?.districtId || "",
      bostaDistrictName: bostaLocation.district?.districtName || "",
    }));
  }, [bostaLocation]);

  useEffect(() => {
    const getCountries = async () => {
      const response = await axios.get("/api/countries");
      setCountries(response.data);
    };
    const getShippingZones = async () => {
      console.log("testtt");
      const response = await axios.get("/api/shipping");
      setShippingZones(response.data);
    };
    getShippingZones();
    const calculateShipping = () => {
      if (countryID === 65) {
        const selectedState = states.find(
          (state) => state.name === formData.state
        );
        const zone = shippingZones.find(
          (zone: ShippingZone) =>
            zone._id === selectedState?.shipping_zone &&
            zone.localGlobal === "local"
        );
        if (zone) {
          // Check if free shipping discount is applied
          if (appliedDiscount?.calculationType === "FREE_SHIPPING") {
            // Check if package price meets minimum order amount required for the discount
            if (
              !appliedDiscount.conditions?.minimumOrderAmount ||
              (packageData?.price &&
                packageData.price >=
                  appliedDiscount.conditions.minimumOrderAmount)
            ) {
              setShipping(0);
            }
          } else {
            setShipping(80);
          }
        }
      }
    };
    calculateShipping();
    getCountries();
    const getStates = async () => {
      const response = await axios.get(`/api/states?countryID=${65}`);
      setStates(response.data);
      // Only set initial state if no state is currently selected
      if (response.data.length > 0 && !state) {
        setState(response.data[0].name);
      }
    };
    getStates();

    const calculatedSubTotal = packageData?.price ?? 0;
    setSubTotal(calculatedSubTotal);

    // Add 20 EGP to total if a gift card is selected
    const giftCardCost = formData.giftCardName ? 20 : 0;
    setTotal(calculatedSubTotal + shipping + giftCardCost);

    cartItems();
  }, [items, countryID, billingState, packageData]); // Add packageData to dependencies
  useEffect(() => {
    if (countryID !== 65) {
      setPayment("card");
    }
  }, [countryID]);
  useEffect(() => {
    formData.cash = payment;
  }, [setPayment]);

  // Sync state changes with formData
  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      state: state,
    }));
  }, [state]);

  // Update total when gift card selection changes
  useEffect(() => {
    const calculatedSubTotal = packageData?.price ?? 0;
    const giftCardCost = formData.giftCardName ? 20 : 0;
    setTotal(calculatedSubTotal + shipping + giftCardCost);
  }, [formData.giftCardName, packageData?.price, shipping]);

  // Handle country changes
  useEffect(() => {
    if (countryID === 65 && states.length > 0 && !state) {
      // Only reset to first state when switching to Egypt AND no state is currently selected
      setState(states[0].name);
    }
  }, [countryID, states, state]);

  useEffect(() => {
    console.log("Shipping calculation triggered:", {
      countryID,
      state,
      statesLength: states.length,
      shippingZonesLength: shippingZones.length,
      countriesLength: countries.length,
    });

    // Debug: Log all states and their shipping zones
    if (states.length > 0) {
      console.log(
        "All states:",
        states.map((s) => ({
          name: s.name,
          shipping_zone: s.shipping_zone,
          type: typeof s.shipping_zone,
        }))
      );
    }

    // Debug: Log all shipping zones
    if (shippingZones.length > 0) {
      console.log(
        "All shipping zones:",
        shippingZones.map((z) => ({
          _id: z._id,
          zone_name: z.zone_name,
          localGlobal: z.localGlobal,
          zone_rate: z.zone_rate,
        }))
      );
    }

    if (countryID === 65) {
      // For Egyptian customers, shipping is handled by Bosta location selector
      // Default shipping will be updated when location is selected
      if (appliedDiscount?.calculationType === "FREE_SHIPPING") {
        // Check if package price meets minimum order amount required for the discount
        if (
          !appliedDiscount.conditions?.minimumOrderAmount ||
          (packageData?.price &&
            packageData.price >= appliedDiscount.conditions.minimumOrderAmount)
        ) {
          setShipping(0);
          const calculatedSubTotal = packageData?.price ?? 0;
          setSubTotal(calculatedSubTotal);
          const giftCardCost = formData.giftCardName ? 20 : 0;
          setTotal(calculatedSubTotal + giftCardCost);
        }
      } else if (!bostaLocation.city) {
        // Set default shipping if no Bosta location selected yet
        setShipping(0);
        const calculatedSubTotal = packageData?.price ?? 0;
        setSubTotal(calculatedSubTotal);
        const giftCardCost = formData.giftCardName ? 20 : 0;
        setTotal(calculatedSubTotal + shipping + giftCardCost);
      }
    } else if (shippingZones.length > 0) {
      // const shippingRate = calculateShippingRate(
      //   countryID,
      //   state,
      //   states,
      //   countries,
      //   shippingZones
      // );
      // console.log("Global shipping rate calculated:", shippingRate);
      if (appliedDiscount?.calculationType === "FREE_SHIPPING") {
        // Check if package price meets minimum order amount required for the discount
        if (
          !appliedDiscount.conditions?.minimumOrderAmount ||
          (packageData?.price &&
            packageData.price >= appliedDiscount.conditions.minimumOrderAmount)
        ) {
          setShipping(0);
        }
      }
      //  else {
      //   setShipping(shippingRate);
      // }
      const calculatedSubTotal = packageData?.price ?? 0;
      setSubTotal(calculatedSubTotal);
      setTotal(calculatedSubTotal + shipping);
    }
  }, [
    countryID,
    states,
    shippingZones,
    state,
    countries,
    items,
    packageData,
    bostaLocation,
    appliedDiscount,
  ]);

  let cartItems = () => {
    return items.map((cartItem, index) => (
      <OrderSummaryItem cartItem={cartItem} key={index} />
    ));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    // alert("clicked");
    e.preventDefault();
    setLoading(true);
    let errors: any = {};
    errors = orderValidation(formData);

    // Set errors to state
    setFormErrors(errors);

    // Stop submission if there are errors
    if (Object.keys(errors).length > 0) {
      alert(Object.keys(errors)[0] + Object.keys(errors)[1]);
      setLoading(false);
      return;
    }

    console.log("total" + formData.total);
    console.log(formData);
    if (useSameAsShipping) {
      const countryName = countries.find(
        (countryy) => countryy.id === billingCountry
      );

      formData.billingCountry = countryName ? countryName.name : "";
      formData.billingFirstName = formData.firstName;
      formData.billingLastName = formData.lastName;
      formData.billingAddress = formData.address;
      formData.billingState = formData.state;
      formData.billingApartment = formData.apartment;
      formData.billingPostalZip = formData.postalZip;
      formData.billingCity = formData.city;
      formData.billingPhone = formData.phone;
      formData.billingWhatsAppNumber = formData.whatsAppNumber;
    }

    // Add discount and loyalty info to payload
    const payload = {
      ...formData,
      appliedDiscount: appliedDiscount?._id,
      appliedDiscountAmount:
        appliedDiscount?.calculationType === "FREE_SHIPPING"
          ? shipping
          : appliedDiscount?.calculationType === "PERCENTAGE"
          ? Math.round((subTotal * (appliedDiscount?.value || 0)) / 100)
          : appliedDiscount?.value,
      loyalty: {
        redeemedPoints: Math.max(
          0,
          Math.min(
            redeemPoints - (redeemPoints % 20),
            loyaltyPoints.realLoyaltyPoints
          )
        ),
        discount: loyaltyDiscount,
      },
    };

    const res = await axios.post("/api/payment/", payload);
    console.log(res.data.token);
    setLoading(false);

    if (payment === "card") {
      // const paymobIframeURL = `https://accept.paymob.com/api/acceptance/iframes/890332?payment_token=${res.data.token}`;
      const paymobIframeURL = `https://accept.paymob.com/unifiedcheckout/?publicKey=${process.env.NEXT_PUBLIC_PaymobPublicKey}&clientSecret=${res.data.token}`;

      router.push(paymobIframeURL);
    } else {
      if (res.data.token === "wiig") {
        clearCart();
        router.replace("/payment/success");
      }
    }
  };

  // Read subscription param from URL

  // You can use 'isSubscription' below to adjust UI/logic for subscription checkouts
  // Example: if (isSubscription) { /* custom logic */ }

  useEffect(() => {
    const fetchPackage = async () => {
      setLoadingPackage(true);
      setNotFound(false);
      try {
        const res = await axios.get(`/api/packages?packageID=${packageID}`);
        if (res.data.data) {
          setPackageData(res.data.data);
        } else {
          setNotFound(true);
        }
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoadingPackage(false);
      }
    };
    if (packageID) fetchPackage();
  }, [packageID]);

  // Show modal when package data is loaded for specific packages
  // useEffect(() => {
  //   if (packageData && packageID) {
  //     const modalContent = getModalContent(packageID as string);
  //     if (modalContent) {
  //       setShowModal(true);
  //     }
  //   }
  // }, [packageData, packageID]);

  // Fix total calculation to always consider discount and loyalty after shipping/state changes
  useEffect(() => {
    // Calculate subtotal
    const calculatedSubTotal = packageData?.price ?? 0;
    setSubTotal(calculatedSubTotal);

    // Calculate discount amount
    let newDiscountAmount = 0;
    let effectiveShipping = shipping;

    // Apply free shipping if subtotal is greater than 2000
    const isFreeShipping = calculatedSubTotal > 2000;

    if (appliedDiscount && appliedDiscount.value !== undefined) {
      if (appliedDiscount.calculationType === "PERCENTAGE") {
        newDiscountAmount = Math.round(
          (calculatedSubTotal * appliedDiscount.value) / 100
        );
      } else if (appliedDiscount.calculationType === "FIXED_AMOUNT") {
        newDiscountAmount = appliedDiscount.value;
      } else if (appliedDiscount.calculationType === "FREE_SHIPPING") {
        effectiveShipping = 0;
        newDiscountAmount = shipping;
      }
    }

    // Apply free shipping if subtotal > 2000, regardless of discount
    if (isFreeShipping) {
      effectiveShipping = 0;
    }

    setDiscountAmount(newDiscountAmount);

    // Loyalty points: clamp to valid multiple of 20 and ≤ loyaltyPoints
    let validRedeem = Math.max(
      0,
      Math.min(
        redeemPoints - (redeemPoints % 20),
        loyaltyPoints.realLoyaltyPoints
      )
    );
    const loyaltyLE = Math.floor(validRedeem / 20);
    setLoyaltyDiscount(loyaltyLE);

    // Calculate final total
    const giftCardCost = formData.giftCardName ? 20 : 0;
    const finalTotal = Math.max(
      0,
      calculatedSubTotal -
        newDiscountAmount -
        loyaltyLE +
        effectiveShipping +
        giftCardCost
    );
    setTotal(finalTotal);
  }, [
    packageData,
    shipping,
    appliedDiscount,
    appliedDiscount?.calculationType,
    loyaltyPoints,
    redeemPoints,
    state,
    countryID,
    subTotal,
    formData.giftCardName,
  ]);

  if (loadingPackage) {
    return (
      <div className="container-custom w-full min-h-[calc(100vh-128px)] py-16 text-center text-lovely flex justify-center items-center">
        <WiigSpinner />
      </div>
    );
  }
  if (notFound || !packageData) {
    return (
      <div className="container-custom py-16 text-center">
        Subscription not found.
      </div>
    );
  }

  return (
    // cart.length > 0 ?
    <div
      className={`relative  container-custom  py-8 md:py-12 justify-between text-lovely min-h-screen  bg-creamey  flex flex-col `}
    >
      <h1
        className={`${thirdFont.className} tracking-normal text-2xl text-lovely md:text-4xl mb-4 md:mb-8  font-semibold`}
      >
        Subscription
      </h1>

      <div className="w-full flex flex-col-reverse min-h-screen md:flex-row">
        <div className="flex flex-col px-1 md:px-2 bg-backgroundColor items-start w-full md:w-5/7 text-[12px] lg:text-lg gap-6 text-nowrap">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-start w-full text-[12px] lg:text-lg gap-2 py-1 pr-1 md:pr-2  border-lovely text-nowrap"
          >
            <div
              className={`${thirdFont.className} w-full text-base lg:text-2xl  border-b border-lovely`}
            >
              contact
            </div>
            <div className="flex  items-center gap-2 w-full ">
              <label className="text-lovely text-base">Email</label>
              <div className="flex w-full gap-1 flex-col">
                <input
                  onChange={handleInputChange}
                  name="email"
                  value={formData.email}
                  type="email"
                  className={`border ${
                    formErrors.email ? "border-red-500" : ""
                  } w-full h-10 bg-creamey border-pinkey border rounded-2xl  px-2 text-base`}
                />
                {formErrors.email ? (
                  <p className="uppercase text-xs text-red-500">
                    {formErrors.email}
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full mt-2">
              <input
                type="checkbox"
                id="giftCheckbox"
                checked={isGift}
                onChange={(e) => {
                  setIsGift(e.target.checked);
                  setFormData({
                    ...formData,
                    isGift: e.target.checked,
                  });
                }}
                className="w-4 h-4 accent-lovely"
              />
              <label htmlFor="giftCheckbox" className="text-lovely text-base">
                I&apos;m buying this as a gift 💖
              </label>
            </div>

            {isGift && (
              <>
                <div className="flex flex-col w-full mt-2 p-3 bg-creamey/30 rounded-lg border border-lovely/30">
                  <p className="text-sm text-lovely mb-2">
                    Please enter The Bride&apos;s Email (if it&apos;s available
                    else let it blank).Please let us know once you give this
                    planner to the bride and We will contact her through her
                    WhatsApp and activate her account.
                  </p>
                  <div className="flex items-center gap-2 w-full">
                    <label className="text-lovely text-base">
                      Bride&apos;s Email
                    </label>
                    <div className="flex w-full gap-1 flex-col">
                      <input
                        onChange={handleInputChange}
                        name="giftRecipientEmail"
                        value={formData.giftRecipientEmail}
                        type="email"
                        className={`border ${
                          formErrors.giftRecipientEmail ? "border-red-500" : ""
                        } w-full h-10 bg-creamey border-pinkey border rounded-2xl px-2 text-base`}
                      />
                      {formErrors.giftRecipientEmail ? (
                        <p className="uppercase text-xs text-red-500">
                          {formErrors.giftRecipientEmail}
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>

                  {/* <div className="flex flex-col w-full mt-2">
                    <label className="text-lovely text-base mb-1">
                      Special Message
                    </label>
                    <textarea
                      onChange={handleInputChange}
                      name="specialMessage"
                      value={formData.specialMessage}
                      className={`border ${
                        formErrors.specialMessage ? "border-red-500" : ""
                      } w-full h-24 bg-creamey border-pinkey placeholder:text-pinkey border rounded-2xl px-2 py-2 text-base`}
                      placeholder="Write a special message for the bride..."
                    />
                    {formErrors.specialMessage ? (
                      <p className="uppercase text-xs text-red-500">
                        {formErrors.specialMessage}
                      </p>
                    ) : (
                      ""
                    )}
                  </div> */}
                </div>

                <div className="flex flex-col w-full mt-4">
                  <label className="text-lovely text-base mb-2">
                    Optional : Select a Gift Card (+20 EGP)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                        formData.giftCardName ===
                        "Born to shine birthday gift card"
                          ? "border-lovely"
                          : "border-transparent"
                      }`}
                      onClick={() => {
                        const newGiftCardName =
                          formData.giftCardName ===
                          "Born to shine birthday gift card"
                            ? ""
                            : "Born to shine birthday gift card";
                        setFormData({
                          ...formData,
                          giftCardName: newGiftCardName,
                        });
                      }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-center text-sm">
                        Born to shine birthday card
                      </div>
                      <img
                        src="/giftCard/Born to shine birthday gift card.jpeg"
                        alt="Birthday Gift Card"
                        className="w-full h-auto"
                      />
                      {formData.giftCardName ===
                        "Born to shine birthday gift card" && (
                        <div className="absolute top-2 right-2 bg-lovely text-white rounded-full p-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                        formData.giftCardName ===
                        "The I love you more than words gift card"
                          ? "border-lovely"
                          : "border-transparent"
                      }`}
                      onClick={() => {
                        const newGiftCardName =
                          formData.giftCardName ===
                          "The I love you more than words gift card"
                            ? ""
                            : "The I love you more than words gift card";
                        setFormData({
                          ...formData,
                          giftCardName: newGiftCardName,
                        });
                      }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-center text-sm">
                        I love you more than words card
                      </div>
                      <img
                        src="/giftCard/The I love you more than words gift card.jpeg"
                        alt="Love Gift Card"
                        className="w-full h-auto"
                      />
                      {formData.giftCardName ===
                        "The I love you more than words gift card" && (
                        <div className="absolute top-2 right-2 bg-lovely text-white rounded-full p-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                        formData.giftCardName === "The Wifey to be card"
                          ? "border-lovely"
                          : "border-transparent"
                      }`}
                      onClick={() => {
                        const newGiftCardName =
                          formData.giftCardName === "The Wifey to be card"
                            ? ""
                            : "The Wifey to be card";
                        setFormData({
                          ...formData,
                          giftCardName: newGiftCardName,
                        });
                      }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-center text-sm">
                        Wifey to be card
                      </div>
                      <img
                        src="/giftCard/The Wifey to be card.jpeg"
                        alt="Wifey to be Card"
                        className="w-full h-auto"
                      />
                      {formData.giftCardName === "The Wifey to be card" && (
                        <div className="absolute top-2 right-2 bg-lovely text-white rounded-full p-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div
              className={`${thirdFont.className} w-full mt-6 text-base lg:text-2xl border-b border-lovely`}
            >
              delivery
            </div>

            <div className="flex gap-2 items-center text-base w-full">
              <p>Country</p>
              {countries ? (
                <select
                  onChange={(e) => setCountryID(Number(e.target.value))}
                  name="country"
                  disabled
                  value={countryID}
                  className="px-2 text-base h-10 w-full bg-creamey border-pinkey border rounded-2xl py-2"
                >
                  {countries.map((country: any, index: number) => {
                    return (
                      <option key={index} value={country.id}>
                        {country.name}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <select
                  onChange={handleInputChange}
                  name="country"
                  value={formData.country}
                  className="px-2 text-base h-10 w-full bg-creamey border-pinkey border rounded-2xl py-2"
                >
                  <option value="EG">EGYPT</option>
                  <option value="SA">SAUDI ARABIA</option>
                </select>
              )}
            </div>
            <div className="flex justify-start  flex-col  w-full gap-2 items-start md:items-center">
              <div className="flex flex-col gap-2 w-full ">
                <div className="flex gap-2 w-full items-center">
                  <label className="text-lovely whitespace-nowrap text-base">
                    {isGift ? "First name" : "Beautiful Bride First Name"}
                  </label>
                  <div className="flex w-full gap-1 flex-col">
                    <input
                      onChange={handleInputChange}
                      name="firstName"
                      value={formData.firstName}
                      type="text"
                      className={`border ${
                        formErrors.firstName ? "border-red-500" : ""
                      } w-full h-10 bg-creamey border-pinkey border rounded-2xl py-2 px-2 text-base`}
                    />

                    {formErrors.firstName ? (
                      <p className="uppercase text-xs text-red-500">
                        {formErrors.firstName}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full ">
                <div className="flex gap-2 w-full items-center">
                  <label className="text-lovely text-base whitespace-nowrap">
                    {isGift ? "Last name" : "Beautiful Bride Last Name"}
                  </label>
                  <div className="flex w-full gap-1 flex-col">
                    <input
                      name="lastName"
                      onChange={handleInputChange}
                      value={formData.lastName}
                      type="text"
                      className={`border ${
                        formErrors.lastName ? "border-red-500" : ""
                      } w-full h-10 bg-creamey border-pinkey border rounded-2xl py-2 px-2 text-base`}
                    />
                    {formErrors.lastName ? (
                      <p className="uppercase text-xs text-red-500">
                        {formErrors.lastName}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full items-center">
              <label className="text-lovely text-base whitespace-nowrap">
                {isGift ? "address" : "Lovely Bride's address"}
              </label>
              <div className="flex w-full gap-1 flex-col">
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="address"
                  value={formData.address}
                  className={`border ${
                    formErrors.address ? "border-red-500" : ""
                  } w-full h-10 bg-creamey border-pinkey border rounded-2xl py-2 px-2 text-base`}
                />

                {formErrors.address ? (
                  <p className="uppercase text-xs text-red-500">
                    {formErrors.address}
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="flex w-full  gap-2 items-center">
              <label className="text-lovely text-base whitespace-nowrap">
                Apartment,Suite etc. (Optional)
              </label>
              <input
                onChange={handleInputChange}
                name="apartment"
                value={formData.apartment}
                type="text"
                className="border w-full h-10 bg-creamey border-pinkey  rounded-2xl py-2 px-2 text-base"
              />
            </div>
            <div className="flex flex-col sm:flex-row w-full gap-2">
              {/* <div className="flex flex-col w-full gap-2 flex-nowrap sm:w-3/5 ">
                <div className="flex w-full gap-2 items-center">
                  <label className="text-lovely text-base whitespace-nowrap">
                    Postal/Zip code
                  </label>
                  <div className="flex w-full gap-1 flex-col">
                    <input
                      placeholder={``}
                      onChange={handleInputChange}
                      value={formData.postalZip}
                      name="postalZip"
                      type="text"
                      className={`${
                        formErrors.postalZip ? "border-red-500" : ""
                      } border w-full h-10 bg-creamey border-pinkey border rounded-2xl py-2  px-2 text-base`}
                    />
                    {formErrors.postalZip ? (
                      <p className="uppercase text-xs text-red-500">
                        {formErrors.postalZip}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div> */}

              <div className="flex flex-col w-full   gap-2 ">
                <div className="flex gap-2 w-full items-center">
                  <label className="text-lovely text-base whitespace-nowrap">
                    City
                  </label>
                  <div className="flex w-full gap-1 flex-col">
                    <input
                      onChange={handleInputChange}
                      name="city"
                      value={formData.city}
                      type="text"
                      className={` w-full h-10 bg-creamey border-pinkey border rounded-2xl py-2 px-2 text-base ${
                        formErrors.city ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.city ? (
                      <p className="uppercase text-xs text-red-500">
                        {formErrors.city}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bosta Location Selector for Egyptian customers */}
            {countryID === 65 ? (
              <BostaLocationSelector
                onLocationChange={handleBostaLocationChange}
                selectedCity={bostaLocation.city?._id}
                selectedZone={bostaLocation.zone?._id}
                selectedDistrict={bostaLocation.district?.districtId}
                orderTotal={packageData?.price || 0}
              />
            ) : (
              <div className="flex w-full gap-2 items-center">
                <label className="text-lovely text-base whitespace-nowrap">
                  State/Province
                </label>
                <input
                  onChange={handleInputChange}
                  value={formData.state}
                  name="state"
                  type="text"
                  className="border w-full h-10 bg-creamey border-pinkey border rounded-2xl py-2 px-2 text-base"
                />
              </div>
            )}
            <div className="flex w-full gap-2 items-center">
              <label className="text-lovely text-base whitespace-nowrap">
                Phone
              </label>
              <div className="flex w-full gap-1 flex-col">
                <input
                  onChange={handleInputChange}
                  type="text"
                  value={formData.phone}
                  name="phone"
                  className={`border ${
                    formErrors.phone ? "border-red-500" : ""
                  } w-full h-10 bg-creamey border-pinkey border rounded-2xl py-2 px-2 text-base`}
                />
                {formErrors.phone ? (
                  <p className="uppercase text-xs text-red-500">
                    {formErrors.phone}
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="flex w-full gap-2 items-center">
              <label className="text-lovely text-base whitespace-nowrap">
                Bride&apos;s WhatsApp Number
              </label>
              <div className="flex w-full gap-1 flex-col">
                <input
                  onChange={handleInputChange}
                  type="text"
                  value={formData.whatsAppNumber}
                  name="whatsAppNumber"
                  className={`border ${
                    formErrors.whatsAppNumber ? "border-red-500" : ""
                  } w-full h-10 bg-creamey border-pinkey border rounded-2xl py-2 px-2 text-base`}
                />
                {formErrors.whatsAppNumber ? (
                  <p className="uppercase text-xs text-red-500">
                    {formErrors.whatsAppNumber}
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-lovely/80">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-lovely/80"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"
                />
              </svg>
              to send your private community invite
            </div>

            <div className="flex flex-col items-start w-full text-[12px] lg:text-lg gap-2 text-nowrap">
              <div
                className={`${thirdFont.className} mt-6 w-full text-base lg:text-2xl border-b border-lovely`}
              >
                payment
              </div>

              {countryID === 65 && (
                <div className="flex flex-col gap-2">
                  {/* <div className="flex gap-6">
                    <input
                      type="checkbox"
                      name="cash"
                      className="appearance-none h-5 ring-1 ring-gray-500 rounded-full w-5 border-2 text-white focus:ring-lovely checked:ring-lovely  checked:bg-everGreen "
                      checked={payment === "cash"}
                      onChange={() => {
                        setPayment("cash");
                        formData.cash = "cash";
                      }}
                    />
                    <label> Cash on delivery </label>
                  </div> */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="appearance-none h-3 ring-1 checked:ring-lovely ring-gray-500 rounded-full w-3 border-2 text-white focus:ring-lovely  checked:bg-everGreen "
                      checked={payment === "card"}
                      onChange={() => {
                        setPayment("card");
                        formData.cash = "card";
                      }}
                    />
                    <label className="text-base"> Pay with card</label>
                  </div>
                </div>
              )}
              {/* paymob */}
              {/* <div className='flex gap-6'>
           <input  type='checkbox'
    className="appearance-none h-5 w-5 border-2 text-white   checked:bg-lovely "
    checked={!cash} onChange={()=>setCash((prev)=>!prev)}/>
           <label> PAY WITH THE CARD</label>
            </div> 
              {/* billing */}

              <div
                className={`${thirdFont.className} mt-6 w-full text-base lg:text-2xl border-b border-lovely`}
              >
                billing address
              </div>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="billingAddress"
                      checked={useSameAsShipping}
                      onChange={() => setUseSameAsShipping(true)}
                      className="appearance-none checked:ring-lovely h-3 ring-1 ring-gray-500 rounded-full w-3 border-2 text-white focus:ring-lovely  checked:bg-everGreen "
                    />
                    <span className=" text-base">Same as shipping address</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="billingAddress"
                      checked={!useSameAsShipping}
                      onChange={() => setUseSameAsShipping(false)}
                      className="appearance-none checked:ring-lovely h-3 ring-1 ring-gray-500 rounded-full w-3 border-2 text-white focus:ring-lovely  checked:bg-everGreen "
                    />
                    <span className="text-base">
                      Use a different billing address
                    </span>
                  </label>
                </div>
              </div>
              <div
                className={`flex flex-col gap-2 w-full transition-all duration-500 ease-in-out overflow-hidden
  ${!useSameAsShipping ? "max-h-[70vh]   opacity-100" : "max-h-0  opacity-0"}
  `}
                style={{
                  padding: !useSameAsShipping ? "0.25rem 0.25rem" : "0",
                }}
              >
                <div className="flex gap-2 w-full">
                  <p>Country</p>
                  {countries ? (
                    <select
                      disabled
                      onChange={(e) =>
                        setBillingCountry(Number(e.target.value))
                      }
                      name="billingCountry"
                      value={billingCountry}
                      className="px-2 text-base h-10 w-full bg-creamey border-pinkey border rounded-2xl py-2"
                    >
                      {countries.map((country: any, index: number) => {
                        return (
                          <option key={index} value={country.id}>
                            {country.name}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <select
                      onChange={handleInputChange}
                      name="billingCountry"
                      value={formData.billingCountry}
                      className="px-2 text-base h-10 w-full bg-creamey border-pinkey border rounded-2xl py-2"
                    >
                      {/* <option value='EG'>EGYPT</option>
              <option value='SA'>SAUDI ARABIA</option> */}
                    </select>
                  )}
                </div>
                <div className="flex justify-start  flex-col md:flex-row w-full gap-2 items-start md:items-center">
                  <div className="flex gap-2 w-full md:w-2/4">
                    <label className="text-lovely">First Name</label>
                    <input
                      onChange={handleInputChange}
                      name="billingFirstName"
                      value={
                        useSameAsShipping
                          ? formData.firstName
                          : formData.billingFirstName
                      }
                      type="text"
                      className="border w-full h-10 bg-creamey border-pinkey border rounded-2xl py-2 px-2 text-base"
                    />
                  </div>
                  <div className="flex gap-2 w-full md:w-2/4">
                    <label className="text-lovely">Last Name</label>
                    <input
                      name="billingLastName"
                      onChange={handleInputChange}
                      value={
                        useSameAsShipping
                          ? formData.lastName
                          : formData.billingLastName
                      }
                      type="text"
                      className="border w-full h-10 bg-creamey border-pinkey border rounded-2xl py-2 px-2 text-base"
                    />
                  </div>
                </div>
                <div className="flex gap-2 w-full">
                  <label className="text-lovely">
                    Lovely Bride&apos;s address
                  </label>
                  <input
                    type="text"
                    onChange={handleInputChange}
                    name="billingAddress"
                    value={
                      useSameAsShipping
                        ? formData.address
                        : formData.billingAddress
                    }
                    className=" w-full h-10 bg-creamey border-pinkey border rounded-2xl py-2 px-2 text-base"
                  />
                </div>
                <div className="flex w-full  gap-2 items-center">
                  <label className="text-lovely text-nowrap">
                    Apartment,Suite ETC. (Optional)
                  </label>
                  <input
                    onChange={handleInputChange}
                    name="billingApartment"
                    value={
                      useSameAsShipping
                        ? formData.apartment
                        : formData.billingApartment
                    }
                    type="text"
                    className="border w-full h-10 bg-creamey border-pinkey border rounded-2xl py-2 px-2 text-base"
                  />
                </div>
                <div className="flex w-full gap-2">
                  {/* <div className="flex w-full gap-2 md:w-3/5 items-center">
                    <label className="text-lovely">
                      Postal/Zip code (Optional)
                    </label>
                    <input
                      onChange={handleInputChange}
                      value={
                        useSameAsShipping
                          ? formData.postalZip
                          : formData.billingPostalZip
                      }
                      name="billingPostalZip"
                      type="text"
                      className="border w-full h-10 bg-creamey border-pinkey border rounded-2xl py-2  px-2 text-base"
                    />
                  </div> */}

                  <div className="flex w-full  gap-2 items-center">
                    <label className="text-lovely">City</label>
                    <input
                      onChange={handleInputChange}
                      name="billingCity"
                      value={
                        useSameAsShipping ? formData.city : formData.billingCity
                      }
                      type="text"
                      className="border w-full h-10 bg-creamey border-pinkey border rounded-2xl py-2 px-2 text-base"
                    />
                  </div>
                </div>

                <div className="flex w-full  gap-2 items-center">
                  <label className="text-lovely">Governate</label>
                  {billingCountry === 65 ? (
                    <select
                      onChange={handleInputChange}
                      name="billingState"
                      value={
                        useSameAsShipping
                          ? formData.state
                          : formData.billingState
                      }
                      className="px-2 text-base h-10 w-full bg-creamey border-pinkey border rounded-2xl py-2"
                    >
                      {states.map((state: any, index: number) => {
                        return (
                          <option key={index} value={state.name}>
                            {state.name}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      onChange={handleInputChange}
                      value={
                        useSameAsShipping
                          ? formData.state
                          : formData.billingState
                      }
                      name="billingState"
                      type="text"
                      className="border w-full h-10 bg-creamey border-pinkey border rounded-2xl py-2 px-2 text-base"
                    />
                  )}
                </div>
                <div className="flex w-full gap-2 items-center">
                  <label className="text-lovely">Phone</label>
                  <input
                    onChange={handleInputChange}
                    type="text"
                    value={
                      useSameAsShipping ? formData.phone : formData.billingPhone
                    }
                    name="billingPhone"
                    className="border w-full h-10 bg-creamey border-pinkey border rounded-2xl py-2 px-2 text-base"
                  />
                </div>
                <div className="flex w-full gap-2 items-center">
                  <label className="text-lovely">WhatsApp Number</label>
                  <input
                    onChange={handleInputChange}
                    type="text"
                    value={
                      useSameAsShipping
                        ? formData.whatsAppNumber
                        : formData.billingWhatsAppNumber
                    }
                    name="billingWhatsAppNumber"
                    className="border w-full h-10 bg-creamey border-pinkey border rounded-2xl py-2 px-2 text-base"
                  />
                </div>
              </div>
            </div>
            {/* <div className='flex pb-5 justify-between'>
           <div className='flex flex-col gap-1'><p>SUBTOTAL</p>
           <p>SHIPPING</p>
           <p className='mt-6'>TOTAL</p>
           </div>
           
           <div className='flex flex-col gap-1 items-end'>
             <p className='text-[12px] lg:text-lg'>{subTotal} LE</p>
             <p className='text-[12px] lg:text-lg'>{shipping} LE</p>
             <p className='text-[12px] mt-6 lg:text-lg'>{total} LE</p>
           </div>
         </div> */}
            <div className="flex items-center gap-2 text-base mt-2">
              <label className="flex items-center gap-2 cursor-pointer relative">
                <input
                  color="#FBF3E0"
                  type="checkbox"
                  id="accept-terms"
                  checked={acceptedTerms}
                  onChange={() => setAcceptedTerms(!acceptedTerms)}
                  className="peer appearance-none bg-creamey checked:bg-everGreen border border-pinkey w-4 h-4 rounded transition-colors flex-shrink-0"
                />
                <span className="absolute left-0 top-0 flex h-4 w-4 items-center justify-center text-white text-xs pointer-events-none peer-checked:opacity-100 opacity-0">
                  ✔
                </span>
              </label>
              <span className="pl-2 text-lovely text-base">
                By checking, you agree to the{" "}
                <Link
                  href="/policies?terms-and-conditions"
                  className="underline hover:cursor-pointer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  terms and conditions
                </Link>
              </span>
            </div>
            <div className="flex justify-end">
              <button
                disabled={loading || !acceptedTerms}
                type="submit"
                className={`border text-base transition duration-300 border-lovely p-1 ${
                  loading || !acceptedTerms
                    ? "cursor-not-allowed bg-gray-300 px-4 py-2 text-gray-500 rounded-2xl"
                    : "hover:cursor-pointer bg-lovely  px-4 py-2 text-creamey hover:bg-lovely/90 rounded-2xl"
                }`}
              >
                PROCEED TO PAYMENT
              </button>
            </div>
          </form>
        </div>

        {/* orderSummaryMob */}

        <div className="block lg:col-span-3 relative w-full md:w-2/7 py-1">
          <div
            className={` md:border-l-2 sticky top-4 w-full border-lovely md:pl-6 shadow-sm h-fit`}
          >
            {/* Wifey Experience Package Details */}
            <div className=" bg-lovely text-creamey rounded-2xl shadow-md p-4 mb-6 flex flex-col items-center border border-lovely">
              <div className="relative w-[95%] h-[60vh] md:h-[40vh] lg:h-[50vh] xl:h-[60vh]">
                <Image
                  src={packageData.imgUrl}
                  fill
                  alt={packageData.name}
                  className="object-cover object-top aspect-[16/20] rounded-xl mb-4"
                />
              </div>
              <h2
                className={`text-lg ${thirdFont.className} md:text-2xl font-bold tracking-normal text-creamey  my-2 mt-4`}
              >
                ✨ You’re One Click Away From getting :
                {/* {packageData.name} */}
              </h2>
              <ul className=" w-full px-2 md:px-4 space-y-2 items-start justify-start  text-left text-sm md:text-base text-creamey/95">
                {packageData.items
                  .filter((item) => item.included)
                  .map(
                    (
                      item: { value: string; included: boolean },
                      idx: number
                    ) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span>{item.value}</span>
                      </li>
                    )
                  )}
              </ul>
              <div className="flex justify-start gap-4 tracking-wider mt-2 ">
                {/* <span className="text-base   text-creamey">
                  💗 Wifey Experience Membership (subscription 2,500 EGP){" "}
                </span> */}
                {/* <span className="text-lg  text-creamey">
                  {packageData.price} LE (yearly)
                </span> */}
                {/* <span className="text-md text-creamey/95">Duration: {wifeyExperience.duration}</span> */}
              </div>
              <div className="flex flex-col justify-start items-start w-full font-thin gap-2  mt-2 mb-2">
                <span className="text-sm text-creamey/80 font-normal">
                  Notes :
                </span>
                <ul className="pl-4">
                  {packageData.notes.map((note: string, idx: number) => (
                    <li
                      key={idx}
                      className="text-sm font-normal text-creamey/80"
                    >
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <DiscountSection
              redeemType="Subscription"
              onDiscountApplied={handleDiscountApplied}
              packagePrice={packageData?.price}
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
            <div className="mt-6 space-y-2 text-lovely">
              <div className="flex justify-between text-base">
                <span>Subtotal</span>
                <span>{subTotal} LE</span>
              </div>
              {appliedDiscount && appliedDiscount.value !== undefined && (
                <div className="flex justify-between text-base text-green-600">
                  <span>Discount ({appliedDiscount.code})</span>
                  <span>
                    {appliedDiscount.calculationType === "FREE_SHIPPING"
                      ? `-${shipping} LE (Free Shipping)`
                      : `-${
                          appliedDiscount.calculationType === "PERCENTAGE"
                            ? Math.round(
                                (subTotal * appliedDiscount.value) / 100
                              )
                            : appliedDiscount.value
                        } LE`}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base">
                {appliedDiscount?.calculationType === "FREE_SHIPPING" ||
                subTotal > 2000 ? (
                  <>
                    <span className="line-through">Shipping</span>
                    <span className="line-through">
                      {(() => {
                        // Show the shipping cost that would have been charged
                        if (countryID === 65 && bostaLocation.city) {
                          return bostaLocation.shippingCost?.shippingFee || 70;
                        } else {
                          const realShipping = calculateShippingRate(
                            countryID,
                            state,
                            states,
                            countries,
                            shippingZones
                          );
                          return realShipping;
                        }
                      })()}{" "}
                      LE
                    </span>
                  </>
                ) : (
                  <>
                    <span>Shipping</span>
                    <span>{shipping} LE</span>
                  </>
                )}
              </div>
              {formData.giftCardName && (
                <div className="flex justify-between text-base">
                  <span>Gift Card </span>
                  <span>+20 LE</span>
                </div>
              )}
              <div className="flex justify-between font-bold mt-4 pt-4 border-t">
                <span>Total</span>
                <span>{total} LE</span>
              </div>
            </div>
          </div>
          {/* </form> */}
        </div>
      </div>

      {/* Modal for specific packages */}
      {/* Modal for specific packages */}
      {showModal && packageID && getModalContent(packageID as string) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-creamey rounded-2xl max-w-md w-full mx-4 relative shadow-2xl border-2 border-lovely">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-lovely hover:text-lovely/70 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Modal content */}
            <div className="p-6 pt-12">
              <div className="text-center">
                <div className="text-4xl mb-4">💖</div>
                {getModalContent(packageID as string) && (
                  <>
                    <h2 className="text-lovely text-lg font-bold mb-4">
                      {getModalContent(packageID as string)?.header}
                    </h2>
                    <div className="text-lovely leading-relaxed whitespace-pre-line text-sm font-medium">
                      {getModalContent(packageID as string)?.content}
                    </div>
                  </>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-6 bg-lovely text-creamey hover:bg-lovely/90 transition-colors rounded-full px-8 py-3 font-semibold shadow-lg"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CheckoutPageWithSuspense(props: any) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-128px)] flex w-full justify-center items-center text-lovely">
          Loading ...
        </div>
      }
    >
      <SubscriptionPage {...props} />
    </Suspense>
  );
}
