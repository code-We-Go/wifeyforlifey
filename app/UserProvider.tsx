'use client';

import { ReactNode, useEffect, useState } from 'react';
import { userContext } from './context/userContext';
import { User } from './interfaces/interfaces';
import axios from 'axios';
import DeviceDetector from 'device-detector-js';

export default function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({
    email: "",
    userId: "",
    userCountry: "EG",
    address: "",
    firstName: "",
    lastName: "",
    title: "",
    dob: "",
    phoneNumber: "",
    deviceType: "", // Device type (mobile, desktop, tablet, etc.)
    deviceBrand: "", // Device manufacturer (Apple, Samsung, etc.)
    deviceModel: "", // Device model (iPhone 12, Galaxy S21, etc.)
    browserName: "", // Browser name (Chrome, Firefox, Safari, etc.)
    browserVersion: "", // Browser version
    osName: "", // Operating system name (iOS, Android, Windows, etc.)
    osVersion: "", // Operating system version
  });

  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        const response = await axios.get('https://get.geojs.io/v1/ip/country');
        console.log("country" + JSON.stringify(response));
        const cleanedCountry = response.data.split("\n")[0];
        
        setUser((prevUser) => ({ ...prevUser, userCountry: cleanedCountry }));
      } catch (error) {
        console.error('Error fetching user country:', error);
        const response = await axios.get('https://ipinfo.io/json?token=8bc8d037f72ed2');
        setUser((prevUser) => ({ ...prevUser, userCountry: "EG" }));
        const detectedCountry = response.data.country || "EG";
        console.log(`Detected Country: ${detectedCountry}`);
        setUser((prevUser) => ({ ...prevUser, userCountry: detectedCountry }));
      }
    };

    const detectDeviceType = () => {
      console.log("working...");
      const userAgent = navigator.userAgent;
      const deviceDetector = new DeviceDetector();
      const result = deviceDetector.parse(userAgent);
      
      // Extract device information
      const deviceType = result.device ? result.device.type : "desktop"; // Default to desktop if unable to detect
      const deviceBrand = result.device ? result.device.brand || "" : "";
      const deviceModel = result.device ? result.device.model || "" : "";
      
      // Extract browser information
      const browserName = result.client ? result.client.name || "" : "";
      const browserVersion = result.client ? result.client.version || "" : "";
      
      // Extract OS information
      const osName = result.os ? result.os.name || "" : "";
      const osVersion = result.os ? result.os.version || "" : "";
      
      console.log("Device Info:", { deviceType, deviceBrand, deviceModel, browserName, browserVersion, osName, osVersion });
      
      setUser((prevUser) => ({
        ...prevUser,
        deviceType,
        deviceBrand,
        deviceModel,
        browserName,
        browserVersion,
        osName,
        osVersion
      }));
    };

    fetchUserCountry();
    detectDeviceType(); // Detect the user's device type

  }, []);

  useEffect(() => {
    if (user.userCountry && user.deviceType) {
      const sendVisitData = async () => {
        try {
          await axios.post('/api/visits', {
            countryCode: user.userCountry,
            deviceType: user.deviceType,
            deviceBrand: user.deviceBrand,
            deviceModel: user.deviceModel,
            browserName: user.browserName,
            browserVersion: user.browserVersion,
            osName: user.osName,
            osVersion: user.osVersion
          });
          console.log('Enhanced visit data sent successfully');
        } catch (error) {
          console.error('Error sending visit data:', error);
        }
      };
  
      sendVisitData();
    }
  }, [user.userCountry, user.deviceType, user.deviceBrand, user.deviceModel, 
      user.browserName, user.browserVersion, user.osName, user.osVersion]); // Track all device information
   // Send the data when user state changes

  return (
    <userContext.Provider value={{ user, setUser }}>
      {children}
    </userContext.Provider>
  );
}
