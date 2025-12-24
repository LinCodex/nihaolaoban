
import React, { useState, useEffect } from 'react';
import { X, User, Lock, Phone, Mail, ShieldCheck, Briefcase, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { EmailVerificationModal } from './EmailVerificationModal';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthBg } from '../../lib/passwordValidation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { name: string, role?: string, id?: string }) => void;
  initialView?: 'user' | 'partner';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, initialView = 'user' }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [partnerType, setPartnerType] = useState<'admin' | 'dealer'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[]; strength: 'weak' | 'medium' | 'strong' }>({ isValid: true, errors: [], strength: 'weak' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const { t } = useLanguage();
  const { signUp, signIn, signInWithGoogle, profile, resendVerificationEmail, resetPasswordRequest } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setError('');
      setSuccessMessage('');
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setConfirmPassword('');
      setIsLogin(true);
      setShowVerification(false);
      setShowForgotPassword(false);
      setResetEmail('');
      setPasswordValidation({ isValid: true, errors: [], strength: 'weak' });
      setShowPassword(false);
      setShowConfirmPassword(false);
      setPasswordsMatch(true);
      // Load remember me preference
      const savedRememberMe = localStorage.getItem('rememberMe');
      setRememberMe(savedRememberMe !== 'false');
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        // Sign in
        const { error: signInError } = await signIn(email, password, rememberMe);
        
        if (signInError) {
          setError(signInError.message || t('auth.loginFailed'));
          return;
        }
        
        // Success - AuthContext will handle profile loading
        setSuccessMessage(t('auth.signedInSuccess'));
        setTimeout(() => {
          onClose();
          onLogin({ name: email });
        }, 500);
      } else {
        // Sign up
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        // Validate password
        const validation = validatePassword(password);
        if (!validation.isValid) {
          setError(validation.errors[0]);
          setLoading(false);
          return;
        }

        const fullName = `${firstName} ${lastName}`.trim() || email;
        const role = initialView === 'partner' ? partnerType : 'buyer';
        
        const { error: signUpError } = await signUp(email, password, {
          full_name: fullName,
          role: role,
        });
        
        if (signUpError) {
          // Check for duplicate email
          if (signUpError.message?.includes('already registered') || signUpError.message?.includes('already exists') || signUpError.message?.includes('User already registered')) {
            setError(t('auth.accountExists'));
          } else {
            setError(signUpError.message || 'Sign up failed');
          }
          return;
        }
        
        // Success - show verification screen
        setError('');
        setVerificationEmail(email);
        setShowVerification(true);
        setSuccessMessage(t('auth.accountCreated'));
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const { error: resendError } = await resendVerificationEmail();
      
      if (resendError) {
        setError(resendError.message || t('auth.loginFailed'));
      } else {
        setSuccessMessage(t('auth.verificationSent'));
      }
    } catch (err) {
      setError(t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { error: resetError } = await resetPasswordRequest(resetEmail);

      if (resetError) {
        setError(resetError.message || 'Failed to send reset email');
      } else {
        setSuccessMessage(t('auth.resetEmailSent'));
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetEmail('');
        }, 2000);
      }
    } catch (err) {
      setError('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    if (!isLogin && newPassword) {
      const validation = validatePassword(newPassword);
      setPasswordValidation(validation);
      // Check if passwords match
      if (confirmPassword) {
        setPasswordsMatch(newPassword === confirmPassword);
      }
    } else {
      setPasswordValidation({ isValid: true, errors: [], strength: 'weak' });
    }
  };

  const handleConfirmPasswordChange = (newConfirmPassword: string) => {
    setConfirmPassword(newConfirmPassword);
    // Live validation of password match
    if (password && newConfirmPassword) {
      setPasswordsMatch(password === newConfirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error: googleError } = await signInWithGoogle();
    
    if (googleError) {
      setError(googleError.message || 'Google sign in failed');
      setLoading(false);
    }
    // OAuth redirect will handle the rest
  };

  if (!isOpen) return null;

  // Forgot Password View
  if (showForgotPassword) {
    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center px-4 animate-modal-fade">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForgotPassword(false)} />
        
        <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl animate-modal-slide">
          <button 
            onClick={() => setShowForgotPassword(false)}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors bg-gray-50 rounded-full"
          >
            <X size={20} />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-brand-black mb-2">
              {t('auth.resetPassword')}
            </h2>
            <p className="text-gray-500 text-sm">
              {t('auth.resetPasswordSubtitle')}
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="email" 
                  required 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-brand-black focus:outline-none focus:ring-2 focus:ring-black/5" 
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-xl">{error}</div>}
            {successMessage && <div className="text-green-600 text-sm font-bold text-center bg-green-50 p-3 rounded-xl">{successMessage}</div>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-black text-white py-4 rounded-2xl font-bold hover:bg-gray-900 transition-transform active:scale-95 shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.sending') : t('auth.sendResetLink')}
            </button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full text-gray-600 hover:text-brand-black font-bold transition-colors"
            >
              {t('auth.backToSignIn')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center px-4 animate-modal-fade">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl animate-modal-slide overflow-hidden flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors bg-gray-50 rounded-full z-10"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-1">
            <div className="mb-6 text-center">
                <h2 className="text-3xl font-display font-bold text-brand-black mb-2">
                    {initialView === 'partner' ? 'Partner Portal' : (isLogin ? t('auth.welcomeBack') : t('auth.createAccount'))}
                </h2>
                <p className="text-gray-500 text-sm">
                    {isLogin ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
                </p>
            </div>

            {initialView === 'user' && (
                <button 
                    onClick={handleGoogleSignIn}
                    type="button"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {t('auth.signInWithGoogle')}
                </button>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {!isLogin && initialView === 'user' && (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-2">{t('auth.firstName')}</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-brand-black focus:outline-none focus:ring-2 focus:ring-black/5" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-2">{t('auth.lastName')}</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-brand-black focus:outline-none focus:ring-2 focus:ring-black/5" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-2">{t('auth.phone')}</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="tel" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-brand-black focus:outline-none focus:ring-2 focus:ring-black/5" 
                                />
                            </div>
                        </div>
                    </>
                )}

                {!isLogin && initialView === 'partner' && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-2">Partner Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPartnerType('dealer')}
                                className={`py-3 px-4 rounded-2xl font-bold transition-all ${
                                    partnerType === 'dealer'
                                        ? 'bg-brand-black text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <Briefcase size={20} className="inline mr-2" />
                                Dealer
                            </button>
                            <button
                                type="button"
                                onClick={() => setPartnerType('admin')}
                                className={`py-3 px-4 rounded-2xl font-bold transition-all ${
                                    partnerType === 'admin'
                                        ? 'bg-brand-black text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <ShieldCheck size={20} className="inline mr-2" />
                                Admin
                            </button>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-2">{t('auth.email')}</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-brand-black focus:outline-none focus:ring-2 focus:ring-black/5" 
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-2">{t('auth.password')}</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type={showPassword ? "text" : "password"}
                            required 
                            value={password}
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

                {!isLogin && initialView === 'user' && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-2">{t('auth.confirmPassword')}</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
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
                )}

                {!isLogin && password && (
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
                                <p className="text-xs text-yellow-800 font-medium mb-1">{t('auth.passwordRequirements')}</p>
                            </div>
                        )}
                    </div>
                )}

                {error && <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-xl">{error}</div>}
                {successMessage && <div className="text-green-600 text-sm font-bold text-center bg-green-50 p-3 rounded-xl">{successMessage}</div>}

                {isLogin && initialView === 'user' && (
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-brand-black focus:ring-brand-black cursor-pointer"
                        />
                        <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer select-none">
                            {t('auth.rememberMe')}
                        </label>
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={loading || (!isLogin && (!passwordValidation.isValid || !passwordsMatch))}
                    className="mt-4 w-full bg-brand-black text-white py-4 rounded-2xl font-bold hover:bg-gray-900 transition-transform active:scale-95 shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? t('auth.loading') : (initialView === 'partner' ? 'Access Portal' : t('auth.submit'))}
                </button>

                {isLogin && initialView === 'user' && (
                    <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="w-full text-sm text-gray-600 hover:text-brand-black font-bold transition-colors"
                    >
                        {t('auth.forgotPassword')}
                    </button>
                )}
            </form>
        </div>

        <div className="mt-6 text-center pt-6 border-t border-gray-100 flex flex-col gap-3">
            {initialView === 'user' && (
                <>
                    <p className="text-gray-500 text-sm">
                        {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 font-bold text-brand-black hover:underline"
                        >
                            {isLogin ? t('auth.signup') : t('auth.login')}
                        </button>
                    </p>
                </>
            )}
            
            {initialView === 'partner' && (
                <p className="text-xs text-gray-400">
                    Restricted area. Unauthorized access is monitored.
                </p>
            )}
        </div>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal 
        isOpen={showVerification}
        onClose={() => {
          setShowVerification(false);
          setIsLogin(true);
        }}
        email={verificationEmail}
      />
    </div>
  );
};
