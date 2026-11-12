import { Suspense } from 'react';
import PoliciesContent from './components/PoliciesContent';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'policiesPage' });

  return {
    title: `${t('metaTitle')} | Wifey For Lifey`,
    description: t('metaDescription'),
  };
}

export default function PoliciesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-backgroundColor text-lovely">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-lovely" />
        </div>
      }
    >
      <PoliciesContent />
    </Suspense>
  );
}