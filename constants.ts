
import { Business, Service, Stat, Broker } from './types';

export const NAVIGATION_LINKS = [
  { label: 'buy', href: '#listings' },
  { label: 'services', href: '#services' },
  { label: 'brokers', href: '#brokers' },
  { label: 'about', href: '#about' },
];

export const BROKERS: Broker[] = [
  {
    id: '1',
    name: 'NY A+ TEAM',
    image: 'https://i.ibb.co/PZcF1Nv3/Gemini-Generated-Image-vm24m8vm24m8vm24.png',
    phone: '631-663-6666',
    email: 'info@nyateam.com',
    specialties: ['Restaurants', 'Franchises', 'Commercial Leasing'],
    location: 'Flushing, NY',
    experience: 15,
    languages: ['English', 'Chinese', 'Korean'],
    description: 'The #1 Commercial Team in New York. We specialize in connecting buyers with profitable restaurant and retail opportunities across the Tri-State area.'
  }
];

export const PROPERTIES: Business[] = [
  {
    id: '1',
    image: 'https://i.ibb.co/QFF4Svwq/Gemini-Generated-Image-wo8xfhwo8xfhwo8x.png',
    images: [
      'https://i.ibb.co/QFF4Svwq/Gemini-Generated-Image-wo8xfhwo8xfhwo8x.png',
      'https://i.ibb.co/hxP59T7x/Gemini-Generated-Image-jvfhnojvfhnojvfh.png'
    ],
    title: 'Prime Main Street Restaurant - Fort Lee (Near Shoo Loong Kan)',
    location: 'Fort Lee, NJ',
    coordinates: [-73.9749, 40.8509],
    price: 158000,
    category: 'Restaurant',
    sellerType: 'Agent',
    views: 1240,
    grossRevenue: 500000,
    cashFlow: 60000,
    isFinancialsEstimated: true,
    realEstate: 'Leased',
    description: '**Facts**: Located on the core Main Street of Fort Lee, NJ, this restaurant is situated in a high-traffic area known for its mature dining atmosphere. **Potential**: The exclusive outdoor dining area provides significant opportunity.',
    rent: 10500,
    sqFt: 1615,
    yearsEstablished: 1,
    employees: 'N/A',
    franchise: false,
    rating: 4.8,
    status: 'active',
    agent: {
        name: 'NY A+ TEAM',
        image: 'https://i.ibb.co/PZcF1Nv3/Gemini-Generated-Image-vm24m8vm24m8vm24.png',
        phone: '631-663-6666',
        email: 'info@nyateam.com'
    },
    isPopular: true,
    createdAt: new Date('2023-11-01'),
    tags: ['Prime Location', 'Turnkey'],
    translations: {
        zh: {
            title: '新泽西Fort Lee主街餐馆转让 (紧邻小龙坎火锅)',
            location: 'Fort Lee, NJ',
            description: '**事实**: 本店位于新泽西Fort Lee主街核心地段。'
        }
    }
  },
  {
    id: '6',
    image: 'https://i.ibb.co/M57sPMTW/Gemini-Generated-Image-2a2y2n2a2y2n2a2y.png',
    images: [
        'https://i.ibb.co/M57sPMTW/Gemini-Generated-Image-2a2y2n2a2y2n2a2y.png'
    ],
    title: 'Wealthy Greenwich POKE / Bubble Tea Shop',
    location: 'Greenwich, CT',
    coordinates: [-73.6285, 41.0262],
    price: 268000,
    category: 'Restaurant',
    sellerType: 'Agent',
    views: 890,
    grossRevenue: 1020000,
    cashFlow: 135000,
    isFinancialsEstimated: true,
    realEstate: 'Leased',
    description: '**Facts**: Located in wealthy Greenwich area. Situated on high-end commercial street.',
    rent: 10300,
    sqFt: 2400,
    yearsEstablished: 1,
    employees: 'N/A',
    franchise: false,
    rating: 4.8,
    status: 'active',
    agent: {
        name: 'NY A+ TEAM',
        image: 'https://i.ibb.co/PZcF1Nv3/Gemini-Generated-Image-vm24m8vm24m8vm24.png',
        phone: '631-663-6666',
        email: 'info@nyateam.com'
    },
    isPopular: true,
    createdAt: new Date('2024-02-01'),
    tags: ['High Cash Flow', 'Prime Location'],
    translations: {
        zh: {
            title: '康州富人区 POKE/奶茶店转让 - Greenwich',
            location: 'Greenwich, CT',
            description: '**事实**: 本店位于康州Greenwich富人区。'
        }
    }
  },
  {
      id: '10',
      title: 'High-Traffic Flushing Beauty Salon',
      location: 'Flushing, NY',
      coordinates: [-73.8322, 40.7600],
      price: 120000,
      category: 'Beauty',
      sellerType: 'Agent',
      views: 2100,
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2574&auto=format&fit=crop&fm=webp',
      grossRevenue: 300000,
      cashFlow: 80000,
      realEstate: 'Leased',
      description: 'Well-established beauty salon in the heart of Flushing.',
      yearsEstablished: 5,
      employees: '4',
      franchise: false,
      rating: 4.6,
      status: 'active',
      agent: {
          name: 'NY A+ TEAM',
          image: 'https://i.ibb.co/PZcF1Nv3/Gemini-Generated-Image-vm24m8vm24m8vm24.png',
          phone: '631-663-6666',
          email: 'info@nyateam.com'
      },
      isPopular: true,
      createdAt: new Date('2024-01-15')
  }
];

const totalValue = PROPERTIES.reduce((acc, curr) => acc + curr.price, 0);
const totalValueFormatted = totalValue > 1000000 ? `$${(totalValue / 1000000).toFixed(1)}M+` : `$${(totalValue / 1000).toFixed(0)}k+`;
const totalListings = PROPERTIES.length;
const totalBrokers = BROKERS.length;
const totalViews = PROPERTIES.reduce((acc, curr) => acc + curr.views, 0);
const activeBuyers = Math.floor(totalViews / 2.5);

export const SERVICES: Service[] = [
  {
    id: '1',
    title: 's1_title',
    description: 's1_desc',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2670&auto=format&fit=crop&fm=webp',
    type: 'large',
    offersCount: activeBuyers
  },
  {
    id: '2',
    title: 's2_title',
    description: 's2_desc',
    type: 'small',
    offersCount: totalListings
  },
  {
    id: '3',
    title: 's3_title',
    description: 's3_desc',
    type: 'small',
    offersCount: totalBrokers
  }
];

export const STATS: Stat[] = [
  { id: '1', value: totalValueFormatted, label: 'val' },
  { id: '2', value: activeBuyers.toLocaleString(), label: 'buyers' },
  { id: '3', value: '142', label: 'sold' },
  { id: '4', value: '98%', label: 'rate' },
];
