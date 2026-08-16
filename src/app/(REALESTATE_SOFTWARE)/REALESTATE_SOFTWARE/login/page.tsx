'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import logoFallback from '@/images/logo.png'
import { loginAction } from './actions'

export default function Login() {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'verify'>('phone')
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.trim().length >= 1) {
      setStep('verify')
      setError(null)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    if (loginMethod === 'password') {
      const res = await loginAction(phone.trim(), password)
      
      if (res.success && res.redirectPath) {
        router.push(res.redirectPath)
      } else {
        setError(res.error || 'Failed to login')
        setLoading(false)
      }
    } else {
      setError('OTP login not fully implemented yet. Please use Password.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-8">
        
        <div className="flex justify-center mb-6">
          <Image 
            src={logoFallback} 
            alt="Bhuwanta Logo" 
            width={150} 
            height={50} 
            className="h-12 w-auto object-contain"
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#0f1d33] mb-2">
            Login
          </h1>
          <p className="text-[#5a6a82] text-sm">
            {step === 'phone' ? 'Enter your Bhuwanta ID, Phone, or Email to login' : 'Authenticate to access your dashboard'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#0f1d33] mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                placeholder="e.g. 0000000000 (IT), 1111111111 (Partner)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-3 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:border-[#c4a55a] focus:ring-1 focus:ring-[#c4a55a]"
              />
            </div>
            <button
              type="submit"
              className="w-full gradient-gold text-white font-semibold rounded-lg py-2.5 shadow-lg shadow-[#c4a55a]/20 hover:scale-[1.02] transition-transform"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {/* Auth Method Toggle */}
            <div className="flex bg-[#f3f5f8] p-1 rounded-lg mb-4">
              <button
                type="button"
                onClick={() => setLoginMethod('password')}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${loginMethod === 'password' ? 'bg-white text-[#c4a55a] shadow-sm' : 'text-[#5a6a82] hover:text-[#0f1d33]'}`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('otp')}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${loginMethod === 'otp' ? 'bg-white text-[#c4a55a] shadow-sm' : 'text-[#5a6a82] hover:text-[#0f1d33]'}`}
              >
                OTP
              </button>
            </div>

            {loginMethod === 'otp' ? (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-[#0f1d33] mb-1.5">
                  One-Time Password (OTP)
                </label>
                <input
                  type="text"
                  id="otp"
                  placeholder="Any OTP will work"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-3 py-2.5 text-[#0f1d33] text-sm text-center tracking-widest font-mono focus:outline-none focus:border-[#c4a55a] focus:ring-1 focus:ring-[#c4a55a]"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#0f1d33] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-3 py-2.5 pr-10 text-[#0f1d33] text-sm focus:outline-none focus:border-[#c4a55a] focus:ring-1 focus:ring-[#c4a55a]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a6a82] hover:text-[#0f1d33]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-gold text-white font-semibold rounded-lg py-2.5 shadow-lg shadow-[#c4a55a]/20 hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Logging in...' : 'Verify & Login'}
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full mt-2 text-sm text-[#5a6a82] hover:text-[#0f1d33]"
            >
              Use a different phone number
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
