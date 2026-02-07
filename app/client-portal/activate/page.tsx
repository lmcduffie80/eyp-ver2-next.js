import { Suspense } from 'react';
import ActivateContent from './ActivateContent';

export default function ActivatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    }>
      <ActivateContent />
    </Suspense>
  );
}
