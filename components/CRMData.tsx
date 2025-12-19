
import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, Calendar, LogOut, BadgeDollarSign, Mail, FilePlus, Laptop, Settings, Globe, Shield, Menu, X, User as UserIcon, Star, Inbox, UserPlus, Building, Briefcase, Car, TrendingUp, Key, FileText, PieChart, Percent, Truck, ClipboardList, PenTool } from 'lucide-react';
import { useData } from '../context/DataContext';
import { UserRole, ProductType } from '../types';

// Icons used in logic below
const RefreshIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
);
const AlertIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);

interface CRMLayoutProps {
  children: React.ReactNode;
}

export const CRMLayout: React.FC<CRMLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // --- DYNAMIC MENU GENERATION ---
  const navItems = useMemo(() => {
    if (!user) return [];

    // 1. Core Items (Always First)
    const coreItems = [
        { path: '/crm/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/crm/inbox', label: 'Requests', icon: Inbox },
        ...(user.role !== UserRole.SUB_ADMIN ? [{ path: '/crm/clients', label: 'Clients', icon: Shield }] : []),
    ];

    // 2. Product Specific Items
    let productItems: any[] = [];
    const products = user.productsSold || [];

    // Helper to avoid duplicates
    const addUnique = (items: any[]) => {
        items.forEach(item => {
            if (!productItems.some(existing => existing.path === item.path)) {
                productItems.push(item);
            }
        });
    };

    if (products.includes(ProductType.LIFE) || products.includes(ProductType.ANNUITY) || products.includes(ProductType.IUL) || products.includes(ProductType.FINAL_EXPENSE)) {
        addUnique([
            { path: '/crm/applications', label: 'Policies & Apps', icon: FileText }
        ]);
    }

    if (products.includes(ProductType.REAL_ESTATE)) {
        addUnique([
            { path: '/crm/properties', label: 'Property Pipeline', icon: Building },
            { path: '/crm/escrow', label: 'Transactions & Escrow', icon: Key }
        ]);
    }

    if (products.includes(ProductType.MORTGAGE)) {
        addUnique([
            { path: '/crm/loans', label: 'Loan Applications', icon: FilePlus },
            { path: '/crm/rates', label: 'Rate Tools', icon: Percent },
            { path: '/crm/refi-calc', label: 'Refinance Calc', icon: PieChart }
        ]);
    }

    if (products.includes(ProductType.BUSINESS) || products.includes(ProductType.COMMERCIAL) || products.includes(ProductType.EO)) {
        addUnique([
            { path: '/crm/commercial-quotes', label: 'Commercial Quotes', icon: Briefcase },
            { path: '/crm/renewals', label: 'Policies & Renewals', icon: RefreshIcon } 
        ]);
    }

    if (products.includes(ProductType.AUTO)) {
        addUnique([
            { path: '/crm/auto-quotes', label: 'Auto Quotes', icon: Car },
            { path: '/crm/fleet', label: 'Fleet Manager', icon: Truck },
            { path: '/crm/claims', label: 'Claims', icon: AlertIcon } 
        ]);
    }

    if (products.includes(ProductType.INVESTMENT) || products.includes(ProductType.SECURITIES)) {
        addUnique([
            { path: '/crm/portfolio', label: 'Portfolio Mgmt', icon: TrendingUp },
            { path: '/crm/compliance', label: 'Compliance Docs', icon: ClipboardList },
            { path: '/crm/fees', label: 'Advisory Fees', icon: BadgeDollarSign }
        ]);
    }

    // 3. Admin / Manager Specifics
    if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER || user.role === UserRole.SUB_ADMIN) {
        addUnique([
            { path: '/crm/intake', label: 'New Intake', icon: FilePlus }
        ]);
    }
    
    // Onboarding specifically restricted per user's latest "Admin Only" feedback
    if (user.role === UserRole.ADMIN) {
        addUnique([
            { path: '/crm/onboarding', label: 'Onboarding', icon: UserPlus }
        ]);
    }

    // 4. Footer Items (Common)
    const footerItems = [
        // Commissions: Show if NOT purely investment (advisory fees cover that) or if multiple products
        ...(user.role !== UserRole.SUB_ADMIN && !products.every(p => p === ProductType.INVESTMENT) ? [{ path: '/crm/commissions', label: 'Commissions', icon: BadgeDollarSign }] : []),
        { path: '/crm/leads', label: 'Leads DB', icon: Users },
        { path: '/crm/calendar', label: 'Calendar', icon: Calendar },
        { path: '/crm/chat', label: 'Team Chat', icon: MessageSquare },
        { path: '/crm/profile', label: 'Profile', icon: UserIcon },
    ];

    return [...coreItems, ...productItems, ...footerItems];
  }, [user]);

  // Administration section items - STRICTLY ADMIN ONLY as per screenshot request
  const adminItems = [
      { path: '/crm/admin', label: 'Users', icon: Users },
      { path: '/crm/admin/website', label: 'Website', icon: Laptop },
      { path: '/crm/admin/carriers', label: 'Carriers', icon: Shield },
      { path: '/crm/admin/testimonials', label: 'Testimonials', icon: Star },
      { path: '/crm/admin/signature', label: 'Email Signature', icon: PenTool }, 
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-slate-900 overflow-hidden">
      {/* Centered App Container - Floating Glass Window */}
      <div className="w-full max-w-[1600px] h-full max-h-[95vh] bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl flex relative overflow-hidden border border-white/50 ring-1 ring-black/5">
        
        {/* Sidebar - Desktop (Translucent Dark Glass) */}
        <aside className="hidden lg:flex flex-col w-72 bg-slate-900/90 backdrop-blur-xl text-white h-full overflow-y-auto py-10 z-10 flex-shrink-0 no-scrollbar border-r border-white/10">
            <div className="px-10 mb-12 flex items-center gap-4">
                <div className="relative w-10 h-10 flex-shrink-0 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M50 0L100 40V100H0V40L50 0Z" fill="#FBBF24"/>
                    </svg>
                </div>
                <div>
                    <h1 className="font-bold text-xl leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">New Holland</h1>
                    <p className="text-[0.65rem] text-slate-400 uppercase tracking-widest mt-1 font-bold">Agent Portal</p>
                </div>
            </div>

            <nav className="flex-1 px-6 space-y-2">
                {navItems.map(item => (
                    <Link 
                        key={item.path}
                        to={item.path} 
                        className={`flex items-center gap-4 px-6 py-3.5 text-sm font-medium rounded-2xl transition-all duration-300 ${
                            location.pathname.startsWith(item.path) 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/50 scale-[1.02]' 
                            : 'text-slate-400 hover:bg-white/10 hover:text-white hover:scale-[1.02]'
                        }`}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </Link>
                ))}

                {/* STRICT ADMIN SECTION - RESTRICTED TO ADMIN ONLY */}
                {user?.role === UserRole.ADMIN && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Administration</p>
                        <div className="space-y-2">
                            {adminItems.map(item => (
                                <Link 
                                    key={item.path}
                                    to={item.path} 
                                    className={`flex items-center gap-4 px-6 py-3.5 text-sm font-medium rounded-2xl transition-all duration-300 ${
                                        location.pathname.startsWith(item.path) 
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/50 scale-[1.02]' 
                                        : 'text-slate-400 hover:bg-white/10 hover:text-white hover:scale-[1.02]'
                                    }`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            <div className="px-6 mt-8">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-6 py-4 text-sm font-bold text-red-300 hover:bg-red-900/20 hover:text-red-200 rounded-2xl w-full transition-all hover:shadow-lg"
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </aside>

        {/* Mobile Toggle */}
        <div className="lg:hidden absolute top-6 right-6 z-20">
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-4 bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-xl hover:scale-105 transition-transform">
                {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>

        {/* Main Content Area - Transparent Background to let glass effect work */}
        <main className="flex-1 h-full overflow-y-auto relative scroll-smooth bg-white/40">
            <div className="p-6 lg:p-10 mx-auto min-h-full flex flex-col pt-24 lg:pt-10">
                {children}
            </div>
        </main>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex flex-col p-8 overflow-y-auto animate-fade-in">
                 <div className="flex justify-between items-center mb-10 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8">
                            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"><path d="M50 0L100 40V100H0V40L50 0Z" fill="#FBBF24"/></svg>
                        </div>
                        <span className="font-bold text-xl">Menu</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/10 rounded-full"><X className="h-6 w-6" /></button>
                 </div>
                 <nav className="space-y-4">
                    {navItems.map(item => (
                        <Link 
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)} 
                            className={`flex items-center gap-4 px-6 py-5 text-lg font-bold rounded-[2rem] ${location.pathname.startsWith(item.path) ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 bg-white/5'}`}
                        >
                            <item.icon className="h-6 w-6" />
                            {item.label}
                        </Link>
                    ))}
                    
                    {user?.role === UserRole.ADMIN && adminItems.map(item => (
                         <Link 
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)} 
                            className={`flex items-center gap-4 px-6 py-5 text-lg font-bold rounded-[2rem] ${location.pathname.startsWith(item.path) ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 bg-white/5'}`}
                        >
                            <item.icon className="h-6 w-6" />
                            {item.label}
                        </Link>
                    ))}

                     <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-5 text-lg font-bold text-red-300 bg-red-900/20 rounded-[2rem] w-full mt-8">
                        <LogOut className="h-6 w-6" /> Sign Out
                     </button>
                 </nav>
            </div>
        )}

      </div>
    </div>
  );
};
