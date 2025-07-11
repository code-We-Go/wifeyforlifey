"use client";
// import BigCartItem from '@/app/components/BigCartItem';
import OrderSummaryItem from "./OrderSummaryItem";
import { cartContext } from "@/app/context/cartContext";
import { userContext } from "@/app/context/userContext";
import { thirdFont } from "@/fonts";
import orderValidation from "@/lib/validations/orderValidation";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { Discount } from "../../types/discount";
import CartItemSmall from "../../cart/CartItemSmall";
import DiscountSection from "./DiscountSection";
import { ShippingZone } from "../../interfaces/interfaces";

// Utility function to calculate shipping rate
const calculateShippingRate = (
  country: number,
  state: string,
  states: any[],
  countries: any[],
  shippingZones: ShippingZone[]
): number => {
  console.log("calculateShippingRate called with:", {
    country,
    state,
    statesCount: states.length,
    countriesCount: countries.length,
    shippingZonesCount: shippingZones.length
  });

  if (country === 65 && states.length > 0) {
    // Local shipping - based on state
    const selectedState = states.find((s) => s.name === state);
    console.log("Selected state:", selectedState);
    
    // Try multiple matching strategies
    let zone = null;
    
    // Strategy 1: Match by _id with shipping_zone
    zone = shippingZones.find(
      (z) => {
        console.log("Strategy 1 - Checking zone:", z._id, "against state shipping_zone:", selectedState?.shipping_zone);
        return z._id === selectedState?.shipping_zone.toString() && z.localGlobal === "local";
      }
    );
    
    // Strategy 2: If not found, try matching by state name in states array
    if (!zone) {
      zone = shippingZones.find(
        (z) => {
          console.log("Strategy 2 - Checking zone states array:", z.states, "for state _id:", selectedState?._id);
          return z.states && z.states.includes(selectedState?._id) && z.localGlobal === "local";
        }
      );
    }
    
    // Strategy 3: If still not found, try matching by state ID in states array
    if (!zone) {
      zone = shippingZones.find(
        (z) => {
          console.log("Strategy 3 - Checking zone states array:", z.states, "for state ID:", selectedState?.id);
          return z.states && z.states.includes(selectedState?.id.toString()) && z.localGlobal === "local";
        }
      );
    }
    
    console.log("Found local zone:", zone);
    return zone ? zone.zone_rate.local : 70; // Default local rate
  } else {
    // Global shipping - based on country
    const selectedCountry = countries.find((c) => c.id === country);
    console.log("Selected country:", selectedCountry);
    
    // Try multiple matching strategies
    let zone = null;
    
    // Strategy 1: Match by _id with shipping_zone
    zone = shippingZones.find(
      (z) => {
        console.log("Strategy 1 - Checking zone:", z._id, "against country shipping_zone:", selectedCountry?.shipping_zone);
        return z._id === selectedCountry?.shipping_zone?.toString() && z.localGlobal === "global";
      }
    );
    
    // Strategy 2: If not found, try matching by country name in countries array
    if (!zone) {
      zone = shippingZones.find(
        (z) => {
          console.log("Strategy 2 - Checking zone countries array:", z.countries, "for country:", selectedCountry?.name);
          return z.countries && z.countries.includes(selectedCountry?.name) && z.localGlobal === "global";
        }
      );
    }
    
    // Strategy 3: If still not found, try matching by country ID in countries array
    if (!zone) {
      zone = shippingZones.find(
        (z) => {
          console.log("Strategy 3 - Checking zone countries array:", z.countries, "for country ID:", selectedCountry?.id);
          return z.countries && z.countries.includes(selectedCountry?.id.toString()) && z.localGlobal === "global";
        }
      );
    }
    
    console.log("Found global zone:", zone);
    return zone ? zone.zone_rate.global : 65; // Default global rate
  }
};

const CheckoutClientPage = () => {
  // let subTotal=0;
  // let total = 0;
  // const []    const[countries,setCountries]=useState([]);
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const calculateTotals = () => {
    // Calculate subtotal first
    const calculatedSubTotal = cart.reduce(
      (acc, cartItem) => acc + cartItem.price * cartItem.quantity,
      0
    );
    setSubTotal(calculatedSubTotal);
    
    // Calculate discount amount
    let newDiscountAmount = 0;
    let effectiveShipping = shipping;

    if (appliedDiscount && appliedDiscount.value !== undefined) {
      if (appliedDiscount.calculationType === 'PERCENTAGE') {
        newDiscountAmount = Math.round((calculatedSubTotal * appliedDiscount.value) / 100);
        console.log('Percentage discount:', {
          subtotal: calculatedSubTotal,
          percentage: appliedDiscount.value,
          discountAmount: newDiscountAmount
        });
      } else if (appliedDiscount.calculationType === 'FIXED_AMOUNT') {
        newDiscountAmount = appliedDiscount.value;
        console.log('Fixed amount discount:', {
          subtotal: calculatedSubTotal,
          fixedAmount: appliedDiscount.value,
          discountAmount: newDiscountAmount
        });
      }
      else if (appliedDiscount.calculationType === 'FREE_SHIPPING'){
        effectiveShipping = 0;
        newDiscountAmount = shipping; // Set the discount amount to the original shipping cost
        console.log('Free shipping discount applied:', {
          originalShipping: shipping,
          effectiveShipping: 0,
          discountAmount: newDiscountAmount
        });
      }
    }

    setDiscountAmount(newDiscountAmount);
    
    // Calculate final total
    const finalTotal = calculatedSubTotal + effectiveShipping;
    console.log('Final calculation:', {
      subtotal: calculatedSubTotal,
      shipping: effectiveShipping,
      discountAmount: newDiscountAmount,
      finalTotal
    });
    setTotal(finalTotal);
  };
  type Payment = "cash" | "card" | "instapay";
  const { user } = useContext(userContext);
  const [shipping, setShipping] = useState(70);
  const [payment, setPayment] = useState<Payment>("cash");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { cart, setCart } = useContext(cartContext);
  const [countries, setCountries] = useState<Country[]>([]);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [summary, setSummary] = useState(false);
  const [subTotal, setSubTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [formErrors, setFormErrors] = useState<any>({});
  const [country, setCountry] = useState(65);
  const [billingCountry, setBillingCountry] = useState(65);
  const [states, setStates] = useState<
    { name: string; shipping_zone: number }[]
  >([]);
  const [useSameAsShipping, setUseSameAsShipping] = useState(true);

  // const [state,setState]=useState(states.length>0?states[0].name:'')
  const [state, setState] = useState("Alexandria"); // Default to the first state's name or an empty string
  const [billingState, setBillingState] = useState("Alexandria"); 
  const handleDiscountApplied = (discount: Discount | null) => {
    // alert(discount?.calculationType)
    setAppliedDiscount(discount);
  };// Default to the first state's name or an empty string
  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      total: total,
      shipping: shipping,
      subTotal: subTotal,
      cart: cart,
    }));
  }, [cart, setCart]);
  useEffect(() => {
    const countryName = countries.find((countryy) => countryy.id === country);

    setFormData((prevFormData) => ({
      ...prevFormData,
      total: total,
      shipping: shipping,
      subTotal: subTotal,
      country: countryName ? countryName.name : "",
    }));
  }, [total, country, countries]);
  const [formData, setFormData] = useState({
    email: "",
    country: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    postalZip: "",
    city: "",
    cart: cart,
    phone: "",
    state: state,
    cash: payment,
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
    currency: user.userCountry === "EG" ? "LE" : "USD",
  });
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log(value);
    setFormData({ ...formData, [name]: value });
  };

  // Separate handler for state changes to ensure shipping calculation triggers
  const handleStateChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
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
        countryy.id === (useSameAsShipping ? country : billingCountry)
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
    // const calculateShipping=()=>{
    //   if(country===65){
    //     const selectedState = states.find((state) => state.name === formData.state)
    //     const zone =shippingZones.find((zone:ShippingZone) => (zone._id === selectedState?.shipping_zone && zone.localGlobal ==='local'))
    //    if(zone){

    //      setShipping(zone.zone_rate.local)
    //    }
    //   }

    // };
    // calculateShipping();
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

    const calculatedSubTotal = cart.reduce(
      (acc, cartItem) => acc + cartItem.price * cartItem.quantity,
      0
    );
    setSubTotal(calculatedSubTotal);
    setTotal(calculatedSubTotal + shipping);
    cartItems();
  }, [cart, country, billingState]); // Removed 'state' from dependencies
  useEffect(() => {
    if (country !== 65) {
      setPayment("card");
    }
  }, [country]);
  useEffect(() => {
    formData.cash = payment;
  }, [setPayment]);

  // Sync state changes with formData
  useEffect(() => {
    setFormData(prevFormData => ({
      ...prevFormData,
      state: state
    }));
  }, [state]);

  // Handle country changes
  useEffect(() => {
    if (country === 65 && states.length > 0 && !state) {
      // Only reset to first state when switching to Egypt AND no state is currently selected
      setState(states[0].name);
    }
  }, [country, states, state]);

  useEffect(() => {
    console.log("Shipping calculation triggered:", {
      country,
      state,
      statesLength: states.length,
      shippingZonesLength: shippingZones.length,
      countriesLength: countries.length
    });
    
    // Debug: Log all states and their shipping zones
    if (states.length > 0) {
      console.log("All states:", states.map(s => ({ name: s.name, shipping_zone: s.shipping_zone, type: typeof s.shipping_zone })));
    }
    
    // Debug: Log all shipping zones
    if (shippingZones.length > 0) {
      console.log("All shipping zones:", shippingZones.map(z => ({ 
        _id: z._id, 
        zone_name: z.zone_name, 
        localGlobal: z.localGlobal,
        zone_rate: z.zone_rate 
      })));
    }
    
    if (country === 65 && states.length > 0 && shippingZones.length > 0) {
      const shippingRate = calculateShippingRate(country, state, states, countries, shippingZones);
      console.log("Local shipping rate calculated:", shippingRate);
      setShipping(shippingRate);
      const calculatedSubTotal = cart.reduce(
        (acc, cartItem) => acc + cartItem.price * cartItem.quantity,
        0
      );
      setSubTotal(calculatedSubTotal);
      setTotal(calculatedSubTotal + shippingRate);
    } else if (shippingZones.length > 0) {
      const shippingRate = calculateShippingRate(country, state, states, countries, shippingZones);
      console.log("Global shipping rate calculated:", shippingRate);
      setShipping(shippingRate);
      const calculatedSubTotal = cart.reduce(
        (acc, cartItem) => acc + cartItem.price * cartItem.quantity,
        0
      );
      setSubTotal(calculatedSubTotal);
      setTotal(calculatedSubTotal + shippingRate);
    }
  }, [country, states, shippingZones, state, countries, cart]);

  let cartItems = () => {
    return cart.map((cartItem, index) => (
      <OrderSummaryItem cartItem={cartItem} key={index} />
    ));
  };
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
    const res = await axios.post("/api/payment/", formData);
    console.log(res.data.token);
    setLoading(false);

    if (payment === "card") {
      const paymobIframeURL = `https://accept.paymob.com/api/acceptance/iframes/890332?payment_token=${res.data.token}`;
      router.push(paymobIframeURL);
    } else {
      if (res.data.token === "wiig") {
        setCart([]);
        router.replace("/pages/payment/success");
      }
    }
  };
  return (
    // cart.length > 0 ?
    <div
      className={`relative pt-14 container-custom  justify-between text-everGreen min-h-screen  bg-creamey  flex flex-col `}
    >
      <div className="w-full flex flex-col-reverse md:flex-row">
        <div className="flex flex-col px-1 md:px-2 bg-backgroundColor items-start w-full md:w-5/7 text-[12px] lg:text-lg gap-6 text-nowrap">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-start w-full text-[12px] lg:text-lg gap-2 py-1 pr-1 md:pr-2  border-primary text-nowrap"
          >
            <div
              className={`${thirdFont.className} w-full text-[16px] lg:text-2xl  border-b border-primary`}
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
                  } w-full h-10 bg-white rounded-2xl  px-1 text-base`}
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
              className={`${thirdFont.className} w-full text-[16px] lg:text-2xl border-b border-primary`}
            >
              delivery
            </div>

            <div className="flex gap-2 items-center text-base w-full">
              <p>Country</p>
              {countries ? (
                <select
                  onChange={(e) => setCountry(Number(e.target.value))}
                  name="country"
                  value={country}
                  className="px-1 text-sm h-10 w-full bg-white rounded-2xl py-2"
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
                  className="px-1 text-sm h-10 w-full bg-white rounded-2xl py-2"
                >
                  <option value="EG">EGYPT</option>
                  <option value="SA">SAUDI ARABIA</option>
                </select>
              )}
            </div>
            <div className="flex justify-start  flex-col md:flex-row w-full gap-2 items-start md:items-center">
              <div className="flex flex-col gap-2 w-full md:w-2/4">
                <div className="flex gap-2 w-full items-center">
                  <label className="text-everGreen whitespace-nowrap text-base">First name</label>
                  <div className="flex w-full gap-1 flex-col">
                    <input
                      onChange={handleInputChange}
                      name="firstName"
                      value={formData.firstName}
                      type="text"
                      className={`border ${
                        formErrors.firstName ? "border-red-500" : ""
                      } w-full h-10 bg-white rounded-2xl py-2 px-1 text-sm`}
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
              <div className="flex flex-col gap-2 w-full md:w-2/4">
                <div className="flex gap-2 w-full items-center">
                  <label className="text-everGreen text-base whitespace-nowrap">Last name</label>
                  <div className="flex w-full gap-1 flex-col">
                    <input
                      name="lastName"
                      onChange={handleInputChange}
                      value={formData.lastName}
                      type="text"
                      className={`border ${
                        formErrors.lastName ? "border-red-500" : ""
                      } w-full h-10 bg-white rounded-2xl py-2 px-1 text-sm`}
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
              <label className="text-everGreen text-base whitespace-nowrap">Address</label>
              <div className="flex w-full gap-1 flex-col">
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="address"
                  value={formData.address}
                  className={`border ${
                    formErrors.address ? "border-red-500" : ""
                  } w-full h-10 bg-white rounded-2xl py-2 px-1 text-sm`}
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
                className="border w-full h-10 bg-white rounded-2xl py-2 px-1 text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row w-full gap-2">
              <div className="flex flex-col w-full gap-2 flex-nowrap sm:w-3/5 ">
                <div className="flex w-full gap-2 items-center">
                  <label className="text-everGreen text-base whitespace-nowrap">Postal/Zip code</label>
                  <div className="flex w-full gap-1 flex-col">
                    <input
                      placeholder={`IF UNAVAILABLE PLEASE TYPE 0000`}
                      onChange={handleInputChange}
                      value={formData.postalZip}
                      name="postalZip"
                      type="text"
                      className={`${
                        formErrors.postalZip ? "border-red-500" : ""
                      } border w-full h-10 bg-white rounded-2xl py-2  px-1 text-sm`}
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
                  <label className="text-everGreen text-base whitespace-nowrap">City</label>
                  <div className="flex w-full gap-1 flex-col">
                    <input
                      onChange={handleInputChange}
                      name="city"
                      value={formData.city}
                      type="text"
                      className={`border w-full h-10 bg-white rounded-2xl py-2 px-1 text-sm ${
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
              <label className="text-everGreen text-base whitespace-nowrap">Governate</label>
              {country === 65 ? (
                <select
                  onChange={handleStateChange}
                  name="state"
                  value={formData.state}
                  className="px-1 text-sm h-10 w-full bg-white rounded-2xl py-2"
                >
                  {states.map((state: any, index: number) => {
                    return (
                      <option className="bg-white" key={index} value={state.name}>
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
                  className="border w-full h-10 bg-white rounded-2xl py-2 px-1 text-sm"
                />
              )}
            </div>
            <div className="flex w-full gap-2 items-center">
              <label className="text-everGreen text-base whitespace-nowrap">Phone</label>
              <div className="flex w-full gap-1 flex-col">
                <input
                  onChange={handleInputChange}
                  type="text"
                  value={formData.phone}
                  name="phone"
                  className={`border ${
                    formErrors.phone ? "border-red-500" : ""
                  } w-full h-10 bg-white rounded-2xl py-2 px-1 text-sm`}
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

            <div className="flex flex-col items-start w-full text-[12px] lg:text-lg gap-2 text-nowrap">
              <div
                className={`${thirdFont.className} w-full text-[16px] lg:text-2xl border-b border-primary`}
              >
                payment
              </div>

              {country === 65 && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-6">
                    <input
                      type="checkbox"
                      name="cash"
                      className="appearance-none h-5 rounded-full w-5 border-2 text-white   checked:bg-everGreen "
                      checked={payment === "cash"}
                      onChange={() => {
                        setPayment("cash");
                        formData.cash = "cash";
                      }}
                    />
                    <label> Cash on delivery </label>
                  </div>
                  {/* paymob */}
                  <div className="flex gap-6">
                    <input
                      type="checkbox"
                      className="appearance-none h-5 w-5 border-2 rounded-full text-white   checked:bg-everGreen "
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
    className="appearance-none h-5 w-5 border-2 text-white   checked:bg-primary "
    checked={!cash} onChange={()=>setCash((prev)=>!prev)}/>
           <label> PAY WITH THE CARD</label>
            </div> 
              {/* billing */}

              <div className={`${thirdFont.className} w-full text-[16px] lg:text-2xl border-b border-primary`}>billing address</div>
            <div className="space-y-4">
            <div>
  <label className="flex items-center space-x-3">
    <input
      type="radio"
      name="billingAddress"
      checked={useSameAsShipping}
      onChange={() => setUseSameAsShipping(true)}
      className="h-4 w-4 rounded-full ring-1 ring-gray-500 border-gray-300 focus:ring-primary checked:bg-primary checked:border-primary appearance-none cursor-pointer"
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
      className="h-4 w-4 rounded-full ring-1 ring-gray-500 border-gray-300 focus:ring-primary checked:bg-primary checked:border-primary appearance-none cursor-pointer"
    />
    <span className="">Use a different billing address</span>
  </label>
</div>

      </div>
<div className={`flex flex-col gap-2 w-full transition-all duration-500 ease-in-out overflow-hidden
  ${
    !useSameAsShipping
      ? "max-h-[60vh]  opacity-100"
      : "max-h-0  opacity-0"
  }
  `}
  style={{
    padding: !useSameAsShipping ? "0.25rem 0.25rem" : "0",
  }}
  >
             <div className='flex gap-2 w-full'>
              <p>COUNTRY</p>
            {countries?<select  onChange={(e)=>setBillingCountry(Number(e.target.value))} name='billingCountry' value={billingCountry} className='px-1 text-sm h-10 w-full bg-white rounded-2xl py-2'>
                    {countries.map((country:any,index:number)=>{
                      return <option key={index} value={country.id}>{country.name}</option>
                    })}              
                         </select> :<select  onChange={handleInputChange} name='billingCountry' value={formData.billingCountry} className='px-1 text-sm h-10 w-full bg-white rounded-2xl py-2'>
              <option value='EG'>EGYPT</option>
              <option value='SA'>SAUDI ARABIA</option>
             </select> }
              </div>
              <div className='flex justify-start  flex-col md:flex-row w-full gap-2 items-start md:items-center'>
              <div className='flex gap-2 w-full md:w-2/4'>
                <label className='text-everGreen' >FIRST NAME</label>
                <input onChange={handleInputChange} name='billingFirstName' value={useSameAsShipping?formData.firstName :formData.billingFirstName} type='text' className='border w-full h-10 bg-white rounded-2xl py-2 px-1 text-sm'/>

              </div>
              <div className='flex gap-2 w-full md:w-2/4'>
                <label className='text-everGreen' >LAST NAME</label>
                <input name='billingLastName' onChange={handleInputChange} value={useSameAsShipping?formData.lastName:formData.billingLastName} type='text' className='border w-full h-10 bg-white rounded-2xl py-2 px-1 text-sm'/>

              </div>
              </div>
              <div className='flex gap-2 w-full'>
                <label className='text-everGreen' >ADDRESS</label>
                <input type='text' onChange={handleInputChange} name='billingAddress' value={useSameAsShipping?formData.address :formData.billingAddress} className='border w-full h-10 bg-white rounded-2xl py-2 px-1 text-sm'/>

              </div>
              <div className='flex w-full  gap-2 items-center'>
                <label className='text-everGreen text-nowrap' >APARTMENT,SUITE ETC. (OPTIONAL)</label>
                <input onChange={handleInputChange} name='billingApartment' value={useSameAsShipping?formData.apartment:formData.billingApartment} type='text' className='border w-full h-10 bg-white rounded-2xl py-2 px-1 text-sm'/>
              </div>
              <div className='flex w-full gap-2'>
              <div className='flex w-full gap-2 md:w-3/5 items-center'>
                <label className='text-everGreen' >POSTAL/ZIP CODE (OPTIONAL)</label>
                <input onChange={handleInputChange} value={useSameAsShipping?formData.postalZip:formData.billingPostalZip} name='billingPostalZip' type='text' className='border w-full h-10 bg-white rounded-2xl py-2  px-1 text-sm'/>
              </div>

              <div className='flex w-full  md:w-2/5 gap-2 items-center'>
                <label className='text-everGreen' >CITY</label>
                <input onChange={handleInputChange} name='billingCity' value={useSameAsShipping?formData.city:formData.billingCity} type='text' className='border w-full h-10 bg-white rounded-2xl py-2 px-1 text-sm'/>
              </div>
              </div>
                
              <div className='flex w-full  gap-2 items-center'>
                <label className='text-everGreen' >GOVERNATE</label>
               {
               billingCountry===65?
               <select  onChange={handleInputChange} name='billingState' value={useSameAsShipping?formData.state:formData.billingState} className='px-1 text-sm h-10 w-full bg-white rounded-2xl py-2'>
                    {states.map((state:any,index:number)=>{
                      return <option key={index} value={state.name}>{state.name}</option>
                    })}              
                         </select>
               :
               
               <input onChange={handleInputChange} value={useSameAsShipping?formData.state:formData.billingState} name='billingState' type='text' className='border w-full h-10 bg-white rounded-2xl py-2 px-1 text-sm'/>
                  }
              </div>
              <div className='flex w-full gap-2 items-center'>
                <label className='text-everGreen' >PHONE</label>
                <input onChange={handleInputChange} type='text' value={useSameAsShipping?formData.phone :formData.billingPhone} name='billingPhone' className='border w-full h-10 bg-white rounded-2xl py-2 px-1 text-sm'/>
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
            {payment === "cash" || "instapay" ? (
              <div className={`flex justify-end`}>
                <button
                  onClick={() => handleSubmit}
                  disabled={loading || cart.length === 0}
                >
                  Confirm order
                </button>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  disabled={cart.length === 0 || loading}
                  type="submit"
                  className={`border transition duration-300 border-primary p-1 ${
                    cart.length === 0 || loading
                      ? "cursor-not-allowed bg-gray-300 text-gray-500" // Styles for disabled state
                      : "hover:cursor-pointer hover:bg-primary hover:text-white text-everGreen"
                  }`}
                >
                  PROCEED TO PAYMENT
                </button>
              </div>
            )}
            <div className="text-sm">
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
            <div className="flex gap-1 py-3 justify-center items-center">
              <h1 className={`${thirdFont.className}`}>ORDER SUMMARY</h1>
              <IoIosArrowDown
                className={`${
                  summary ? "rotate-180" : ""
                } transition duration-500`}
              />
            </div>
            <h1 className={`${thirdFont.className}`}>
              {total} {user.userCountry === "EG" ? "LE" : "USD"}{" "}
            </h1>
          </div>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              summary ? "max-h-[60vh]  opacity-100" : "max-h-0  opacity-0"
            } px-1 py-1 flex flex-col gap-2`}
            style={{
              padding: summary ? "0.25rem 0.25rem" : "0",
            }}
          >
            {cart.map((cartItem, index) => (
              <OrderSummaryItem cartItem={cartItem} key={index} />
            ))}
            <div className="flex pb-5 justify-between">
              <div className="flex flex-col gap-1">
                <p>SUBTOTAL</p>
                <p>SHIPPING</p>
                <p className="mt-6">TOTAL</p>
              </div>

              <div className="flex flex-col gap-1 items-end">
                <p className="text-[12px] lg:text-lg">
                  {subTotal} {user.userCountry === "EG" ? "LE" : "USD"}
                </p>
                <p className="text-[12px] lg:text-lg">
                  {shipping} {user.userCountry === "EG" ? "LE" : "USD"}
                </p>
                <p className="text-[12px] mt-6 lg:text-lg">
                  {total} {user.userCountry === "EG" ? "LE" : "USD"}
                </p>
                {/* <p className="text-[12px] lg:text-lg">{subTotal} {country===65?'LE':'USD'}</p>
      <p className="text-[12px] lg:text-lg">{shipping} {country===65?'LE':'USD'}</p>
      <p className="text-[12px] mt-6 lg:text-lg">{total} {country !==65?'LE':'USD'}</p> */}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 max-lg:order-2 p-6">
            <div className="border-l-2 border-primary p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item,index) => (
                  <CartItemSmall key={index} item={item} wishListBool={false} />
                ))}
              </div>

              {/* Discount Section */}
              <DiscountSection onDiscountApplied={handleDiscountApplied} />

              {/* Order Totals */}
              <div className="mt-6 space-y-2 text-black">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{subTotal} LE</span>
                </div>
                {appliedDiscount && appliedDiscount.value !== undefined && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>
                      {appliedDiscount.calculationType === 'FREE_SHIPPING' 
                        ? `-${shipping} LE (Free Shipping)`
                        : `-${appliedDiscount.calculationType === 'PERCENTAGE' 
                          ? Math.round((subTotal * appliedDiscount.value) / 100)
                          : appliedDiscount.value} LE`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{appliedDiscount?.calculationType === 'FREE_SHIPPING' ? '0' : shipping} LE</span>
                </div>
                <div className="flex justify-between font-bold mt-4 pt-4 border-t">
                  <span>Total</span>
                  <span>{total} LE</span>
                </div>
              </div>

              {/* ... rest of the order summary ... */}
            </div>
          </div>
      </div>
    </div>
  );
};

export default CheckoutClientPage;
