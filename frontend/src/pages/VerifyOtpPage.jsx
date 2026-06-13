import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/common/Spinner';

const RESEND_COOLDOWN = 60;

const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // email passed from RegisterPage via router state
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const next = [...otp];
    next[index] = value.slice(-1); // one digit per box
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) return toast.error('Please enter the complete 6-digit OTP.');
    if (!email) return toast.error('Email is missing. Please register again.');

    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp: otpValue });
      toast.success('Email verified! You can now log in. 🍕');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed.');
      // Clear OTP boxes on wrong attempt
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return toast.error('Email is missing. Please register again.');
    setResendLoading(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('New OTP sent! Check your inbox.');
      setOtp(['', '', '', '', '', '']);
      setCountdown(RESEND_COOLDOWN);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const retryAfter = err.response?.data?.retryAfter;
      if (retryAfter) {
        setCountdown(retryAfter);
        setCanResend(false);
      }
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="card p-8 shadow-xl rounded-3xl">
          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">📬</div>
            <h1 className="text-3xl font-extrabold text-app-text">Verify Your Email</h1>
            <p className="text-gray-500 mt-2 text-sm">
              We sent a 6-digit OTP to{' '}
              <span className="font-semibold text-app-text">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            {/* OTP BOXES */}
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none bg-white text-app-text transition-colors"
                />
              ))}
            </div>

            {/* VERIFY BUTTON */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? <Spinner size="sm" color="white" /> : '✅ Verify OTP'}
            </motion.button>
          </form>

          {/* RESEND */}
          <div className="text-center mt-6">
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-primary font-semibold text-sm hover:underline disabled:opacity-60 flex items-center gap-1 mx-auto"
              >
                {resendLoading ? <Spinner size="sm" color="primary" /> : '🔁 Resend OTP'}
              </button>
            ) : (
              <p className="text-gray-400 text-sm">
                Resend OTP in{' '}
                <span className="font-semibold text-app-text">{countdown}s</span>
              </p>
            )}
          </div>

          <p className="text-center mt-4 text-gray-400 text-xs">
            Wrong email?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Register again
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOtpPage;
