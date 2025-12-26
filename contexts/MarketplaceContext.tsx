
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Business, Broker, User, Log, Report, AdminMessage } from '../types';
import { PROPERTIES, BROKERS } from '../constants';
// Removing mock data imports
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
  incrementListingViews: (id: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);







export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with cached data if available
  const [listings, setListings] = useState<Business[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('listings_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // Revive dates
          return parsed.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            yearsEstablished: item.yearsEstablished // Keep raw number or calc dynamically? Logic in mapSupabaseToListing handles this for new fetches.
            // Note: cached data might be slightly stale but acceptable for instant load
          }));
        } catch (e) {
          console.error('Error parsing cached listings', e);
        }
      }
    }
    return [];
  });
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [isPostingEnabled, setIsPostingEnabled] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(listings.length === 0);
  const { user } = useAuth();

  const mapSupabaseToListing = (row: any): Business => ({
    id: row.id,
    ownerProfileId: row.owner_profile_id,
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
    // Only show loading if we had no data (first load ever)
    if (listings.length === 0) setListingsLoading(true);

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        return;
      }

      if (data && data.length > 0) {
        const mappedListings = data.map(mapSupabaseToListing);
        setListings(mappedListings);

        // Update cache
        localStorage.setItem('listings_cache', JSON.stringify(mappedListings));
      } else {
        console.log('No listings in database');
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
          featured: listing.isPopular || false,
          image_url: listing.image // Save image URL
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
        if (updates.image) supabaseUpdates.image_url = updates.image; // Update image URL
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

  // Fetch brokers from Supabase
  const refreshBrokers = useCallback(async () => {
    console.log('refreshBrokers: Starting fetch...');
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Broker fetch timeout')), 10000)
      );

      const { data, error } = await Promise.race([
        supabase.from('brokers').select('*').order('created_at', { ascending: false }),
        timeoutPromise
      ]) as any;

      console.log('refreshBrokers: Result', { data, error });

      if (error) {
        console.error('Error fetching brokers:', error);
        return;
      }

      if (data) {
        const mappedBrokers: Broker[] = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone || '',
          image: row.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&fm=webp',
          location: row.location || '',
          description: row.description || '',
          specialties: row.specialties || [],
          languages: row.languages || ['English'],
          experience: row.experience || 0,
          status: row.status || 'active'
        }));
        console.log('refreshBrokers: Mapped brokers', mappedBrokers);
        setBrokers(mappedBrokers);
      }
    } catch (err) {
      console.error('Failed to fetch brokers:', err);
    }
  }, []);

  // Load brokers on mount
  useEffect(() => {
    refreshBrokers();
  }, [refreshBrokers]);

  const addBroker = async (broker: Broker) => {
    try {
      let profileId = null;

      // 1. Create auth user if password provided
      if (broker.password) {
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_broker_user', {
          email: broker.email,
          password: broker.password,
          full_name: broker.name
        });

        if (rpcError) {
          console.error('Error creating broker user:', rpcError);
          alert('Failed to create broker login: ' + rpcError.message);
          return;
        }

        profileId = rpcData?.id;
        console.log('Broker user created:', rpcData);
      }

      // 2. Insert broker into brokers table
      const { data, error } = await supabase.from('brokers').insert({
        profile_id: profileId,
        name: broker.name,
        email: broker.email,
        phone: broker.phone,
        image: broker.image,
        location: broker.location,
        description: broker.description,
        specialties: broker.specialties,
        languages: broker.languages,
        experience: broker.experience,
        status: broker.status || 'active'
      }).select().single();

      if (error) {
        console.error('Error inserting broker:', error);
        alert('Failed to save broker: ' + error.message);
        return;
      }

      // 3. Update local UI
      if (data) {
        setBrokers(prev => [{ ...broker, id: data.id }, ...prev]);
      }
      addLog('Added Broker', 'Admin', 'admin', broker.name);
    } catch (err) {
      console.error('Unexpected error adding broker:', err);
    }
  };

  const updateBroker = async (id: string, updates: Partial<Broker>) => {
    // Optimistic update
    setBrokers(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    const target = brokers.find(b => b.id === id)?.name || 'Unknown Broker';
    addLog('Updated Broker', 'Admin', 'admin', target);

    // Sync to Supabase
    try {
      const supabaseUpdates: any = {};
      if (updates.name) supabaseUpdates.name = updates.name;
      if (updates.email) supabaseUpdates.email = updates.email;
      if (updates.phone) supabaseUpdates.phone = updates.phone;
      if (updates.image) supabaseUpdates.image = updates.image;
      if (updates.location) supabaseUpdates.location = updates.location;
      if (updates.description) supabaseUpdates.description = updates.description;
      if (updates.specialties) supabaseUpdates.specialties = updates.specialties;
      if (updates.languages) supabaseUpdates.languages = updates.languages;
      if (updates.experience !== undefined) supabaseUpdates.experience = updates.experience;
      if (updates.status) supabaseUpdates.status = updates.status;
      supabaseUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('brokers')
        .update(supabaseUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating broker in Supabase:', error);
      }
    } catch (err) {
      console.error('Failed to update broker:', err);
    }
  };

  const deleteBroker = async (id: string) => {
    const target = brokers.find(b => b.id === id)?.name || 'Unknown Broker';
    setBrokers(prev => prev.filter(item => item.id !== id));
    addLog('Deleted Broker', 'Admin', 'admin', target);

    // Sync to Supabase
    try {
      const { error } = await supabase
        .from('brokers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting broker from Supabase:', error);
      }
    } catch (err) {
      console.error('Failed to delete broker:', err);
    }
  };

  const getBrokerById = (id: string) => {
    return brokers.find(b => b.id === id);
  };

  // Fetch users from Supabase profiles table
  const refreshUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      if (data) {
        const mappedUsers: User[] = data.map((row: any) => ({
          id: row.id,
          name: row.full_name || row.email?.split('@')[0] || 'Unknown',
          email: row.email,
          role: row.role === 'dealer' ? 'seller' : (row.role || 'buyer') as any,
          joinedDate: new Date(row.created_at),
          status: row.is_banned ? 'banned' : 'active',
          phone: row.phone
        }));
        setUsers(mappedUsers);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  // Load users on mount
  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const deleteUser = async (id: string) => {
    const target = users.find(u => u.id === id)?.name || 'Unknown User';
    setUsers(prev => prev.filter(u => u.id !== id));
    addLog('Deleted User', 'Admin', 'admin', target);

    // Note: Deleting from auth.users requires admin API, just remove from profiles
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting user from Supabase:', error);
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    const target = users.find(u => u.id === id)?.name || 'Unknown User';
    addLog('Updated User Profile', 'Admin', 'admin', target);

    // Sync to Supabase
    try {
      const supabaseUpdates: any = {};
      if (updates.name) supabaseUpdates.full_name = updates.name;
      if (updates.email) supabaseUpdates.email = updates.email;
      if (updates.phone) supabaseUpdates.phone = updates.phone;
      if (updates.role) {
        supabaseUpdates.role = updates.role === 'seller' ? 'dealer' : updates.role;
      }
      supabaseUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('profiles')
        .update(supabaseUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating user in Supabase:', error);
      }
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const updateUserStatus = async (id: string, status: 'active' | 'banned') => {
    const target = users.find(u => u.id === id)?.name || 'Unknown User';
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    addLog(`Changed User Status to ${status}`, 'Admin', 'admin', target);

    // Sync to Supabase
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: status === 'banned', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error updating user status in Supabase:', error);
      }
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
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

  // Fetch admin messages from Supabase
  const refreshAdminMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin messages:', error);
        return;
      }

      if (data) {
        const mappedMessages: AdminMessage[] = data.map((row: any) => ({
          id: row.id,
          sender: row.sender_name,
          email: row.sender_email,
          subject: row.subject,
          content: row.content,
          timestamp: new Date(row.created_at),
          status: row.status,
          type: row.message_type
        }));
        setAdminMessages(mappedMessages);
      }
    } catch (err) {
      console.error('Failed to fetch admin messages:', err);
    }
  }, []);

  // Load admin messages on mount + set up realtime subscription
  useEffect(() => {
    refreshAdminMessages();

    // Subscribe to realtime changes on support_messages table
    const channel = supabase
      .channel('support_messages_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_messages' },
        (payload) => {
          console.log('Realtime message update:', payload);

          if (payload.eventType === 'INSERT') {
            // Add new message to the top
            const row = payload.new as any;
            const newMessage: AdminMessage = {
              id: row.id,
              sender: row.sender_name,
              email: row.sender_email,
              subject: row.subject,
              content: row.content,
              timestamp: new Date(row.created_at),
              status: row.status,
              type: row.message_type
            };
            setAdminMessages(prev => [newMessage, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            // Update existing message
            const row = payload.new as any;
            setAdminMessages(prev => prev.map(m =>
              m.id === row.id
                ? { ...m, status: row.status, content: row.content }
                : m
            ));
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted message
            const row = payload.old as any;
            setAdminMessages(prev => prev.filter(m => m.id !== row.id));
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshAdminMessages]);

  const sendMessage = async (userId: string, message: string) => {
    const targetUser = users.find(u => u.id === userId);
    const target = targetUser?.name || 'Unknown User';
    addLog('Message Sent', 'Admin', 'admin', `To ${target}: ${message.substring(0, 20)}...`);

    // Save message to Supabase
    try {
      const { error } = await supabase.from('support_messages').insert({
        sender_name: 'Admin',
        sender_email: 'admin@nihaolaoban.com',
        subject: `Message from Admin`,
        content: `To: ${target} (${targetUser?.email})\n\n${message}`,
        message_type: 'system',
        status: 'read' // Admin already saw it
      });

      if (error) {
        console.error('Error saving admin message:', error);
      }
    } catch (err) {
      console.error('Failed to save admin message:', err);
    }
  };

  const markMessageRead = async (id: string) => {
    // Optimistic update
    setAdminMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m));

    // Sync to Supabase
    try {
      const { error } = await supabase
        .from('support_messages')
        .update({ status: 'read', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error marking message read:', error);
      }
    } catch (err) {
      console.error('Failed to mark message read:', err);
    }
  };

  const sendSupportInquiry = async (data: { name: string, email: string, role: string, subject: string, message: string }) => {
    // Insert to Supabase
    try {
      const { error } = await supabase.from('support_messages').insert({
        sender_name: data.name,
        sender_email: data.email,
        subject: `[${data.subject.toUpperCase()}] ${data.role}`,
        content: data.message,
        message_type: 'support'
      });

      if (error) {
        console.error('Error sending support inquiry:', error);
        return;
      }

      // Refresh to see new message
      refreshAdminMessages();
      addLog('Support Inquiry', data.name, 'buyer', 'Support Form');
    } catch (err) {
      console.error('Failed to send support inquiry:', err);
    }
  };

  const sendAnnouncement = (subject: string, message: string) => {
    const activeUsers = users.filter(u => u.status === 'active');
    addLog('System Announcement', 'Admin', 'admin', `Sent to ${activeUsers.length} users: ${subject}`);
    console.log(`Announcement sent to ${activeUsers.length} users: ${subject} - ${message}`);
  };

  const incrementListingViews = useCallback((id: string) => {
    setListings(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, views: (l.views || 0) + 1 } : l);
      // Persist to cache immediately for instant updates on refresh
      if (typeof window !== 'undefined') {
        localStorage.setItem('listings_cache', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

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
      sendAnnouncement,
      incrementListingViews
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
