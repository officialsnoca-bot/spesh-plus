import fs from 'fs';
import path from 'path';
import { 
  User, Country, Service, VirtualNumber, Order, 
  SMSMessage, Provider, Transaction, Ticket, ApiKey, Pricing 
} from './types';

// Let's store db state in a local file or in-memory fallback
const DB_FILE = path.join(process.cwd(), '.data', 'db_store.json');

// Ensure directories exist
try {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
} catch (e) {
  console.warn("Could not create .data folder, using memory db:", e);
}

// Initial country list
const initialCountries: Country[] = [
  { id: 'c1', name: 'United States', code: 'US', flag: '🇺🇸' },
  { id: 'c2', name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
  { id: 'c3', name: 'Estonia', code: 'EE', flag: '🇪🇪' },
  { id: 'c4', name: 'Ukraine', code: 'UA', flag: '🇺🇦' },
  { id: 'c5', name: 'Germany', code: 'DE', flag: '🇩🇪' },
  { id: 'c6', name: 'Brazil', code: 'BR', flag: '🇧🇷' },
  { id: 'c7', name: 'India', code: 'IN', flag: '🇮🇳' },
  { id: 'c8', name: 'Nigeria', code: 'NG', flag: '🇳🇬' },
  { id: 'c9', name: 'South Africa', code: 'ZA', flag: '🇿🇦' },
  { id: 'c10', name: 'Canada', code: 'CA', flag: '🇨🇦' },
];

// Initial service list
const initialServices: Service[] = [
  // Messengers
  { id: 's1', name: 'WhatsApp', logo: 'MessageSquare', defaultPrice: 1.5, category: 'Messengers' },
  { id: 's2', name: 'Telegram', logo: 'Send', defaultPrice: 1.2, category: 'Messengers' },
  { id: 's10', name: 'Discord', logo: 'Users', defaultPrice: 0.9, category: 'Messengers' },
  { id: 's11', name: 'Viber', logo: 'Phone', defaultPrice: 0.8, category: 'Messengers' },
  { id: 's12', name: 'WeChat', logo: 'MessageSquare', defaultPrice: 1.7, category: 'Messengers' },
  { id: 's13', name: 'Snapchat', logo: 'Smartphone', defaultPrice: 1.0, category: 'Messengers' },

  // Social Networks
  { id: 's4', name: 'Facebook', logo: 'Facebook', defaultPrice: 0.7, category: 'Social Networks' },
  { id: 's5', name: 'Instagram', logo: 'Instagram', defaultPrice: 0.65, category: 'Social Networks' },
  { id: 's6', name: 'TikTok', logo: 'Video', defaultPrice: 0.9, category: 'Social Networks' },
  { id: 's14', name: 'Twitter / X', logo: 'Layers', defaultPrice: 0.85, category: 'Social Networks' },
  { id: 's15', name: 'LinkedIn', logo: 'Users', defaultPrice: 1.3, category: 'Social Networks' },
  { id: 's16', name: 'Reddit', logo: 'Globe', defaultPrice: 0.6, category: 'Social Networks' },

  // AI & Tech Tools
  { id: 's7', name: 'ChatGPT / OpenAI', logo: 'Cpu', defaultPrice: 2.2, category: 'AI & Developer' },
  { id: 's17', name: 'Claude AI', logo: 'Sparkles', defaultPrice: 2.0, category: 'AI & Developer' },
  { id: 's3', name: 'Google / Gmail', logo: 'Mail', defaultPrice: 0.8, category: 'AI & Developer' },
  { id: 's18', name: 'Microsoft / Outlook', logo: 'Mail', defaultPrice: 0.75, category: 'AI & Developer' },
  { id: 's19', name: 'GitHub', logo: 'Terminal', defaultPrice: 0.95, category: 'AI & Developer' },

  // Payments & Finance
  { id: 's20', name: 'PayPal', logo: 'DollarSign', defaultPrice: 2.5, category: 'Payments & Finance' },
  { id: 's21', name: 'Stripe', logo: 'CreditCard', defaultPrice: 2.4, category: 'Payments & Finance' },
  { id: 's22', name: 'Revolut', logo: 'Wallet', defaultPrice: 2.3, category: 'Payments & Finance' },
  { id: 's23', name: 'Binance', logo: 'Activity', defaultPrice: 1.9, category: 'Payments & Finance' },
  { id: 's24', name: 'Coinbase', logo: 'Activity', defaultPrice: 1.8, category: 'Payments & Finance' },

  // Food & Ride-sharing
  { id: 's9', name: 'Uber / Grab', logo: 'Car', defaultPrice: 0.5, category: 'Food & Ride-sharing' },
  { id: 's25', name: 'Lyft', logo: 'Car', defaultPrice: 0.6, category: 'Food & Ride-sharing' },
  { id: 's26', name: 'Bolt', logo: 'Car', defaultPrice: 0.55, category: 'Food & Ride-sharing' },
  { id: 's27', name: 'DoorDash', logo: 'Car', defaultPrice: 0.7, category: 'Food & Ride-sharing' },

  // Entertainment & Fun
  { id: 's8', name: 'Tinder', logo: 'Flame', defaultPrice: 1.1, category: 'Entertainment & Fun' },
  { id: 's28', name: 'Netflix', logo: 'Video', defaultPrice: 1.4, category: 'Entertainment & Fun' },
  { id: 's29', name: 'Spotify', logo: 'Music', defaultPrice: 0.8, category: 'Entertainment & Fun' },
  { id: 's30', name: 'Steam', logo: 'Layers', defaultPrice: 0.95, category: 'Entertainment & Fun' },
];

// Initial provider list
const initialProviders: Provider[] = [
  { id: 'p1', name: '5Sim', apiKey: '5sim_sec_prod_8231', balance: 450.80, priority: 2, active: true },
  { id: 'p2', name: 'SMS-Activate', apiKey: 'smsact_sec_prod_9091', balance: 290.40, priority: 3, active: true },
  { id: 'p3', name: 'Twilio API', apiKey: 'twilio_sid_test_12a0', balance: 150.00, priority: 1, active: true },
  { id: 'p4', name: 'Plivo Bulk', apiKey: 'plivo_auth_test_992e', balance: 75.50, priority: 4, active: true },
];

export interface DBState {
  users: User[];
  countries: Country[];
  services: Service[];
  providers: Provider[];
  numbers: VirtualNumber[];
  orders: Order[];
  sms: SMSMessage[];
  transactions: Transaction[];
  tickets: Ticket[];
  apiKeys: ApiKey[];
  markupPercent: number; // Global markup percentage managed by Admin
  pricingMode: 'percent' | 'fixed_margin';
  fixedProfitAmt: number;
}

const defaultState = (): DBState => {
  const users: User[] = [
    {
      id: 'usr_admin',
      email: 'admin@speshplus.com',
      role: 'Admin',
      balance: 1000.00,
      kycStatus: 'Verified',
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      twoFactorEnabled: true,
      password: 'password123',
      securityQuestion: 'What is your secret code?',
      securityAnswer: '777',
      status: 'Active'
    },
    {
      id: 'usr_customer',
      email: 'customer@speshplus.com',
      role: 'Customer',
      balance: 45.50,
      kycStatus: 'Verified',
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      twoFactorEnabled: false,
      password: 'password123',
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'gold',
      status: 'Active'
    },
    {
      id: 'usr_reseller',
      email: 'reseller@speshplus.com',
      role: 'Reseller',
      balance: 350.00,
      kycStatus: 'Verified',
      createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      twoFactorEnabled: true,
      password: 'password123',
      securityQuestion: 'What is your favorite pet?',
      securityAnswer: 'dog',
      status: 'Active'
    },
    {
      id: 'usr_support',
      email: 'support@speshplus.com',
      role: 'Support',
      balance: 10.00,
      kycStatus: 'Unverified',
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      twoFactorEnabled: false,
      password: 'password123',
      securityQuestion: 'Where were you born?',
      securityAnswer: 'berlin',
      status: 'Active'
    }
  ];

  // Auto-generate some initial pool numbers for all country-service combinations
  const numbers: VirtualNumber[] = [];
  const providersKeys: ('5Sim' | 'SMS-Activate' | 'Twilio' | 'Plivo')[] = ['5Sim', 'SMS-Activate', 'Twilio', 'Plivo'];
  let numId = 1;

  initialCountries.forEach((c) => {
    initialServices.forEach((s) => {
      // 1 one-time and 1 long-term number for variety
      const randomBase = Math.floor(Math.random() * 9000000) + 1000000;
      const ccCode = c.code === 'US' ? '1' : c.code === 'GB' ? '44' : c.code === 'EE' ? '372' : c.code === 'UA' ? '380' : c.code === 'DE' ? '49' : '55';
      
      numbers.push({
        id: `num_${numId++}`,
        phone: `+${ccCode}${randomBase}`,
        countryId: c.id,
        provider: providersKeys[Math.floor(Math.random() * providersKeys.length)],
        serviceId: s.id,
        status: 'available',
        price: Number((s.defaultPrice * (1 + 0.15)).toFixed(2)),
        type: 'one-time'
      });

      numbers.push({
        id: `num_${numId++}`,
        phone: `+${ccCode}${randomBase + 215}`,
        countryId: c.id,
        provider: providersKeys[Math.floor(Math.random() * providersKeys.length)],
        serviceId: s.id,
        status: 'available',
        price: Number((s.defaultPrice * 4.5).toFixed(2)), // weekly/monthly pricing
        type: 'long-term'
      });
    });
  });

  const transactions: Transaction[] = [
    {
      id: 'tx_1',
      userId: 'usr_customer',
      amount: 50.00,
      type: 'deposit',
      status: 'Completed',
      gateway: 'Stripe',
      reference: 'ch_stripe_98721ad9',
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'tx_2',
      userId: 'usr_customer',
      amount: 4.50,
      type: 'purchase',
      status: 'Completed',
      gateway: 'Admin',
      reference: 'ord_purch_rec_0911',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    }
  ];

  const tickets: Ticket[] = [
    {
      id: 'tkt_1',
      userId: 'usr_customer',
      userEmail: 'customer@speshplus.com',
      subject: 'Did not receive WhatsApp SMS',
      status: 'Closed',
      priority: 'Medium',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      messages: [
        {
          id: 'tm_1',
          sender: 'user',
          text: 'Hi, I rented a US WhatsApp number but no SMS code was received within 15 minutes. Can you check?',
          createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        },
        {
          id: 'tm_2',
          sender: 'support',
          text: 'Hello. I have refunded the $1.50 to your wallet as no SMS arrived within the 15-minute timeframe. This is automatic, but let me know if you need help with a new activation.',
          createdAt: new Date(Date.now() - (2 * 24 * 3600 * 1000 - 3600 * 1000)).toISOString(),
        }
      ]
    },
    {
      id: 'tkt_2',
      userId: 'usr_reseller',
      userEmail: 'reseller@speshplus.com',
      subject: 'Large-scale reseller API request limits',
      status: 'Open',
      priority: 'High',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 'tm_3',
          sender: 'user',
          text: 'We are deploying a script to rent 100+ numbers daily. Can you list any strict rate-limiting policies or provide a discount?',
          createdAt: new Date().toISOString(),
        }
      ]
    }
  ];

  const apiKeys: ApiKey[] = [
    {
      id: 'key_1',
      userId: 'usr_reseller',
      key: 'spesh_live_9a40fb87bc3109a24',
      secret: '••••••••••••••••••••••••••••••••',
      rateLimit: 120,
      createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    }
  ];

  return {
    users,
    countries: initialCountries,
    services: initialServices,
    providers: initialProviders,
    numbers,
    orders: [],
    sms: [],
    transactions,
    tickets,
    apiKeys,
    markupPercent: 20, // default 20%
    pricingMode: 'fixed_margin',
    fixedProfitAmt: 2.0,
  };
};

let dbCache: DBState | null = null;

export function getDB(): DBState {
  if (dbCache) return dbCache;

  try {
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      // Basic schema health check
      if (parsed.users && parsed.countries && parsed.numbers) {
        if (parsed.pricingMode === undefined) {
          parsed.pricingMode = 'fixed_margin';
        }
        if (parsed.fixedProfitAmt === undefined) {
          parsed.fixedProfitAmt = 2.0;
        }
        // Migration: Ensure all initial services are present in retrieved DB
        if (!parsed.services || parsed.services.length < initialServices.length) {
          parsed.services = initialServices;
          // Regenerate numbers for new services
          const providersKeys: ('5Sim' | 'SMS-Activate' | 'Twilio' | 'Plivo')[] = ['5Sim', 'SMS-Activate', 'Twilio', 'Plivo'];
          let maxNumId = Math.max(...parsed.numbers.map((n: any) => parseInt(n.id.replace('num_', '')) || 0), 1) + 1;
          parsed.countries.forEach((c : any) => {
            initialServices.forEach((s) => {
              if (!parsed.numbers.some((n: any) => n.serviceId === s.id && n.countryId === c.id)) {
                const randomBase = Math.floor(Math.random() * 9000000) + 1000000;
                const ccCode = c.code === 'US' ? '1' : c.code === 'GB' ? '44' : c.code === 'EE' ? '372' : c.code === 'UA' ? '380' : c.code === 'DE' ? '49' : '55';
                parsed.numbers.push({
                  id: `num_${maxNumId++}`,
                  phone: `+${ccCode}${randomBase}`,
                  countryId: c.id,
                  provider: providersKeys[Math.floor(Math.random() * providersKeys.length)],
                  serviceId: s.id,
                  status: 'available',
                  price: Number((s.defaultPrice * 1.15).toFixed(2)),
                  type: 'one-time'
                });
                parsed.numbers.push({
                  id: `num_${maxNumId++}`,
                  phone: `+${ccCode}${randomBase + 215}`,
                  countryId: c.id,
                  provider: providersKeys[Math.floor(Math.random() * providersKeys.length)],
                  serviceId: s.id,
                  status: 'available',
                  price: Number((s.defaultPrice * 4.5).toFixed(2)),
                  type: 'long-term'
                });
              }
            });
          });
        }
        dbCache = parsed;
        return dbCache!;
      }
    }
  } catch (err) {
    console.warn("Loading db failed, fallback to defaults.", err);
  }

  dbCache = defaultState();
  saveDB();
  return dbCache;
}

export function saveDB() {
  if (!dbCache) return;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to write state:", err);
  }
}
