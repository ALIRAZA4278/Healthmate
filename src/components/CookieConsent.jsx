'use client';

import { useEffect, useState } from 'react';

export default function CookieConsent() {
  const [status, setStatus] = useState(null); // null = loading, 'accepted', 'declined', 'pending'

  useEffect(() => {
    const saved = localStorage.getItem('cookie_consent');
    if (saved === 'accepted') {
      setStatus('accepted');
    } else if (saved === 'declined') {
      setStatus('declined');
    } else {
      setStatus('pending');
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setStatus('accepted');
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setStatus('declined');
  };

  // Still loading from localStorage
  if (status === null) return null;

  // User accepted — show nothing, site works normally
  if (status === 'accepted') return null;

  // User declined — block entire site
  if (status === 'declined') {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-2">
            Aap ne Terms &amp; Conditions accept nahi ki, isliye HealthMate use nahi kar sakte.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Website use karne ke liye Terms &amp; Conditions accept karna zaroori hai.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('cookie_consent');
              setStatus('pending');
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition"
          >
            Wapis Jao — Accept Karen
          </button>
        </div>
      </div>
    );
  }

  // Pending — show the consent modal
  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl font-bold">H</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">HealthMate</h2>
            <p className="text-xs text-gray-500">Terms &amp; Privacy Policy</p>
          </div>
        </div>

        {/* Content */}
        <p className="text-gray-700 mb-4 text-sm leading-relaxed">
          HealthMate mein khush amdeed! Website use karne se pehle hamari
          <strong> Terms &amp; Conditions</strong> aur <strong>Privacy Policy</strong> parh kar
          agree karein.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
          <p className="font-semibold text-gray-800">Hamari Terms:</p>
          <p>✅ Aapka health data secure aur private rakha jata hai.</p>
          <p>✅ AI analysis sirf guidance ke liye hai, doctor ki jagah nahi.</p>
          <p>✅ Aapka data third parties ke saath share nahi kiya jata.</p>
          <p>✅ Cookies service improvement ke liye use hoti hain.</p>
          <p>✅ Aap kabhi bhi apna account delete kar sakte hain.</p>
          <p className="pt-1 text-xs text-gray-400">
            Service use karke aap in terms se agree karte hain. Yeh data medical
            diagnosis replace nahi karta — hamesha apne doctor se milein.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition text-sm"
          >
            ✅ Accept &amp; Continue
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 border-2 border-gray-300 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
          >
            ❌ Decline
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-3">
          Decline karne par website access nahi hogi.
        </p>
      </div>
    </div>
  );
}
