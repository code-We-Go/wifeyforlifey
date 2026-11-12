'use client';
import React from 'react';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { thirdFont } from '@/fonts';

interface PolicyTabProps {
  title: string;
  value: string;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const PolicyTab: React.FC<PolicyTabProps> = ({
  title,
  value,
  activeTab,
  setActiveTab,
}) => {
  const router = useRouter();
  const locale = useLocale();
  const isAr = locale === 'ar';

  const handleClick = () => {
    setActiveTab(value);
    router.push(`/policies?${value}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`text-start transition-all duration-200 cursor-pointer text-xl text-nowrap ${
        value === activeTab
          ? 'text-lovely underline underline-offset-8 font-extrabold'
          : 'text-lovely/70 hover:text-lovely font-medium'
      } ${isAr ? 'font-bold' : thirdFont.className}`}
    >
      {title}
    </button>
  );
};

export default PolicyTab;