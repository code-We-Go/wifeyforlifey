"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Trash2, ShoppingBag, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useCart } from "@/providers/CartProvider";
import { thirdFont } from "@/fonts";
import { ShippingZone } from "../interfaces/interfaces";
import axios from "axios";
import CartItemSmall from "./CartItemSmall";

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
    shippingZonesCount: shippingZones.length
  });

  if (countryID === 65 && states.length > 0) {
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
    const selectedCountry = countries.find((c) => c.id === countryID);
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

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [shipping, setShipping] = useState(0);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [countryID, setCountryID] = useState(65); // Default to Egypt
  const [state, setState] = useState("Alexandria"); // Default state

  // Fetch shipping zones and countries on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [zonesResponse, countriesResponse, statesResponse] = await Promise.all([
          axios.get("/api/shipping"),
          axios.get("/api/countries"),
          axios.get(`/api/states?countryID=${65}`)
        ]);
        
        setShippingZones(zonesResponse.data);
        setCountries(countriesResponse.data);
        setStates(statesResponse.data);
      } catch (error) {
        console.error("Error fetching shipping data:", error);
      }
    };
    
    fetchData();
  }, []);

  // Calculate shipping when dependencies change
  useEffect(() => {
    if (shippingZones.length > 0 && countries.length > 0) {
      const shippingRate = calculateShippingRate(countryID, state, states, countries, shippingZones);
      setShipping(shippingRate);
    }
  }, [countryID, state, states, countries, shippingZones]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    // Simulate API call
    setTimeout(() => {
      setIsApplying(false);
      alert(`Coupon "${couponCode}" is invalid.`);
    }, 1000);
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 max-w-4xl  mx-auto text-center">
        <div className="bg-card rounded-2xl bg-lovely text-creamey border-2 border-lovely  p-8 md:p-12 shadow-sm">
          <div className="w-24 h-24  rounded-full flex bg-creamey items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-lovely" />
          </div>
          <h1 className="text-2xl md:text-3xl text-creamey  font-medium mb-4">Your Cart is Empty</h1>
          <p className=" mb-8 max-w-md mx-auto">
            Looks like you haven&apos;t added anything to your cart yet. Explore our products and find something you&apos;ll love!
          </p>
          <Button asChild size="lg" className="rounded-2xl bg-creamey text-lovely hover:bg-creamey hover:font-semibold">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const tax = totalPrice * 0.1; // 10% tax
  const orderTotal = totalPrice + shipping + tax;

  return (
    <div className="container-custom py-8 min-h-screen md:py-12">
      <div className="flex items-center mb-8">
        <h1 className={`${thirdFont.className} tracking-normal text-4xl text-everGreen md:text-5xl  font-semibold`}>Shopping Cart</h1>
        <span className="ml-2 text-creamey">
          ({totalItems} {totalItems === 1 ? "item" : "items"})
        </span>
      </div>

      <div className="grid grid-cols-1  gap-8">
        {/* Cart Items */}
        <div className="lg: space-y-6">
          <div className="hidden md:grid grid-cols-12 gap-4 text-sm text-creamey mb-2">
            <div className="col-span-5 text-center">Product</div>
            <div className="col-span-2 text-center">Variants</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-1 text-center">Price</div>
            <div className="col-span-1 text-right">Total</div>
          </div>

          <Separator className="hidden md:block bg-lovely" />
          <div className="w-full flex flex-col gap-4">

         
          {items.map((item,index) => (
            <CartItemSmall item={item} key={index} wishListBool={false}/>
            // <div key={index} className="bg-card bg-everGreen text-creamey rounded-lg p-4 md:p-6 shadow-sm">
            //   <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            //     {/* Product */}
            //     <div className="md:col-span-5 flex items-center space-x-4">
            //       <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
            //         <Image
            //           src={item.imageUrl}
            //           alt={item.productName}
            //           fill
            //           className="object-cover rounded-md"
            //         />
            //       </div>
            //       <div>
            //         <h5 className="font-medium line-clamp-1">{item.productName}</h5>
            //         {/* <p className="text-sm text-creamey md:hidden">
            //           ${item.price.toFixed(2)}
            //         </p> */}
            //       </div>

            //     </div>
            //     <div className="md:col-span-1 hidden md:block text-center">
            //       {item.variant.name}
            //     </div>
            //     <div className="md:col-span-1 hidden md:block text-center">
            //       {item.attributes.name}
            //     </div>


            //     {/* Quantity */}
            //     <div className="md:col-span-2 flex items-center justify-between md:justify-center">
            //       <span className="md:hidden text-sm text-creamey">
            //         Quantity:
            //       </span>
            //       <div className="flex items-center">
            //         <Button
            //           variant="outline"
            //           size="icon"
            //           className="h-8 w-8"
            //           onClick={() => 
            //             updateQuantity(item.productId, Math.max(1, item.quantity - 1),item.variant, item.attributes)
            //           }
            //         >
            //           <span className="sr-only">Decrease quantity</span>
            //           <span className="text-everGreen" aria-hidden>-</span>
            //         </Button>
            //         <span className="w-10 text-center">{item.quantity}</span>
            //         <Button
            //           variant="outline"
            //           size="icon"
            //           className="h-8 w-8"
            //           onClick={() => 
            //             updateQuantity(item.productId, item.quantity + 1,item.variant,item.attributes)
            //           }
            //         >
            //           <span className="sr-only">Increase quantity</span>
            //           <span className="text-everGreen" aria-hidden>+</span>
            //         </Button>
            //       </div>
            //     </div>

            //     {/* Price */}
            //     <div className="md:col-span-1 hidden md:block text-center">
            //       ${item.price.toFixed(2)}
            //     </div>

            //     {/* Total */}
            //     <div className="md:col-span-2 flex items-center justify-between md:justify-end">
            //       <span className="md:hidden text-sm text-creamey">
            //         Total:
            //       </span>
            //       <div className="flex items-center">
            //         <span className="font-medium">
            //           ${(item.price * item.quantity).toFixed(2)}
            //         </span>
            //         <Button
            //           variant="ghost"
            //           size="icon"
            //           className="ml-2 h-8 w-8 text-creamey hover:text-destructive"
            //           onClick={() => removeItem(item.productId,item.variant,item.attributes)}
            //         >
            //           <Trash2 className="h-4 w-4" />
            //           <span className="sr-only">Remove item</span>
            //         </Button>
            //       </div>
            //     </div>
            //   </div>
            // </div>
          ))}
 </div>
          
        <div className="flex gap-4">

        
          <div className="mt-6 flex justify-between items-center">
            <Button asChild variant="outline" className="gap-2 rounded-2xl bg-creamey text-lovely hover:bg-lovely hover:text-creamey border-lovely">
              <Link href="/shop">
                {/* <ArrowLeft className="h-4 w-4" /> */}
                Continue Shopping
              </Link>
            </Button>
          </div>
          <div className="mt-6 flex justify-between items-center">
            <Button asChild variant="outline" className="gap-2 rounded-2xl bg-lovely hover:border hover:border-lovely hover:text-lovely text-creamey">
              <Link href="/checkout">
                Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          </div>
        </div>

        {/* Order Summary */}
        {/* <div className="lg:col-span-1 ">
          <div className="bg-card rounded-lg p-6 shadow-sm sticky bg-everGreen text-creamey top-24">
            <h2 className="text-xl font-medium mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-50">Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-50">Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-gray-50">Calculated at checkout</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-50">Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-medium text-base pt-2">
                <span>Total</span>
                <span>${orderTotal.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleApplyCoupon} className="mt-6">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  variant="outline"
                  disabled={!couponCode || isApplying}
                  className="text-creamey bg-everGreen hover:bg-lovely"
                >
                  Apply
                </Button>
              </div>
            </form>

            <Button className="w-full hover:bg-saga text-creamey bg-lovely/90 mt-6 rounded-full" size="lg" asChild>
              <Link href="/checkout">
                <CreditCard className="mr-2 h-5 w-5" />
                Checkout
              </Link>
            </Button>

            <p className="text-xs text-gray-50 text-center mt-4">
              Secure online payment powered by Paymob
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
}