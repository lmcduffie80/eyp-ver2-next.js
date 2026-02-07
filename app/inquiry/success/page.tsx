import React, { Suspense } from 'react';
import InquirySuccessContent from './InquirySuccessContent';

export default function InquirySuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-10">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-16 text-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    }>
      <InquirySuccessContent />
    </Suspense>
  );
}
