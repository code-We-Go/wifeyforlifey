import React from 'react';
import { useTranslations } from 'next-intl';

interface PolicyProps {
  selectedTab: string;
  setSelectedTab?: React.Dispatch<React.SetStateAction<string>>;
}

const PrivacyPolicy: React.FC<PolicyProps> = ({ selectedTab }) => {
  const t = useTranslations('policiesPage.privacy');

  return (
    <div
      className={`${
        selectedTab === 'privacy-policy' ? 'flex flex-col gap-6' : 'hidden'
      } h-auto w-full text-lovely`}
    >
      <p className="text-base md:text-lg leading-relaxed">{t('intro')}</p>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('section1Title')}
        </h2>
        <h3 className="font-semibold text-lg text-lovely/95">
          {t('personalInfoTitle')}
        </h3>
        <p className="text-lovely/90">{t('personalInfoDesc')}</p>
        <ul className="list-disc list-inside space-y-1.5 ms-2 text-lovely/90">
          <li>{t('personalItem1')}</li>
          <li>{t('personalItem2')}</li>
        </ul>

        <h3 className="font-semibold text-lg text-lovely/95 mt-4">
          {t('nonPersonalInfoTitle')}
        </h3>
        <p className="text-lovely/90">{t('nonPersonalInfoDesc')}</p>
        <ul className="list-disc list-inside space-y-1.5 ms-2 text-lovely/90">
          <li>{t('nonPersonalItem1')}</li>
          <li>{t('nonPersonalItem2')}</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('section2Title')}
        </h2>
        <p className="text-lovely/90">{t('whyCollectDesc')}</p>
        <ul className="list-disc list-inside space-y-1.5 ms-2 text-lovely/90">
          <li>{t('whyItem1')}</li>
          <li>{t('whyItem2')}</li>
          <li>{t('whyItem3')}</li>
          <li>{t('whyItem4')}</li>
          <li>{t('whyItem5')}</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('section3Title')}
        </h2>
        <p className="text-lovely/90 leading-relaxed">{t('protectDesc')}</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('section4Title')}
        </h2>
        <p className="text-lovely/90">{t('sharingDesc')}</p>
        <ul className="list-disc list-inside space-y-1.5 ms-2 text-lovely/90">
          <li>{t('sharingItem1')}</li>
          <li>{t('sharingItem2')}</li>
        </ul>
        <p className="text-lovely/80 text-sm mt-1">{t('sharingNote')}</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('section5Title')}
        </h2>
        <p className="text-lovely/90">{t('rightsDesc')}</p>
        <ul className="list-disc list-inside space-y-1.5 ms-2 text-lovely/90">
          <li>{t('rightsItem1')}</li>
          <li>{t('rightsItem2')}</li>
          <li>{t('rightsItem3')}</li>
        </ul>
        <p className="text-lovely/90 mt-2">
          {t.rich('rightsContact', {
            emailLink: (chunks) => (
              <a
                href="mailto:privacy@wifeyforlifey.com"
                className="underline font-semibold hover:text-lovely/80"
              >
                {chunks}
              </a>
            ),
            phoneLink: (chunks) => (
              <a
                href="https://wa.me/201055691340"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-lovely/80 inline-block"
                dir="ltr"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('section6Title')}
        </h2>
        <p className="text-lovely/90 leading-relaxed">{t('updatesDesc')}</p>
      </div>

      <p className="text-lovely font-medium text-lg pt-4 border-t border-lovely/20">
        {t('closing')}
      </p>
    </div>
  );
};

export default PrivacyPolicy;