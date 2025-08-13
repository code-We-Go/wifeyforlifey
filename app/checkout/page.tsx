"use client";
// import BigCartItem from '@/app/components/BigCartItem';
import OrderSummaryItem from "./components/OrderSummaryItem";
import { cartContext } from "@/app/context/cartContext";
import { CartProvider, useCart } from "@/providers/CartProvider";

import { userContext } from "@/app/context/userContext";
import { thirdFont } from "@/fonts";
import orderValidation from "@/lib/validations/orderValidation";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useContext, useEffect, useState, Suspense } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { Discount } from "../types/discount";
import CartItemSmall from "../cart/CartItemSmall";
import DiscountSection from "./components/DiscountSection";
import { ShippingZone } from "../interfaces/interfaces";
import { wifeyExperience } from "../constants";
import Image from "next/image";
import { Spinner } from "@material-tailwind/react";
import { useAuth } from "@/hooks/useAuth";
import { Info } from "lucide-react";
import LoyaltyPointsSection from "@/components/LoyaltyPointsSection";

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

const CheckoutClientPage = () => {
  // let subTotal=0;
  // let total = 0;
  // const []
  //  const[countries,setCountries]=useState([]);
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const calculateTotals = () => {
    // Calculate subtotal first
    const calculatedSubTotal = items.reduce(
      (acc, cartItem) => acc + cartItem.price * cartItem.quantity,
      0
    );

    // Calculate discount amount
    let newDiscountAmount = 0;
    let effectiveShipping = shipping;

    if (appliedDiscount && appliedDiscount.value !== undefined) {
      if (appliedDiscount.calculationType === "PERCENTAGE") {
        newDiscountAmount = Math.round(
          (calculatedSubTotal * appliedDiscount.value) / 100
        );
        console.log("Percentage discount:", {
          subtotal: calculatedSubTotal,
          percentage: appliedDiscount.value,
          discountAmount: newDiscountAmount,
        });
      } else if (appliedDiscount.calculationType === "FIXED_AMOUNT") {
        newDiscountAmount = appliedDiscount.value;
        console.log("Fixed amount discount:", {
          subtotal: calculatedSubTotal,
          fixedAmount: appliedDiscount.value,
          discountAmount: newDiscountAmount,
        });
      } else if (appliedDiscount.calculationType === "FREE_SHIPPING") {
        effectiveShipping = 0;
        newDiscountAmount = shipping; // Set the discount amount to the original shipping cost
        console.log("Free shipping discount applied:", {
          originalShipping: shipping,
          effectiveShipping: 0,
          discountAmount: newDiscountAmount,
        });
      }
    }

    // Calculate final total
    const finalTotal = calculatedSubTotal + effectiveShipping;
    console.log("Final calculation:", {
      subtotal: calculatedSubTotal,
      shipping: effectiveShipping,
      discountAmount: newDiscountAmount,
      finalTotal,
    });
  };
  type Payment = "cash" | "card" | "instapay";
  const { user } = useContext(userContext);
  const [shipping, setShipping] = useState(70);
  const [payment, setPayment] = useState<Payment>("cash");
  const [loading, setLoading] = useState(false);
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

  // const [state,setState]=useState(states.length>0?states[0].name:'')
  const [state, setState] = useState("Alexandria"); // Default to the first state's name or an empty string
  const [billingState, setBillingState] = useState("Alexandria");
  const { loyaltyPoints, isAuthenticated } = useAuth();
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleDiscountApplied = (discount: Discount | null) => {
    // alert(discount?.calculationType)
    setAppliedDiscount(discount);
    if (discount && discount.calculationType === "FREE_SHIPPING") {
      setShipping(0);
    }
    //     setFormData((prevFormData)=>({
    // ...prevFormData,
    // appliedDiscount:discount?._id,
    // // appliedDiscountAmount:
    //     }));
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
  const [formData, setFormData] = useState({
    email: "",
    country: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    postalZip: "",
    city: "",
    appliedDiscount: "",
    appliedDiscountAmount: 0,
    cart: items,
    phone: "",
    state: state,
    cash: payment,
    redeemedLoyaltyPoints: Math.max(
      0,
      Math.min(
        redeemPoints - (redeemPoints % 20),
        loyaltyPoints.realLoyaltyPoints
      )
    ),
    total: total,
    shipping: shipping,
    billingCountry: "",
    billingFirstName: "",
    billingLastName: "",
    billingState: useSameAsShipping ? state : billingState,
    billingAddress: "",
    billingApartment: "",
    billingPostalZip: "",
    billingCity: "",
    billingPhone: "",
    subTotal: subTotal,
    // currency:country===65?'LE':'USD'
    currency: "LE",
    // currency: user.userCountry === "EG" ? "LE" : "USD",
  });
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      }));
    }
  }, [useSameAsShipping]);
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
      // Prevent recalculation if FREE_SHIPPING discount is active
      if (
        appliedDiscount &&
        appliedDiscount.calculationType === "FREE_SHIPPING"
      ) {
        setShipping(0);
        return;
      }
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
          setShipping(zone.zone_rate.local);
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

    const calculatedSubTotal = items.reduce(
      (acc, cartItem) => acc + cartItem.price * cartItem.quantity,
      0
    );
    setSubTotal(calculatedSubTotal);
    setTotal(calculatedSubTotal + shipping);

    cartItems();
  }, [items, countryID, billingState]); // Removed 'state' from dependencies
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

    if (countryID === 65 && states.length > 0 && shippingZones.length > 0) {
      const shippingRate = calculateShippingRate(
        countryID,
        state,
        states,
        countries,
        shippingZones
      );
      console.log("Local shipping rate calculated:", shippingRate);
      if (appliedDiscount?.calculationType === "FREE_SHIPPING") {
        setShipping(0);
      } else {
        setShipping(shippingRate);
      }
      const calculatedSubTotal = items.reduce(
        (acc, cartItem) => acc + cartItem.price * cartItem.quantity,
        0
      );
      setSubTotal(calculatedSubTotal);
      // setTotal(calculatedSubTotal + shippingRate); // REMOVED: total is now only set in discount/loyalty effect
    } else if (shippingZones.length > 0) {
      const shippingRate = calculateShippingRate(
        countryID,
        state,
        states,
        countries,
        shippingZones
      );
      console.log("Global shipping rate calculated:", shippingRate);
      if (appliedDiscount?.calculationType === "FREE_SHIPPING") {
        setShipping(0);
      } else {
        setShipping(shippingRate);
      }
      const calculatedSubTotal = items.reduce(
        (acc, cartItem) => acc + cartItem.price * cartItem.quantity,
        0
      );
      setSubTotal(calculatedSubTotal);
      // setTotal(calculatedSubTotal + shippingRate); // REMOVED: total is now only set in discount/loyalty effect
    }
  }, [countryID, states, shippingZones, state, countries, items]);

  let cartItems = () => {
    return items.map((cartItem, index) => (
      <OrderSummaryItem cartItem={cartItem} key={index} />
    ));
  };
  const [discountAmount, setDiscountAmount] = useState(0);
  // const [total, setTotal] = useState(0);

  // Handler for redeeming points (allow any value, clamp in effect)
  const handleRedeemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value) || 0;
    setRedeemPoints(value);
  };

  // Recalculate all totals and discounts together
  useEffect(() => {
    // Calculate subtotal
    const calculatedSubTotal = items.reduce(
      (acc, cartItem) => acc + cartItem.price * cartItem.quantity,
      0
    );
    setSubTotal(calculatedSubTotal);

    // Calculate discount amount and effective shipping
    let newDiscountAmount = 0;
    let effectiveShipping = shipping;
    if (appliedDiscount && appliedDiscount.value !== undefined) {
      if (appliedDiscount.calculationType === "PERCENTAGE") {
        newDiscountAmount = Math.round(
          (calculatedSubTotal * appliedDiscount.value) / 100
        );
      } else if (appliedDiscount.calculationType === "FIXED_AMOUNT") {
        newDiscountAmount = appliedDiscount.value;
      } else if (appliedDiscount.calculationType === "FREE_SHIPPING") {
        // Always use the latest shipping value for discount and set shipping to 0
        newDiscountAmount = shipping;
        effectiveShipping = 0;
      }
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

    // Calculate final total, always using effectiveShipping
    const finalTotal = Math.max(
      0,
      calculatedSubTotal - newDiscountAmount - loyaltyLE + effectiveShipping
    );
    setTotal(finalTotal);
  }, [items, shipping, appliedDiscount, loyaltyPoints, redeemPoints]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let errors: any = {};
    errors = orderValidation(formData);

    // Set errors to state
    setFormErrors(errors);

    // Stop submission if there are errors
    if (Object.keys(errors).length > 0) {
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
    }
    const orderPayload = {
      ...formData,
      total, // use the latest state value
      shipping:
        appliedDiscount?.calculationType === "FREE_SHIPPING" ? 0 : shipping,
      subTotal,
      cart: items,
      appliedDiscount: appliedDiscount?._id,
      appliedDiscountAmount: discountAmount,
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
    const res = await axios.post("/api/payment/", orderPayload);
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
  const searchParams = useSearchParams();
  const isSubscription = searchParams.get("subscription") === "true";
  // You can use 'isSubscription' below to adjust UI/logic for subscription checkouts
  // Example: if (isSubscription) { /* custom logic */ }

  return (
    // cart.length > 0 ?
    <div
      className={`relative  container-custom  py-8 md:py-12 justify-between text-everGreen min-h-screen  bg-creamey  flex flex-col `}
    >
      {loading && (
        <div className="fixed z-20 inset-0 bg-black/40 flex w-full h-[100vh] justify-center items-center">
          <div className="w-12 animate-spin border-lovely border-b-2 h-12 rounded-full  "></div>
        </div>
      )}
      <h1
        className={`${thirdFont.className} tracking-normal text-xl text-everGreen md:text-3xl mb-4 md:mb-8  font-semibold`}
      >
        Checkout
      </h1>

      <div className="w-full flex flex-col-reverse min-h-screen md:flex-row">
        <div className="flex flex-col px-1 md:px-2 bg-backgroundColor items-start w-full md:w-3/7 text-[12px] lg:text-base gap-6 text-nowrap">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-start w-full text-[12px] lg:text-base gap-2 py-1 pr-1 md:pr-2  border-lovely text-nowrap"
          >
            <div
              className={`${thirdFont.className} w-full text-lg lg:text-2xl  border-b border-lovely`}
            >
              contact
            </div>
            <div className="flex  items-center gap-2 w-full ">
              <label className="text-everGreen text-base">Email</label>
              <div className="flex w-full gap-1 flex-col">
                <input
                  onChange={handleInputChange}
                  name="email"
                  value={formData.email}
                  type="email"
                  className={`border ${
                    formErrors.email ? "border-red-500" : ""
                  } w-full h-10 bg-creamey rounded-2xl  px-2 text-base`}
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
            <div
              className={`${thirdFont.className} w-full mt-6 text-lg lg:text-2xl border-b border-lovely`}
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
                  className="px-2 text-base h-10 w-full bg-creamey rounded-2xl py-2"
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
                  className="px-2 text-base h-10 w-full bg-creamey rounded-2xl py-2"
                >
                  <option value="EG">EGYPT</option>
                  <option value="SA">SAUDI ARABIA</option>
                </select>
              )}
            </div>
            <div className="flex justify-start  flex-col  w-full gap-2 items-start md:items-center">
              <div className="flex flex-col gap-2 w-full ">
                <div className="flex gap-2 w-full items-center">
                  <label className="text-everGreen whitespace-nowrap text-base">
                    Beautiful Bride First Name
                  </label>
                  <div className="flex w-full gap-1 flex-col">
                    <input
                      onChange={handleInputChange}
                      name="firstName"
                      value={formData.firstName}
                      type="text"
                      className={`border ${
                        formErrors.firstName ? "border-red-500" : ""
                      } w-full h-10 bg-creamey rounded-2xl py-2 px-2 text-base`}
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
                  <label className="text-everGreen text-base whitespace-nowrap">
                    Beautiful Bride Last Name
                  </label>
                  <div className="flex w-full gap-1 flex-col">
                    <input
                      name="lastName"
                      onChange={handleInputChange}
                      value={formData.lastName}
                      type="text"
                      className={`border ${
                        formErrors.lastName ? "border-red-500" : ""
                      } w-full h-10 bg-creamey rounded-2xl py-2 px-2 text-base`}
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
              <label className="text-everGreen text-base whitespace-nowrap">
                Lovely Bride&apos;s address
              </label>
              <div className="flex w-full gap-1 flex-col">
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="address"
                  value={formData.address}
                  className={`border ${
                    formErrors.address ? "border-red-500" : ""
                  } w-full h-10 bg-creamey rounded-2xl py-2 px-2 text-base`}
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
              <label className="text-everGreen text-base whitespace-nowrap">
                Apartment,Suite etc. (Optional)
              </label>
              <input
                onChange={handleInputChange}
                name="apartment"
                value={formData.apartment}
                type="text"
                className="border w-full h-10 bg-creamey rounded-2xl py-2 px-2 text-base"
              />
            </div>
            <div className="flex flex-col sm:flex-row w-full gap-2">
              <div className="flex flex-col w-full gap-2 flex-nowrap sm:w-3/5 ">
                <div className="flex w-full gap-2 items-center">
                  <label className="text-everGreen text-base whitespace-nowrap">
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
                      } border w-full h-10 bg-creamey rounded-2xl py-2  px-2 text-base`}
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
              </div>

              <div className="flex flex-col w-full  md:w-2/5 gap-2 ">
                <div className="flex gap-2 w-full items-center">
                  <label className="text-everGreen text-base whitespace-nowrap">
                    City
                  </label>
                  <div className="flex w-full gap-1 flex-col">
                    <input
                      onChange={handleInputChange}
                      name="city"
                      value={formData.city}
                      type="text"
                      className={`border w-full h-10 bg-creamey rounded-2xl py-2 px-2 text-base ${
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

            <div className="flex w-full  gap-2 items-center">
              <label className="text-everGreen text-base whitespace-nowrap">
                Governate
              </label>
              {countryID === 65 ? (
                <select
                  onChange={handleStateChange}
                  name="state"
                  value={formData.state}
                  className="px-2 text-base h-10 w-full bg-creamey rounded-2xl py-2"
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
                  value={formData.state}
                  name="state"
                  type="text"
                  className="border w-full h-10 bg-creamey rounded-2xl py-2 px-2 text-base"
                />
              )}
            </div>
            <div className="flex w-full gap-2 items-center">
              <label className="text-everGreen text-base whitespace-nowrap">
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
                  } w-full h-10 bg-creamey rounded-2xl py-2 px-2 text-base`}
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

            <div className="flex flex-col items-start w-full text-[12px] lg:text-base gap-2 text-nowrap">
              <div
                className={`${thirdFont.className} mt-6 w-full text-lg lg:text-2xl border-b border-lovely`}
              >
                payment
              </div>

              {countryID === 65 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-6">
                    <input
                      type="checkbox"
                      name="cash"
                      className="appearance-none h-3 ring-1 ring-gray-500 rounded-full w-3 border-2 text-white focus:ring-lovely checked:ring-lovely  checked:bg-everGreen "
                      checked={payment === "cash"}
                      onChange={() => {
                        setPayment("cash");
                        formData.cash = "cash";
                      }}
                    />
                    <label> Cash on delivery </label>
                  </div>
                  {/* paymob */}
                  <div className="flex items-center gap-6">
                    <input
                      type="checkbox"
                      className="appearance-none h-3 ring-1 checked:ring-lovely ring-gray-500 rounded-full w-3 border-2 text-white focus:ring-lovely  checked:bg-everGreen "
                      checked={payment === "card"}
                      onChange={() => {
                        setPayment("card");
                        formData.cash = "card";
                      }}
                    />
                    <label> Pay with card</label>
                  </div>
                </div>
              )}
              {/* paymob */}
              {/* <div className='flex gap-6'>
           <input  type='checkbox'
    className="appearance-none h-3 w-3 border-2 text-white   checked:bg-lovely "
    checked={!cash} onChange={()=>setCash((prev)=>!prev)}/>
           <label> PAY WITH THE CARD</label>
            </div> 
              {/* billing */}

              <div
                className={`${thirdFont.className} mt-6 w-full text-lg lg:text-2xl border-b border-lovely`}
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
                    <span className=" ">Same as shipping address</span>
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
                    <span className="">Use a different billing address</span>
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
                      className="px-2 text-base h-10 w-full bg-creamey rounded-2xl py-2"
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
                      className="px-2 text-base h-10 w-full bg-creamey rounded-2xl py-2"
                    >
                      {/* <option value='EG'>EGYPT</option>
              <option value='SA'>SAUDI ARABIA</option> */}
                    </select>
                  )}
                </div>
                <div className="flex justify-start  flex-col md:flex-row w-full gap-2 items-start md:items-center">
                  <div className="flex gap-2 w-full md:w-2/4">
                    <label className="text-everGreen">First Name</label>
                    <input
                      onChange={handleInputChange}
                      name="billingFirstName"
                      value={
                        useSameAsShipping
                          ? formData.firstName
                          : formData.billingFirstName
                      }
                      type="text"
                      className="border w-full h-10 bg-creamey rounded-2xl py-2 px-2 text-base"
                    />
                  </div>
                  <div className="flex gap-2 w-full md:w-2/4">
                    <label className="text-everGreen">Last Name</label>
                    <input
                      name="billingLastName"
                      onChange={handleInputChange}
                      value={
                        useSameAsShipping
                          ? formData.lastName
                          : formData.billingLastName
                      }
                      type="text"
                      className="border w-full h-10 bg-creamey rounded-2xl py-2 px-2 text-base"
                    />
                  </div>
                </div>
                <div className="flex gap-2 w-full">
                  <label className="text-everGreen">
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
                    className="border w-full h-10 bg-creamey rounded-2xl py-2 px-2 text-base"
                  />
                </div>
                <div className="flex w-full  gap-2 items-center">
                  <label className="text-everGreen text-nowrap">
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
                    className="border w-full h-10 bg-creamey rounded-2xl py-2 px-2 text-base"
                  />
                </div>
                <div className="flex w-full gap-2">
                  <div className="flex w-full gap-2 md:w-3/5 items-center">
                    <label className="text-everGreen">
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
                      className="border w-full h-10 bg-creamey rounded-2xl py-2  px-2 text-base"
                    />
                  </div>

                  <div className="flex w-full  md:w-2/5 gap-2 items-center">
                    <label className="text-everGreen">City</label>
                    <input
                      onChange={handleInputChange}
                      name="billingCity"
                      value={
                        useSameAsShipping ? formData.city : formData.billingCity
                      }
                      type="text"
                      className="border w-full h-10 bg-creamey rounded-2xl py-2 px-2 text-base"
                    />
                  </div>
                </div>

                <div className="flex w-full  gap-2 items-center">
                  <label className="text-everGreen">Governate</label>
                  {billingCountry === 65 ? (
                    <select
                      onChange={handleInputChange}
                      name="billingState"
                      value={
                        useSameAsShipping
                          ? formData.state
                          : formData.billingState
                      }
                      className="px-2 text-base h-10 w-full bg-creamey rounded-2xl py-2"
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
                      className="border w-full h-10 bg-creamey rounded-2xl py-2 px-2 text-base"
                    />
                  )}
                </div>
                <div className="flex w-full gap-2 items-center">
                  <label className="text-everGreen">Phone</label>
                  <input
                    onChange={handleInputChange}
                    type="text"
                    value={
                      useSameAsShipping ? formData.phone : formData.billingPhone
                    }
                    name="billingPhone"
                    className="border w-full h-10 bg-creamey rounded-2xl py-2 px-2 text-base"
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
             <p className='text-[12px] lg:text-base'>{subTotal} LE</p>
             <p className='text-[12px] lg:text-base'>{shipping} LE</p>
             <p className='text-[12px] mt-6 lg:text-base'>{total} LE</p>
           </div>
         </div> */}
            {payment === "cash" || "instapay" ? (
              <div className={`flex justify-end`}>
                <button
                  className="bg-lovely rounded-2xl text-creamey disabled:bg-lovely/60 hover:bg-lovely/90 px-4 py-2"
                  onClick={handleSubmit}
                  disabled={loading || items.length === 0}
                >
                  Confirm order
                </button>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  disabled={items.length === 0 || loading}
                  type="submit"
                  className={`border transition duration-300 border-lovely p-1 ${
                    items.length === 0 || loading
                      ? "cursor-not-allowed bg-gray-300 text-gray-500" // Styles for disabled state
                      : "hover:cursor-pointer hover:bg-lovely hover:text-white text-everGreen"
                  }`}
                >
                  PROCEED TO PAYMENT
                </button>
              </div>
            )}
            <div className="text-base">
              <p>
                By clicking &quot;CONFIRM ORDER&quot;, you accept the{" "}
                <Link
                  href="/policies?terms-and-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-everGreen underline"
                >
                  terms and conditions
                </Link>
                .
              </p>
            </div>
          </form>
        </div>
        {/* orderSummaryMob */}
        <div className="flex flex-col md:hidden">
          <div
            onClick={() => setSummary((prevState) => !prevState)}
            className="flex  justify-between items-center px-1 hover:cursor-pointer"
          >
            <div className="flex gap-1  justify-center items-center">
              <h6 className={`${thirdFont.className}`}>ORDER SUMMARY</h6>
              <IoIosArrowDown
                className={`${
                  summary ? "rotate-180" : ""
                } transition duration-500`}
              />
            </div>
            <h6 className={`${thirdFont.className}`}>{total} LE</h6>
          </div>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              summary
                ? "max-h-[90vh] h-auto  opacity-100"
                : "max-h-0  opacity-0"
            } px-1 py-1 flex flex-col gap-2`}
            style={{
              padding: summary ? "0.25rem 0.25rem" : "0",
            }}
          >
            {items.map((cartItem, index) => (
              <OrderSummaryItem cartItem={cartItem} key={index} />
            ))}
            <DiscountSection
              onDiscountApplied={handleDiscountApplied}
              redeemType="Purchase"
            />
            {/* Loyalty Points Section for mobile */}
            <LoyaltyPointsSection
              loyaltyPoints={loyaltyPoints}
              redeemPoints={redeemPoints}
              setRedeemPoints={setRedeemPoints}
              loyaltyDiscount={loyaltyDiscount}
              setLoyaltyDiscount={setLoyaltyDiscount}
              isAuthenticated={isAuthenticated}
              showTooltip={showTooltip}
              setShowTooltip={setShowTooltip}
              mobile={true}
            />
            <div className="mt-6 flex justify-between">
              <div className="flex flex-col gap-1 text-sm">
                <p>SUBTOTAL</p>
                {redeemPoints > 0 && (
                  <p className="text-[12px] lg:text-base text-green-700">
                    -{loyaltyDiscount} LE (Loyalty Discount)
                  </p>
                )}
                <p>SHIPPING</p>
                <p className="mt-6">TOTAL</p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <p className="text-[12px] lg:text-base">{subTotal} LE</p>
                {redeemPoints > 0 && (
                  <p className="text-[12px] lg:text-base text-green-700">
                    -{loyaltyDiscount} LE
                  </p>
                )}
                <p className="text-[12px] lg:text-base">{shipping} LE</p>
                <p className="text-[12px] mt-6 lg:text-base">{total} LE</p>
              </div>
            </div>
          </div>
        </div>
        {!isSubscription === true ? (
          <div className="hidden md:block lg:col-span-3 relative w-full md:w-2/7 py-1">
            <div className="border-l-2 sticky top-4 w-full border-lovely pl-6 shadow-sm h-fit">
              <h2
                className={`${thirdFont.className} text-lg lg:text-2xl  text-everGreen mb-6`}
              >
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="flex flex-col gap-4 mb-6">
                {items.map((item, index) => (
                  <OrderSummaryItem key={index} cartItem={item} />
                ))}
              </div>

              {/* Discount Section */}
              <DiscountSection
                redeemType="Purchase"
                onDiscountApplied={handleDiscountApplied}
              />

              {/* Order Totals */}
              <div className="mt-6 space-y-2 text-everGreen">
                <div className="flex justify-between text-base">
                  <span>Subtotal</span>
                  <span>{subTotal} LE</span>
                </div>
                {redeemPoints > 0 && (
                  <div className="flex justify-between text-base text-green-700">
                    <span>Loyalty Discount</span>
                    <span>-{loyaltyDiscount} LE</span>
                  </div>
                )}
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
                  {appliedDiscount?.calculationType === "FREE_SHIPPING" ? (
                    <>
                      <span className=" line-through">Shipping</span>
                      <span className="line-through">
                        {(() => {
                          // Calculate the real shipping before discount
                          const realShipping = calculateShippingRate(
                            countryID,
                            state,
                            states,
                            countries,
                            shippingZones
                          );
                          return realShipping;
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
                <div className="flex justify-between font-bold mt-4 pt-4 border-t">
                  <span>Total</span>
                  <span>{total} LE</span>
                </div>
              </div>
              {/* Loyalty Points Section */}
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
            </div>
          </div>
        ) : (
          <div className="hidden md:block lg:col-span-3 relative w-full md:w-2/7 py-1">
            <div
              className={`${thirdFont.className} border-l-2 sticky top-4 w-full border-lovely pl-6 shadow-sm h-fit`}
            >
              {/* Wifey Experience Package Details */}
              <div className="wifey-experience-package bg-lovely text-creamey rounded-2xl shadow-md p-4 mb-6 flex flex-col items-center border border-lovely">
                <Image
                  src={wifeyExperience.imgUrl}
                  width={400}
                  height={250}
                  alt={wifeyExperience.name}
                  className="object-cover object-top aspect-[16/11] rounded-xl mb-4"
                />
                <h2
                  className={`text-2xl ${thirdFont.className} font-bold tracking-normal text-creamey mb-2`}
                >
                  {wifeyExperience.name}
                </h2>
                <ul className="list-disc w-full items-start justify-start list-inside text-left text-lg tracking-wide text-creamey/95">
                  {wifeyExperience.items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                <div className="flex justify-start gap-4 tracking-wider mt-4 mb-2">
                  <span className="text-base   text-creamey">
                    one lifetime subscription fee :
                  </span>
                  <span className="text-base  text-creamey">
                    {wifeyExperience.price} LE
                  </span>
                  {/* <span className="text-md text-creamey/95">Duration: {wifeyExperience.duration}</span> */}
                </div>
              </div>
              <div className="mt-6 space-y-2 text-everGreen">
                <div className="flex justify-between text-base">
                  <span>Subtotal</span>
                  <span>{subTotal} LE</span>
                </div>
                {redeemPoints > 0 && (
                  <div className="flex justify-between text-base text-green-700">
                    <span>Loyalty Discount</span>
                    <span>-{loyaltyDiscount} LE</span>
                  </div>
                )}
                {appliedDiscount && appliedDiscount.value !== undefined && (
                  <div className="flex justify-between text-base text-green-600">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>
                      -{discountAmount} LE
                      {appliedDiscount.calculationType === "FREE_SHIPPING"
                        ? " (Free Shipping)"
                        : ""}
                    </span>
                  </div>
                )}
                {/* {redeemPoints > 0 && <div>{redeemPoints}</div>} */}
                <div className="flex justify-between text-base">
                  <span>Shipping</span>
                  <span>
                    {appliedDiscount?.calculationType === "FREE_SHIPPING"
                      ? "0"
                      : shipping}{" "}
                    LE
                  </span>
                </div>
                <div className="flex justify-between font-bold mt-4 pt-4 border-t">
                  <span>Total</span>
                  <span>{total} LE</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CheckoutPageWithSuspense(props: any) {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <CheckoutClientPage {...props} />
    </Suspense>
  );
}
