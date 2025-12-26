
import React, { useState, Suspense, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { Ban } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Offers from './components/Offers';
import Footer from './components/Footer';
import { ContactModal } from './components/ui/ContactModal';
import { AuthModal } from './components/ui/AuthModal';
import { PasswordResetModal } from './components/ui/PasswordResetModal';
import { SearchFilters, Conversation } from './types';
import { LanguageProvider } from './contexts/LanguageContext';
import { MarketplaceProvider, useMarketplace } from './contexts/MarketplaceContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrokerLogin } from './components/BrokerLogin';
import { AdminLogin } from './components/AdminLogin';
import { SupportChatButton } from './components/ui/SupportChatButton';

// Lazy load components
const ListingsView = React.lazy(() => import('./components/ListingsView').then(module => ({ default: module.ListingsView })));
const BusinessDetails = React.lazy(() => import('./components/PropertyDetails').then(module => ({ default: module.BusinessDetails })));
const ValuationTool = React.lazy(() => import('./components/ValuationTool').then(module => ({ default: module.ValuationTool })));
const BrokersView = React.lazy(() => import('./components/BrokersView').then(module => ({ default: module.BrokersView })));
const PrivacyPolicy = React.lazy(() => import('./components/LegalPages').then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = React.lazy(() => import('./components/LegalPages').then(module => ({ default: module.TermsOfService })));
const CookieSettings = React.lazy(() => import('./components/LegalPages').then(module => ({ default: module.CookieSettings })));
const Dashboard = React.lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const DealerDashboard = React.lazy(() => import('./components/dealer/DealerDashboard').then(module => ({ default: module.DealerDashboard })));
const SupportPage = React.lazy(() => import('./components/SupportPage').then(module => ({ default: module.SupportPage })));
const AboutPage = React.lazy(() => import('./components/AboutPage').then(module => ({ default: module.AboutPage })));

// Admin Components
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout').then(module => ({ default: module.AdminLayout })));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const AdminListings = React.lazy(() => import('./components/admin/AdminListings').then(module => ({ default: module.AdminListings })));
const AdminBrokers = React.lazy(() => import('./components/admin/AdminBrokers').then(module => ({ default: module.AdminBrokers })));
const AdminUsers = React.lazy(() => import('./components/admin/AdminUsers').then(module => ({ default: module.AdminUsers })));
const AdminLogs = React.lazy(() => import('./components/admin/AdminLogs').then(module => ({ default: module.AdminLogs })));
const AdminReports = React.lazy(() => import('./components/admin/AdminReports').then(module => ({ default: module.AdminReports })));
const AdminTranslations = React.lazy(() => import('./components/admin/AdminTranslations').then(module => ({ default: module.AdminTranslations })));
const AdminMessages = React.lazy(() => import('./components/admin/AdminMessages').then(module => ({ default: module.AdminMessages })));

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#EEF1EE] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-brand-black border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const safeScrollTo = (x: number, y: number) => {
  try {
    window.scrollTo(x, y);
  } catch (e) {
    console.debug('Scrolling blocked by environment');
  }
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    safeScrollTo(0, 0);
  }, [pathname]);
  return null;
};

interface HomeProps {
  onNavigate: (page: string, filters?: SearchFilters) => void;
  onPropertyClick: (id: string) => void;
  isLoggedIn: boolean;
  onStartSelling: () => void;
}

const Home = ({ onNavigate, onPropertyClick, isLoggedIn, onStartSelling }: HomeProps) => {
  return (
    <>
      <Hero onSearch={(filters) => onNavigate('listings', filters)} />
      <Services
        onCategoryClick={(filters) => onNavigate('listings', filters)}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        onStartSelling={onStartSelling}
      />
      <Offers
        onPropertyClick={onPropertyClick}
        onViewAll={() => onNavigate('listings', {})}
      />
    </>
  );
};

const ListingsPage = ({ onNavigate, onPropertyClick, favorites, onToggleFavorite }: {
  onNavigate: (page: string) => void,
  onPropertyClick: (id: string) => void,
  favorites: string[],
  onToggleFavorite: (id: string) => void
}) => {
  const location = useLocation();
  const initialFilters = (location.state as SearchFilters) || {};

  return (
    <ListingsView
      initialFilters={initialFilters}
      onBack={() => onNavigate('home')}
      onPropertyClick={onPropertyClick}
      favorites={favorites}
      onToggleFavorite={onToggleFavorite}
    />
  );
};

const PropertyDetailsPage = ({
  onNavigate,
  onMessageAgent,
  favorites,
  onToggleFavorite,
  currentUser,
  onLoginRequest
}: {
  onNavigate: (page: string) => void,
  onMessageAgent: (title: string, context?: 'listing' | 'broker', isNDASigned?: boolean) => void,
  favorites: string[],
  onToggleFavorite: (id: string) => void,
  currentUser: { name: string, role?: string, id?: string } | null,
  onLoginRequest: () => void
}) => {
  const { id } = useParams<{ id: string }>();
  const { listings } = useMarketplace();
  const property = listings.find(p => p.id === id);

  if (!property) {
    return <div className="min-h-screen flex items-center justify-center">Property not found</div>;
  }

  return (
    <BusinessDetails
      property={property}
      onBack={() => onNavigate('listings')}
      onBookViewing={() => onMessageAgent(property.title, 'listing', false)}
      onNavigate={onNavigate}
      onMessageAgent={onMessageAgent}
      isFavorite={favorites.includes(property.id)}
      onToggleFavorite={() => onToggleFavorite(property.id)}
      currentUser={currentUser}
      onLoginRequest={onLoginRequest}
    />
  );
};

const AppContent: React.FC = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<'user' | 'partner'>('user');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [inquirySubject, setInquirySubject] = useState<string | undefined>(undefined);
  const [contactContext, setContactContext] = useState<'listing' | 'broker'>('listing');
  const [isNDASignedInContact, setIsNDASignedInContact] = useState(false);
  const [contactListingId, setContactListingId] = useState<string | undefined>(undefined);
  const [contactDealerId, setContactDealerId] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const location = useLocation();
  const { listings } = useMarketplace();
  const { user, profile, signOut, loading } = useAuth();



  // Handle OAuth callback and password reset - redirect user after successful auth
  useEffect(() => {
    // Check if this is a password reset callback
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');

    if (type === 'recovery') {
      // Show password reset modal
      setShowPasswordReset(true);
      return;
    }


  }, [location.pathname]);

  // Fetch favorites on load
  useEffect(() => {
    if (user) {
      const fetchFavorites = async () => {
        const { data, error } = await supabase
          .from('favorites')
          .select('listing_id')
          .eq('profile_id', user.id);

        if (data) {
          setFavorites(data.map(f => f.listing_id));
        }
      };
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const handleOpenContact = (subject?: string, context: 'listing' | 'broker' = 'listing', isNDASigned: boolean = false, listingId?: string, dealerId?: string) => {
    setInquirySubject(subject);
    setContactContext(context);
    setIsNDASignedInContact(isNDASigned);
    setContactListingId(listingId);
    setContactDealerId(dealerId);
    setIsContactOpen(true);
  };

  const handleToggleFavorite = async (id: string) => {
    // Optimistic update
    const isCurrentlyFavorite = favorites.includes(id);
    setFavorites(prev =>
      isCurrentlyFavorite ? prev.filter(f => f !== id) : [...prev, id]
    );

    if (user) {
      if (isCurrentlyFavorite) {
        // Remove from DB
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('profile_id', user.id)
          .eq('listing_id', id);

        if (error) {
          console.error('Error removing favorite:', error);
          // Rollback on error
          setFavorites(prev => [...prev, id]);
        }
      } else {
        // Add to DB
        const { error } = await supabase
          .from('favorites')
          .insert({ profile_id: user.id, listing_id: id });

        if (error) {
          console.error('Error adding favorite:', error);
          // Rollback on error
          setFavorites(prev => prev.filter(f => f !== id));
        }
      }
    }
  };

  const handleLogin = () => {
    setIsAuthOpen(false);

    const isListingPage = location.pathname.startsWith('/listings/');

    if (profile?.role === 'admin') {
      navigate('/admin');
    } else if (profile?.role === 'dealer') {
      navigate(`/dealer`);
    } else {
      if (!isListingPage) {
        navigate('/dashboard');
      }
    }
  };

  const handleLogout = async () => {
    console.log('App.tsx: handleLogout called');
    await signOut();
    console.log('App.tsx: signOut completed, navigating to home');
    navigate('/');
    console.log('App.tsx: navigation to / requested');
  };

  const handleNavigate = (page: string, filters?: SearchFilters) => {
    switch (page) {
      case 'home':
        navigate('/');
        break;
      case 'listings':
        navigate('/listings', { state: filters });
        break;
      case 'valuation':
        navigate('/valuation');
        break;
      case 'brokers':
        navigate('/brokers');
        break;
      case 'about':
        navigate('/about');
        break;
      case 'support':
        navigate('/support');
        break;
      case 'dashboard':
        if (profile) {
          if (profile.role === 'dealer') {
            navigate('/dealer');
          } else if (profile.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        } else {
          setAuthView('user');
          setIsAuthOpen(true);
        }
        break;
      case 'admin':
        setAuthView('partner');
        setIsAuthOpen(true);
        break;
      case 'privacy':
        navigate('/privacy');
        break;
      case 'terms':
        navigate('/terms');
        break;
      case 'cookies':
        navigate('/cookies');
        break;
      default:
        navigate('/');
    }
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/listings/${propertyId}`);
  };

  const handleStartConversation = () => {
    // Conversation logic
  };

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDealerRoute = location.pathname.startsWith('/dealer');

  // Show loading screen only if we're loading AND don't have a cached profile
  // This allows "Optimistic UI" - show logged in state immediately while checking session in background
  if (loading && !profile) {
    return <LoadingFallback />;
  }

  return (
    <div className="app-container flex flex-col min-h-screen">
      <ScrollToTop />
      {!isAdminRoute && !isDealerRoute && (
        <Navbar
          onLoginClick={() => {
            setAuthView('user');
            setIsAuthOpen(true);
          }}
          isLoggedIn={!!profile}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}

      <main id="main-content" className="flex-grow" role="main">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  onNavigate={handleNavigate}
                  onPropertyClick={handlePropertyClick}
                  isLoggedIn={!!profile}
                  onStartSelling={() => {
                    setAuthView('user');
                    setIsAuthOpen(true);
                  }}
                />
              }
            />
            <Route path="/admin" element={<AdminLayout onLogout={handleLogout} />}>
              <Route index element={<AdminDashboard />} />
              <Route path="listings" element={<AdminListings />} />
              <Route path="brokers" element={<AdminBrokers />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="logs" element={<AdminLogs />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="translations" element={<AdminTranslations />} />
              <Route path="messages" element={<AdminMessages />} />
            </Route>

            <Route
              path="/dealer"
              element={
                profile && profile.role === 'dealer' ? (
                  <DealerDashboard dealerId={profile.id} onLogout={handleLogout} />
                ) : (
                  <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                      <Ban size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
                    <p className="text-gray-500">You must be an authorized dealer to view this portal.</p>
                    <button onClick={() => navigate('/')} className="px-6 py-2 bg-brand-black text-white rounded-full font-bold">Go Home</button>
                  </div>
                )
              }
            />

            <Route
              path="/listings"
              element={
                <ListingsPage
                  onNavigate={handleNavigate}
                  onPropertyClick={handlePropertyClick}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              }
            />
            <Route
              path="/listings/:id"
              element={
                <PropertyDetailsPage
                  onNavigate={handleNavigate}
                  onMessageAgent={handleOpenContact}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  currentUser={profile ? { name: profile.full_name || profile.email, role: profile.role, id: profile.id } : null}
                  onLoginRequest={() => {
                    setAuthView('user');
                    setIsAuthOpen(true);
                  }}
                />
              }
            />
            <Route path="/valuation" element={<ValuationTool onBack={() => handleNavigate('home')} />} />
            <Route
              path="/brokers"
              element={<BrokersView onBack={() => handleNavigate('home')} onContact={handleOpenContact} />}
            />
            <Route
              path="/about"
              element={<AboutPage onBack={() => handleNavigate('home')} />}
            />
            <Route
              path="/support"
              element={<SupportPage onBack={() => handleNavigate('home')} />}
            />
            <Route
              path="/dashboard"
              element={
                profile && profile.role !== 'dealer' && profile.role !== 'admin' ? (
                  <Dashboard
                    onBack={() => handleNavigate('home')}
                    user={{ name: profile.full_name || profile.email }}
                    favorites={favorites}
                    conversations={conversations}
                    onNavigateToProperty={handlePropertyClick}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Home
                    onNavigate={handleNavigate}
                    onPropertyClick={handlePropertyClick}
                    isLoggedIn={!!profile}
                    onStartSelling={() => {
                      setAuthView('user');
                      setIsAuthOpen(true);
                    }}
                  />
                )
              }
            />
            <Route path="/privacy" element={<PrivacyPolicy onBack={() => handleNavigate('home')} />} />
            <Route path="/terms" element={<TermsOfService onBack={() => handleNavigate('home')} />} />
            <Route path="/cookies" element={<CookieSettings onBack={() => handleNavigate('home')} />} />
            <Route path="/brokerlogin" element={<BrokerLogin />} />
            <Route path="/adminlogin" element={<AdminLogin />} />
            <Route path="*" element={
              <Home
                onNavigate={handleNavigate}
                onPropertyClick={handlePropertyClick}
                onPropertyClick={handlePropertyClick}
                isLoggedIn={!!profile}
                onStartSelling={() => {
                  setAuthView('user');
                  setIsAuthOpen(true);
                }}
              />
            } />
          </Routes>
        </Suspense>
      </main>

      {!isAdminRoute && !isDealerRoute && <Footer onNavigate={handleNavigate} />}

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => {
          setIsContactOpen(false);
          if (user) handleStartConversation();
        }}
        propertyTitle={inquirySubject}
        context={contactContext}
        isNDASigned={isNDASignedInContact}
        currentUser={profile ? { name: profile.full_name || profile.email, email: profile.email } : null}
        listingId={contactListingId}
        dealerId={contactDealerId}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        initialView={authView}
      />

      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => {
          setShowPasswordReset(false);
          // Clear hash from URL
          window.history.replaceState(null, '', window.location.pathname);
        }}
      />

      {/* Floating Support Chat Button - show on public pages */}
      {!isAdminRoute && !isDealerRoute && <SupportChatButton />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MarketplaceProvider>
          <LanguageProvider>
            <Router>
              <AppContent />
            </Router>
          </LanguageProvider>
        </MarketplaceProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
