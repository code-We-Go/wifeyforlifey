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
    deviceType: "", // Add deviceType to store the device information
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
      const device = deviceDetector.parse(userAgent);
      const deviceType = device.device? device.device.type : "desktop"; // Default to desktop if unable to detect
      console.log("deviceType"+deviceType)
      setUser((prevUser) => ({ ...prevUser, deviceType }));
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
          });
          console.log('Visit data sent successfully');
        } catch (error) {
          console.error('Error sending visit data:', error);
        }
      };
  
      sendVisitData();
    }
  }, [user.userCountry, user.deviceType]); // Only track necessary dependencies
   // Send the data when user state changes

  return (
    <userContext.Provider value={{ user, setUser }}>
      {children}
    </userContext.Provider>
  );
}
