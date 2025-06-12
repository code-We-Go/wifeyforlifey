import { Suspense } from 'react';
import PoliciesContent from './components/PoliciesContent';

export default function PoliciesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PoliciesContent />
    </Suspense>
  );
}