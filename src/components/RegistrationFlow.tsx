import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertCircle, ArrowRight, ShoppingCart } from 'lucide-react';
import { supabase } from '../supabase';

interface RegistrationFlowProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function RegistrationFlow({ onSuccess, onSwitchToLogin }: RegistrationFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  // Registration Form Fields
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true
        }
      });
      
      if (authError) throw authError;
      
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });
      
      if (authError) throw authError;
      if (!data.user) throw new Error('Verification failed');
      
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User session not found');
      }

      // Update auth profile with password and metadata
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: {
          full_name: fullName,
          shop_name: shopName
        }
      });

      if (updateError) throw updateError;

      // Save additional data to users table
      const { error: dbError } = await supabase.from('users').insert([
        {
          uid: user.id,
          email: user.email,
          display_name: fullName,
          shop_name: shopName,
          mobile: mobile,
          referral_code: referralCode,
          address: address,
          role: 'collector',
          balance: 0,
          created_at: new Date().toISOString()
        }
      ]);
      
      if (dbError) throw dbError;

      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        {/* Left Orange Panel */}
        <div className="md:w-5/12 bg-[#F97316] text-white p-10 md:p-14 flex flex-col relative overflow-hidden">
          <div className="z-10">
            <h1 className="text-4xl font-black tracking-tight mb-6 mt-4">Bexo BD</h1>
            <div className="w-16 h-1 bg-white/30 mb-8 rounded-full"></div>
            <p className="text-lg text-white/90 leading-relaxed font-medium">
              বাংলাদেশের সেরা ড্রপশিপিং সাপ্লায়ার নেটওয়ার্ক। আপনার ই-কমার্স ব্যবসাকে সহজতর ও লাভজনক করতে আমরা কাজ করছি।
            </p>
          </div>
          <div className="absolute -bottom-8 -left-8 text-white/10">
            <ShoppingCart size={300} strokeWidth={1} />
          </div>
        </div>

        {/* Right White Panel */}
        <div className="md:w-7/12 p-8 md:p-14 lg:p-16 flex flex-col relative">
          <div className="flex justify-between items-center mb-10">
            <button 
              onClick={onSwitchToLogin}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              হোম পেজ
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
              <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">🌐</span>
              EN
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">নতুন অ্যাকাউন্ট খুলুন</h2>
            <p className="text-slate-500 font-medium">আপনার ব্যবসার যাত্রা শুরু হোক আজ থেকেই।</p>
          </div>

          {error && (
            <div className="mb-6 p-4 flex items-start gap-3 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex-1">
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <input
                  type="email"
                  placeholder="জিমেইল / ইমেইল"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#F97316] hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-wide text-sm shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'অপেক্ষা করুন...' : 'ভেরিফিকেশন কোড পাঠান'} <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-4 text-center">আমরা <b className="text-slate-900">{email}</b> এ একটি ৬-ডিজিটের কোড পাঠিয়েছি।</p>
                  <input
                    type="text"
                    placeholder="৬-ডিজিটের কোড দিন"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-5 py-5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10 transition-all text-center text-3xl tracking-[0.5em] font-mono text-slate-900"
                    required
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="flex-1 py-4 bg-[#F97316] hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-wide text-sm shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'ভেরিফাই হচ্ছে...' : 'ভেরিফাই করুন'} <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleRegistration} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-semibold mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{email} ভেরিফাইড হয়েছে।</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="text-green-800 hover:underline text-xs"
                  >
                    পরিবর্তন করুন
                  </button>
                </div>

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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
