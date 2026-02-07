'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function InquirySuccessContent() {
  const searchParams = useSearchParams();
  const [inquiryRef, setInquiryRef] = useState('');

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setInquiryRef(ref);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-10">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-16 text-center">
        <div className="w-25 h-25 bg-gradient-to-br from-green-500 to-green-700 text-white text-6xl rounded-full flex items-center justify-center mx-auto mb-8 animate-[scaleIn_0.5s_ease]">
          ✓
        </div>
        
        <h1 className="text-gray-900 text-4xl mb-8 font-bold">Inquiry Submitted Successfully!</h1>
        
        {inquiryRef && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-5 rounded-xl border-2 border-accent mb-8">
            <p className="m-0 mb-2 text-gray-600 text-sm font-semibold">Your reference number:</p>
            <div className="text-3xl font-bold text-accent font-mono">{inquiryRef}</div>
          </div>
        )}
        
        <p className="text-lg text-gray-700 leading-relaxed mb-10">
          Thank you for your interest in Externally Yours Productions! We've received your inquiry and will review it within 24 hours.
        </p>
        
        <div className="text-left my-10">
          <h2 className="text-gray-900 text-2xl mb-6 text-center">What Happens Next?</h2>
          <div className="flex flex-col gap-5">
            <div className="flex gap-5 items-start p-5 bg-gray-50 rounded-xl border-l-4 border-accent">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent to-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-gray-900 text-lg m-0 mb-2">We Review Your Inquiry</h3>
                <p className="text-gray-600 m-0 text-sm leading-relaxed">
                  Our team will carefully review all the details you provided
                </p>
              </div>
            </div>
            <div className="flex gap-5 items-start p-5 bg-gray-50 rounded-xl border-l-4 border-accent">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent to-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-gray-900 text-lg m-0 mb-2">We Reach Out to You</h3>
                <p className="text-gray-600 m-0 text-sm leading-relaxed">
                  We'll contact you to discuss your vision and answer any questions
                </p>
              </div>
            </div>
            <div className="flex gap-5 items-start p-5 bg-gray-50 rounded-xl border-l-4 border-accent">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent to-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-gray-900 text-lg m-0 mb-2">We Create Your Proposal</h3>
                <p className="text-gray-600 m-0 text-sm leading-relaxed">
                  You'll receive a custom proposal tailored to your event
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 text-green-700 px-4 py-4 rounded-lg my-8 text-sm">
          <p className="m-0">📧 A confirmation email has been sent to your inbox</p>
        </div>
        
        <div className="flex gap-4 justify-center mt-10">
          <a
            href="/"
            className="px-9 py-3.5 bg-accent text-white rounded-lg no-underline font-semibold text-base transition-all hover:bg-accent-dark hover:-translate-y-0.5 hover:shadow-lg"
          >
            Return to Home
          </a>
          <a
            href="/contact"
            className="px-9 py-3.5 bg-white text-gray-800 rounded-lg no-underline font-semibold text-base border-2 border-gray-300 transition-all hover:border-accent hover:text-accent"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
