import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { getDB, saveDB } from './src/dbMock';
import { User, Order, SMSMessage, Transaction, Ticket, ApiKey } from './src/types';

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// Ensure the database is initialized
const db = getDB();

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. AUTHENTICATION
app.post('/api/auth/register', (req, res) => {
  const { email, password, role, securityQuestion, securityAnswer } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const newUser: User = {
    id: `usr_${Math.random().toString(36).substring(2, 9)}`,
    email,
    role: role || 'Customer',
    balance: role === 'Reseller' ? 100.00 : 10.00, // starting balance for demo purposes
    kycStatus: 'Verified',
    createdAt: new Date().toISOString(),
    twoFactorEnabled: false,
    password,
    securityQuestion: securityQuestion || 'What is your favorite color?',
    securityAnswer: securityAnswer || 'gold',
    status: 'Active'
  };

  db.users.push(newUser);
  saveDB();
  res.status(201).json(newUser);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Validate password
  if (user.password && user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Validate user status
  if (user.status && user.status !== 'Active') {
    return res.status(403).json({ error: `Access Denied: Your account status is currently "${user.status}". Please contact an administrator.` });
  }

  res.json(user);
});

// Forgot password - Request security question
app.post('/api/auth/forgot-password/question', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'No account registered with this email' });
  }

  res.json({
    email: user.email,
    securityQuestion: user.securityQuestion || 'What is your favorite color?'
  });
});

// Forgot password - Reset password
app.post('/api/auth/forgot-password/reset', (req, res) => {
  const { email, securityAnswer, newPassword } = req.body;
  if (!email || !securityAnswer || !newPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'Associated user not found' });
  }

  const expectedAnswer = (user.securityAnswer || 'gold').trim().toLowerCase();
  const providedAnswer = securityAnswer.trim().toLowerCase();

  if (expectedAnswer !== providedAnswer) {
    return res.status(400).json({ error: 'Verification failed: Incorrect answer to your security question' });
  }

  user.password = newPassword;
  saveDB();
  res.json({ message: 'Password reset successful! Please log in with your new credentials.' });
});

app.put('/api/auth/update-role', (req, res) => {
  const { userId, role } = req.body;
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.role = role;
  saveDB();
  res.json(user);
});

// 2. WALLET
app.post('/api/wallet/topup', (req, res) => {
  const { userId, amount, gateway } = req.body;
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: 'Invalid top-up amount' });
  }

  user.balance = Number((user.balance + amt).toFixed(2));

  const transaction: Transaction = {
    id: `tx_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    amount: amt,
    type: 'deposit',
    status: 'Completed',
    gateway: gateway || 'Stripe',
    reference: `ch_${gateway?.toLowerCase() || 'stripe'}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString()
  };

  db.transactions.push(transaction);
  saveDB();
  res.json({ balance: user.balance, transaction });
});

// 3. NUMBERS BROWSE
app.get('/api/numbers/browse', (req, res) => {
  // Return all countries, services, and dynamic calculated inventory rates
  // Standard prices are multiplied by markup percentage
  const globalMarkup = db.markupPercent;
  const clientServices = db.services.map((s) => {
    const markupPrice = Number((s.defaultPrice * (1 + globalMarkup / 100)).toFixed(2));
    return {
      ...s,
      price: markupPrice,
      successRate: Math.floor(Math.random() * 15) + 82, // Dynamic nice success-rate 82%-97%
      availableCount: Math.floor(Math.random() * 80) + 12 // Simulated dynamic stock count
    };
  });

  res.json({
    countries: db.countries,
    services: clientServices,
    numbersCount: db.numbers.filter(n => n.status === 'available').length,
    markupPercent: db.markupPercent
  });
});

// 4. NUMBER RENTAL (BUY SERVICE OTP)
app.post('/api/numbers/rent', (req, res) => {
  const { userId, countryId, serviceId, type, durationDays } = req.body;
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const country = db.countries.find((c) => c.id === countryId);
  const service = db.services.find((s) => s.id === serviceId);

  if (!country || !service) {
    return res.status(400).json({ error: 'Invalid country or service selection' });
  }

  // Calculate rental cost
  const isLongTerm = type === 'long-term';
  const duration = durationDays ? parseInt(durationDays) : 0;
  const baseCost = isLongTerm ? service.defaultPrice * 3 * (duration || 7) : service.defaultPrice;
  const markupPrice = Number((baseCost * (1 + db.markupPercent / 100)).toFixed(2));

  if (user.balance < markupPrice) {
    return res.status(400).json({ error: 'Insufficient balance. Please top-up your wallet' });
  }

  // Find a matching number or auto-generate a pool number dynamically on provider side
  let availableNum = db.numbers.find(
    (n) => n.countryId === countryId && n.status === 'available' && n.type === (isLongTerm ? 'long-term' : 'one-time')
  );

  if (!availableNum) {
    // Dynamically auto-create a clean matching number to avoid failing order (plug-and-play provider failover)
    const randomBase = Math.floor(Math.random() * 90000000) + 10000000;
    const ccCode = country.code === 'US' ? '1' : country.code === 'GB' ? '44' : country.code === 'EE' ? '372' : country.code === 'UA' ? '380' : '49';
    const activeProvider = db.providers.find(p => p.active) || db.providers[0];
    
    availableNum = {
      id: `num_${Math.random().toString(36).substring(2, 9)}`,
      phone: `+${ccCode}${randomBase}`,
      countryId: country.id,
      provider: (activeProvider.name as any),
      serviceId: service.id,
      status: 'available',
      price: markupPrice,
      type: isLongTerm ? 'long-term' : 'one-time'
    };
    db.numbers.push(availableNum);
  }

  // Rent out the number
  availableNum.status = 'rented';
  availableNum.rentedBy = user.id;
  
  const minutes = isLongTerm ? (duration || 7) * 24 * 60 : 15; // Short term expires in 15 mins
  const expiresAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();
  availableNum.expiresAt = expiresAt;

  user.balance = Number((user.balance - markupPrice).toFixed(2));

  const orderId = `ord_${Math.random().toString(36).substring(2, 9)}`;
  const order: Order = {
    id: orderId,
    userId: user.id,
    numberId: availableNum.id,
    phone: availableNum.phone,
    countryName: country.name,
    countryCode: country.code,
    serviceId: service.id,
    serviceName: service.name,
    price: markupPrice,
    status: 'Active',
    otpReceived: false,
    rentalDuration: isLongTerm ? `${duration || 7} Days` : '15 minutes',
    createdAt: new Date().toISOString(),
    expiresAt
  };

  db.orders.push(order);

  // Record purchase transaction
  const transaction: Transaction = {
    id: `tx_${Math.random().toString(36).substring(2, 9)}`,
    userId: user.id,
    amount: markupPrice,
    type: 'purchase',
    status: 'Completed',
    gateway: 'Admin',
    reference: orderId,
    createdAt: new Date().toISOString()
  };
  db.transactions.push(transaction);

  // AUTOMATIC OTP SIMULATOR FOR CONVENIENT TESTING
  // Setup standard dynamic SMS reception after 10-15 seconds automatically!
  setTimeout(() => {
    const freshOrder = db.orders.find(o => o.id === orderId);
    if (freshOrder && freshOrder.status === 'Active' && !freshOrder.otpReceived) {
      const otpCode = Math.floor(Math.random() * 900000) + 100000;
      const senders = ['WhatsApp', 'Telegram', 'Google', 'Facebook', 'Tinder', 'Uber', 'ChatGPT'];
      const currentSender = senders.find(s => s.toLowerCase().includes(freshOrder.serviceName.toLowerCase())) || freshOrder.serviceName;
      
      const newSMS: SMSMessage = {
        id: `sms_${Math.random().toString(36).substring(2, 9)}`,
        orderId: freshOrder.id,
        numberId: freshOrder.numberId,
        sender: currentSender,
        content: `Your verification code for ${currentSender} is ${otpCode}. Ref: ${Math.random().toString(36).substring(2, 5).toUpperCase()}.`,
        otpCode: String(otpCode),
        receivedAt: new Date().toISOString()
      };

      db.sms.push(newSMS);
      freshOrder.otpReceived = true;
      freshOrder.status = 'Completed';
      saveDB();
    }
  }, 12000); // 12 seconds delay

  saveDB();
  res.status(201).json({ order, updatedBalance: user.balance });
});

// 5. GET ORDERS & SMS
app.get('/api/orders', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  // Filter and auto-expire old active orders
  const nowStr = new Date().toISOString();
  db.orders.forEach((o) => {
    if (o.status === 'Active' && o.expiresAt < nowStr) {
      o.status = o.otpReceived ? 'Completed' : 'Expired';
      
      // AUTO-REFUND SYSTEM
      // If code was not received by short-term number, auto-refund!
      if (!o.otpReceived && o.rentalDuration === '15 minutes') {
        const user = db.users.find(u => u.id === o.userId);
        if (user) {
          user.balance = Number((user.balance + o.price).toFixed(2));
          o.status = 'Refunded';

          // Add refund transaction log
          db.transactions.push({
            id: `tx_${Math.random().toString(36).substring(2, 9)}`,
            userId: o.userId,
            amount: o.price,
            type: 'refund',
            status: 'Completed',
            gateway: 'Admin',
            reference: o.id,
            createdAt: new Date().toISOString()
          });
        }
      }
    }
  });

  saveDB();

  const userOrders = db.orders.filter((o) => o.userId === userId);
  res.json(userOrders);
});

app.get('/api/orders/:orderId/sms', (req, res) => {
  const { orderId } = req.params;
  const messages = db.sms.filter((s) => s.orderId === orderId);
  res.json(messages);
});

// 6. CANCEL / REFUND ORDER
app.post('/api/orders/:orderId/cancel', (req, res) => {
  const { orderId } = req.params;
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.status !== 'Active') {
    return res.status(400).json({ error: 'Only active rentals can be cancelled' });
  }

  const user = db.users.find((u) => u.id === order.userId);
  if (!user) {
    return res.status(404).json({ error: 'Associated user not found' });
  }

  // If no SMS received, refund!
  if (!order.otpReceived) {
    user.balance = Number((user.balance + order.price).toFixed(2));
    order.status = 'Refunded';

    // Add refund transaction
    db.transactions.push({
      id: `tx_${Math.random().toString(36).substring(2, 9)}`,
      userId: user.id,
      amount: order.price,
      type: 'refund',
      status: 'Completed',
      gateway: 'Admin',
      reference: order.id,
      createdAt: new Date().toISOString()
    });

    // Update number status
    const num = db.numbers.find(n => n.id === order.numberId);
    if (num) {
      num.status = 'available';
      num.rentedBy = undefined;
      num.expiresAt = undefined;
    }

    saveDB();
    res.json({ message: 'Order cancelled, full refund returned to wallet', order, balance: user.balance });
  } else {
    order.status = 'Completed';
    saveDB();
    res.status(400).json({ error: 'OTP already received, unable to cancel order' });
  }
});

// 7. API KEYS (Reseller backend credentials)
app.get('/api/apikeys', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  
  const keys = db.apiKeys.filter(k => k.userId === userId);
  res.json(keys);
});

app.post('/api/apikeys', (req, res) => {
  const { userId } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newKey: ApiKey = {
    id: `key_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    key: `spesh_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
    secret: '••••••••••••••••••••••••••••••••',
    rateLimit: user.role === 'Reseller' ? 200 : 60,
    createdAt: new Date().toISOString()
  };

  db.apiKeys.push(newKey);
  saveDB();
  res.status(201).json(newKey);
});

app.delete('/api/apikeys/:keyId', (req, res) => {
  const { keyId } = req.params;
  const idx = db.apiKeys.findIndex(k => k.id === keyId);
  if (idx > -1) {
    db.apiKeys.splice(idx, 1);
    saveDB();
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'API Key not found' });
});

// 8. SUPPORT CENTER
app.get('/api/support/tickets', (req, res) => {
  const { userId } = req.query;
  const tickets = userId 
    ? db.tickets.filter(t => t.userId === userId)
    : db.tickets; // support agents see all
  res.json(tickets);
});

app.post('/api/support/tickets', (req, res) => {
  const { userId, subject, priority, message } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newTkt: Ticket = {
    id: `tkt_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    userEmail: user.email,
    subject,
    status: 'Open',
    priority: priority || 'Medium',
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: `tm_${Math.random().toString(36).substring(2, 9)}`,
        sender: 'user',
        text: message,
        createdAt: new Date().toISOString()
      }
    ]
  };

  db.tickets.push(newTkt);
  saveDB();
  res.status(201).json(newTkt);
});

app.post('/api/support/tickets/:ticketId/reply', async (req, res) => {
  const { ticketId } = req.params;
  const { sender, text } = req.body;
  const tkt = db.tickets.find(t => t.id === ticketId);
  if (!tkt) return res.status(404).json({ error: 'Ticket not found' });

  const newMsg = {
    id: `tm_${Math.random().toString(36).substring(2, 9)}`,
    sender: sender || 'user',
    text,
    createdAt: new Date().toISOString()
  };

  tkt.messages.push(newMsg);
  tkt.status = sender === 'user' ? 'Open' : 'Pending';
  saveDB();

  // STAGE INTEGRATIVE GENAI AUTO-ANSWER FOR SUPPORT AGENTS!
  // If user asked, auto-answer via Gemini agent if enabled!
  if (sender === 'user') {
    const ai = getGemini();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `You are Spesh+ Support AI Bot. The customer sent this query: "${text}".
Please reply in a helpful, concise, support agent tone. Limit your answer to 2-3 short, highly friendly sentences. Let them know what action was taken. Use plain text.`,
          config: {
            temperature: 0.7
          }
        });
        
        if (response.text) {
          tkt.messages.push({
            id: `tm_${Math.random().toString(36).substring(2, 9)}`,
            sender: 'support',
            text: response.text.trim(),
            createdAt: new Date().toISOString()
          });
          tkt.status = 'Closed';
          saveDB();
        }
      } catch (err) {
        console.warn("Gemini support response extraction failed:", err);
      }
    }
  }

  res.json(tkt);
});

// 9. ADMIN ANALYTICS & INVENTORY
app.get('/api/admin/overview', (req, res) => {
  // Compute analytics
  const totalUsers = db.users.length;
  const activeRentals = db.orders.filter(o => o.status === 'Active').length;
  const totalRevenue = db.transactions
    .filter(t => t.status === 'Completed' && t.type === 'purchase')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDeposits = db.transactions
    .filter(t => t.status === 'Completed' && t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const openTickets = db.tickets.filter(t => t.status === 'Open').length;

  res.json({
    metrics: {
      totalUsers,
      activeRentals,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalDeposits: Number(totalDeposits.toFixed(2)),
      openTickets
    },
    providers: db.providers,
    recentTransactions: db.transactions.slice(-8).reverse(),
    globalMarkup: db.markupPercent
  });
});

app.post('/api/admin/inventory/markup', (req, res) => {
  const { markupPercent } = req.body;
  const val = parseInt(markupPercent);
  if (!isNaN(val) && val >= 0) {
    db.markupPercent = val;
    saveDB();
    return res.json({ markupPercent: db.markupPercent });
  }
  res.status(400).json({ error: 'Invalid markup percentage value' });
});

app.post('/api/admin/inventory/provider-toggle', (req, res) => {
  const { providerId, active } = req.body;
  const prov = db.providers.find(p => p.id === providerId);
  if (prov) {
    prov.active = !!active;
    saveDB();
    return res.json(prov);
  }
  res.status(404).json({ error: 'Provider not found' });
});

// SIMULATE CUSTOM MANUAL SMS (Injected directly by Admin or Support)
app.post('/api/admin/sms/simulate', (req, res) => {
  const { orderId, sender, content, otpCode } = req.body;
  const order = db.orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const newSMS: SMSMessage = {
    id: `sms_${Math.random().toString(36).substring(2, 9)}`,
    orderId: order.id,
    numberId: order.numberId,
    sender: sender || 'SpeshVerify',
    content: content || `Verification SMS message. Code: ${otpCode || '552199'}`,
    otpCode: otpCode || '552199',
    receivedAt: new Date().toISOString()
  };

  db.sms.push(newSMS);
  order.otpReceived = true;
  order.status = 'Completed';
  saveDB();

  res.json({ success: true, sms: newSMS, order });
});

app.get('/api/admin/users', (req, res) => {
  res.json(db.users);
});

app.post('/api/admin/users/balance', (req, res) => {
  const { userId, newBalance } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const amt = parseFloat(newBalance);
  if (!isNaN(amt)) {
    user.balance = Number(amt.toFixed(2));
    saveDB();
    return res.json(user);
  }
  res.status(400).json({ error: 'Invalid balance value' });
});

// Admin User Control: Create User
app.post('/api/admin/users/create', (req, res) => {
  const { email, password, role, balance, securityQuestion, securityAnswer } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const parseBal = parseFloat(balance);
  const newUser = {
    id: `usr_${Math.random().toString(36).substring(2, 9)}`,
    email,
    password,
    role: role || 'Customer',
    balance: isNaN(parseBal) ? 10.00 : parseBal,
    kycStatus: 'Verified' as const,
    createdAt: new Date().toISOString(),
    twoFactorEnabled: false,
    securityQuestion: securityQuestion || 'What is your favorite color?',
    securityAnswer: securityAnswer || 'gold',
    status: 'Active' as const
  };

  db.users.push(newUser);
  saveDB();
  res.json(newUser);
});

// Admin User Control: Change Role
app.post('/api/admin/users/role', (req, res) => {
  const { userId, role } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.role = role;
  saveDB();
  res.json(user);
});

// Admin User Control: Set status (Active, Suspended, Banned)
app.post('/api/admin/users/status', (req, res) => {
  const { userId, status } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (status !== 'Active' && status !== 'Suspended' && status !== 'Banned') {
    return res.status(400).json({ error: 'Invalid status' });
  }

  user.status = status;
  saveDB();
  res.json(user);
});

// Admin User Control: Direct Overriding Password Reset
app.post('/api/admin/users/reset-password', (req, res) => {
  const { userId, newPassword } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (!newPassword || newPassword.length < 3) {
    return res.status(400).json({ error: 'Password must be at least 3 characters' });
  }

  user.password = newPassword;
  saveDB();
  res.json({ message: 'Password updated successfully!', user });
});

// Admin User Control: Delete User
app.delete('/api/admin/users/:userId', (req, res) => {
  const { userId } = req.params;
  const idx = db.users.findIndex(u => u.id === userId);
  if (idx > -1) {
    const deleted = db.users.splice(idx, 1);
    saveDB();
    return res.json({ success: true, deletedUser: deleted[0] });
  }
  res.status(404).json({ error: 'User not found' });
});

// ----------------------------------------------------
// VITE OR STATIC FILES SERVING MIDDLEWARE
// ----------------------------------------------------

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Spesh+] Server running at http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
