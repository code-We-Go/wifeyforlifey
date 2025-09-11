"use client";
import React, { useState, useEffect } from "react";
import bostaClientService, {
  BostaCity,
  BostaZone,
  BostaDistrict,
} from "../../services/bostaClientService";

interface BostaLocationSelectorProps {
  onLocationChange: (location: {
    city: BostaCity | null;
    zone: BostaZone | null;
    district: BostaDistrict | null;
    shippingCost: {
      priceBeforeVat: number;
      priceAfterVat: number;
      shippingFee: number;
    };
  }) => void;
  selectedCity?: string;
  selectedZone?: string;
  selectedDistrict?: string;
  orderTotal?: number;
}

const BostaLocationSelector: React.FC<BostaLocationSelectorProps> = ({
  onLocationChange,
  selectedCity = "",
  selectedZone = "",
  selectedDistrict = "",
  orderTotal = 100,
}) => {
  const [cities, setCities] = useState<BostaCity[]>([]);
  const [zones, setZones] = useState<BostaZone[]>([]);
  const [districts, setDistricts] = useState<BostaDistrict[]>([]);
  const [selectedCityObj, setSelectedCityObj] = useState<BostaCity | null>(
    null
  );
  const [selectedZoneObj, setSelectedZoneObj] = useState<BostaZone | null>(
    null
  );
  const [selectedDistrictObj, setSelectedDistrictObj] =
    useState<BostaDistrict | null>(null);
  const [loading, setLoading] = useState({
    cities: false,
    zones: false,
    districts: false,
  });
  const calculateShippingCost = async (
    city: BostaCity | null,
    orderAmount: number = orderTotal
  ) => {
    if (!city) return { priceBeforeVat: 0, priceAfterVat: 0, shippingFee: 0 };

    try {
      // Use the client service to calculate shipping cost with Bosta pricing API
      const cost = await bostaClientService.calculateShippingCost(
        orderAmount, // COD amount
        city.name, // Drop off city
        "Cairo", // Pickup city (default)
        "Normal", // Size
        "SEND" // Type
      );
      return cost;
    } catch (error) {
      console.error("Error calculating shipping cost:", error);
      return { priceBeforeVat: 70, priceAfterVat: 80, shippingFee: 70 }; // Fallback cost
    }
  };

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      setLoading((prev) => ({ ...prev, cities: true }));
      try {
        const citiesData = await bostaClientService.getCities();
        setCities(citiesData);

        // If there's a pre-selected city, find and set it
        if (selectedCity) {
          const cityObj = citiesData.find(
            (city) => city._id === selectedCity || city.name === selectedCity
          );
          if (cityObj) {
            setSelectedCityObj(cityObj);
            loadZones(cityObj._id);
          }
        }
      } catch (error) {
        console.error("Error loading cities:", error);
      } finally {
        setLoading((prev) => ({ ...prev, cities: false }));
      }
    };

    loadCities();
  }, []);

  // Load zones when city changes
  const loadZones = async (cityId: string) => {
    setLoading((prev) => ({ ...prev, zones: true }));
    setZones([]);
    setDistricts([]);
    setSelectedZoneObj(null);
    setSelectedDistrictObj(null);

    try {
      const zonesData = await bostaClientService.getZones(cityId);
      setZones(zonesData);

      // If there's a pre-selected zone, find and set it
      if (selectedZone) {
        const zoneObj = zonesData.find(
          (zone) => zone._id === selectedZone || zone.name === selectedZone
        );
        if (zoneObj) {
          setSelectedZoneObj(zoneObj);
          loadDistricts(cityId, zoneObj._id);
        }
      }
    } catch (error) {
      console.error("Error loading zones:", error);
    } finally {
      setLoading((prev) => ({ ...prev, zones: false }));
    }
  };

  // Load districts when zone changes
  const loadDistricts = async (cityId: string, zoneId: string) => {
    setLoading((prev) => ({ ...prev, districts: true }));
    setDistricts([]);
    setSelectedDistrictObj(null);

    try {
      const districtsData = await bostaClientService.getDistrictsByZone(
        cityId,
        zoneId
      );
      setDistricts(districtsData);

      // If there's a pre-selected district, find and set it
      if (selectedDistrict) {
        const districtObj = districtsData.find(
          (district) =>
            district.districtId === selectedDistrict ||
            district.districtName === selectedDistrict
        );
        if (districtObj) {
          setSelectedDistrictObj(districtObj);
        }
      }
    } catch (error) {
      console.error("Error loading districts:", error);
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  // Handle city selection
  const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    const cityObj = cities.find((city) => city._id === cityId) || null;

    setSelectedCityObj(cityObj);
    setSelectedZoneObj(null);
    setSelectedDistrictObj(null);

    if (cityObj) {
      loadZones(cityId);
      // Calculate shipping cost and notify parent
      const shippingCost = await calculateShippingCost(cityObj, orderTotal);
      onLocationChange({
        city: cityObj,
        zone: null,
        district: null,
        shippingCost,
      });
    } else {
      setZones([]);
      setDistricts([]);
      onLocationChange({
        city: null,
        zone: null,
        district: null,
        shippingCost: {
          priceBeforeVat: 70,
          priceAfterVat: 80,
          shippingFee: 70,
        }, // Default shipping cost
      });
    }
  };

  // Handle zone selection
  const handleZoneChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zoneId = e.target.value;
    const zoneObj = zones.find((zone) => zone._id === zoneId) || null;

    setSelectedZoneObj(zoneObj);
    setSelectedDistrictObj(null);

    if (zoneObj && selectedCityObj) {
      loadDistricts(selectedCityObj._id, zoneId);
      // Calculate shipping cost and notify parent
      // const shippingCost = await calculateShippingCost(
      //   selectedCityObj,
      //   orderTotal
      // );
      // onLocationChange({
      //   city: selectedCityObj,
      //   zone: zoneObj,
      //   district: null,
      //   shippingCost,
      // });
    } else {
      setDistricts([]);
      const shippingCost = selectedCityObj
        ? await calculateShippingCost(selectedCityObj, orderTotal)
        : { priceBeforeVat: 70, priceAfterVat: 80, shippingFee: 70 };
      onLocationChange({
        city: selectedCityObj,
        zone: null,
        district: null,
        shippingCost,
      });
    }
  };

  // Handle district selection
  const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const districtId = e.target.value;
    const districtObj =
      districts.find((district) => district.districtId === districtId) || null;

    setSelectedDistrictObj(districtObj);

    // if (districtObj && selectedCityObj && selectedZoneObj) {
    //   const cost = await calculateShippingCost(selectedCityObj, orderTotal);
    //   onLocationChange({
    //     city: selectedCityObj,
    //     zone: selectedZoneObj,
    //     district: districtObj,
    //     shippingCost: cost,
    //   });
    // }
  };

  return (
    <div className="space-y-4 w-full">
      {/* City/Governorate Selection */}
      <div className="flex w-full gap-2 items-center">
        <label className="text-lovely text-base whitespace-nowrap">
          Governorate
        </label>
        <select
          value={selectedCityObj?._id || ""}
          onChange={handleCityChange}
          disabled={loading.cities}
          className="px-2 text-base h-10 w-full bg-creamey rounded-2xl border border-gray-200 py-2 disabled:opacity-50"
        >
          <option value="">Select Governorate</option>
          {cities.map((city) => (
            <option key={city._id} value={city._id}>
              {city.name} ({city.nameAr})
            </option>
          ))}
        </select>
        {loading.cities && (
          <div className="text-sm text-gray-500">Loading...</div>
        )}
      </div>

      {/* Zone Selection */}
      {selectedCityObj && (
        <div className="flex w-full gap-2 items-center">
          <label className="text-lovely text-base whitespace-nowrap">
            Zone
          </label>
          <select
            value={selectedZoneObj?._id || ""}
            onChange={handleZoneChange}
            disabled={loading.zones || zones.length === 0}
            className="px-2 text-base h-10 w-full bg-creamey rounded-2xl py-2 border border-gray-200 disabled:opacity-50"
          >
            <option value="">Select Zone</option>
            {zones.map((zone) => (
              <option key={zone._id} value={zone._id}>
                {zone.name} ({zone.nameAr})
              </option>
            ))}
          </select>
          {loading.zones && (
            <div className="text-sm text-gray-500">Loading zones...</div>
          )}
        </div>
      )}

      {/* District Selection */}
      {selectedZoneObj && (
        <div className="flex w-full gap-2 items-center">
          <label className="text-lovely text-base whitespace-nowrap">
            District
          </label>
          <select
            value={selectedDistrictObj?.districtId || ""}
            onChange={handleDistrictChange}
            disabled={loading.districts || districts.length === 0}
            className="px-2 text-base h-10 w-full bg-creamey rounded-2xl py-2 border border-gray-200 disabled:opacity-50"
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district.districtId} value={district.districtId}>
                {district.districtName} - {district.districtOtherName}
              </option>
            ))}
          </select>
          {loading.districts && (
            <div className="text-sm text-gray-500">Loading districts...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default BostaLocationSelector;
