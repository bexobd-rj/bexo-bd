import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface RegistrationFlowProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function RegistrationFlow({ onSuccess, onSwitchToLogin }: RegistrationFlowProps) {
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('পাসওয়ার্ড মিলছে না (Passwords do not match)');
      return;
    }

    if (!agreeTerms) {
      setError('আপনাকে শর্তাবলীতে রাজি হতে হবে (You must agree to the terms)');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: fullName
      });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: fullName,
        shopName,
        mobile,
        referralCode,
        address,
        role: 'collector',
        balance: 0,
        createdAt: Date.now()
      });

      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl mx-auto overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 sm:p-8 bg-gradient-to-br from-orange-50 to-white flex-shrink-0">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-orange-100 flex items-center justify-center text-[#F97316]">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">নতুন অ্যাকাউন্ট</h2>
              <p className="text-slate-500 font-medium text-sm">তথ্য দিয়ে রেজিস্ট্রেশন সম্পন্ন করুন</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-grow">
          <div className="max-w-md mx-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleRegistration} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <input
                type="email"
                placeholder="ইমেইল ঠিকানা"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#F97316] transition-all font-medium placeholder:text-slate-400"
                required
              />

              <input
                type="text"
                placeholder="শপের নাম"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#F97316] transition-all font-medium placeholder:text-slate-400"
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  type="text"
                  placeholder="আপনার পূর্ণ নাম"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#F97316] transition-all font-medium placeholder:text-slate-400"
                  required
                />
                <input
                  type="tel"
                  placeholder="মোবাইল নম্বর"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#F97316] transition-all font-medium placeholder:text-slate-400"
                  required
                />
              </div>

              <input
                type="text"
                placeholder="রেফার কোড / সেলার কোড (যদি থাকে)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#F97316] transition-all font-medium placeholder:text-slate-400"
              />

              <input
                type="text"
                placeholder="সম্পূর্ণ ঠিকানা"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#F97316] transition-all font-medium placeholder:text-slate-400"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  type="password"
                  placeholder="পাসওয়ার্ড"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#F97316] transition-all font-medium placeholder:text-slate-400"
                  required
                />
                <input
                  type="password"
                  placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#F97316] transition-all font-medium placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2 pb-4">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-5 h-5 text-[#F97316] rounded border-slate-300 focus:ring-[#F97316]"
                />
                <label htmlFor="agree" className="text-slate-600 font-medium cursor-pointer">
                  আমি <span className="text-[#F97316] font-bold hover:underline">শর্তাবলীতে</span> রাজি আছি
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#F97316] hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base shadow-lg shadow-orange-200 transition-all flex items-center justify-center"
              >
                {loading ? 'প্রসেস হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}
              </button>
            </form>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex-shrink-0 text-center">
          <p className="text-slate-600 font-medium">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
            <button onClick={onSwitchToLogin} className="text-[#F97316] font-bold hover:underline">
              লগইন করুন
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
