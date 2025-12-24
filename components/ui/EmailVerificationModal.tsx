import React, { useState } from 'react';
import { Mail, CheckCircle, RefreshCw, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ isOpen, onClose, email }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const { resendVerificationEmail, verifyOtp } = useAuth();
  const { t } = useLanguage();

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const { error: resendError } = await resendVerificationEmail();
      
      if (resendError) {
        setError(resendError.message || t('auth.invalidCode'));
      } else {
        setMessage(t('auth.verificationSent'));
      }
    } catch (err) {
      setError(t('auth.invalidCode'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 8) {
      setError(t('auth.enterValidCode'));
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: verifyError } = await verifyOtp(email, verificationCode);

      if (verifyError) {
        setError(verifyError.message || t('auth.invalidCode'));
      } else {
        setMessage(t('auth.emailVerified'));
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(t('auth.invalidCode'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center px-4 animate-modal-fade">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl animate-modal-slide">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors bg-gray-50 rounded-full"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-display font-bold text-brand-black mb-2">
            {t('auth.verifyEmail')}
          </h2>
          <p className="text-gray-500 text-sm">
            {t('auth.verifyEmailSubtitle')}
          </p>
          <p className="text-brand-black font-bold mt-1">{email}</p>
        </div>

        <div className="space-y-4">
          {/* Verification Code Input */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-2">
              {t('auth.verificationCode')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={8}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="00000000"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-center text-2xl font-bold tracking-widest text-brand-black focus:outline-none focus:ring-2 focus:ring-black/5"
              />
              <button
                onClick={handleVerifyCode}
                disabled={loading || verificationCode.length !== 8}
                className="px-6 py-3 bg-brand-black text-white rounded-2xl font-bold hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={20} />
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-xl">
              {error}
            </div>
          )}

          {message && (
            <div className="text-green-600 text-sm font-bold text-center bg-green-50 p-3 rounded-xl">
              {message}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 p-4 rounded-2xl">
            <p className="text-sm text-gray-600 mb-3">
              <strong className="text-brand-black">{t('auth.twoWaysToVerify')}</strong>
            </p>
            <ol className="text-sm text-gray-600 space-y-2 ml-4 list-decimal">
              <li>{t('auth.clickLinkInEmail')}</li>
              <li>{t('auth.enterCodeFromEmail')}</li>
            </ol>
          </div>

          {/* Resend Button */}
          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 hover:text-brand-black font-bold transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {t('auth.resendVerification')}
          </button>

          {/* Help Text */}
          <p className="text-xs text-gray-400 text-center">
            {t('auth.didntReceiveEmail')}
          </p>
        </div>
      </div>
    </div>
  );
};
