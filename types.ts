
export interface Agent {
  name: string;
  image: string;
  phone: string;
  email: string;
}

export interface Broker {
  id: string;
  name: string;
  image: string;
  phone: string;
  email: string;
  specialties: string[];
  description: string;
  location: string;
  languages: string[];
  experience: number; // years
  password?: string; // For mock login credentials
  status?: 'active' | 'hidden';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  joinedDate: Date;
  status: 'active' | 'banned';
  phone?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface BusinessContent {
  title: string;
  description: string;
  location: string;
  reasonForSelling?: string;
  competition?: string;
  growthExpansion?: string;
  supportTraining?: string;
  customSections?: CustomSection[];
}

export interface Business extends BusinessContent {
  id: string;
  ownerProfileId?: string;
  image: string;
  images?: string[];

  price: number;
  downPayment?: number;
  category: 'Restaurant' | 'Beauty' | 'Other' | 'Retail' | 'Service';
  sellerType: 'Owner' | 'Agent' | 'Dealer';
  views: number;

  // Financials
  grossRevenue: number;
  cashFlow: number;
  ebitda?: number;
  ffne?: number;
  inventory?: number;
  isFinancialsEstimated?: boolean;
  realEstate: 'Included' | 'Available' | 'Leased' | 'Not Applicable';

  // Lease
  rent?: number;
  sqFt?: number;
  leaseExpiration?: string;
  leaseOptions?: string;

  // Operations
  yearsEstablished: number;
  employees: string;
  ownerHours?: string;
  hoursOfOperation?: string;
  franchise: boolean;

  rating: number; // Deal Health/Score
  status: 'active' | 'sold' | 'pending' | 'hidden';
  agent: Agent;

  // New Fields
  isPopular?: boolean;
  createdAt?: Date;

  // Map Data
  coordinates: [number, number]; // [longitude, latitude]

  // Localization Support
  translations?: {
    zh?: BusinessContent;
  };

  // Tags
  tags?: string[];
}

export type LeadStatus = 'new' | 'contacted' | 'negotiating' | 'sold' | 'archived';

export interface DealerLead {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  listingId: string;
  listingTitle: string;
  message: string;
  timestamp: Date;
  status: LeadStatus;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  image?: string;
  type: 'large' | 'small';
  offersCount?: number;
}

export interface Stat {
  id: string;
  value: string;
  label: string;
}

export interface SearchFilters {
  location?: string;
  priceRange?: string;
  category?: string;
  cashFlow?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  agentName: string;
  agentImage: string;
  businessTitle: string;
  messages: Message[];
  unread: number;
}

export interface Log {
  id: string;
  action: string;
  user: string;
  role: 'admin' | 'buyer' | 'seller' | 'system';
  target: string;
  details?: string;
  timestamp: Date;
}

export interface Report {
  id: string;
  targetId: string;
  targetType: 'listing' | 'user' | 'broker';
  reason: 'spam' | 'inappropriate' | 'scam' | 'other';
  description: string;
  reporter: string;
  status: 'pending' | 'resolved' | 'dismissed';
  timestamp: Date;
}

export interface AdminMessage {
  id: string;
  sender: string;
  email: string;
  subject: string;
  content: string;
  timestamp: Date;
  status: 'unread' | 'read' | 'replied';
  type: 'inquiry' | 'support' | 'system';
}
