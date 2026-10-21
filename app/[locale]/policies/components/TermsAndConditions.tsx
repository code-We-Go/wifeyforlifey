import React from 'react';
import { useTranslations } from 'next-intl';

interface PolicyProps {
  selectedTab: string;
  setSelectedTab?: React.Dispatch<React.SetStateAction<string>>;
}

const TermsAndConditions: React.FC<PolicyProps> = ({ selectedTab }) => {
  const t = useTranslations('policiesPage.terms');

  return (
    <div
      className={`${
        selectedTab === 'terms-and-conditions'
          ? 'flex flex-col gap-6'
          : 'hidden'
      } h-auto w-full text-lovely`}
    >
      <h1 className="font-bold text-2xl md:text-3xl text-lovely mb-2">
        {t('title')}
      </h1>

      <p className="text-base md:text-lg leading-relaxed">{t('intro')}</p>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('section1Title')}
        </h2>
        <ul className="list-disc list-inside space-y-1.5 ms-2 text-lovely/90">
          <li>{t('generalItem1')}</li>
          <li>{t('generalItem2')}</li>
          <li>{t('generalItem3')}</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('section2Title')}
        </h2>
        <p className="text-lovely/90 leading-relaxed">{t('productsDesc')}</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('section3Title')}
        </h2>
        <ul className="list-disc list-inside space-y-1.5 ms-2 text-lovely/90">
          <li>{t('ordersItem1')}</li>
          <li>{t('ordersItem2')}</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('section4Title')}
        </h2>
        <ul className="list-disc list-inside space-y-1.5 ms-2 text-lovely/90">
          <li>{t('shippingItem1')}</li>
          <li>{t('shippingItem2')}</li>
          <li>{t('shippingItem3')}</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('section5Title')}
        </h2>
        <ul className="list-disc list-inside space-y-1.5 ms-2 text-lovely/90">
          <li>{t('videoItem1')}</li>
          <li>{t('videoItem2')}</li>
          <li>{t('videoItem3')}</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('section6Title')}
        </h2>
        <p className="text-lovely/90 leading-relaxed">{t('ipDesc')}</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('section7Title')}
        </h2>
        <p className="text-lovely/90 leading-relaxed">{t('communityDesc')}</p>
      </div>

      <p className="text-lovely font-medium text-lg pt-4 border-t border-lovely/20 leading-relaxed">
        {t.rich('closing', {
          emailLink: (chunks) => (
            <a
              href="mailto:support@wifeyforlifey.com"
              className="underline font-semibold hover:text-lovely/80"
            >
              {chunks}
            </a>
          ),
        })}
      </p>
    </div>
  );
};

export default TermsAndConditions;