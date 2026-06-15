export interface User {
  id: string;
  email: string;
  role: 'Guest' | 'Customer' | 'Reseller' | 'Admin' | 'Support';
  balance: number; // in USD
  kycStatus: 'Unverified' | 'Pending' | 'Verified';
  createdAt: string;
  twoFactorEnabled: boolean;
  password?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  status?: 'Active' | 'Suspended' | 'Banned';
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
  lockedBalance: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'purchase' | 'refund' | 'payout';
  status: 'Completed' | 'Pending' | 'Failed';
  gateway: 'Stripe' | 'PayPal' | 'Crypto' | 'Mobile Money' | 'Admin';
  reference: string;
  createdAt: string;
}

export interface Country {
  id: string;
  name: string;
  code: string; // e.g. "US", "GB", "EE"
  flag: string; // flag emoji or dynamic flag character
}

export interface Service {
  id: string;
  name: string;
  logo: string; // name of representative lucide icon or generic string
  defaultPrice: number;
}

export interface VirtualNumber {
  id: string;
  phone: string;
  countryId: string;
  provider: '5Sim' | 'SMS-Activate' | 'Plivo' | 'Twilio';
  serviceId: string;
  status: 'available' | 'rented' | 'expired';
  rentedBy?: string;
  expiresAt?: string;
  price: number;
  type: 'one-time' | 'long-term';
}

export interface Order {
  id: string;
  userId: string;
  numberId: string;
  phone: string;
  countryName: string;
  countryCode: string;
  serviceId: string;
  serviceName: string;
  price: number;
  status: 'Active' | 'Completed' | 'Refunded' | 'Expired';
  otpReceived: boolean;
  rentalDuration?: string; // e.g. "15 minutes" or "7 Days"
  createdAt: string;
  expiresAt: string;
}

export interface SMSMessage {
  id: string;
  orderId: string;
  numberId: string;
  sender: string;
  content: string;
  otpCode: string;
  receivedAt: string;
}

export interface Provider {
  id: string;
  name: string;
  apiKey: string;
  balance: number;
  priority: number;
  active: boolean;
}

export interface Pricing {
  id: string;
  countryId: string;
  serviceId: string;
  providerId: string;
  cost: number;
  markupPercent: number; // e.g., 20 for 20%
}

export interface ApiKey {
  id: string;
  userId: string;
  key: string;
  secret: string;
  rateLimit: number; // requests per minute
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  status: 'Open' | 'Pending' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
  messages: Array<{
    id: string;
    sender: 'user' | 'support';
    text: string;
    createdAt: string;
  }>;
}
