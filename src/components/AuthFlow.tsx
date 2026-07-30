import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Package, AlertCircle, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import RegistrationFlow from './RegistrationFlow';

export default function AuthFlow() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  
  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Determine if it's an email or phone number
      const isEmail = loginIdentifier.includes('@');
      
      const { error: authError } = await supabase.auth.signInWithPassword({
        [isEmail ? 'email' : 'phone']: loginIdentifier,
        password: loginPassword,
      });

      if (authError) throw authError;

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(resetEmail);
      
      if (authError) throw authError;
      
      setResetStep(2);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp) {
      setError('Please enter the OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.verifyOtp({
        email: resetEmail,
        token: resetOtp,
        type: 'recovery'
      });
      
      if (authError) throw authError;
      if (!data.user) throw new Error('Verification failed');
      
      setResetStep(3);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmNewPassword) {
      setError('পাসওয়ার্ড মিলছে না (Passwords do not match)');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setSuccess('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! (Password successfully updated!)');
      setTimeout(() => {
        setMode('login');
        setResetStep(1);
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'register') {
    return (
      <RegistrationFlow 
        onSuccess={() => setMode('login')} 
        onSwitchToLogin={() => setMode('login')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full border border-white relative overflow-hidden"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#F97316] text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-100 rotate-3">
            <Package size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">BEXO <span className="text-[#F97316] italic">BD</span></h1>
          <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Supplier & Reseller Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-3 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg text-center flex items-center justify-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-3 text-xs font-bold text-green-600 bg-green-50 border border-green-200 rounded-lg text-center flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}

        {mode === 'login' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-center text-sm font-bold text-slate-500 mb-8 italic">
              Empowering local resellers with high-quality inventory and seamless fulfillment.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder="Email or Phone Number"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#F97316] font-medium text-sm transition-colors"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#F97316] font-medium text-sm transition-colors"
                required
              />
              
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => { setMode('forgot-password'); setError(''); }}
                  className="text-xs font-bold text-[#F97316] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Please wait...' : 'Sign In'} <ArrowRight size={16} />
              </button>
            </form>

            <div className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-500 pt-4 border-t border-slate-100">
              <span>Don't have an account?</span>
              <button 
                type="button" 
                onClick={() => { setMode('register'); setError(''); }}
                className="text-[#F97316] hover:underline"
              >
                Sign Up
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <button 
              type="button" 
              onClick={() => { setMode('login'); setResetStep(1); setError(''); }}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>

            {resetStep === 1 && (
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Reset Password</h2>
                <p className="text-sm text-slate-500 mb-4">Enter your email address to receive a 6-digit verification code.</p>
                
                <input
                  type="email"
                  placeholder="Email Address"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#F97316] font-medium text-sm transition-colors"
                  required
                />
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#F97316] hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending...' : 'Send Verification Code'} <ArrowRight size={16} />
                </button>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={handleVerifyResetOtp} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Verify OTP</h2>
                <p className="text-sm text-slate-500 mb-4">We sent a 6-digit code to <b>{resetEmail}</b>.</p>
                
                <input
                  type="text"
                  placeholder="6-Digit OTP"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#F97316] transition-all text-center text-2xl tracking-[0.5em] font-mono text-slate-900"
                  required
                  maxLength={6}
                />
                
                <button 
                  type="submit"
                  disabled={loading || resetOtp.length !== 6}
                  className="w-full py-4 bg-[#F97316] hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'} <CheckCircle2 size={16} />
                </button>
              </form>
            )}

            {resetStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 mb-2">New Password</h2>
                <p className="text-sm text-slate-500 mb-4">Enter your new password to secure your account.</p>
                
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#F97316] font-medium text-sm transition-colors"
                  required
                />
                
                <input
                  type="password"
                  placeholder="Repeat New Password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#F97316] font-medium text-sm transition-colors"
                  required
                />
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Updating...' : 'Update Password'} <CheckCircle2 size={16} />
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
