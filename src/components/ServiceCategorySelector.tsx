import { useState } from 'react';
import { 
  Search, MessageSquare, Send, Users, Phone, Smartphone, 
  Facebook, Instagram, Video, Layers, Globe, Cpu, Sparkles, 
  Mail, Terminal, DollarSign, CreditCard, Wallet, Activity, 
  Car, Flame, Music, Star, ChevronRight, Activity as Sparklet
} from 'lucide-react';
import { Service, Country } from '../types';

interface ServiceCategorySelectorProps {
  services: (Service & { price: number; successRate?: number; availableCount?: number })[];
  selectedCountryId: string;
  countries: Country[];
  onRentService: (countryId: string, serviceId: string) => void;
  loading: boolean;
}

const CATEGORIES = [
  { id: 'All', label: 'All Services', icon: Globe },
  { id: 'Messengers', label: '💬 Messengers', icon: Send },
  { id: 'Social Networks', label: '📱 Social Networks', icon: Facebook },
  { id: 'AI & Developer', label: '🤖 AI & Tech', icon: Cpu },
  { id: 'Payments & Finance', label: '💳 Payments & Finance', icon: DollarSign },
  { id: 'Food & Ride-sharing', label: '🚗 Food & Ride', icon: Car },
  { id: 'Entertainment & Fun', label: '🎵 Streaming & Fun', icon: Flame },
];

export default function ServiceCategorySelector({
  services,
  selectedCountryId,
  countries,
  onRentService,
  loading
}: ServiceCategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeCountry = countries.find(c => c.id === selectedCountryId) || countries[0];

  // Filter services by category and search query
  const filteredServices = services.filter(s => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Get active icon for a service logo string
  const getServiceIcon = (logo: string) => {
    switch (logo) {
      case 'MessageSquare': return <MessageSquare className="h-5 w-5" />;
      case 'Send': return <Send className="h-5 w-5" />;
      case 'Users': return <Users className="h-5 w-5" />;
      case 'Phone': return <Phone className="h-5 w-5" />;
      case 'Smartphone': return <Smartphone className="h-5 w-5" />;
      case 'Facebook': return <Facebook className="h-5 w-5" />;
      case 'Instagram': return <Instagram className="h-5 w-5" />;
      case 'Video': return <Video className="h-5 w-5" />;
      case 'Layers': return <Layers className="h-5 w-5" />;
      case 'Globe': return <Globe className="h-5 w-5" />;
      case 'Cpu': return <Cpu className="h-5 w-5" />;
      case 'Sparkles': return <Sparkles className="h-5 w-5" />;
      case 'Mail': return <Mail className="h-5 w-5" />;
      case 'Terminal': return <Terminal className="h-5 w-5" />;
      case 'DollarSign': return <DollarSign className="h-5 w-5" />;
      case 'CreditCard': return <CreditCard className="h-5 w-5" />;
      case 'Wallet': return <Wallet className="h-5 w-5" />;
      case 'Activity': return <Activity className="h-5 w-5" />;
      case 'Car': return <Car className="h-5 w-5" />;
      case 'Flame': return <Flame className="h-5 w-5" />;
      case 'Music': return <Music className="h-5 w-5" />;
      default: return <Smartphone className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-[#121317]/55 border border-zinc-850 rounded-[32px] p-6 lg:p-8 shadow-xl mt-4" id="service-selector-workbench">
      
      {/* Target Regional Router Status Line */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-900 pb-5 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-center text-lg shadow-inner">
            {activeCountry?.flag || '🇺🇸'}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#FACC15]">Active Tunnel Routing</div>
            <h3 className="text-sm font-extrabold text-white">
              {activeCountry ? `${activeCountry.name} (+${activeCountry.code === 'US' ? '1' : activeCountry.code === 'GB' ? '44' : activeCountry.code === 'EE' ? '372' : activeCountry.code === 'UA' ? '380' : activeCountry.code === 'DE' ? '49' : '91'})` : 'Select a country router upper tab'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#171922] border border-zinc-800 px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-zinc-400">
          <Sparklet className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span className="font-mono text-emerald-400">{filteredServices.length}</span> Services Configured
        </div>
      </div>

      {/* Category selector row + search bar */}
      <div className="grid lg:grid-cols-12 gap-5 items-center mb-8">
        
        {/* Horizontal Category Navigation Tabs */}
        <div className="lg:col-span-8 overflow-x-auto no-scrollbar py-2 flex gap-2 font-semibold">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 text-xs px-4 py-2.5 rounded-full transition-all shrink-0 cursor-pointer ${
                  isSelected 
                    ? 'bg-[#FACC15] text-[#0A0B0E] font-black shadow-lg shadow-yellow-500/10' 
                    : 'bg-[#1C1E26] text-zinc-400 hover:text-white hover:bg-[#252833] border border-zinc-800/60'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Service Search Query Input */}
        <div className="lg:col-span-4 relative">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-zinc-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search e.g. WhatsApp, ChatGPT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1C1D24] border border-zinc-800 focus:border-amber-400/40 rounded-full py-2.5 pl-10 pr-4 text-xs font-bold text-white focus:outline-none placeholder-zinc-500"
          />
        </div>

      </div>

      {/* Workspace Display Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-[#161720]/30 border border-dashed border-zinc-900 rounded-2xl">
          <p className="text-zinc-500 text-xs font-semibold">No services matches your search parameters. Try choosing another category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredServices.map((svc) => {
            const successRate = svc.successRate || 98;
            const availableCount = svc.availableCount || 105;
            
            return (
              <div 
                key={svc.id} 
                className="bg-[#161720]/80 hover:bg-[#1C1D26] border border-zinc-850 hover:border-zinc-750 p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 relative group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    {/* Service Icon Container */}
                    <div className="h-11 w-11 rounded-xl bg-slate-950/90 border border-zinc-800 flex items-center justify-center text-[#FACC15] group-hover:scale-105 transition-transform duration-300">
                      {getServiceIcon(svc.logo)}
                    </div>
                    <div>
                      {/* Category Badge Name */}
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-0.5">
                        {svc.category || 'Other Services'}
                      </span>
                      <h4 className="text-sm font-extrabold text-white group-hover:text-[#FACC15] transition-colors">{svc.name}</h4>
                    </div>
                  </div>

                  {/* Pricing tag */}
                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-[#FACC15] block">${svc.price.toFixed(2)}</span>
                    <span className="text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest block transform translate-y-[-2px]">
                      per SMS code
                    </span>
                  </div>
                </div>

                {/* Technical health tags */}
                <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-zinc-500 mb-4 bg-zinc-950/40 py-1.5 px-3 rounded-lg border border-zinc-900/60 justify-between">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-zinc-400 font-semibold">{availableCount} online pools</span>
                  </div>
                  {/* Rate Indicator */}
                  <div className="text-emerald-400 font-extrabold">
                    {successRate}% delivery rate
                  </div>
                </div>

                {/* Direct Provision Activation Action Button */}
                <button
                  disabled={loading}
                  onClick={() => onRentService(selectedCountryId, svc.id)}
                  className="w-full bg-[#1A1B22] border border-[#2E313D] hover:border-amber-400/30 hover:bg-zinc-900 text-white hover:text-[#FACC15] font-black uppercase tracking-wider text-[10px] py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Select & Provision Virtual Line</span>
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>

              </div>
            );
          })}
        </div>
      )}

      {/* Safety Shield disclaimer */}
      <div className="mt-8 pt-5 border-t border-zinc-900/80 flex items-center gap-2 text-[10px] font-semibold text-zinc-500">
        <span className="text-xs">⚡</span>
        <span>Autoshield Refund active: No SMS code received? Total credit balance is refunded instantly to your wallet.</span>
      </div>

    </div>
  );
}
