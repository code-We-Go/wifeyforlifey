"use client";
import React, { useState, useEffect, useRef } from "react";
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

  // Load cities on component mount or when selectedCity changes
  useEffect(() => {
    const loadCities = async () => {
      setLoading((prev) => ({ ...prev, cities: true }));
      try {
        const citiesData = await bostaClientService.getCities();
        setCities(citiesData);
      } catch (error) {
        console.error("Error loading cities:", error);
      } finally {
        setLoading((prev) => ({ ...prev, cities: false }));
      }
    };

    loadCities();
  }, []);

  // Handle initial city selection from props
  useEffect(() => {
    if (selectedCity && cities.length > 0) {
      const cityObj = cities.find(
        (city) => city._id === selectedCity || city.name === selectedCity
      );
      if (cityObj && cityObj._id !== selectedCityObj?._id) {
        setSelectedCityObj(cityObj);
        loadZones(cityObj._id);
      }
    }
  }, [selectedCity, cities]);

  // Handle initial zone selection from props
  useEffect(() => {
    if (selectedZone && zones.length > 0 && selectedCityObj) {
      const zoneObj = zones.find(
        (zone) => zone._id === selectedZone || zone.name === selectedZone
      );
      if (zoneObj && zoneObj._id !== selectedZoneObj?._id) {
        setSelectedZoneObj(zoneObj);
        loadDistricts(selectedCityObj._id, zoneObj._id);
      }
    }
  }, [selectedZone, zones, selectedCityObj]);

  // Handle initial district selection from props
  useEffect(() => {
    if (selectedDistrict && districts.length > 0) {
      const districtObj = districts.find(
        (district) =>
          district.districtId === selectedDistrict ||
          district.districtName === selectedDistrict
      );
      if (
        districtObj &&
        districtObj.districtId !== selectedDistrictObj?.districtId
      ) {
        setSelectedDistrictObj(districtObj);
      }
    }
  }, [selectedDistrict, districts]);
  
  // Cache to store the last fetched shipping cost for a city and order total
  const lastCostRef = useRef({
    cityId: "",
    orderTotal: orderTotal,
    cost: { priceBeforeVat: 70, priceAfterVat: 80, shippingFee: 70 }
  });

  // Update parent component when selected location objects change
  useEffect(() => {
    const updateParent = async () => {
      // Skip updating parent if we're still resolving initial props
      if (loading.cities || loading.zones || loading.districts) return;

      if (selectedCityObj) {
        let shippingCost = lastCostRef.current.cost;

        // Only calculate if the city or order total has changed since the last calculation
        if (
          lastCostRef.current.cityId !== selectedCityObj._id ||
          lastCostRef.current.orderTotal !== orderTotal
        ) {
          shippingCost = await calculateShippingCost(selectedCityObj, orderTotal);
          lastCostRef.current = {
            cityId: selectedCityObj._id,
            orderTotal,
            cost: shippingCost,
          };
        }

        onLocationChange({
          city: selectedCityObj,
          zone: selectedZoneObj,
          district: selectedDistrictObj,
          shippingCost,
        });
      }
    };

    updateParent();
  }, [
    selectedCityObj,
    selectedZoneObj,
    selectedDistrictObj,
    orderTotal,
    loading.cities,
    loading.zones,
    loading.districts,
  ]);

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
    } catch (error) {
      console.error("Error loading districts:", error);
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  // Handle city selection
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    const cityObj = cities.find((city) => city._id === cityId) || null;

    setSelectedCityObj(cityObj);
    setSelectedZoneObj(null);
    setSelectedDistrictObj(null);

    if (cityObj) {
      loadZones(cityId);
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
  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zoneId = e.target.value;
    const zoneObj = zones.find((zone) => zone._id === zoneId) || null;

    setSelectedZoneObj(zoneObj);
    setSelectedDistrictObj(null);

    if (zoneObj && selectedCityObj) {
      loadDistricts(selectedCityObj._id, zoneId);
    } else {
      setDistricts([]);
    }
  };

  // Handle district selection
  const handleDistrictChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const districtId = e.target.value;
    const districtObj =
      districts.find((district) => district.districtId === districtId) || null;

    setSelectedDistrictObj(districtObj);
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
