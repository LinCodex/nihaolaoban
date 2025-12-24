import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthBg } from '../../lib/passwordValidation';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ isOpen, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[]; strength: 'weak' | 'medium' | 'strong' }>({ isValid: true, errors: [], strength: 'weak' });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const { resetPassword } = useAuth();
  const { t } = useLanguage();

  const handlePasswordChange = (password: string) => {
    setNewPassword(password);
    const validation = validatePassword(password);
    setPasswordValidation(validation);
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (password: string) => {
    setConfirmPassword(password);
    if (newPassword) {
      setPasswordsMatch(newPassword === password);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordValidation.isValid) {
      setError('Please meet all password requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await resetPassword(newPassword);

      if (resetError) {
        setError(resetError.message || t('auth.loginFailed'));
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 z-[3000] flex items-center justify-center px-4 animate-modal-fade">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl animate-modal-slide text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-display font-bold text-brand-black mb-2">
            {t('auth.passwordResetSuccess')}
          </h2>
          <p className="text-gray-500 text-sm">
            {t('auth.passwordResetSuccessMsg')}
          </p>
        </div>
      </div>
    );
  }

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
            <Lock size={32} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-display font-bold text-brand-black mb-2">
            {t('auth.setNewPassword')}
          </h2>
          <p className="text-gray-500 text-sm">
            {t('auth.setNewPasswordSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-2">
              {t('auth.newPassword')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type={showPassword ? "text" : "password"}
                required 
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-12 py-3 text-brand-black focus:outline-none focus:ring-2 focus:ring-black/5" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-2">
              {t('auth.confirmPassword')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type={showConfirmPassword ? "text" : "password"}
                required 
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                className={`w-full bg-gray-50 border rounded-2xl pl-10 pr-12 py-3 text-brand-black focus:outline-none focus:ring-2 ${
                  confirmPassword && !passwordsMatch 
                    ? 'border-red-300 focus:ring-red-100' 
                    : confirmPassword && passwordsMatch 
                    ? 'border-green-300 focus:ring-green-100' 
                    : 'border-gray-200 focus:ring-black/5'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-500 mt-1 ml-2 font-medium">{t('auth.passwordsDontMatch')}</p>
            )}
            {confirmPassword && passwordsMatch && (
              <p className="text-xs text-green-600 mt-1 ml-2 font-medium">✓ {t('auth.passwordsMatch')}</p>
            )}
          </div>

          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${getPasswordStrengthBg(passwordValidation.strength)}`}
                    style={{ width: passwordValidation.strength === 'strong' ? '100%' : passwordValidation.strength === 'medium' ? '66%' : '33%' }}
                  />
                </div>
                <span className={`text-xs font-bold ${getPasswordStrengthColor(passwordValidation.strength)}`}>
                  {passwordValidation.strength === 'weak' ? t('auth.passwordStrengthWeak') : passwordValidation.strength === 'medium' ? t('auth.passwordStrengthMedium') : t('auth.passwordStrengthStrong')}
                </span>
              </div>
              {passwordValidation.errors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                  <p className="text-xs text-yellow-800 font-medium">{t('auth.passwordRequirements')}</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-xl">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading || !passwordValidation.isValid || !passwordsMatch}
            className="w-full bg-brand-black text-white py-4 rounded-2xl font-bold hover:bg-gray-900 transition-transform active:scale-95 shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.resetting') : t('auth.resetPasswordBtn')}
          </button>
        </form>
      </div>
    </div>
  );
};
