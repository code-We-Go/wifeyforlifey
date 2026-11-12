import React from 'react';
import { useTranslations } from 'next-intl';

interface PolicyProps {
  selectedTab: string;
  setSelectedTab?: React.Dispatch<React.SetStateAction<string>>;
}

const LoyaltyPolicy: React.FC<PolicyProps> = ({ selectedTab }) => {
  const t = useTranslations('policiesPage.loyalty');

  return (
    <div
      className={`${
        selectedTab === 'loyalty' ? 'flex flex-col gap-6' : 'hidden'
      } h-auto w-full text-lovely`}
    >
      <h1 className="font-bold text-2xl md:text-3xl text-lovely mb-1">
        {t('title')}
      </h1>

      <p className="text-lg font-medium text-lovely/90 mb-2">
        {t('subtitle')}
      </p>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('howToEarnTitle')}
        </h2>
        <ul className="space-y-2.5 ms-2 text-lovely/90">
          <li className="flex items-start gap-3">
            <span className="text-xl">📲</span>
            <span>
              <strong>{t('earnIgFollow')}</strong> = {t('earnIgFollowPts')}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">💬</span>
            <span>
              <strong>{t('earnIgStory')}</strong> = {t('earnIgStoryPts')}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">📦</span>
            <span>
              <strong>{t('earnReorder')}</strong> = {t('earnReorderPts')}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">💕</span>
            <span>
              <strong>{t('earnRefer')}</strong> = {t('earnReferPts')}
            </span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t('tiersTitle')}
        </h2>

        <div className="space-y-4">
          <div className="border border-lovely/30 rounded-xl p-5 bg-pinkey/30 backdrop-blur-sm">
            <h3 className="font-bold text-lg mb-2 text-lovely">
              {t('bestieTierTitle')}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm md:text-base text-lovely/90 ms-2">
              <li>{t('bestiePerk1')}</li>
              <li>{t('bestiePerk2')}</li>
            </ul>
          </div>

          <div className="border border-lovely/30 rounded-xl p-5 bg-pinkey/30 backdrop-blur-sm">
            <h3 className="font-bold text-lg mb-1 text-lovely">
              {t('wifeyTierTitle')}
            </h3>
            <p className="text-sm md:text-base text-lovely/80 mb-2">
              {t('wifeyTierSubtitle')}
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm md:text-base text-lovely/90 ms-2">
              <li>{t('wifeyPerk1')}</li>
              <li>{t('wifeyPerk2')}</li>
              <li>{t('wifeyPerk3')}</li>
            </ul>
          </div>

          <div className="border border-lovely/30 rounded-xl p-5 bg-pinkey/30 backdrop-blur-sm">
            <h3 className="font-bold text-lg mb-1 text-lovely">
              {t('bossTierTitle')}
            </h3>
            <p className="text-sm md:text-base text-lovely/80 mb-2">
              {t('bossTierSubtitle')}
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm md:text-base text-lovely/90 ms-2">
              <li>{t('bossPerk1')}</li>
            </ul>
          </div>
        </div>
      </div>

      <p className="text-lovely font-semibold text-lg pt-4 border-t border-lovely/20">
        💰 {t('conversion')}
      </p>
    </div>
  );
};

export default LoyaltyPolicy;