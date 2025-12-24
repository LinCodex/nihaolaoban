
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Business, Broker, User, Log, Report, AdminMessage } from '../types';
import { PROPERTIES, BROKERS } from '../constants';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

interface MarketplaceContextType {
  listings: Business[];
  brokers: Broker[];
  users: User[];
  logs: Log[];
  reports: Report[];
  adminMessages: AdminMessage[];
  isPostingEnabled: boolean;
  listingsLoading: boolean;
  refreshListings: () => Promise<void>;
  addListing: (listing: Business) => Promise<void>;
  updateListing: (id: string, updates: Partial<Business>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  addBroker: (broker: Broker) => void;
  updateBroker: (id: string, updates: Partial<Broker>) => void;
  deleteBroker: (id: string) => void;
  getBrokerById: (id: string) => Broker | undefined;
  deleteUser: (id: string) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  updateUserStatus: (id: string, status: 'active' | 'banned') => void;
  addLog: (action: string, user: string, role: Log['role'], target: string) => void;
  addReport: (report: Report) => void;
  resolveReport: (id: string, status: 'resolved' | 'dismissed') => void;
  togglePostingEnabled: () => void;
  sendMessage: (userId: string, message: string) => void;
  markMessageRead: (id: string) => void;
  sendSupportInquiry: (data: { name: string, email: string, role: string, subject: string, message: string }) => void;
  sendAnnouncement: (subject: string, message: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

// Mock Users Data
const MOCK_USERS: User[] = [
    { id: '1', name: 'John Buyer', email: 'john@example.com', role: 'buyer', joinedDate: new Date('2023-10-15'), status: 'active', phone: '+1 555-0101' },
    { id: '2', name: 'Alice Seller', email: 'alice@business.com', role: 'seller', joinedDate: new Date('2023-11-02'), status: 'active', phone: '+1 555-0202' },
    { id: '3', name: 'Bob Inactive', email: 'bob@spam.com', role: 'buyer', joinedDate: new Date('2023-09-20'), status: 'banned', phone: '+1 555-9999' },
];

// Mock Logs
const MOCK_LOGS: Log[] = [
    { id: '1', action: 'Listing Approved', user: 'Admin', role: 'admin', target: 'Prime Downtown Pizzeria', timestamp: new Date(Date.now() - 10000000) },
    { id: '2', action: 'User Banned', user: 'Admin', role: 'admin', target: 'Spam Bot 3000', timestamp: new Date(Date.now() - 5000000) },
    { id: '3', action: 'Listing Created', user: 'Alice Seller', role: 'seller', target: 'Nail Salon', timestamp: new Date(Date.now() - 2000000) },
];

// Mock Reports
const MOCK_REPORTS: Report[] = [
  { id: '1', targetId: '2', targetType: 'listing', reason: 'scam', description: 'Price seems too good to be true, asks for wire transfer.', reporter: 'John Buyer', status: 'pending', timestamp: new Date(Date.now() - 86400000) },
  { id: '2', targetId: '3', targetType: 'user', reason: 'spam', description: 'Sending unsolicited messages.', reporter: 'Alice Seller', status: 'pending', timestamp: new Date(Date.now() - 172800000) },
];

// Mock Admin Messages
const MOCK_ADMIN_MESSAGES: AdminMessage[] = [
    { id: '1', sender: 'John Buyer', email: 'john@example.com', subject: 'Inquiry about Listing #123', content: 'Hi, I am interested in the restaurant in Fort Lee. Can I see the financials?', timestamp: new Date(Date.now() - 3600000), status: 'unread', type: 'inquiry' },
    { id: '2', sender: 'Alice Seller', email: 'alice@business.com', subject: 'Technical Issue', content: 'I cannot upload photos to my listing. Please help.', timestamp: new Date(Date.now() - 7200000), status: 'read', type: 'support' },
    { id: '3', sender: 'System', email: 'no-reply@system.com', subject: 'New User Registration', content: 'New user "David Lee" registered.', timestamp: new Date(Date.now() - 86400000), status: 'read', type: 'system' }
];

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with constants as fallback
  const [listings, setListings] = useState<Business[]>(PROPERTIES);
  const [brokers, setBrokers] = useState<Broker[]>(BROKERS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [logs, setLogs] = useState<Log[]>(MOCK_LOGS);
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>(MOCK_ADMIN_MESSAGES);
  const [isPostingEnabled, setIsPostingEnabled] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);
  const { user } = useAuth();

  // Convert Supabase listing to Business type
  const mapSupabaseToListing = (row: any): Business => ({
    id: row.id,
    title: row.title || '',
    description: row.description || '',
    location: row.location || '',
    image: row.image_url || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=400&fm=webp',
    images: row.images || [],
    price: Number(row.price) || 0,
    category: row.business_type || 'Other',
    sellerType: 'Agent',
    views: row.views || 0,
    grossRevenue: Number(row.revenue) || 0,
    cashFlow: Number(row.profit) || 0,
    realEstate: row.real_estate || 'Leased',
    rent: row.rent,
    sqFt: row.sq_ft,
    yearsEstablished: row.year_established ? new Date().getFullYear() - row.year_established : 0,
    employees: row.employees?.toString() || 'N/A',
    franchise: row.franchise || false,
    rating: row.rating || 4.5,
    status: row.status || 'active',
    agent: {
      name: 'NY A+ TEAM',
      image: 'https://i.ibb.co/PZcF1Nv3/Gemini-Generated-Image-vm24m8vm24m8vm24.png',
      phone: '631-663-6666',
      email: 'info@nyateam.com'
    },
    isPopular: row.featured || false,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    coordinates: [row.longitude || -73.9857, row.latitude || 40.7484],
    tags: row.tags || []
  });

  // Fetch listings from Supabase
  const refreshListings = useCallback(async () => {
    setListingsLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        // Keep mock data as fallback
        return;
      }

      if (data && data.length > 0) {
        const mappedListings = data.map(mapSupabaseToListing);
        setListings(mappedListings);
      } else {
        // No data in DB, keep mock data
        console.log('No listings in database, using mock data');
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setListingsLoading(false);
    }
  }, []);

  // Load listings on mount
  useEffect(() => {
    refreshListings();
  }, [refreshListings]);

  const addLog = (action: string, user: string, role: Log['role'], target: string) => {
      const newLog: Log = {
          id: Date.now().toString(),
          action,
          user,
          role,
          target,
          timestamp: new Date()
      };
      setLogs(prev => [newLog, ...prev]);
  };

  const addListing = async (listing: Business) => {
    // Add to local state immediately for optimistic UI
    setListings(prev => [listing, ...prev]);
    addLog('Created Listing', listing.sellerType === 'Owner' ? 'User' : 'Broker', 'seller', listing.title);

    // If user is logged in, also save to Supabase
    if (user) {
      try {
        const { error } = await supabase.from('listings').insert({
          id: listing.id,
          owner_profile_id: user.id,
          title: listing.title,
          description: listing.description,
          business_type: listing.category,
          industry: listing.category,
          location: listing.location,
          price: listing.price,
          revenue: listing.grossRevenue,
          profit: listing.cashFlow,
          employees: listing.employees === 'N/A' ? null : parseInt(listing.employees),
          year_established: new Date().getFullYear() - listing.yearsEstablished,
          status: listing.status || 'pending',
          featured: listing.isPopular || false
        });

        if (error) {
          console.error('Error saving listing to Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to save listing:', err);
      }
    }
  };

  const updateListing = async (id: string, updates: Partial<Business>) => {
    setListings(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    const target = listings.find(l => l.id === id)?.title || 'Unknown Listing';
    
    // Simplified logging for updates
    if (updates.status) {
        addLog(`Status changed to ${updates.status}`, 'Admin', 'admin', target);
    } else {
        addLog('Updated Listing', 'Admin', 'admin', target);
    }

    // Sync to Supabase
    if (user) {
      try {
        const supabaseUpdates: any = {};
        if (updates.title) supabaseUpdates.title = updates.title;
        if (updates.description) supabaseUpdates.description = updates.description;
        if (updates.price) supabaseUpdates.price = updates.price;
        if (updates.status) supabaseUpdates.status = updates.status;
        if (updates.location) supabaseUpdates.location = updates.location;
        if (updates.grossRevenue) supabaseUpdates.revenue = updates.grossRevenue;
        if (updates.cashFlow) supabaseUpdates.profit = updates.cashFlow;
        supabaseUpdates.updated_at = new Date().toISOString();

        const { error } = await supabase
          .from('listings')
          .update(supabaseUpdates)
          .eq('id', id);

        if (error) {
          console.error('Error updating listing in Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to update listing:', err);
      }
    }
  };

  const deleteListing = async (id: string) => {
    const target = listings.find(l => l.id === id)?.title || 'Unknown Listing';
    setListings(prev => prev.filter(item => item.id !== id));
    addLog('Deleted Listing', 'Admin', 'admin', target);

    // Sync to Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('listings')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting listing from Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to delete listing:', err);
      }
    }
  };

  const addBroker = (broker: Broker) => {
    setBrokers(prev => [...prev, broker]);
    addLog('Added Broker', 'Admin', 'admin', broker.name);
  };

  const updateBroker = (id: string, updates: Partial<Broker>) => {
    setBrokers(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    const target = brokers.find(b => b.id === id)?.name || 'Unknown Broker';
    addLog('Updated Broker', 'Admin', 'admin', target);
  };

  const deleteBroker = (id: string) => {
    const target = brokers.find(b => b.id === id)?.name || 'Unknown Broker';
    setBrokers(prev => prev.filter(item => item.id !== id));
    addLog('Deleted Broker', 'Admin', 'admin', target);
  };

  const getBrokerById = (id: string) => {
    return brokers.find(b => b.id === id);
  };

  const deleteUser = (id: string) => {
    const target = users.find(u => u.id === id)?.name || 'Unknown User';
    setUsers(prev => prev.filter(u => u.id !== id));
    addLog('Deleted User', 'Admin', 'admin', target);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
      const target = users.find(u => u.id === id)?.name || 'Unknown User';
      addLog('Updated User Profile', 'Admin', 'admin', target);
  }

  const updateUserStatus = (id: string, status: 'active' | 'banned') => {
    const target = users.find(u => u.id === id)?.name || 'Unknown User';
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    addLog(`Changed User Status to ${status}`, 'Admin', 'admin', target);
  };

  const addReport = (report: Report) => {
      setReports(prev => [report, ...prev]);
      const reporterUser = users.find(u => u.name === report.reporter);
      const role = reporterUser ? reporterUser.role : 'system';
      addLog('Report Filed', report.reporter, role, `${report.reason} on ${report.targetType}`);
  };

  const resolveReport = (id: string, status: 'resolved' | 'dismissed') => {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      addLog(`Report ${status}`, 'Admin', 'admin', `Report #${id}`);
  };

  const togglePostingEnabled = () => {
      const newState = !isPostingEnabled;
      setIsPostingEnabled(newState);
      addLog(newState ? 'Enabled User Posting' : 'Disabled User Posting', 'Admin', 'admin', 'System Settings');
  };

  const sendMessage = (userId: string, message: string) => {
      const target = users.find(u => u.id === userId)?.name || 'Unknown User';
      addLog('Message Sent', 'Admin', 'admin', `To ${target}: ${message.substring(0, 20)}...`);
      console.log(`Message sent to user ${userId}: ${message}`);
  };

  const markMessageRead = (id: string) => {
      setAdminMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m));
  };

  const sendSupportInquiry = (data: { name: string, email: string, role: string, subject: string, message: string }) => {
      const newMessage: AdminMessage = {
          id: Date.now().toString(),
          sender: data.name,
          email: data.email,
          subject: `[${data.subject.toUpperCase()}] ${data.role}`,
          content: data.message,
          timestamp: new Date(),
          status: 'unread',
          type: 'support'
      };
      setAdminMessages(prev => [newMessage, ...prev]);
      addLog('Support Inquiry', data.name, 'buyer', 'Support Form');
  };

  const sendAnnouncement = (subject: string, message: string) => {
      const activeUsers = users.filter(u => u.status === 'active');
      addLog('System Announcement', 'Admin', 'admin', `Sent to ${activeUsers.length} users: ${subject}`);
      // In a real app, this would iterate activeUsers and create notification records
      console.log(`Announcement sent to ${activeUsers.length} users: ${subject} - ${message}`);
  };

  return (
    <MarketplaceContext.Provider value={{
      listings,
      brokers,
      users,
      logs,
      reports,
      adminMessages,
      isPostingEnabled,
      listingsLoading,
      refreshListings,
      addListing,
      updateListing,
      deleteListing,
      addBroker,
      updateBroker,
      deleteBroker,
      getBrokerById,
      deleteUser,
      updateUser,
      updateUserStatus,
      addLog,
      addReport,
      resolveReport,
      togglePostingEnabled,
      sendMessage,
      markMessageRead,
      sendSupportInquiry,
      sendAnnouncement
    }}>
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
