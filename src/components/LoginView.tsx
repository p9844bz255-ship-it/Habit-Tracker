import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (name: string, role: string) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('indra@school.id');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email beralamat wajib diisi.');
      return;
    }
    if (!password) {
      setError('Kata sandi wajib diisi.');
      return;
    }
    // Simulate login
    onLoginSuccess('Indra Bayu Muktias', 'Kepala Sekolah');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-6 bg-gradient-to-br from-[#f2f2f4] via-[#f8f6f0] to-[#f4e6c9]">
      {/* Decorative ambient background blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFD166]/10 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#6b38d4]/10 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center relative z-10">
        
        {/* Brand/Logo Section */}
        <div className="flex flex-col items-center mb-8 text-center animate-fade-in">
          <img
            src="https://www.image2url.com/r2/default/images/1778032976429-fb84224a-3e08-4092-b38f-529e608a47d2.png"
            alt="Al-Wildan Logo"
            className="w-16 h-16 object-contain mb-3 drop-shadow-sm select-none"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-3.5xl font-extrabold tracking-tight text-[#111c2d] font-sans">
            EduPlan
          </h1>
          <p className="text-xs font-semibold text-on-surface-variant/70 tracking-widest uppercase mt-1 font-sans">
            AL - WILDAN ISLAMIC SCHOOL 3 BSD CITY
          </p>
        </div>

        {/* Login Glass-Card */}
        <div className="w-full glass-card p-8 md:p-10 shadow-xl border border-white/60">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-on-surface flex items-center justify-center gap-2">
              Welcome Back <span className="animate-bounce">👋</span>
            </h2>
            <p className="text-sm text-on-surface-variant mt-1.5 font-medium">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#111c2d] uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="youremail@school.id"
                  className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-[#2d2d2d] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#111c2d] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-[#2d2d2d] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="w-4.5 h-4.5 rounded border-gray-300 text-[#002c64] focus:ring-[#002c64] outline-none cursor-pointer"
                />
                <span className="text-sm font-semibold text-on-surface-variant/85 select-none transition-colors group-hover:text-on-surface">
                  Remember me
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-6 py-3.5 px-6 bg-[#111c2d] hover:bg-[#1f2f45] text-white text-sm font-bold rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              Sign In
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Demo instructions */}
        <p className="mt-6 text-xs text-on-surface-variant/60 font-medium text-center">
          Klik tombol <strong>Sign In</strong> untuk demo login instan sebagai Kepala Sekolah.
        </p>
      </div>
    </div>
  );
}
