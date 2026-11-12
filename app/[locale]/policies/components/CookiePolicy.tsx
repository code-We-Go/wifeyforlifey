import React from 'react';
import { useTranslations } from 'next-intl';

interface PolicyProps {
  selectedTab: string;
  setSelectedTab?: React.Dispatch<React.SetStateAction<string>>;
}

const CookiePolicy: React.FC<PolicyProps> = ({ selectedTab }) => {
  const t = useTranslations('policiesPage.cookie');

  return (
    <div
      className={`${
        selectedTab === 'cookie-policy' ? 'flex flex-col gap-6' : 'hidden'
      } h-auto w-full text-lovely`}
    >
      <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('title')}</h1>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('whatAreCookies')}
        </h2>
        <p className="text-lovely/90 leading-relaxed">
          {t('whatAreCookiesDesc')}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('howWeUse')}
        </h2>
        <p className="text-lovely/90">{t('howWeUseDesc')}</p>
        <ul className="list-disc list-inside space-y-1.5 ms-2 text-lovely/90">
          <li>
            <strong>{t('useItem1Title')} </strong>
            {t('useItem1Desc')}
          </li>
          <li>
            <strong>{t('useItem2Title')} </strong>
            {t('useItem2Desc')}
          </li>
          <li>
            <strong>{t('useItem3Title')} </strong>
            {t('useItem3Desc')}
          </li>
          <li>
            <strong>{t('useItem4Title')} </strong>
            {t('useItem4Desc')}
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('typesTitle')}
        </h2>

        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-lovely/95">
              {t('type1Title')}
            </h3>
            <p className="text-lovely/90">{t('type1Desc')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-lovely/95">
              {t('type2Title')}
            </h3>
            <p className="text-lovely/90">{t('type2Desc')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-lovely/95">
              {t('type3Title')}
            </h3>
            <p className="text-lovely/90">{t('type3Desc')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-lovely/95">
              {t('type4Title')}
            </h3>
            <p className="text-lovely/90">{t('type4Desc')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('thirdPartyTitle')}
        </h2>
        <p className="text-lovely/90">{t('thirdPartyDesc')}</p>
        <ul className="list-disc list-inside space-y-1.5 ms-2 text-lovely/90">
          <li>
            <strong>{t('thirdParty1Title')} </strong>
            {t('thirdParty1Desc')}
          </li>
          <li>
            <strong>{t('thirdParty2Title')} </strong>
            {t('thirdParty2Desc')}
          </li>
        </ul>
        <p className="text-lovely/80 text-sm mt-1">{t('thirdPartyNote')}</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('managingTitle')}
        </h2>
        <p className="text-lovely/90 leading-relaxed">{t('managingDesc')}</p>
        <p className="font-semibold text-lovely mt-1">{t('stepsTitle')}</p>
        <ul className="list-disc list-inside space-y-1.5 ms-2 text-lovely/90">
          <li>{t('chromeStep')}</li>
          <li>{t('safariStep')}</li>
          <li>{t('firefoxStep')}</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('updatesTitle')}
        </h2>
        <p className="text-lovely/90 leading-relaxed">{t('updatesDesc')}</p>
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t border-lovely/20">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('contactTitle')}
        </h2>
        <p className="text-lovely/90">{t('contactDesc')}</p>
        <p className="text-lovely/95 font-semibold">
          {t('team')}
          <br />
          {t('emailLabel')}{' '}
          <a
            href="mailto:privacy@wifeyforlifey.com"
            className="underline font-semibold hover:text-lovely/80"
          >
            privacy@wifeyforlifey.com
          </a>
        </p>
        <p className="text-lovely font-medium mt-2">{t('consent')}</p>
      </div>
    </div>
  );
};

export default CookiePolicy;