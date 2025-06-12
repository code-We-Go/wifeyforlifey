'use client'
import React, { useContext } from 'react'
import { signOut } from "next-auth/react";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { wifeyFont } from '@/app/layout';
import { lifeyFont, thirdFont } from '@/fonts';



const PolicyTab = ({title,value,activeTab,setActiveTab}:{title:string,value:string,activeTab:string,setActiveTab:React.Dispatch<React.SetStateAction<string>>}) => {
 const router = useRouter();

  const handleClick = async () => {
    setActiveTab(value);
    router.push(`/policies?${value}`);
  };

  return (
    <div 
    onClick={handleClick}
    className={`${value === activeTab ?'text-lovely':'text-gray-500'} hover:cursor-pointer text-xl text-nowrap ${thirdFont.className}`}>{title}</div>
  )
}

export default PolicyTab