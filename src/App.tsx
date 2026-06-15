import { useState, useEffect, FormEvent } from 'react';
import { 
  Phone, MessageSquare, Globe, Shield, Wallet, Terminal, Sliders, 
  LifeBuoy, Users, Check, Copy, LogOut, ArrowRight, Lock, 
  RefreshCw, Send, Flame, Car, Video, Cpu, Mail, HelpCircle, 
  User, Activity, AlertCircle, Sparkles, Star, DollarSign, 
  Key, Layers, ChevronRight, Plus, ChevronDown
} from 'lucide-react';
import { User as UserType, Country, Service, Order, SMSMessage, Transaction, Ticket, ApiKey } from './types';
import ServiceCategorySelector from './components/ServiceCategorySelector';

export default function App() {
  // State variables
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<string>('shop'); // shop (Marketplace), prices (Services), reseller (API), support, active, wallet, admin
  const [countries, setCountries] = useState<Country[]>([]);
  const [services, setServices] = useState<(Service & { price: number; successRate: number; availableCount: number })[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [smsMessages, setSmsMessages] = useState<SMSMessage[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [globalMarkup, setGlobalMarkup] = useState<number>(20);
  const [pricingMode, setPricingMode] = useState<'percent' | 'fixed_margin'>('fixed_margin');
  const [fixedProfitAmt, setFixedProfitAmt] = useState<number>(2.00);
  const [providers, setProviders] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);

  // Selection states (for filtering country/service in mockup)
  const [filterCountry, setFilterCountry] = useState<string>('All');
  const [filterService, setFilterService] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All Numbers'); // All Numbers, VoIP, Mobile
  const [filterPeriod, setFilterPeriod] = useState<string>('ANY'); // ANY, 15 MIN, 1 DAY

  // Inputs
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRole, setAuthRole] = useState<'Customer' | 'Reseller' | 'Admin' | 'Support'>('Customer');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Extended authentication states
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [securityQuestion, setSecurityQuestion] = useState('What is your secret code?');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotQuestion, setForgotQuestion] = useState('');
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  // Administrative user creation & inline control form states
  const [adminCreateEmail, setAdminCreateEmail] = useState('');
  const [adminCreatePassword, setAdminCreatePassword] = useState('');
  const [adminCreateRole, setAdminCreateRole] = useState<'Customer' | 'Reseller' | 'Admin' | 'Support'>('Customer');
  const [adminCreateBalance, setAdminCreateBalance] = useState('10.00');
  const [adminCreateQuestion, setAdminCreateQuestion] = useState('What is your favorite color?');
  const [adminCreateAnswer, setAdminCreateAnswer] = useState('gold');
  const [adminCreateError, setAdminCreateError] = useState('');
  const [adminCreateSuccess, setAdminCreateSuccess] = useState('');
  const [adminResetPasswords, setAdminResetPasswords] = useState<Record<string, string>>({});

  const [topupAmount, setTopupAmount] = useState('15.00');
  const [topupGateway, setTopupGateway] = useState<'Stripe' | 'PayPal' | 'Crypto' | 'Mobile Money'>('Stripe');
  const [topupSuccess, setTopupSuccess] = useState('');

  // Buy Number states
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [rentalType, setRentalType] = useState<'one-time' | 'long-term'>('one-time');
  const [longTermDays, setLongTermDays] = useState('7');
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState('');

  // Ticket create states
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [ticketMessage, setTicketMessage] = useState('');
  const [replyText, setReplyText] = useState('');

  // Admin simulation states
  const [customSmsContent, setCustomSmsContent] = useState('Your 6-digit WhatsApp activation code is 442901');
  const [customSmsSender, setCustomSmsSender] = useState('WhatsApp');
  const [customSmsOtp, setCustomSmsOtp] = useState('442901');
  const [targetOrderIdForSms, setTargetOrderIdForSms] = useState('');
  
  // Edit user balance
  const [selectedUserIdForBalance, setSelectedUserIdForBalance] = useState('');
  const [newUserBalance, setNewUserBalance] = useState('');

  // Feedback states
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshingSms, setRefreshingSms] = useState(false);

  // Comparison with Virtunum states
  const [savingsQty, setSavingsQty] = useState<number>(25);
  const [savingsService, setSavingsService] = useState<'WhatsApp' | 'Telegram' | 'Google' | 'ChatGPT'>('WhatsApp');

  // Interactive Live SMS demonstration ticker for hero
  const [liveSmsSampleIndex, setLiveSmsSampleIndex] = useState(0);
  const [heroTimerValue, setHeroTimerValue] = useState('48291');

  // Auto-fill active default user for immediate preview testing
  useEffect(() => {
    handleDefaultLogin('customer@speshplus.com');
    loadBrowseData();
  }, []);

  // Fetch contextual user data whenever active user patterns or tab selections update
  useEffect(() => {
    if (currentUser) {
      loadUserOrders();
      loadTransactions();
      loadApiKeys();
      loadTickets();
      if (currentUser.role === 'Admin' || currentUser.role === 'Support') {
        loadAdminOverview();
      }
    }
  }, [currentUser, activeTab]);

  // Handle auto polling of OTP SMS message logs for active selected rentals
  useEffect(() => {
    let intervalId: any;
    if (selectedOrder && selectedOrder.status === 'Active') {
      loadSMSForOrder(selectedOrder.id);
      intervalId = setInterval(() => {
        loadSMSForOrder(selectedOrder.id);
        loadUserOrders(); 
      }, 4000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedOrder]);

  // Hero interactive state triggers
  useEffect(() => {
    const sTimeout = setInterval(() => {
      setLiveSmsSampleIndex(prev => (prev + 1) % 3);
      const codes = ['48291', '77192', '39281'];
      setHeroTimerValue(codes[Math.floor(Math.random() * codes.length)]);
    }, 6000);
    return () => clearInterval(sTimeout);
  }, []);

  const loadBrowseData = async () => {
    try {
      const res = await fetch('/api/numbers/browse');
      const data = await res.json();
      setCountries(data.countries || []);
      setServices(data.services || []);
      setGlobalMarkup(data.markupPercent || 20);
      setPricingMode(data.pricingMode || 'fixed_margin');
      setFixedProfitAmt(data.fixedProfitAmt !== undefined ? data.fixedProfitAmt : 2.00);
      if (data.countries?.length > 0) setSelectedCountryId(data.countries[0].id);
      if (data.services?.length > 0) setSelectedServiceId(data.services[0].id);
    } catch (err) {
      console.error('Failed to load browse specs:', err);
    }
  };

  const loadUserOrders = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/orders?userId=${currentUser.id}`);
      const data = await res.json();
      setOrders(data);
      if (selectedOrder) {
        const matching = data.find((o: Order) => o.id === selectedOrder.id);
        if (matching) setSelectedOrder(matching);
      }
    } catch (e) {
      console.warn("Orders fetch failed", e);
    }
  };

  const loadTransactions = async () => {
    if (!currentUser) return;
    try {
      const userRes = await fetch('/api/admin/users');
      if (userRes.ok) {
        const uList = await userRes.json();
        const me = uList.find((u: any) => u.id === currentUser.id);
        if (me) {
          setCurrentUser(prev => prev ? { ...prev, balance: me.balance } : null);
        }
      }
    } catch (e) {}
  };

  const loadApiKeys = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/apikeys?userId=${currentUser.id}`);
      const data = await res.json();
      setApiKeys(data);
    } catch (e) {}
  };

  const loadTickets = async () => {
    if (!currentUser) return;
    try {
      const isSupportStaff = currentUser.role === 'Support' || currentUser.role === 'Admin';
      const endpoint = isSupportStaff ? '/api/support/tickets' : `/api/support/tickets?userId=${currentUser.id}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setTickets(data);
      if (selectedTicket) {
        const matching = data.find((t: Ticket) => t.id === selectedTicket.id);
        if (matching) setSelectedTicket(matching);
      }
    } catch (e) {}
  };

  const loadAdminOverview = async () => {
    try {
      const optRes = await fetch('/api/admin/overview');
      const data = await optRes.json();
      setProviders(data.providers || []);
      setGlobalMarkup(data.globalMarkup || 20);
      setPricingMode(data.pricingMode || 'fixed_margin');
      setFixedProfitAmt(data.fixedProfitAmt !== undefined ? data.fixedProfitAmt : 2.00);

      const userRes = await fetch('/api/admin/users');
      const uList = await userRes.json();
      setAllUsers(uList);
    } catch (e) {}
  };

  const loadSMSForOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/sms`);
      const data = await res.json();
      setSmsMessages(data);
    } catch (e) {}
  };

  const handleDefaultLogin = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' })
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        setAuthSuccess(`Welcome back as ${user.role}!`);
        setAuthError('');
      }
    } catch (e) {
      console.warn("Check failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: FormEvent, isRegister: boolean) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    setAuthSuccess('');

    if (!authEmail || !authPassword) {
      setAuthError('Please fill in both email and password.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const bodyPayload = isRegister ? {
        email: authEmail,
        password: authPassword,
        role: authRole,
        securityQuestion,
        securityAnswer
      } : {
        email: authEmail,
        password: authPassword
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Identity verification failed');
      } else {
        setCurrentUser(data);
        setAuthSuccess(isRegister ? 'Account created successfully!' : 'Successfully signed in!');
        setAuthEmail('');
        setAuthPassword('');
        setSecurityAnswer('');
        setAuthMode('login');
        setActiveTab('shop');
      }
    } catch (err) {
      setAuthError('Server communication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordCheck = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    setAuthSuccess('');

    if (!authEmail) {
      setAuthError('Please enter your email to recover your account.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail })
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Identity check failed.');
      } else {
        setForgotQuestion(data.securityQuestion);
        setForgotStep(2);
      }
    } catch (err) {
      setAuthError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    setAuthSuccess('');

    if (!forgotAnswer || !forgotNewPassword) {
      setAuthError('Please fill in both the security answer and your new password.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          securityAnswer: forgotAnswer,
          newPassword: forgotNewPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Reset verification failed.');
      } else {
        setAuthSuccess('Password reset successfully! Please sign in with your new credentials.');
        setAuthPassword('');
        setForgotAnswer('');
        setForgotNewPassword('');
        setForgotStep(1);
        setAuthMode('login');
      }
    } catch (err) {
      setAuthError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleSwitch = async (role: 'Customer' | 'Reseller' | 'Admin' | 'Support') => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/auth/update-role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, role })
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        setActiveTab('shop');
      }
    } catch (e) {}
  };

  const handleTopup = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    setTopupSuccess('');

    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          amount: topupAmount,
          gateway: topupGateway
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentUser(prev => prev ? { ...prev, balance: data.balance } : null);
        setTopupSuccess(`Successfully deposited $${topupAmount} via ${topupGateway}!`);
        setTopupAmount('15.00');
        loadTransactions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Direct trigger used by Marketplace grid cards
  const handleRentSpecificNumber = async (countryId: string, serviceId: string) => {
    if (!currentUser) {
      setActiveTab('auth');
      return;
    }
    setLoading(true);
    setPurchaseError('');
    setPurchaseSuccess('');

    try {
      const res = await fetch('/api/numbers/rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          countryId: countryId,
          serviceId: serviceId,
          type: 'one-time'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setPurchaseError(data.error || 'Failed to purchase number');
      } else {
        setPurchaseSuccess('Virtual number rented successfully! Access your inbox below.');
        setCurrentUser(prev => prev ? { ...prev, balance: data.updatedBalance } : null);
        loadUserOrders();
        setActiveTab('active');
        setSelectedOrder(data.order);
      }
    } catch (err) {
      setPurchaseError('Server request timeout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRentNumber = async () => {
    if (!selectedCountryId || !selectedServiceId) return;
    await handleRentSpecificNumber(selectedCountryId, selectedServiceId);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(prev => prev ? { ...prev, balance: data.balance } : null);
        loadUserOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(data.order);
        }
      } else {
        alert(data.error || 'Failed to cancel');
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (res.ok) loadApiKeys();
    } catch (e) {}
  };

  const handleRevokeApiKey = async (id: string) => {
    try {
      const res = await fetch(`/api/apikeys/${id}`, { method: 'DELETE' });
      if (res.ok) loadApiKeys();
    } catch (e) {}
  };

  const handleCreateTicket = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!ticketSubject || !ticketMessage) return;

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          subject: ticketSubject,
          priority: ticketPriority,
          message: ticketMessage
        })
      });

      if (res.ok) {
        setTicketSubject('');
        setTicketMessage('');
        loadTickets();
      }
    } catch (e) {}
  };

  const handlePostTicketReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedTicket || !replyText) return;

    try {
      const senderType = (currentUser.role === 'Admin' || currentUser.role === 'Support') ? 'support' : 'user';
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: senderType,
          text: replyText
        })
      });

      if (res.ok) {
        setReplyText('');
        setTimeout(() => {
          loadTickets();
        }, 1500);
        const nextState = await res.json();
        setSelectedTicket(nextState);
      }
    } catch (e) {}
  };

  // ADMIN ACTION: Adjust user balance
  const handleAdminUpdateBalance = async () => {
    if (!selectedUserIdForBalance || !newUserBalance) return;
    try {
      const res = await fetch('/api/admin/users/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserIdForBalance,
          newBalance: newUserBalance
        })
      });
      if (res.ok) {
        setNewUserBalance('');
        loadAdminOverview();
      }
    } catch (e) {}
  };

  // ADMIN ACTION: Change markup
  const handleAdminMarkupChange = async (markupVal: number) => {
    try {
      const res = await fetch('/api/admin/inventory/markup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markupPercent: markupVal })
      });
      if (res.ok) {
        setGlobalMarkup(markupVal);
        loadBrowseData();
      }
    } catch (e) {}
  };

  // ADMIN ACTION: Change pricing mode & fixed profit margin
  const handleAdminPricingConfigChange = async (mode: 'percent' | 'fixed_margin', fixedProfit: number) => {
    try {
      const res = await fetch('/api/admin/inventory/pricing-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricingMode: mode, fixedProfitAmt: fixedProfit })
      });
      if (res.ok) {
        const data = await res.json();
        setPricingMode(data.pricingMode);
        setFixedProfitAmt(data.fixedProfitAmt);
        loadBrowseData();
      }
    } catch (e) {}
  };

  // ADMIN ACTION: Toggle provider
  const handleAdminToggleProvider = async (providerId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/inventory/provider-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, active: !currentStatus })
      });
      if (res.ok) {
        loadAdminOverview();
      }
    } catch (e) {}
  };

  // ADMIN ACTION: Create User Accounts
  const handleAdminCreateUser = async (userPayload: any) => {
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload)
      });
      const data = await res.json();
      if (res.ok) {
        loadAdminOverview();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to create user' };
      }
    } catch (e) {
      return { success: false, error: 'Database network error' };
    }
  };

  // ADMIN ACTION: Update User Role
  const handleAdminUpdateUserRole = async (userId: string, role: string) => {
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role })
      });
      if (res.ok) {
        loadAdminOverview();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update role');
      }
    } catch (e) {}
  };

  // ADMIN ACTION: Change User Account status (Active, Suspended, Banned)
  const handleAdminUpdateUserStatus = async (userId: string, status: 'Active' | 'Suspended' | 'Banned') => {
    try {
      const res = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status })
      });
      if (res.ok) {
        loadAdminOverview();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (e) {}
  };

  // ADMIN ACTION: Overriding Reset Password
  const handleAdminResetUserPassword = async (userId: string, newPassword: string) => {
    if (!newPassword) return;
    try {
      const res = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Password overridden successfully!');
        loadAdminOverview();
      } else {
        alert(data.error || 'Failed to reset password');
      }
    } catch (e) {}
  };

  // ADMIN ACTION: Delete User from registry
  const handleAdminDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user? This action is permanent.')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadAdminOverview();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (e) {}
  };

  // ADMIN ACTION: Manual SMS Simulation delivery
  const handleAdminSmsSimulate = async () => {
    if (!targetOrderIdForSms) return;
    try {
      const res = await fetch('/api/admin/sms/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: targetOrderIdForSms,
          sender: customSmsSender,
          content: customSmsContent,
          otpCode: customSmsOtp
        })
      });

      if (res.ok) {
        alert("Manual verification code dispatched! Active order updated.");
        loadUserOrders();
        if (selectedOrder?.id === targetOrderIdForSms) {
          loadSMSForOrder(targetOrderIdForSms);
        }
      }
    } catch (e) {}
  };

  const handleCopyClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  // Helper formatting 
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Filtered lists for rendering our marketplace grid exactly as shown in screenshot #2
  // We mock a nice, structured sample grid of numbers from our dataset or mock values
  const getMockedMarketplaceCards = () => {
    // Generate a beautiful, fixed high-fidelity listing mirroring screenshot #2
    return [
      { id: 'mc-1', parentCountry: 'c1', parentService: 's1', countryCode: 'US', serviceName: 'WhatsApp', phone: '+1 415-867-5309', successRate: 98, poolCount: 408, price: 0.45, isSpecialHighlight: false },
      { id: 'mc-2', parentCountry: 'c2', parentService: 's2', countryCode: 'GB', serviceName: 'Telegram', phone: '+44 740 Telegram line', successRate: 100, poolCount: 184, price: 0.29, isSpecialHighlight: true }, // Highlighted yellow card!
      { id: 'mc-3', parentCountry: 'c5', parentService: 's5', countryCode: 'DE', serviceName: 'Instagram', phone: '+49 157 84561234', successRate: 94, poolCount: 64, price: 0.55, isSpecialHighlight: false },
      { id: 'mc-4', parentCountry: 'c7', parentService: 's3', countryCode: 'IN', serviceName: 'Google', phone: '+91 98765 43210', successRate: 89, poolCount: 521, price: 0.12, isSpecialHighlight: false },
      { id: 'mc-5', parentCountry: 'c6', parentService: 's6', countryCode: 'BR', serviceName: 'TikTok', phone: '+55 11 98765-4321', successRate: 96, poolCount: 95, price: 0.31, isSpecialHighlight: false },
      { id: 'mc-6', parentCountry: 'c8', parentService: 's1', countryCode: 'NG', serviceName: 'WhatsApp', phone: '+234 803 123 4567', successRate: 92, poolCount: 290, price: 0.18, isSpecialHighlight: false },
    ];
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0E0F12] text-slate-100 font-sans selection:bg-amber-400/20 relative">
      
      {/* GLOW DECORATIVE BLURS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[20%] right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* TOP DEEPLY CRAFTED HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-[#1A1C23] bg-[#0E0F12]/90 backdrop-blur-md px-4 py-4 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          
          {/* Brand Logo perfectly styled like Screenshot #1 */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('shop')}>
            {/* Real high-fidelity logo representing 3x3 layout inside yellow/amber container */}
            <div className="flex h-10 w-10 shrink-0 bg-[#FACC15] rounded-xl items-center justify-center shadow-lg shadow-amber-500/10 transition-transform group-hover:scale-105">
              <div className="grid grid-cols-3 gap-0.5 p-1.5 w-8 h-8">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-slate-950 rounded-sm w-1.5 h-1.5"></div>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white select-none">
                spesh<span className="text-[#FACC15] ml-0.5">+</span>
              </span>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mt-0.5">INSTANT OTP</p>
            </div>
          </div>

          {/* MAIN NAVIGATION TAB LIST - Mirroring the menu in screenshots! */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-bold text-zinc-400">
            {[
              { id: 'shop', label: 'Marketplace' },
              { id: 'prices', label: 'Services' },
              { id: 'pricing-page', label: 'Pricing', isPriceRedirect: true },
              { id: 'reseller', label: 'API' },
              { id: 'support', label: 'Support' },
            ].map(tab => {
              // Helper to check active status
              const isTabActive = tab.isPriceRedirect ? activeTab === 'prices' : activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.isPriceRedirect ? 'prices' : tab.id)}
                  className={`relative px-4 py-2 rounded-lg transition-all duration-150 select-none cursor-pointer ${
                    isTabActive 
                      ? 'text-white font-extrabold'
                      : 'hover:text-white'
                  }`}
                  id={`nav-${tab.id}`}
                >
                  {tab.label}
                  {/* Underline selected item in pure gold color like Marketplace highlight in Screenshot #2 */}
                  {isTabActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#FACC15] shadow-md shadow-yellow-500/50" />
                  )}
                </button>
              );
            })}

            {currentUser && (
              <div className="h-4 w-px bg-zinc-800 mx-2" />
            )}

            {currentUser && (
              <button
                onClick={() => setActiveTab('active')}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
                  activeTab === 'active' 
                    ? 'text-[#FACC15] bg-[#1C1E26] border border-amber-500/20' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                SMS Inbox
                {orders.filter(o => o.status === 'Active').length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </button>
            )}

            {(currentUser?.role === 'Admin' || currentUser?.role === 'Support') && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`ml-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black tracking-widest uppercase border border-amber-400/30 text-amber-400 hover:bg-amber-450/10 transition-all`}
                id="nav-admin"
              >
                ADMIN PANEL
              </button>
            )}
          </nav>

          {/* USER QUICK WALLET & PROFILE CHIPS */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                
                {/* Balance Pill matched with screenshot #1 */}
                <div 
                  className="bg-[#16181F] border border-zinc-800 rounded-full pl-3.5 pr-4 py-2 flex items-center gap-2 cursor-pointer hover:border-zinc-700 transition-all select-none"
                  onClick={() => setActiveTab('wallet')}
                  title="Deposit funds or adjust balance"
                >
                  <Wallet className="h-4 w-4 text-[#FACC15]" />
                  <span className="text-zinc-400 text-xs font-semibold">Balance:</span>
                  <span className="font-mono font-black text-xs text-white">${currentUser.balance.toFixed(2)}</span>
                </div>

                {/* Profile circular avatar matched with screenshot #1 */}
                <div 
                  onClick={() => setActiveTab('wallet')}
                  className="h-9 w-9 rounded-full bg-[#1C1D24] border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 cursor-pointer transition-all"
                  title="Check profile ledger logs"
                >
                  <User className="h-4.5 w-4.5" />
                </div>

                {/* Silent Log Out Action */}
                <button 
                  onClick={() => { setCurrentUser(null); setActiveTab('shop'); }}
                  className="p-1.5 text-zinc-500 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('auth')}
                className="flex items-center gap-1.5 bg-[#EA580C] hover:bg-orange-500 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-600/10 cursor-pointer"
              >
                Sign In
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

        </div>
      </header>

      {/* MOBILE SCROLL NAV COMPONENT */}
      <div className="md:hidden sticky top-[72px] z-30 flex items-center justify-between gap-1 bg-[#101115]/95 border-b border-zinc-900 px-3 py-2.5 overflow-x-auto shadow-sm">
        <button onClick={() => setActiveTab('shop')} className={`text-xs px-3 py-2 rounded-lg font-bold shrink-0 ${activeTab === 'shop' ? 'bg-[#FACC15] text-[#0A0B0E]' : 'text-zinc-405 text-zinc-400'}`}>Marketplace</button>
        <button onClick={() => setActiveTab('prices')} className={`text-xs px-3 py-2 rounded-lg font-bold shrink-0 ${activeTab === 'prices' ? 'bg-[#FACC15] text-[#0A0B0E]' : 'text-zinc-400'}`}>Services</button>
        <button onClick={() => setActiveTab('active')} className={`text-xs px-3 py-2 rounded-lg font-bold shrink-0 ${activeTab === 'active' ? 'bg-[#FACC15] text-[#0A0B0E]' : 'text-zinc-400'}`}>Inbox</button>
        <button onClick={() => setActiveTab('wallet')} className={`text-xs px-3 py-2 rounded-lg font-bold shrink-0 ${activeTab === 'wallet' ? 'bg-[#FACC15] text-[#0A0B0E]' : 'text-zinc-400'}`}>Wallet</button>
        <button onClick={() => setActiveTab('support')} className={`text-xs px-3 py-2 rounded-lg font-bold shrink-0 ${activeTab === 'support' ? 'bg-[#FACC15] text-[#0A0B0E]' : 'text-zinc-400'}`}>Support</button>
      </div>

      {/* HERO BANNER SECTION (Shown exclusively on shop/marketplace header to introduce product specs) */}
      {activeTab === 'shop' && (
        <section className="relative px-4 pt-12 pb-8 text-left overflow-hidden z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* HERO LEFT: TEXT SPECS CONTAINER */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Green online counter badge exactly as shown in screenshot #1 */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-950 bg-emerald-950/20 text-[#10B981] px-4 py-1.5 text-xs font-bold shadow-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                12,459 numbers online right now
              </div>

              {/* Majestic Headline Typography */}
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.05]">
                INSTANT VIRTUAL NUMBERS FOR <br />
                EVERY VERIFICATION
              </h1>

              {/* Sub descriptor */}
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
                Rent phone numbers from 200+ countries. Receive SMS instantly. Perfect for WhatsApp, Telegram, Google, Instagram, Tinder, and OpenAI. Non-VoIP SIM carrier paths with sandbox zero-cost autoshield refund guarantee.
              </p>

              {/* Fast links / buttons */}
              <div className="flex flex-wrap gap-3.5">
                <button
                  onClick={() => {
                    const scrollDest = document.getElementById('marketplace-search-grid');
                    if (scrollDest) scrollDest.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#1E2026] hover:bg-[#2A2C35] text-white border border-zinc-800 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
                >
                  Browse Catalog
                </button>
                <button
                  onClick={() => setActiveTab('prices')}
                  className="text-zinc-400 hover:text-white bg-transparent px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Pricing Comparison
                </button>
              </div>

            </div>

            {/* HERO RIGHT: THE MAGNIFICENT MOCK DASHBOARD DEVICE (Screenshot #1 Visual) */}
            <div className="lg:col-span-5">
              <div className="bg-[#111215] border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                {/* Simulated Window Circles */}
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#EF4444] opacity-80" />
                    <span className="h-3 w-3 rounded-full bg-[#F59E0B] opacity-80" />
                    <span className="h-3 w-3 rounded-full bg-[#10B981] opacity-80" />
                  </div>
                  
                  {/* Phone text on upper right has carrier index */}
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#FACC15] font-semibold tracking-wide">+1 (415) 555-0192</span>
                    <span className="bg-emerald-950/40 border border-[#10B981]/30 rounded-full px-2.5 py-0.5 text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      LIVE
                    </span>
                  </div>
                </div>

                {/* Service Indicator Tab */}
                <div className="mb-4 inline-flex items-center gap-2 bg-[#1C1E26] border border-[#2E313D] rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  WhatsApp +44 • ready
                </div>

                {/* Simulated sms notifications list */}
                <div className="space-y-2.5">
                  {[
                    { code: '771920', text: 'Your Tinder code is 771920' },
                    { code: '482913', text: 'Your WhatsApp code is 482913' },
                    { code: '392817', text: 'G-392817 is your Google verification code' }
                  ].map((msg, i) => {
                    const isFocus = liveSmsSampleIndex === i;
                    return (
                      <div 
                        key={i} 
                        className={`p-3.5 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                          isFocus 
                            ? 'bg-[#181A20] border-zinc-750 border-zinc-700' 
                            : 'bg-[#14151B]/40 border-zinc-900 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3 font-mono text-[11px]">
                          <span className="text-[#10B981] font-bold text-xs">{msg.code}</span>
                          <span className="text-zinc-300 font-medium">{msg.text}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Outstanding OTP yellow badge in lower right corner exactly like image #1 */}
                <div className="absolute bottom-4 right-4 bg-[#FACC15] text-[#0A0B0E] p-4.5 rounded-2xl shadow-xl flex flex-col justify-center items-center pointer-events-none transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <span className="text-[10px] font-black uppercase tracking-wider pl-1 font-sans text-zinc-800 flex items-center gap-1">
                    <span className="text-xs">⚡</span> OTP
                  </span>
                  <p className="text-2xl font-black font-mono tracking-widest mt-1 leading-none">{heroTimerValue}</p>
                </div>

              </div>
            </div>

          </div>
        </section>
      )}

      {/* CORE ROUTING CONTENT GRID SECTION */}
      <main className="flex-1 flex flex-col justify-start relative z-10">

        {/* TAB 1: LANDING/MARKETPLACE SHOP (Screenshot #2 Visual Representation) */}
        {activeTab === 'shop' && (
          <div className="mx-auto max-w-7xl px-4 py-8 w-full" id="marketplace-search-grid">
            
            {/* FIND YOUR NUMBER HEADER WITH SCANDINAVIAN FILTER BLOCK */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Find your number</h2>
                <p className="text-zinc-500 text-xs font-semibold mt-1">Review live rates, select country routing, and start instant verifications.</p>
              </div>

              {/* Upper right tab filter segment shown in screenshot 2 */}
              <div className="flex bg-[#121317] border border-zinc-800 p-1 rounded-xl gap-1.5 self-start md:self-auto font-mono">
                {['All numbers', 'VoIP', 'Mobile'].map((typeOption) => (
                  <button
                    key={typeOption}
                    onClick={() => setFilterType(typeOption)}
                    className={`text-xs px-4 py-2 rounded-lg font-bold transition-all cursor-pointer select-none ${
                      filterType === typeOption
                        ? 'bg-[#1C1E26] text-white shadow-sm font-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {typeOption}
                  </button>
                ))}
              </div>
            </div>

            {/* FILTERS BAR Row perfectly matching Screenshot #2 */}
            <div className="bg-[#121317]/80 backdrop-blur border border-zinc-800/80 rounded-2xl p-4 mb-8 grid md:grid-cols-12 gap-3 items-center">
              
              {/* Country select search box */}
              <div className="md:col-span-4 relative">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5">Country Router</label>
                <div className="relative">
                  <select
                    value={selectedCountryId}
                    onChange={(e) => {
                      setSelectedCountryId(e.target.value);
                      const matchingCountry = countries.find(c => c.id === e.target.value);
                      if (matchingCountry) setFilterCountry(matchingCountry.name);
                    }}
                    className="w-full bg-[#1C1D24] border border-zinc-850 border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white font-mono focus:outline-none focus:border-amber-400/50 appearance-none cursor-pointer pr-10"
                  >
                    <option value="All">All countries ({countries.length > 0 ? countries.length : '214'})</option>
                    {countries.map(c => (
                      <option key={c.id} value={c.id}>{c.flag} {c.name} (+{c.code === 'US' ? '1' : c.code === 'GB' ? '44' : c.code === 'EE' ? '372' : c.code === 'UA' ? '380' : c.code === 'DE' ? '49' : '91'})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Service selection filter box */}
              <div className="md:col-span-4 relative">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5">App Verification Service</label>
                <div className="relative">
                  <select
                    value={selectedServiceId}
                    onChange={(e) => {
                      setSelectedServiceId(e.target.value);
                      const matchingSvc = services.find(s => s.id === e.target.value);
                      if (matchingSvc) setFilterService(matchingSvc.name);
                    }}
                    className="w-full bg-[#1C1D24] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400/50 appearance-none cursor-pointer pr-10"
                  >
                    <option value="All">All services ({services.length})</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (price: ${s.price.toFixed(2)})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* ANY, 15 MIN, 1 DAY filter segments shown in Screenshot #2 */}
              <div className="md:col-span-3">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5">Billing Lease Duration</label>
                <div className="flex bg-[#1C1D24] border border-zinc-800 rounded-xl p-1 gap-1">
                  {['ANY', '15 MIN', '1 DAY'].map((pOption) => (
                    <button
                      key={pOption}
                      onClick={() => {
                        setFilterPeriod(pOption);
                        if (pOption === '15 MIN') setRentalType('one-time');
                        if (pOption === '1 DAY') {
                          setRentalType('long-term');
                          setLongTermDays('3');
                        }
                      }}
                      className={`flex-1 text-[10px] font-extrabold py-2 rounded-lg transition-all cursor-pointer ${
                        filterPeriod === pOption 
                          ? 'bg-[#121317] text-[#FACC15]' 
                          : 'text-zinc-400 hover:text-zinc-250 hover:text-slate-200'
                      }`}
                    >
                      {pOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Refresh trigger icon circular button */}
              <div className="md:col-span-1 flex justify-center pt-5 md:pt-0">
                <button
                  onClick={() => {
                    loadBrowseData();
                    alert("Sync completed! Checking real-time provider stock parameters.");
                  }}
                  title="Force status refresh"
                  className="h-10 w-10 shrink-0 bg-[#1C1D24] hover:bg-[#252731] border border-zinc-805 border-zinc-800 rounded-xl flex items-center justify-center text-zinc-355 text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

            </div>

            {/* Error notifications block */}
            {purchaseError && (
              <div className="mb-6 bg-red-950/20 border border-red-900/50 p-4 rounded-xl text-xs flex gap-2 text-red-400 items-center font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{purchaseError}</span>
              </div>
            )}

            {/* VIRTUNUM CATEGORIZED WORKBENCH */}
            <div className="mb-12">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#FACC15] bg-amber-500/10 px-3 py-1.5 rounded-full select-none">
                ⚙️ CARRIER SUITE PROVISION PANEL
              </span>
              <h3 className="text-xl font-bold text-white mt-3.5 mb-1.5">Configure & Provision Rented Lines</h3>
              <p className="text-zinc-500 text-xs font-semibold mb-6">Explore different virtual numbers for all verification apps safely using our live trunk feeds.</p>

              <ServiceCategorySelector
                services={services}
                selectedCountryId={selectedCountryId}
                countries={countries}
                onRentService={handleRentSpecificNumber}
                loading={loading}
              />
            </div>

            {/* VIRTUAL NUMBER CARDS LIST GRID (Screenshot #2 Presentation) */}
            <div className="mb-4">
              <span className="text-[10px] uppercase font-type font-black tracking-widest text-zinc-550 text-zinc-500">🔥 TRUNK PROVISION HIGHLIGHTS</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {getMockedMarketplaceCards().map((card) => {
                // If filters match, show them; we provide options to keep them visible for immediate screen likeness
                const isSelected = card.isSpecialHighlight; 
                return (
                  <div 
                    key={card.id} 
                    className={`bg-[#121317] rounded-[24px] p-6 text-left flex flex-col justify-between min-h-[190px] transition-all duration-300 relative group border ${
                      isSelected 
                        ? 'border-[#FACC15]/85 shadow-lg shadow-yellow-500/5 ring-1 ring-[#FACC15]/25' 
                        : 'border-[#1C1F26] hover:border-zinc-700 hover:scale-[1.01]'
                    }`}
                  >
                    
                    {/* Upper row: Country code & Pricing display in beautiful gold text exactly like Screenshot #2 */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-3xl font-black tracking-tight text-white">{card.countryCode}</span>
                        <div className="text-[10px] font-bold text-zinc-500 mt-0.5 tracking-wider uppercase">
                          {card.serviceName === 'WhatsApp' ? 'US Phone Service' : card.serviceName + ' Routing'}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-3xl font-black text-[#FACC15] block">${card.price.toFixed(2)}</span>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block transform translate-y-[-2px]">
                          one-time
                        </span>
                      </div>
                    </div>

                    {/* Middle section: Cellular number monospace string exactly like Screenshot #2 */}
                    <div className="my-4 font-mono font-bold text-sm text-zinc-350 bg-[#171921]/60 px-3 py-2 rounded-lg border border-zinc-900/55 text-zinc-300">
                      {card.phone}
                    </div>

                    {/* Bottom stats row & direct Rent action */}
                    <div className="flex items-center justify-between border-t border-zinc-900/60 pt-4 mt-1">
                      
                      {/* RENT NOW Button */}
                      <button
                        onClick={() => handleRentSpecificNumber(card.parentCountry, card.parentService)}
                        disabled={loading}
                        className="bg-[#1E2026] hover:bg-[#2A2C35] hover:text-[#FACC15] text-white border border-[#2E313D] text-[10px] font-black uppercase tracking-wider px-4.5 py-2.5 rounded-xl transition-all duration-200 select-none cursor-pointer"
                      >
                        RENT NOW
                      </button>

                      {/* Success rate & Pool stock count */}
                      <div className="text-right text-[10px] font-bold text-zinc-500 flex items-center gap-2 font-mono">
                        <span className="text-emerald-400 font-extrabold">{card.successRate}%</span>
                        <span className="h-3 w-px bg-zinc-800" />
                        <span>{card.poolCount} items</span>
                      </div>

                    </div>

                    {/* Selected Golden Halo Badge overlay */}
                    {isSelected && (
                      <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-[#FACC15] shadow-xs" />
                    )}

                  </div>
                );
              })}
            </div>

            {/* THREE STEPS TUTORIAL WRAPPER COMPACT */}
            <div className="bg-[#121317]/50 border border-zinc-900 rounded-3xl p-6 md:p-8 mb-12">
              <h3 className="text-lg font-bold text-white mb-6 text-center">Fast Verification Tutorial</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { step: '1', title: 'Pick Application service', desc: 'Choose country and target verification application (WhatsApp, Google, etc.).' },
                  { step: '2', title: 'Copy leased cellular SIM', desc: 'System pools dynamic carrier trunks and allocates virtual line on demand.' },
                  { step: '3', title: 'Retrieve instant SMS code', desc: 'Codes are routed securely to Active Inbox within seconds. Autoshield active.' },
                ].map((stepItem, index) => (
                  <div key={index} className="bg-[#161720]/80 p-5 rounded-2xl border border-zinc-850 relative">
                    <span className="absolute -top-3.5 left-5 flex h-7 w-7 items-center justify-center rounded-lg bg-[#FACC15] text-[#0A0B0E] font-black text-xs shadow-md shadow-yellow-500/10">{stepItem.step}</span>
                    <h4 className="text-sm font-bold text-slate-200 mt-2 mb-1 pl-1">{stepItem.title}</h4>
                    <p className="text-zinc-400 text-xs leading-relaxed pl-1 font-semibold">{stepItem.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK VERIFICATION SEALS BANNER */}
            <div className="text-center text-zinc-500">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#FACC15]/60">CARRIERS AUTOMATED SYNC STATUS</span>
              <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs font-semibold">
                {['WhatsApp Business', 'Telegram Messenger Lite', 'Google Authenticator', 'Tinder Select', 'Instagram Creators', 'ChatGPT OpenAI Pro', 'Uber Technologies'].map(item => (
                  <span key={item} className="bg-[#14151B] text-zinc-400 px-3.5 py-1.5 rounded-lg border border-zinc-900">{item}</span>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ADVANTAGE RATES & STOCK SERVICES LISTING */}
        {activeTab === 'prices' && (
          <div className="mx-auto max-w-5xl px-4 py-12 w-full">
            <div className="mb-8 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FACC15] bg-amber-500/10 px-3 py-1 rounded-full">
                Real-Time Provider Inventory Pools
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white mt-3 select-none">Services Rate & Carrier Stock</h2>
              <p className="text-zinc-405 text-zinc-400 text-xs font-semibold mt-1">Rates are adjusted live. Markup is calculated dynamically at +{globalMarkup}% pool margin.</p>
            </div>

            <div className="bg-[#121317] rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-zinc-850 bg-[#161820]/50 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs font-bold text-zinc-405 text-zinc-400">
                <span>Synchronizing cellular API triggers</span>
                <span className="text-[#10B981] flex items-center gap-1.5 font-mono">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Auto-updated 5s ago
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-zinc-850 text-zinc-500 font-bold uppercase tracking-wider text-[11px] bg-[#14161D]">
                      <th className="p-4">App Service Name</th>
                      <th className="p-4">Delivery rate</th>
                      <th className="p-4 text-center">Available Stock</th>
                      <th className="p-4 text-right">Virtunum Avg Rate</th>
                      <th className="p-4 text-right text-[#FACC15]">Spesh+ Rate</th>
                      <th className="p-4 text-center">Your discount</th>
                      <th className="p-4 text-center">Trigger action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-300 font-semibold font-sans">
                    {services.map((svc) => {
                      const virtunumPrice = svc.name === 'WhatsApp' ? 2.50 : svc.name === 'Telegram' ? 3.00 : svc.name === 'Google / Gmail' ? 1.80 : Number((svc.price * 3.5).toFixed(2));
                      const savingsPct = Math.round((1 - (svc.price / virtunumPrice)) * 100);
                      return (
                        <tr key={svc.id} className="hover:bg-[#161720]/40 transition-colors">
                          <td className="p-4 font-extrabold text-white">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-[#181921] flex items-center justify-center text-[#FACC15] border border-zinc-800">
                                {svc.logo === 'MessageSquare' ? <MessageSquare className="h-4 w-4" /> :
                                 svc.logo === 'Send' ? <Send className="h-4 w-4" /> :
                                 svc.logo === 'Users' ? <Users className="h-4 w-4" /> :
                                 svc.logo === 'Phone' ? <Phone className="h-4 w-4" /> :
                                 svc.logo === 'Terminal' ? <Terminal className="h-4 w-4" /> :
                                 svc.logo === 'Mail' ? <Mail className="h-4 w-4" /> :
                                 svc.logo === 'Cpu' ? <Cpu className="h-4 w-4" /> :
                                 svc.logo === 'Sparkles' ? <Sparkles className="h-4 w-4" /> :
                                 svc.logo === 'Flame' ? <Flame className="h-4 w-4" /> :
                                 svc.logo === 'Car' ? <Car className="h-4 w-4" /> :
                                 svc.logo === 'Video' ? <Video className="h-4 w-4" /> :
                                 svc.logo === 'DollarSign' ? <DollarSign className="h-4 w-4" /> :
                                 svc.logo === 'Wallet' ? <Wallet className="h-4 w-4" /> :
                                 svc.logo === 'Activity' ? <Activity className="h-4 w-4" /> :
                                 svc.logo === 'Globe' ? <Globe className="h-4 w-4" /> :
                                 <Layers className="h-4 w-4" />
                                }
                              </div>
                              {svc.name}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-emerald-400 font-mono font-bold">98% Success</span>
                          </td>
                          <td className="p-4 text-center text-zinc-400 font-mono font-medium">
                            {svc.id === 's1' ? '408 active SIM' : svc.id === 's2' ? '184 active SIM' : '150 lines'}
                          </td>
                          <td className="p-4 text-right font-mono text-zinc-500 line-through">
                            ${virtunumPrice.toFixed(2)}
                          </td>
                          <td className="p-4 text-right font-mono font-extrabold text-[#FACC15] text-base">
                            ${svc.price.toFixed(2)}
                          </td>
                          <td className="p-4 text-center">
                            <span className="bg-[#10B981]/10 text-emerald-400 border border-emerald-900/30 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                              {savingsPct}% Cheaper
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => {
                                setSelectedServiceId(svc.id);
                                setActiveTab('shop');
                              }}
                              className="bg-[#1E2026] hover:bg-[#2A2C35] text-white border border-zinc-800 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              Rent Line
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUTHENTICATION PORTAL */}
        {activeTab === 'auth' && (
          <div className="mx-auto max-w-md px-4 py-16 w-full flex-grow flex flex-col justify-center">
            <div className="bg-[#121317] border border-zinc-800 p-8 rounded-3xl shadow-xl flex flex-col">
              
              {/* Header section with toggle titles */}
              <div className="text-center mb-6">
                <span className="text-[10px] uppercase font-black text-[#FACC15] bg-amber-500/15 px-3 py-1 rounded-full">
                  Secure Identity Hub
                </span>
                <h3 className="text-xl font-bold text-white mt-3 select-none">
                  {authMode === 'login' && 'Spesh+ Account Access'}
                  {authMode === 'signup' && 'Create Carrier Account'}
                  {authMode === 'forgot' && 'Account Password Recovery'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {authMode === 'login' && 'Sign in to manage active rented lines and wallets.'}
                  {authMode === 'signup' && 'Register now to instantly request virtual numbers.'}
                  {authMode === 'forgot' && 'Verify your security question credentials to define a new password.'}
                </p>
              </div>

              {/* Error & Success Messages */}
              {authError && (
                <div className="mb-4 bg-red-950/20 border border-red-900/50 p-4 rounded-xl text-xs flex gap-2 text-red-400 items-start">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="mb-4 bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl text-xs flex gap-2 text-emerald-400 items-start">
                  <Check className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Login Form */}
              {authMode === 'login' && (
                <form onSubmit={(e) => handleAuthSubmit(e, false)} className="space-y-4 font-semibold text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-wider text-zinc-500 mb-1.5">Email address</label>
                    <input 
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="customer@speshplus.com"
                      className="w-full bg-[#1C1D24] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400/50"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] uppercase font-black tracking-wider text-zinc-500">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError('');
                          setAuthSuccess('');
                          setForgotStep(1);
                          setAuthMode('forgot');
                        }}
                        className="text-[10px] text-amber-400 hover:text-amber-300 hover:underline font-bold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input 
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#1C1D24] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400/50"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#EA580C] hover:bg-orange-500 text-white font-extrabold py-3 rounded-xl transition-all shadow-md shadow-orange-650/15 cursor-pointer text-xs uppercase tracking-widest font-black"
                    >
                      {loading ? 'Processing...' : 'Sign In'}
                    </button>
                  </div>

                  <p className="text-center text-xs text-zinc-500 mt-4">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError('');
                        setAuthSuccess('');
                        setAuthMode('signup');
                      }}
                      className="text-[#FACC15] hover:underline font-extrabold"
                    >
                      Sign Up
                    </button>
                  </p>
                </form>
              )}

              {/* Signup Form */}
              {authMode === 'signup' && (
                <form onSubmit={(e) => handleAuthSubmit(e, true)} className="space-y-4 font-semibold text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-wider text-zinc-500 mb-1.5">Email address</label>
                    <input 
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="newuser@example.com"
                      className="w-full bg-[#1C1D24] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-wider text-zinc-500 mb-1.5">Password</label>
                    <input 
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#1C1D24] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-wider text-zinc-500 mb-1.5 font-bold font-mono">Select Testing Account Persona</label>
                    <select
                      value={authRole}
                      onChange={(e: any) => setAuthRole(e.target.value)}
                      className="w-full bg-[#1C1D24] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none cursor-pointer font-bold"
                    >
                      <option value="Customer">Standard Retail Customer (Demo starting balance $10.00)</option>
                      <option value="Reseller">Developer/Reseller API Access (Demo starting balance $100.00)</option>
                    </select>
                  </div>

                  <div className="border-t border-zinc-900 pt-3">
                    <span className="text-[10px] font-bold text-amber-400 block mb-2 font-mono">🔐 Password Recovery Secret Setup</span>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase font-black tracking-wider text-zinc-500 mb-1.5">Pick Recovery Question</label>
                        <select 
                          value={securityQuestion}
                          onChange={(e) => setSecurityQuestion(e.target.value)}
                          className="w-full bg-[#1C1D24] border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none cursor-pointer"
                        >
                          <option value="What is your secret code?">What is your secret code?</option>
                          <option value="What is your favorite color?">What is your favorite color?</option>
                          <option value="What is your favorite pet?">What is your favorite pet?</option>
                          <option value="Where were you born?">Where were you born?</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-black tracking-wider text-zinc-500 mb-1.5">Your Secret Answer</label>
                        <input 
                          type="text"
                          value={securityAnswer}
                          onChange={(e) => setSecurityAnswer(e.target.value)}
                          placeholder="e.g. gold"
                          className="w-full bg-[#1C1D24] border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400/50"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#FACC15] hover:bg-yellow-450 text-slate-950 font-extrabold py-3 rounded-xl transition-all shadow-md shadow-yellow-550/10 cursor-pointer text-xs uppercase tracking-widest font-black"
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                  </div>

                  <p className="text-center text-xs text-zinc-500 mt-4">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError('');
                        setAuthSuccess('');
                        setAuthMode('login');
                      }}
                      className="text-[#FACC15] hover:underline font-extrabold"
                    >
                      Sign In
                    </button>
                  </p>
                </form>
              )}

              {/* Forgot Password Recovery Mode */}
              {authMode === 'forgot' && (
                <div className="space-y-4 font-semibold text-xs">
                  {forgotStep === 1 ? (
                    <form onSubmit={handleForgotPasswordCheck} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase font-black tracking-wider text-zinc-500 mb-1.5">Registered Account Email</label>
                        <input 
                          type="email"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="customer@speshplus.com"
                          className="w-full bg-[#1C1D24] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none"
                          required
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#EA580C] hover:bg-orange-500 text-white font-extrabold py-3 rounded-xl transition-all cursor-pointer text-xs uppercase tracking-widest font-black"
                      >
                        {loading ? 'Consulting registry...' : 'Verify User Email'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleForgotPasswordReset} className="space-y-4">
                      <div className="bg-[#1C1D24] p-4 rounded-xl border border-zinc-850">
                        <span className="text-[9px] uppercase font-mono font-black text-[#FACC15] tracking-wider block">Security question registered:</span>
                        <p className="text-white font-bold text-sm mt-1">{forgotQuestion}</p>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-black tracking-wider text-zinc-500 mb-1.5">type secret response answer</label>
                        <input 
                          type="text"
                          value={forgotAnswer}
                          onChange={(e) => setForgotAnswer(e.target.value)}
                          placeholder="Answer answer casing-insensitive"
                          className="w-full bg-[#1C1D24] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400/50"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-black tracking-wider text-zinc-500 mb-1.5">Define new login password</label>
                        <input 
                          type="password"
                          value={forgotNewPassword}
                          onChange={(e) => setForgotNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#1C1D24] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400/50"
                          required
                        />
                      </div>

                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setForgotStep(1)}
                          className="flex-1 bg-zinc-800 hover:bg-zinc-750 text-white font-extrabold py-3 rounded-xl transition-all cursor-pointer text-xs uppercase tracking-widest font-black text-center"
                        >
                          Back
                        </button>
                        <button 
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-[#FACC15] hover:bg-[#E5B80E] text-slate-950 font-extrabold py-3 rounded-xl transition-all cursor-pointer text-xs uppercase tracking-widest font-black text-center"
                        >
                          {loading ? 'Saving...' : 'Reset Password'}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError('');
                        setAuthSuccess('');
                        setAuthMode('login');
                        setForgotStep(1);
                      }}
                      className="text-zinc-500 hover:text-white text-xs font-semibold hover:underline"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </div>
              )}

              {/* Demo profiling (Only shown in Login Mode for convenient sandbox testing) */}
              {authMode === 'login' && (
                <>
                  <div className="my-6 flex items-center justify-between text-xs text-zinc-500 font-bold select-none">
                    <div className="h-px bg-zinc-800 flex-1 mr-3" />
                    <span>Sandbox quick load profiling</span>
                    <div className="h-px bg-zinc-800 flex-1 ml-3" />
                  </div>

                  <div className="space-y-3">
                    <div className="bg-[#181921] border border-zinc-850 p-4 rounded-xl">
                      <div className="flex gap-2 mb-2 justify-center">
                        <button 
                          onClick={() => {
                            setAuthEmail('customer@speshplus.com');
                            setAuthPassword('password123');
                            setAuthError('');
                            setAuthSuccess('');
                          }}
                          className="text-[10px] uppercase font-black bg-[#121317] hover:bg-zinc-900 text-zinc-300 border border-zinc-800 px-3 py-2 rounded-lg transition-all cursor-pointer"
                        >
                          Customer Demo
                        </button>
                        <button 
                          onClick={() => {
                            setAuthEmail('admin@speshplus.com');
                            setAuthPassword('password123');
                            setAuthError('');
                            setAuthSuccess('');
                          }}
                          className="text-[10px] uppercase font-black bg-[#121317] hover:bg-[#FACC15]/10 hover:text-[#FACC15] text-[#FACC15] rounded-lg border border-zinc-800 px-3 py-2 transition-all cursor-pointer"
                        >
                          Admin Demo
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 text-center leading-normal font-semibold">Click a demo profile helper button above to automatically populate login fields.</p>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        )}

        {/* TAB 4: ACTIVE NUMBERS & LIVE CODES INBOX Timeline */}
        {activeTab === 'active' && (
          <div className="mx-auto max-w-6xl px-4 py-8 w-full flex-grow flex flex-col justify-start">
            
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  Active Numbers & OTP code inbox
                </h2>
                <p className="text-zinc-500 text-xs font-semibold">Track live cellular allocations and read code dispatches globally.</p>
              </div>

              {currentUser && (
                <button 
                  onClick={() => { loadUserOrders(); alert("Inbox messages verified! Autorefresh listening loop checking triggers."); }}
                  className="bg-[#121317] hover:bg-zinc-900 border border-zinc-800 text-xs px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-zinc-300 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-[#FACC15]" />
                  Sync Inbox state
                </button>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="bg-[#121317] border border-zinc-800 p-12 text-center rounded-3xl flex flex-col items-center justify-center min-h-[300px]">
                <div className="h-14 w-14 rounded-full bg-[#181921] flex items-center justify-center text-zinc-500 mb-4 border border-zinc-800">
                  <MessageSquare className="h-6 w-6 text-[#FACC15]" />
                </div>
                <h4 className="text-white font-extrabold text-lg select-none">No virtual line leases registered</h4>
                <p className="text-zinc-500 text-xs max-w-md mx-auto mt-2 leading-relaxed">Once you triggers a carrier phone renting from the search directory, details will update here dynamically.</p>
                <button 
                  onClick={() => setActiveTab('shop')}
                  className="bg-[#EA580C] hover:bg-orange-500 font-extrabold text-xs px-5 py-3 rounded-xl text-white mt-6 transition-all cursor-pointer"
                >
                  Select Virtual Number
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6 items-stretch">
                
                {/* LIST OF RESERVED CARRIER PHONES */}
                <div className="lg:col-span-1 bg-[#121317] border border-zinc-800 rounded-3xl overflow-hidden flex flex-col">
                  <div className="p-4 bg-[#181921]/65 border-b border-zinc-850 text-center font-mono">
                    <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest block">History of Line Allocations</span>
                  </div>

                  <div className="divide-y divide-zinc-900 overflow-y-auto max-h-[450px]">
                    {orders.slice().reverse().map((o) => {
                      const isChosen = selectedOrder?.id === o.id;
                      return (
                        <div
                          key={o.id}
                          onClick={() => {
                            setSelectedOrder(o);
                            loadSMSForOrder(o.id);
                          }}
                          className={`p-4 cursor-pointer text-left transition-colors font-sans ${
                            isChosen 
                              ? 'bg-[#1C1E26] border-l-4 border-[#FACC15]' 
                              : 'bg-transparent hover:bg-[#161720]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[10px] uppercase font-extrabold text-zinc-400 font-mono">{o.serviceName}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                              o.status === 'Active' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/30' :
                              o.status === 'Completed' ? 'bg-[#121317] text-zinc-400 border border-zinc-800' :
                              'bg-zinc-900 text-zinc-500'
                            }`}>
                              {o.status}
                            </span>
                          </div>

                          <p className="font-mono font-bold text-white text-base mt-2">{o.phone}</p>
                          
                          <div className="flex items-center justify-between text-xs text-zinc-500 mt-2 font-semibold">
                            <span>{o.countryName} ({o.countryCode})</span>
                            <span className="font-mono text-[10px] text-[#FACC15]">{o.otpReceived ? '✓ Received' : '⌛ listening'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* DETAILED TIMELINE INBOX READER VIEW */}
                <div className="lg:col-span-2 bg-[#121317] border border-zinc-850 rounded-3xl p-6 flex flex-col justify-between">
                  {selectedOrder ? (
                    <div className="flex flex-col h-full justify-between">
                      
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b border-zinc-850 pb-4 mb-5 gap-3">
                          <div>
                            <span className="text-[10px] font-black text-[#FACC15] uppercase tracking-wider">{selectedOrder.serviceName} LEASE LINE</span>
                            <h3 className="font-mono font-bold text-2xl text-white mt-1">{selectedOrder.phone}</h3>
                            <p className="text-zinc-550 text-zinc-550 text-zinc-400 text-xs font-semibold mt-1">Country Node: {selectedOrder.countryName} (+{selectedOrder.countryCode}) | Active duration: {selectedOrder.rentalDuration || '15 minutes'}</p>
                          </div>

                          <div className="text-right font-semibold text-xs">
                            {selectedOrder.status === 'Active' ? (
                              <div className="space-y-2">
                                <span className="inline-block bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase">
                                  Autoshield active
                                </span>
                                <p className="text-[11px] text-zinc-500">Timer: <span className="text-amber-400 font-mono">15m countdown</span></p>
                              </div>
                            ) : (
                              <span className="text-zinc-500 font-mono text-[11px]">Lease closed: {formatTime(selectedOrder.createdAt)}</span>
                            )}
                          </div>
                        </div>

                        {selectedOrder.status === 'Active' && !selectedOrder.otpReceived && (
                          <div className="bg-[#181A21] border border-zinc-800 p-4.5 rounded-2xl text-xs space-y-2 mb-6 font-semibold text-zinc-400">
                            <div className="flex items-center gap-1.5 text-white">
                              <span className="h-2 w-2 rounded-full bg-[#FACC15] animate-ping" />
                              <span className="font-bold">Carrier gateway sync listening active...</span>
                            </div>
                            <p className="leading-relaxed">Please paste your newly assigned number <b className="font-mono text-white">{selectedOrder.phone}</b> into the verification form of {selectedOrder.serviceName}. Fresh OTP codes usually update dynamically within 15 seconds.</p>
                            <div className="bg-[#FACC15]/5 p-3 rounded-lg text-[10px] text-amber-300 font-semibold border border-amber-400/10">
                              💡 <b>Interactive sandbox tip:</b> Wait 10-12s, or toggle your persona to <b>Admin Persona</b> on right corner options to trigger a mock OTP code transmission immediately!
                            </div>
                          </div>
                        )}

                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500 font-mono">Incoming messages timeline</h4>
                          
                          {smsMessages.length === 0 ? (
                            <div className="bg-[#15161E] border border-zinc-850 rounded-2xl p-8 text-center space-y-2">
                              <RefreshCw className="h-6 w-6 text-[#FACC15] animate-spin mx-auto" />
                              <p className="text-xs font-bold text-zinc-400">Listening on virtual trunk line...</p>
                              <p className="text-[10px] text-zinc-550 text-zinc-500 font-mono">Carrier listening rate: 2000 ms checks</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {smsMessages.map((sms) => (
                                <div key={sms.id} className="bg-[#1C1E26] p-4.5 rounded-2xl border border-[#2E313D]">
                                  <div className="flex items-center justify-between text-xs mb-2.5 text-zinc-500 font-bold">
                                    <span className="text-[#FACC15] uppercase tracking-wider font-extrabold text-[10px]" id={`sender-${sms.id}`}>{sms.sender} carrier node</span>
                                    <span className="font-mono text-[10px]">{formatTime(sms.receivedAt)}</span>
                                  </div>
                                  <p className="text-xs text-white font-mono leading-relaxed bg-[#121317] p-3.5 rounded-xl border border-zinc-900">{sms.content}</p>
                                  
                                  {sms.otpCode && (
                                    <div className="mt-3.5 flex items-center justify-between bg-[#152B20] border border-emerald-900/35 p-4 rounded-xl shadow-xs">
                                      <div>
                                        <span className="text-[9px] text-[#22C55E] uppercase tracking-wider font-extrabold block">Verification code found</span>
                                        <p className="text-[#FACC15] font-mono font-black text-2xl tracking-widest mt-1 leading-none">{sms.otpCode}</p>
                                      </div>

                                      <button
                                        onClick={() => handleCopyClipboard(sms.otpCode)}
                                        className="bg-[#1E2026] hover:bg-[#2A2C35] text-white border border-zinc-800 text-[10px] font-black uppercase tracking-widest px-4.5 py-2.5 rounded-xl transition-all cursor-pointer"
                                      >
                                        {copiedText === sms.otpCode ? 'Copied!' : 'Copy Code'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Cancel & instant refund bar */}
                      {selectedOrder.status === 'Active' && (
                        <div className="mt-8 pt-4 border-t border-zinc-850 flex items-center justify-between gap-3 bg-[#1C1E26]/50 p-4 rounded-xl">
                          <div className="font-semibold text-xs text-zinc-400">
                            <p className="font-bold text-white">No incoming SMS packet found?</p>
                            <p className="text-[10px] text-zinc-550 text-zinc-500">Cancel line to trigger instant automated balance refund.</p>
                          </div>
                          
                          <button
                            onClick={() => handleCancelOrder(selectedOrder.id)}
                            className="bg-red-500/10 border border-red-900/30 hover:bg-red-550 hover:bg-red-500 text-red-400 hover:text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-lg transition-all cursor-pointer"
                          >
                            Cancel Line / Refund
                          </button>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="text-center text-zinc-500 py-16 flex flex-col items-center justify-center h-full min-h-[300px]">
                      <Phone className="h-10 w-10 text-zinc-700 mb-3" />
                      <p className="text-sm font-bold text-white">No rented line chosen</p>
                      <p className="text-xs text-zinc-500 mt-2 max-w-xs mx-auto leading-relaxed">Select an active cellular lease code from the history bar on the left to read live SMS logs.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB 5: WALLET DEPOSITS & TRANSPARENT TRANS LOGS */}
        {activeTab === 'wallet' && (
          <div className="mx-auto max-w-4xl px-4 py-12 w-full">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
                <Wallet className="h-7 w-7 text-[#FACC15]" />
                Wallet Recharge Gateway
              </h2>
              <p className="text-zinc-500 text-xs font-semibold mt-1">Multi-payment dynamic gateway simulation setup. Absolute PCI security.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              
              {/* DEPOSIT FORM */}
              <div className="bg-[#121317] border border-zinc-850 p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider text-zinc-400 mb-4 font-mono">Fill Sandbox Funds</h4>
                  
                  {topupSuccess && (
                    <div className="mb-4 bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl text-xs text-emerald-400">
                      <span>{topupSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleTopup} className="space-y-4 text-xs font-semibold">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-405 text-zinc-400 mb-1.5">Enter Deposit amount (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-zinc-500 font-bold">$</span>
                        <input 
                          type="number"
                          step="1"
                          min="1"
                          max="1000"
                          value={topupAmount}
                          onChange={(e) => setTopupAmount(e.target.value)}
                          className="w-full bg-[#1C1D24] border border-zinc-800 rounded-xl pl-8 pr-4 py-3 text-white font-mono font-bold focus:outline-none focus:border-amber-400/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Checkout Carrier</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { id: 'Stripe', label: 'Credit Card (Stripe)' },
                          { id: 'PayPal', label: 'PayPal Checkout' },
                          { id: 'Crypto', label: 'Crypto Network Pay' },
                          { id: 'Mobile Money', label: 'Mobile Wallet' }
                        ].map((g) => (
                          <button
                            type="button"
                            key={g.id}
                            onClick={() => setTopupGateway(g.id as any)}
                            className={`p-2.5 rounded-xl border text-left font-sans text-[11px] font-bold transition-all ${
                              topupGateway === g.id 
                                ? 'bg-[#FACC15] border-[#FACC15] text-[#0A0B0E] font-extrabold' 
                                : 'bg-[#1C1D24] border-zinc-805 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#EA580C] hover:bg-orange-500 text-white font-black py-3 rounded-xl uppercase tracking-wider transition-all cursor-pointer text-[10px]"
                    >
                      Process Simulated Account Top-Up
                    </button>
                  </form>
                </div>

                <div className="bg-[#181A21] border border-zinc-850 p-4 rounded-xl text-[10.5px] text-zinc-500 mt-6 leading-relaxed font-semibold">
                  🔐 <b>Sandbox Notice:</b> The platform utilizes verified secure mock checkout channels. Funds are credited instantly of demonstration sandbox balances without transactional holds.
                </div>
              </div>

              {/* TRANSACTIONS ledger */}
              <div className="bg-[#121317] border border-zinc-850 p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider text-zinc-400 mb-5 font-mono">Account Balance Summary</h4>
                  
                  {currentUser ? (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-zinc-900 to-[#1C1D24] border border-zinc-800 p-5 rounded-2xl flex items-center justify-between text-white">
                        <div>
                          <span className="text-[10px] text-[#FACC15] font-black uppercase tracking-widest block">Available Funds balance</span>
                          <p className="text-3xl font-black text-white mt-1.5 font-mono">${currentUser.balance.toFixed(2)}</p>
                        </div>
                        <span className="text-[9px] font-black bg-emerald-950/80 text-emerald-400 border border-emerald-900/35 px-2.5 py-1 rounded">
                          KYC SECURED
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <h5 className="text-[10px] uppercase font-black text-zinc-500 tracking-wider font-mono">System Ledger billing logs</h5>
                        
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                          {transactions.length === 0 ? (
                            <div className="text-zinc-600 italic py-4 text-center">No transactions registered.</div>
                          ) : (
                            transactions.map((tx) => (
                              <div key={tx.id} className="bg-[#1C1D24] p-3 rounded-xl border border-zinc-850 flex justify-between text-xs items-center">
                                <div>
                                  <span className="font-extrabold uppercase text-[9px] bg-[#121317] border border-zinc-800 px-2 py-0.5 rounded text-[#FACC15]">
                                    {tx.type}
                                  </span>
                                  <span className="text-zinc-500 font-mono ml-2 text-[10px]">{tx.id}</span>
                                </div>
                                <div className="text-right">
                                  <span className={`font-mono font-bold ${tx.type === 'deposit' || tx.type === 'refund' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                    {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}${tx.amount.toFixed(2)}
                                  </span>
                                  <p className="text-[9px] text-zinc-500 mt-0.5">{formatTime(tx.createdAt)}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-zinc-550 text-center py-12">Log in to open balance details.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: RESELLER API SUITE */}
        {activeTab === 'reseller' && (
          <div className="mx-auto max-w-5xl px-4 py-12 w-full">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
                <Terminal className="h-7 w-7 text-[#FACC15]" />
                Developer Integration Portal
              </h2>
              <p className="text-zinc-500 text-xs font-semibold mt-1 font-mono">Interact programmatically with Spesh+ SMS pooling networks via high speed API keys.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              
              {/* API CARD */}
              <div className="md:col-span-1 bg-[#121317] border border-zinc-800 p-5 rounded-3xl h-fit">
                <h4 className="text-white font-extrabold text-xs uppercase tracking-wider text-zinc-400 mb-4 font-mono flex justify-between items-center">
                  <span>Your Keys</span>
                  <Key className="h-4 w-4 text-[#FACC15]" />
                </h4>

                {apiKeys.length === 0 ? (
                  <div className="space-y-4 text-xs font-semibold text-zinc-400">
                    <p className="leading-relaxed">Generate your security bearertoken to lease numbers automatically programmatically.</p>
                    <button 
                      onClick={handleCreateApiKey}
                      className="w-full bg-[#EA580C] hover:bg-orange-500 text-white font-extrabold py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer text-[10px]"
                    >
                      Generate API Key
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {apiKeys.map((k) => (
                      <div key={k.id} className="bg-[#1C1D24] p-3 rounded-xl border border-zinc-850 space-y-2">
                        <div className="flex justify-between text-[9px] items-center font-bold">
                          <span className="text-[#FACC15] font-black uppercase font-mono">LIVE API HOOK</span>
                          <span className="text-zinc-500 font-mono">Limit: {k.rateLimit} r/m</span>
                        </div>
                        <p className="font-mono text-[9px] select-all bg-[#121317] border border-zinc-900 p-2 rounded text-zinc-350 truncate font-semibold">{k.key}</p>
                        <button 
                          onClick={() => handleRevokeApiKey(k.id)}
                          className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider block"
                        >
                          Revoke Token
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={handleCreateApiKey}
                      className="w-full border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Generate New Live Key
                    </button>
                  </div>
                )}
              </div>

              {/* INTEGRATION SWAGGER CODE EXAMPLES */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-[#121317] border border-zinc-850 p-6 rounded-3xl space-y-4 text-xs">
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider text-zinc-400 mb-2 font-mono">Unified API endpoints Swagger specs</h4>
                  
                  <div>
                    <span className="inline-block bg-sky-650 bg-sky-600 text-white font-mono text-[9px] font-black px-2 py-0.5 rounded uppercase mr-2 select-none">GET</span>
                    <code className="text-zinc-200 font-mono font-bold">/api/numbers/browse</code>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed pl-4 font-semibold">Queries active catalog nodes success rates pool stock listing.</p>
                  </div>

                  <div className="bg-[#181921] p-4.5 rounded-xl border border-zinc-900 text-zinc-300 font-mono select-all">
                    <pre className="text-[10px] leading-relaxed text-[#FACC15]/95">
                      curl -X GET "https://speshplus.com/api/numbers/browse" \<br />
                      &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY"
                    </pre>
                  </div>

                  <div className="h-px bg-zinc-850 my-4" />

                  <div>
                    <span className="inline-block bg-[#10B981] text-white font-mono text-[9px] font-black px-2 py-0.5 rounded uppercase mr-2 select-none">POST</span>
                    <code className="text-zinc-200 font-mono font-bold">/api/numbers/rent</code>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed pl-4 font-semibold">Lease a dedicated non-VoIP carrier virtual number instantly with auto-failover safety.</p>
                  </div>

                  <div className="bg-[#181921] p-4.5 rounded-xl border border-zinc-900 text-zinc-300 font-mono select-all">
                    <pre className="text-[10px] leading-relaxed text-[#FACC15]/95">
                      curl -X POST "https://speshplus.com/api/numbers/rent" \<br />
                      &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY" \<br />
                      &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                      &nbsp;&nbsp;-d '&#123;"countryId":"c1","serviceId":"s1","type":"one-time"&#125;'
                    </pre>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 7: SUPPORT TICKETS & AI BOTTIMELINE */}
        {activeTab === 'support' && (
          <div className="mx-auto max-w-5xl px-4 py-12 w-full flex-grow flex flex-col justify-start">
            
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
                <LifeBuoy className="h-7 w-7 text-[#FACC15]" />
                Customer Helpdesk Ticketing Center
              </h2>
              <p className="text-zinc-500 text-xs font-semibold mt-1">Submit support claim files. Real-time Gemini developer chatbot automated replies integration.</p>
            </div>

            <div className="grid md:grid-cols-5 gap-6 items-stretch flex-grow min-h-[400px]">
              
              {/* SUBMIT CASE BOX */}
              <div className="md:col-span-2 bg-[#121317] border border-zinc-850 p-5 rounded-3xl flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider text-zinc-400 mb-4 font-mono">Create support claim</h4>

                  <form onSubmit={handleCreateTicket} className="space-y-4 text-xs font-semibold">
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-wider text-zinc-550 text-zinc-500 mb-1.5">Claim Subject</label>
                      <input 
                        type="text"
                        className="w-full bg-[#1C1D24] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400/50"
                        placeholder="PayPal simulation deposit sync issue"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-wider text-zinc-500 mb-1.5">Priority</label>
                      <select
                        className="w-full bg-[#1C1D24] border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none cursor-pointer"
                        value={ticketPriority}
                        onChange={(e: any) => setTicketPriority(e.target.value)}
                      >
                        <option value="Low">Low (General Query)</option>
                        <option value="Medium">Medium (Refund Claim)</option>
                        <option value="High">High (Urgent Reseller API Help)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-wider text-zinc-500 mb-1.5">Description details</label>
                      <textarea 
                        className="w-full bg-[#1C1D24] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none h-24 font-normal"
                        placeholder="State your transaction reference or active virtual rented line..."
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#EA580C] hover:bg-orange-500 text-white font-black py-3 rounded-xl uppercase tracking-wider transition-all cursor-pointer text-[10px]"
                    >
                      File Case Timeline
                    </button>
                  </form>
                </div>

                <div className="border-t border-zinc-900 pt-5 mt-5">
                  <h5 className="text-[10px] uppercase font-black text-zinc-550 text-zinc-500 mb-3 tracking-widest font-mono">All Open claim threads ({tickets.length})</h5>
                  
                  <div className="space-y-2 max-h-[160px] overflow-y-auto">
                    {tickets.length === 0 ? (
                      <div className="text-zinc-600 italic text-[11px] py-4 text-center">No cases filed.</div>
                    ) : (
                      tickets.map((t) => (
                        <div 
                          key={t.id}
                          onClick={() => setSelectedTicket(t)}
                          className={`p-3 rounded-xl text-xs cursor-pointer border transition-all ${
                            selectedTicket?.id === t.id 
                              ? 'bg-[#1C1E26] border-zinc-700 text-white' 
                              : 'bg-transparent border-zinc-900 text-zinc-400 hover:bg-zinc-900/30'
                          }`}
                        >
                          <div className="flex justify-between font-extrabold mb-1">
                            <span className="truncate max-w-[120px] text-white">{t.subject}</span>
                            <span className="text-[#FACC15] text-[9px] uppercase font-mono">{t.status}</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-mono">ID: {t.id} • {t.messages.length} replies</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* TIMELINE CONVERSATIONS READER COMPOSER */}
              <div className="md:col-span-3 bg-[#121317] border border-zinc-850 rounded-3xl p-6 flex flex-col justify-between">
                {selectedTicket ? (
                  <div className="flex-1 flex flex-col justify-between h-full">
                    
                    <div>
                      <div className="border border-zinc-850 pb-3 mb-4 flex justify-between items-center bg-[#181A21] p-4 rounded-xl">
                        <div>
                          <span className="text-[9px] font-black text-[#FACC15] uppercase tracking-wider block">Case timeline log</span>
                          <h4 className="text-base font-bold text-white mt-0.5 leading-tight">{selectedTicket.subject}</h4>
                          <p className="text-zinc-500 text-[10px] mt-1 font-mono">Claims ID: {selectedTicket.id} | Priority: {selectedTicket.priority}</p>
                        </div>
                        <span className="bg-[#1C1E26] border border-zinc-800 text-[#FACC15] font-mono text-[10px] px-2.5 py-1 rounded-lg select-none">{selectedTicket.status}</span>
                      </div>

                      {/* timeline threads lists */}
                      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                        {selectedTicket.messages.map((m) => {
                          const isSupport = m.sender === 'support';
                          return (
                            <div 
                              key={m.id}
                              className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                                isSupport 
                                  ? 'bg-[#1C1E26] text-white ml-auto border border-zinc-800' 
                                  : 'bg-[#15161C] border border-zinc-900 text-zinc-300 mr-auto'
                              }`}
                            >
                              <div className="flex justify-between font-extrabold text-[9px] mb-1.5 uppercase gap-8">
                                <span className={isSupport ? 'text-[#FACC15]' : 'text-zinc-500'}>
                                  {isSupport ? '🛡️ spesh+ support bot' : '👤 YOU (account owner)'}
                                </span>
                                <span className="font-mono text-zinc-600 text-[9px]">{formatTime(m.createdAt)}</span>
                              </div>
                              <p className="leading-relaxed font-semibold">{m.text}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <form onSubmit={handlePostTicketReply} className="mt-6 pt-4 border-t border-zinc-850 space-y-3">
                      <div className="bg-[#FACC15]/5 p-3 rounded-lg text-[10px] text-amber-300 font-semibold border border-amber-400/10 flex items-center gap-1.5">
                        <span>✨</span>
                        <span><b>Live Developers Sandbox Bot:</b> Sending messages dynamically dispatches an automated reply from Spesh+ automated helpdesk nodes.</span>
                      </div>

                      <div className="flex gap-2 text-xs">
                        <input 
                          type="text" 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Reply message or query regarding active rentals..."
                          className="flex-1 bg-[#1C1D24] border border-zinc-800 rounded-xl px-4 py-2.5 text-white"
                        />
                        <button
                          type="submit"
                          className="bg-[#EA580C] hover:bg-orange-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer font-black"
                        >
                          Send
                        </button>
                      </div>
                    </form>

                  </div>
                ) : (
                  <div className="text-center text-zinc-600 py-16 flex flex-col items-center justify-center h-full">
                    <LifeBuoy className="h-10 w-10 text-zinc-800 mb-3" />
                    <p className="font-bold text-white">Select claim case thread</p>
                    <p className="text-zinc-500 mt-1 max-w-xs leading-normal text-[11px] font-semibold">Choose a filed claim case from the side selection log to read replies or chat with virtual carrier technicians.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 8: SUPERVISOR OPERATIONS PANEL */}
        {activeTab === 'admin' && (
          <div className="mx-auto max-w-6xl px-4 py-12 w-full">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
                <Sliders className="h-7 w-7 text-[#FACC15]" />
                Administrative Supervisor Operations
              </h2>
              <p className="text-zinc-500 text-xs font-semibold mt-1">Configure global pricing lift values, inspect carrier API credit values, or dispatch manual verification codes overriding simulator logs.</p>
            </div>

            {/* TILES */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#121317] border border-zinc-800 p-4.5 rounded-2xl">
                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Active Pool users</span>
                <p className="text-2xl font-black text-white mt-1">{allUsers.length}</p>
              </div>

              <div className="bg-[#121317] border border-zinc-800 p-4.5 rounded-2xl">
                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider font-mono">Dynamic Margin Rule</span>
                <p className="text-xl font-black text-[#FACC15] mt-1.5 animate-pulse">
                  {pricingMode === 'fixed_margin' ? `+$${fixedProfitAmt.toFixed(2)} Profit` : `${globalMarkup}% Markup`}
                </p>
              </div>

              <div className="bg-[#121317] border border-zinc-800 p-4.5 rounded-2xl">
                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Active carrier leases</span>
                <p className="text-2xl font-black text-[#10B981] mt-1">{orders.filter(o => o.status === 'Active').length} Lines</p>
              </div>

              <div className="bg-[#121317] border border-zinc-800 p-4.5 rounded-2xl">
                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider font-mono">Open support claim files</span>
                <p className="text-2xl font-black text-sky-400 mt-1">{tickets.filter(t => t.status === 'Open').length} Cases</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-1 space-y-6">
                {/* ADJUSTER CARD */}
                <div className="bg-[#121317] border border-zinc-800 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-extrabold text-xs uppercase tracking-wider font-mono">💰 Carrier Margin Engine</h4>
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#FACC15] px-2 py-0.5 rounded-full bg-amber-400/10 font-mono">
                      {pricingMode === 'fixed_margin' ? 'Fixed Margin' : 'Percentage'}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-zinc-400 leading-normal font-semibold">
                    Set up your Twilio virtual lines margin rules. Twilio offers high-success failovers with real-time trunk provisioning.
                  </p>

                  {/* Mode Switches */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#1C1D24] rounded-xl border border-zinc-900/60 font-semibold text-[10px]">
                    <button
                      onClick={() => handleAdminPricingConfigChange('fixed_margin', fixedProfitAmt)}
                      className={`py-1.5 rounded-lg text-center uppercase tracking-wider transition-all cursor-pointer ${
                        pricingMode === 'fixed_margin'
                          ? 'bg-[#FACC15] text-slate-950 font-black'
                          : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      Fixed Profit
                    </button>
                    <button
                      onClick={() => handleAdminPricingConfigChange('percent', fixedProfitAmt)}
                      className={`py-1.5 rounded-lg text-center uppercase tracking-wider transition-all cursor-pointer ${
                        pricingMode === 'percent'
                          ? 'bg-[#FACC15] text-slate-950 font-black'
                          : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      Percent Lift
                    </button>
                  </div>

                  {pricingMode === 'fixed_margin' ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[11px] font-bold text-white font-mono">
                        <span>Fixed Profit Per Trade:</span>
                        <span className="font-mono text-[#FACC15] text-sm font-black">${fixedProfitAmt.toFixed(2)}</span>
                      </div>
                      
                      <input 
                        type="range"
                        min="0.5"
                        max="5.0"
                        step="0.1"
                        value={fixedProfitAmt}
                        onChange={(e) => handleAdminPricingConfigChange('fixed_margin', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-[#1C1D24] rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <div className="flex justify-between text-[9px] font-mono text-zinc-500 font-bold">
                        <span>+$0.50</span>
                        <span>+$2.00 (Target)</span>
                        <span>+$5.00 Limit</span>
                      </div>
                      <p className="text-[9.5px] font-semibold text-emerald-400 leading-normal">
                        ⚡ Fixed profit lock active! App charges standard carriage cost and locks exactly **${fixedProfitAmt.toFixed(2)}** profit on all virtual SMS routes.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[11px] font-bold text-white">
                        <span>Markup Price Multiplier:</span>
                        <span className="font-mono text-[#FACC15]">{globalMarkup}%</span>
                      </div>
                      
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={globalMarkup}
                        onChange={(e) => handleAdminMarkupChange(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[#1C1D24] rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <div className="flex justify-between text-[9px] font-mono text-zinc-500 font-bold">
                        <span>0% (Cost price)</span>
                        <span>50%</span>
                        <span>100% (Double)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* HARDWARE TRUNKS */}
                <div className="bg-[#121317] border border-zinc-800 p-6 rounded-3xl space-y-3">
                  <h4 className="text-white font-extrabold text-xs uppercase tracking-wider mb-2 font-mono">API Carrier provider failover trunks</h4>
                  <p className="text-[10px] text-zinc-500 leading-normal font-semibold">Leverage failover nodes by toggling target provider connectivity.</p>

                  <div className="space-y-2.5">
                    {providers.map((p) => (
                      <div key={p.id} className="bg-[#1C1D24] p-3 rounded-xl border border-zinc-850 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-white block">{p.name}</span>
                          <span className="text-[9.5px] font-mono text-zinc-500 block">Balance: ${p.balance.toFixed(2)}</span>
                        </div>
                        
                        <button
                          onClick={() => handleAdminToggleProvider(p.id, p.active)}
                          className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-transform duration-200 select-none cursor-pointer ${
                            p.active 
                              ? 'bg-amber-450 bg-[#FACC15] text-slate-950 shadow-xs' 
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {p.active ? 'ACTIVE' : 'MUTED'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* OVERRIDES DEPLOYER */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* MANUAL Dispatch override */}
                <div className="bg-[#121317] border border-zinc-800 p-6 rounded-3xl text-xs font-semibold">
                  <h4 className="text-white font-extrabold text-xs uppercase tracking-wider mb-2.5 font-mono">SMS Payload Injector manual dispatch</h4>
                  <p className="text-[11px] text-zinc-500 leading-normal mb-4 font-semibold">Intercede simulation limits by pushing custom verification payloads directly to specific active numbers in testing logs.</p>

                  <div className="grid sm:grid-cols-3 gap-2.5 mb-3.5">
                    <div>
                      <label className="text-[9px] uppercase font-black text-zinc-500 block mb-1">Active rent lines</label>
                      <select 
                        className="w-full bg-[#1C1D24] border border-zinc-800 rounded-lg p-2 text-white text-xs"
                        value={targetOrderIdForSms}
                        onChange={(e) => setTargetOrderIdForSms(e.target.value)}
                      >
                        <option value="">-- Choose lease line --</option>
                        {orders.filter(o => o.status === 'Active').map((o) => (
                          <option key={o.id} value={o.id}>{o.serviceName} ({o.phone})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-black text-zinc-500 block mb-1">Sender Label</label>
                      <input 
                        type="text" 
                        className="w-full bg-[#1C1D24] border border-zinc-800 rounded-lg p-1.5 text-white text-xs font-bold font-mono"
                        value={customSmsSender}
                        onChange={(e) => setCustomSmsSender(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-black text-zinc-500 block mb-1">Custom Verification Code</label>
                      <input 
                        type="text" 
                        className="w-full bg-[#1C1D24] border border-zinc-800 rounded-lg p-1.5 text-[#FACC15] text-xs font-bold font-mono"
                        value={customSmsOtp}
                        onChange={(e) => setCustomSmsOtp(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-[9px] uppercase font-black text-zinc-500 block mb-1">Simulated Message Payload Content</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#1C1D24] border border-zinc-800 rounded-lg p-2 text-white text-xs"
                      value={customSmsContent}
                      onChange={(e) => setCustomSmsContent(e.target.value)}
                    />
                  </div>

                  <button 
                    onClick={handleAdminSmsSimulate}
                    className="bg-[#EA580C] hover:bg-orange-505 bg-orange-500 text-white font-extrabold text-[10px] tracking-widest uppercase px-5 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    🚀 Trigger manual OTP payload arriving
                  </button>
                </div>

                {/* ADMINISTRATIVE USER CONTROL & LOG MODULES */}
                <div className="space-y-6">
                  
                  {/* UTILITY: CREATE NEW ACCOUNT (Supervising account manager) */}
                  <div className="bg-[#121317] border border-zinc-800 p-6 rounded-3xl text-xs font-semibold">
                    <span className="text-[9px] uppercase font-bold text-[#FACC15] bg-amber-500/10 px-2.5 py-1 rounded">🛡️ ACCOUNT PROVISION ENGINE</span>
                    <h4 className="text-white font-extrabold text-xs uppercase tracking-wider mt-3 mb-2 font-mono">Provision New Client Account</h4>
                    <p className="text-[10px] text-zinc-500 leading-normal mb-4 font-semibold">Registers a new account directly in the backend state with custom parameters, starting balances, and recovery credentials.</p>

                    {adminCreateError && (
                      <div className="mb-4 bg-red-950/20 border border-red-900/50 p-3.5 rounded-xl text-red-400">{adminCreateError}</div>
                    )}
                    {adminCreateSuccess && (
                      <div className="mb-4 bg-emerald-950/20 border border-emerald-900/50 p-3.5 rounded-xl text-emerald-400">{adminCreateSuccess}</div>
                    )}

                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setAdminCreateError('');
                        setAdminCreateSuccess('');
                        if (!adminCreateEmail || !adminCreatePassword) {
                          setAdminCreateError('Both Email and Password are required.');
                          return;
                        }
                        const resSubmit = await handleAdminCreateUser({
                          email: adminCreateEmail,
                          password: adminCreatePassword,
                          role: adminCreateRole,
                          balance: adminCreateBalance,
                          securityQuestion: adminCreateQuestion,
                          securityAnswer: adminCreateAnswer
                        });
                        if (resSubmit.success) {
                          setAdminCreateSuccess(`Provisioned Account successfully: "${adminCreateEmail}"`);
                          setAdminCreateEmail('');
                          setAdminCreatePassword('');
                          setAdminCreateBalance('10.00');
                        } else {
                          setAdminCreateError(resSubmit.error || 'Provisioning failed.');
                        }
                      }}
                      className="grid sm:grid-cols-2 md:grid-cols-3 gap-4"
                    >
                      <div>
                        <label className="text-[9.5px] uppercase font-black text-zinc-500 block mb-1">Email Address</label>
                        <input 
                          type="email" 
                          placeholder="client@speshplus.com"
                          className="w-full bg-[#1C1D24] border border-zinc-800 rounded-lg p-2 text-white font-bold text-xs"
                          value={adminCreateEmail}
                          onChange={(e) => setAdminCreateEmail(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-[9.5px] uppercase font-black text-zinc-500 block mb-1">Set Password</label>
                        <input 
                          type="text" 
                          placeholder="e.g. secret123"
                          className="w-full bg-[#1C1D24] border border-zinc-800 rounded-lg p-2 text-white font-bold text-xs"
                          value={adminCreatePassword}
                          onChange={(e) => setAdminCreatePassword(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-[9.5px] uppercase font-black text-zinc-500 block mb-1">Account Role</label>
                        <select 
                          className="w-full bg-[#1C1D24] border border-zinc-800 rounded-lg p-2 text-white text-xs cursor-pointer"
                          value={adminCreateRole}
                          onChange={(e: any) => setAdminCreateRole(e.target.value)}
                        >
                          <option value="Customer">Customer</option>
                          <option value="Reseller">Reseller</option>
                          <option value="Support">Support</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[9.5px] uppercase font-black text-zinc-500 block mb-1">Starting Balance ($)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          placeholder="10.00"
                          className="w-full bg-[#1C1D24] border border-zinc-800 rounded-lg p-2 text-white font-mono text-xs"
                          value={adminCreateBalance}
                          onChange={(e) => setAdminCreateBalance(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-[9.5px] uppercase font-black text-zinc-500 block mb-1">Recovery Question</label>
                        <select 
                          className="w-full bg-[#1C1D24] border border-zinc-800 rounded-lg p-2 text-white text-xs cursor-pointer"
                          value={adminCreateQuestion}
                          onChange={(e) => setAdminCreateQuestion(e.target.value)}
                        >
                          <option value="What is your secret code?">What is your secret code?</option>
                          <option value="What is your favorite color?">What is your favorite color?</option>
                          <option value="What is your favorite pet?">What is your favorite pet?</option>
                          <option value="Where were you born?">Where were you born?</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[9.5px] uppercase font-black text-zinc-500 block mb-1">Question Answer</label>
                        <input 
                          type="text" 
                          placeholder="e.g. gold"
                          className="w-full bg-[#1C1D24] border border-zinc-800 rounded-lg p-2 text-zinc-300 font-bold text-xs"
                          value={adminCreateAnswer}
                          onChange={(e) => setAdminCreateAnswer(e.target.value)}
                        />
                      </div>

                      <div className="sm:col-span-2 md:col-span-3 pt-2">
                        <button 
                          type="submit"
                          className="bg-[#EA580C] hover:bg-orange-500 text-white font-extrabold uppercase tracking-widest text-[9.5px] px-6 py-2.5 rounded-xl cursor-pointer"
                        >
                          ➕ Register Account & Set Online
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* MASTER: COMPLETE USERS CONTROL MATRIX */}
                  <div className="bg-[#121317] border border-zinc-800 p-6 rounded-3xl text-xs font-semibold">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#FACC15] bg-amber-500/10 px-2.5 py-1 rounded">🛡️ ACCOUNT AUDITING CONTROL PANEL</span>
                        <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mt-3 font-mono">Dynamic Users Control & Security Matrix</h4>
                        <p className="text-[10px] text-zinc-500 leading-normal mt-0.5 font-semibold">Live-switch roles, suspend or ban user sessions instantly, override client credentials, or execute balance refunds.</p>
                      </div>

                      {/* Manual Quick Add Credit tool */}
                      <div className="bg-[#1C1D24] p-3 rounded-2xl border border-zinc-850 flex gap-2 items-center flex-wrap self-stretch md:self-auto">
                        <select 
                          value={selectedUserIdForBalance} 
                          onChange={(e) => setSelectedUserIdForBalance(e.target.value)}
                          className="bg-[#121317] border border-zinc-800 text-[10px] rounded-lg p-1.5 font-semibold text-white focus:outline-none"
                        >
                          <option value="">Refill User...</option>
                          {allUsers.map((u) => (
                            <option key={u.id} value={u.id}>{u.email.replace(/@.*/, '')} (${u.balance.toFixed(1)})</option>
                          ))}
                        </select>
                        <input 
                          type="number" 
                          step="1"
                          style={{ width: '55px' }}
                          value={newUserBalance}
                          onChange={(e) => setNewUserBalance(e.target.value)}
                          placeholder="$"
                          className="bg-[#121317] border border-zinc-800 text-[10px] rounded-lg p-1 text-center font-mono text-white focus:outline-none"
                        />
                        <button 
                          onClick={handleAdminUpdateBalance}
                          className="bg-[#FACC15] hover:bg-[#E5B80E] text-slate-950 text-[10px] font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                        >
                          Refill
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto text-[11px] font-sans">
                      <table className="w-full text-left table-auto min-w-[700px]">
                        <thead>
                          <tr className="border-b border-zinc-850 text-zinc-500 font-bold uppercase text-[9px] tracking-wider font-mono">
                            <th className="py-3 px-2">Account Identity</th>
                            <th className="py-3 px-2">System Persona Role</th>
                            <th className="py-3 px-2">Availability Status</th>
                            <th className="py-3 px-2 text-right">Balance</th>
                            <th className="py-3 px-2 text-center">Credential Overrider</th>
                            <th className="py-3 px-2 text-right">Purge User</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900 text-zinc-300">
                          {allUsers.map((u) => {
                            const currentStatus = u.status || 'Active';
                            return (
                              <tr key={u.id} className="hover:bg-[#161720]/40 transition-colors">
                                
                                {/* Identity Column */}
                                <td className="py-3 px-2">
                                  <div className="font-extrabold text-white text-xs">{u.email}</div>
                                  <div className="text-[9.5px] text-zinc-500 font-mono mt-0.5">
                                    ID: <span className="text-zinc-450">{u.id}</span> • Built: <span className="text-zinc-650">{new Date(u.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </td>

                                {/* Role Inline Switcher */}
                                <td className="py-3 px-2">
                                  <select
                                    value={u.role}
                                    onChange={(e) => handleAdminUpdateUserRole(u.id, e.target.value)}
                                    className="bg-[#1C1D24] border border-zinc-850 text-[10px] font-bold text-[#FACC15] rounded-md px-2 py-1 focus:outline-none cursor-pointer"
                                  >
                                    <option value="Customer">Customer</option>
                                    <option value="Reseller">Reseller</option>
                                    <option value="Support">Support</option>
                                    <option value="Admin">Admin</option>
                                  </select>
                                </td>

                                {/* Account Status Blocks */}
                                <td className="py-3 px-2">
                                  <select
                                    value={currentStatus}
                                    onChange={(e) => handleAdminUpdateUserStatus(u.id, e.target.value as any)}
                                    className={`border text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg focus:outline-none cursor-pointer ${
                                      currentStatus === 'Active' 
                                        ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-400' 
                                        : currentStatus === 'Suspended'
                                        ? 'bg-yellow-950/20 border-amber-900/60 text-amber-500'
                                        : 'bg-red-950/20 border-red-900/60 text-red-500 font-black'
                                    }`}
                                  >
                                    <option value="Active" className="bg-[#121317] text-emerald-400 font-extrabold">Active</option>
                                    <option value="Suspended" className="bg-[#121317] text-amber-550">Suspended</option>
                                    <option value="Banned" className="bg-[#121317] text-red-500 font-extrabold">Banned</option>
                                  </select>
                                </td>

                                {/* Balance Display */}
                                <td className="py-3 px-2 text-right font-mono font-extrabold text-white text-xs">
                                  ${u.balance.toFixed(2)}
                                </td>

                                {/* Credential Override Trigger Input */}
                                <td className="py-3 px-2 text-center">
                                  <div className="flex gap-1.5 items-center justify-center">
                                    <input 
                                      type="text"
                                      placeholder="Override key"
                                      value={adminResetPasswords[u.id] || ''}
                                      onChange={(e) => setAdminResetPasswords(prev => ({ ...prev, [u.id]: e.target.value }))}
                                      className="bg-[#1C1D24] border border-zinc-800 rounded px-2 py-1 text-[10px] text-[#FACC15] w-24 focus:outline-none focus:border-amber-400/50 font-bold"
                                    />
                                    <button 
                                      onClick={() => {
                                        const newPass = adminResetPasswords[u.id];
                                        if (!newPass) {
                                          alert('Please insert a code value.');
                                          return;
                                        }
                                        handleAdminResetUserPassword(u.id, newPass);
                                        setAdminResetPasswords(prev => ({ ...prev, [u.id]: '' }));
                                      }}
                                      className="bg-zinc-800 hover:bg-zinc-700 text-white text-[9px] uppercase font-black tracking-wider px-2 py-1 rounded cursor-pointer"
                                    >
                                      Set
                                    </button>
                                  </div>
                                </td>

                                {/* Purge Action */}
                                <td className="py-3 px-2 text-right">
                                  <button
                                    onClick={() => handleAdminDeleteUser(u.id)}
                                    className="text-red-500 hover:text-red-400 bg-red-950/20 hover:bg-red-950/40 px-2 py-1 rounded text-[9.5px] font-bold uppercase tracking-wider cursor-pointer"
                                    title="Permanently remove user from the database state."
                                    disabled={u.id === 'usr_admin'} // do not delete primary tester
                                  >
                                    PURGE
                                  </button>
                                </td>

                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* DISCRETE PERSONA TOGGLE DRAWER BOX (Anti-AI-Slop compliant demo switcher) */}
      {currentUser && (
        <div className="bg-[#121317] border-t border-zinc-850 py-3.5 px-4 sticky bottom-0 z-30 shadow-2xl text-xs flex flex-wrap items-center justify-between gap-3 text-zinc-450 text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-bold">Sandbox session connected</span>
            <span className="text-zinc-700 font-semibold">•</span>
            <span className="text-zinc-500">Current active email: </span>
            <strong className="text-white font-mono">{currentUser.email}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wild select-none">Quick Test Actor Role:</span>
            <select 
              value={currentUser.role}
              onChange={(e) => handleQuickRoleSwitch(e.target.value as any)}
              className="bg-[#1C1D24] text-xs text-[#FACC15] font-black border border-zinc-800 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
              title="Switch user role dynamically to instantly audit buyer, reseller or administrator screens!"
            >
              <option value="Customer">Standard customer</option>
              <option value="Reseller">Reseller (API client)</option>
              <option value="Support">Support Agent</option>
              <option value="Admin">System Administrator</option>
            </select>
          </div>
        </div>
      )}

      {/* PIXEL-PERFECT FOOTER BLOCK */}
      <footer className="bg-[#0A0B0E] border-t border-zinc-900/40 px-4 py-12 lg:px-8 text-xs text-zinc-500 mt-12">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="grid grid-cols-2 gap-0.5 p-0.5 bg-[#FACC15] rounded-xs w-3 h-3">
                <div className="bg-slate-950 w-1 h-1"></div>
                <div className="bg-slate-950 w-1 h-1"></div>
              </div>
              <span className="font-black text-sm text-white tracking-widest uppercase">spesh+</span>
            </div>
            <p className="mt-1.5 text-zinc-550 text-zinc-500 font-semibold leading-normal">High-performance multi-carrier physical cellular SIM routing portals.<br />Automatic failsafe gateway networks.</p>
          </div>

          <div className="flex flex-wrap gap-4 text-[10.5px] font-bold text-zinc-500 justify-center">
            <span className="hover:text-[#FACC15] cursor-pointer transition-colors" onClick={() => alert("Refund Warranty: 100% automatic refund. If active leased numbers does not catch messages within the 15-minute checkout countdown, funds are fully auto-credited to your account balance.")}>Refund Warranties</span>
            <span>•</span>
            <span className="hover:text-[#FACC15] cursor-pointer transition-colors" onClick={() => alert("Regulatory Status: System lines are leased solely for application integration checks. Logging is subject to compliant sandbox storage.")}>Carrier Terms</span>
            <span>•</span>
            <span className="hover:text-[#FACC15] cursor-pointer transition-colors" onClick={() => alert("Support Helpdesk: File a client timeline case directly inside the Support tab to receive an immediate response.")}>F.A.Q Help</span>
          </div>
        </div>
        <p className="text-center text-zinc-600 text-[10px] mt-8 font-mono">© 2026 Spesh+ cellular virtual networks inc. All rights reserved.</p>
      </footer>

    </div>
  );
}
