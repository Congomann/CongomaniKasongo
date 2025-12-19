
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, FileText, PhoneIncoming, Bell, BadgeDollarSign, Video, Mail, Calendar, ShieldCheck, Globe, Laptop, Settings, ChevronRight, Phone, X, FileCheck, Hourglass, CheckCircle, XCircle, Home, Truck, TrendingUp, Building2, Briefcase, Percent, Key, FilePlus, Upload, Shield } from 'lucide-react';
import { UserRole, ApplicationStatus, LifeDetails, ProductType, AdvisorCategory, Notification } from '../../types';

// Updated StatCard with Glassmorphism
const StatCard = ({ icon: Icon, colorClass, bgClass, label, value, subtext }: any) => (
    <div className="glass-panel p-6 rounded-[2.5rem] shadow-lg shadow-slate-200/50 flex items-start gap-5 hover:scale-[1.02] transition-all duration-300 group">
        <div className={`p-4 rounded-2xl ${bgClass} ${colorClass} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
            <Icon className="h-7 w-7"/>
        </div>
        <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            <p className="text-3xl font-black text-slate-800 mt-1 tracking-tight">{value}</p>
            {subtext && <p className="text-xs text-slate-400 mt-1 font-medium">{subtext}</p>}
        </div>
    </div>
);

export const Dashboard: React.FC = () => {
    const { user, leads, metrics, callbacks, applications, performanceTargets, availableCarriers, updateApplicationStatus, addLead, companySettings, resources, allUsers } = useData();
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [isAppStatusModalOpen, setIsAppStatusModalOpen] = useState(false);
    const [isTargetsModalOpen, setIsTargetsModalOpen] = useState(false);
    const [quoteForm, setQuoteForm] = useState<Partial<LifeDetails & { name: string, email: string, phone: string }>>({});
    
    // Tabbed Production Graph State
    const [activeGraphTab, setActiveGraphTab] = useState<string>('All');

    const isAdmin = user?.role === UserRole.ADMIN;

    // 1. DYNAMIC STAT CARDS - STRICT PERMISSIONING
    const statCards = useMemo(() => {
        const cards: any[] = [];
        const products = user?.productsSold || [];

        if (isAdmin) {
             return [
                { icon: Users, color: "text-blue-600", bg: "bg-blue-100/50", label: "Total Users", value: allUsers.length, sub: `${allUsers.filter(u => u.role === UserRole.ADVISOR).length} Advisors` },
                { icon: FileText, color: "text-purple-600", bg: "bg-purple-100/50", label: "Total Leads", value: leads.length, sub: "Pipeline" },
                { icon: Globe, color: "text-green-600", bg: "bg-green-100/50", label: "Resources", value: resources.length, sub: "Public" },
                { icon: ShieldCheck, color: "text-orange-600", bg: "bg-orange-100/50", label: "System Status", value: "Healthy", sub: "Online" }
             ];
        }

        // Standard Advisor/Manager Cards (Personal metrics)
        if (products.includes(ProductType.LIFE) || products.includes(ProductType.ANNUITY)) {
            cards.push({ icon: DollarSign, color: "text-blue-600", bg: "bg-blue-100/50", label: "My Production", value: `$${metrics.totalRevenue.toLocaleString()}` });
            cards.push({ icon: FileText, color: "text-orange-600", bg: "bg-orange-100/50", label: "Pending Apps", value: metrics.pendingLeads });
        }

        if (products.includes(ProductType.REAL_ESTATE)) {
            cards.push({ icon: Home, color: "text-emerald-600", bg: "bg-emerald-100/50", label: "My Listings", value: "4" });
            cards.push({ icon: Key, color: "text-indigo-600", bg: "bg-indigo-100/50", label: "Escrows Open", value: "2" });
        }

        if (products.includes(ProductType.MORTGAGE)) {
            cards.push({ icon: Percent, color: "text-cyan-600", bg: "bg-cyan-100/50", label: "Loan Volume", value: "$1.2M" });
            cards.push({ icon: FilePlus, color: "text-teal-600", bg: "bg-teal-100/50", label: "Applications", value: "7" });
        }

        if (products.includes(ProductType.BUSINESS)) {
            cards.push({ icon: Briefcase, color: "text-slate-700", bg: "bg-slate-200/50", label: "Comm. Quotes", value: "12" });
        }

        if (products.includes(ProductType.AUTO)) {
            cards.push({ icon: Truck, color: "text-red-600", bg: "bg-red-100/50", label: "Auto Quotes", value: "28" });
        }

        if (products.includes(ProductType.INVESTMENT) || products.includes(ProductType.SECURITIES)) {
            cards.push({ icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100/50", label: "My AUM", value: "$4.5M" });
        }

        if (cards.length < 3) {
             cards.push({ icon: BadgeDollarSign, color: "text-green-600", bg: "bg-green-100/50", label: "Commissions", value: `$${metrics.totalCommission.toLocaleString()}` });
        }
        
        cards.push({ icon: PhoneIncoming, color: "text-red-600", bg: "bg-red-100/50", label: "My Callbacks", value: callbacks.filter(c => !c.resolved).length });

        return cards.slice(0, 4);
    }, [user, metrics, callbacks, resources, allUsers, leads, isAdmin]);

    const quickActions = useMemo(() => {
        const actions: any[] = [];
        const products = user?.productsSold || [];

        if (products.includes(ProductType.LIFE) || products.includes(ProductType.ANNUITY)) {
            actions.push({ label: 'New Quote', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', action: () => setIsQuoteModalOpen(true) });
            actions.push({ label: 'App Status', icon: FileCheck, color: 'text-green-600', bg: 'bg-green-50', action: () => setIsAppStatusModalOpen(true) });
        }

        if (products.includes(ProductType.REAL_ESTATE)) {
            actions.push({ label: 'Add Listing', icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-50', action: () => {} });
        }

        if (products.includes(ProductType.MORTGAGE)) {
            actions.push({ label: 'Loan App', icon: FilePlus, color: 'text-cyan-600', bg: 'bg-cyan-50', action: () => {} });
        }

        if (products.includes(ProductType.BUSINESS)) {
            actions.push({ label: 'Comm. Quote', icon: Briefcase, color: 'text-slate-600', bg: 'bg-slate-100', action: () => {} });
        }

        return actions.slice(0, 6);
    }, [user]);

    const graphTabs = useMemo(() => {
        const tabs = ['All'];
        const products = user?.productsSold || [];
        if (products.includes(ProductType.LIFE)) tabs.push('Life');
        if (products.includes(ProductType.REAL_ESTATE)) tabs.push('Real Estate');
        if (products.includes(ProductType.MORTGAGE)) tabs.push('Mortgage');
        return tabs;
    }, [user]);

    const graphData = useMemo(() => {
        return metrics.monthlyPerformance.map(m => {
            let val = m.revenue;
            if (activeGraphTab === 'Real Estate') val = val * 2.5;
            if (activeGraphTab === 'Mortgage') val = val * 5;
            return { ...m, value: val };
        });
    }, [activeGraphTab, metrics]);

    const handleQuoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addLead({
            name: `${quoteForm.name}`,
            email: `${quoteForm.email}`,
            phone: `${quoteForm.phone}`,
            interest: ProductType.LIFE,
            message: "Manual quote entry from dashboard.",
            lifeDetails: { ...quoteForm }
        }, user?.id);
        setIsQuoteModalOpen(false);
        setQuoteForm({});
    };

    return (
        <div className="space-y-8">
            {/* 1. DYNAMIC STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, idx) => (
                    <StatCard 
                        key={idx}
                        icon={card.icon}
                        colorClass={card.color}
                        bgClass={card.bg}
                        label={card.label}
                        value={card.value}
                        subtext={card.sub}
                    />
                ))}
            </div>
            
            {/* 2. ADMIN CONTROL CENTER - STRICTLY ADMIN ONLY */}
            {isAdmin && (
                <div className="glass-panel p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 mb-8 animate-fade-in">
                     <div className="flex items-center justify-between mb-8">
                         <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <Laptop className="h-7 w-7 text-blue-600" />
                            Admin Control Center
                         </h3>
                         <span className="px-5 py-2 bg-green-100/80 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200">System Live</span>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Link to="/crm/admin" className="flex items-center justify-between p-6 bg-slate-50/50 hover:bg-white/60 rounded-[2rem] transition-colors border border-transparent hover:border-white/50 group">
                            <span className="font-bold text-slate-700 text-lg group-hover:text-blue-700 transition-colors">Manage Users & Roles</span>
                            <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform"><ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600" /></div>
                        </Link>
                        <Link to="/crm/leads" className="flex items-center justify-between p-6 bg-slate-50/50 hover:bg-white/60 rounded-[2rem] transition-colors border border-transparent hover:border-white/50 group">
                            <span className="font-bold text-slate-700 text-lg group-hover:text-blue-700 transition-colors">Lead Assignment Pool</span>
                            <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform"><ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600" /></div>
                        </Link>
                    </div>
                </div>
            )}

            {/* 3. MAIN DASHBOARD CONTENT */}
            {!isAdmin && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                     {/* Production Graph */}
                     <div className="lg:col-span-2 glass-panel p-10 rounded-[3rem] flex flex-col shadow-xl shadow-slate-200/50 relative">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 flex-shrink-0 gap-4">
                            <h3 className="text-2xl font-bold text-slate-800">My Production Metrics</h3>
                            {graphTabs.length > 1 && (
                                <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full no-scrollbar">
                                    {graphTabs.map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveGraphTab(tab)}
                                            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeGraphTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* FIX: Recharts Warning - Use fixed pixel height on wrapper and container */}
                        <div className="flex-1 w-full min-w-0" style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height={350}>
                                <AreaChart data={graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} tickFormatter={(value) => `$${value/1000}k`} />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Production']}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                     </div>

                     {/* Right Sidebar - Dynamic per role */}
                     <div className="space-y-6">
                        {/* Quick Actions (Advisor/Manager only) */}
                        {quickActions.length > 0 && (
                            <div className="glass-panel p-8 rounded-[3rem] shadow-lg shadow-slate-200/50">
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Quick Actions</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {quickActions.map((action, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={action.action}
                                            className="flex flex-col items-center justify-center p-4 bg-white hover:bg-blue-50 rounded-[2rem] border border-slate-100 transition-all group"
                                        >
                                            <div className={`p-3 rounded-2xl ${action.bg} ${action.color} group-hover:scale-110 transition-transform mb-3`}>
                                                <action.icon className="h-6 w-6" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Alerts / Notifications */}
                        <div className="glass-panel p-8 rounded-[3rem] shadow-lg shadow-slate-200/50">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Team Feed</h4>
                                <Bell className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="space-y-4">
                                {leads.slice(0, 3).map(lead => (
                                    <div key={lead.id} className="flex gap-4 p-4 hover:bg-white/60 rounded-2xl transition-colors cursor-pointer group">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <Users className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{lead.name}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{lead.interest} • {new Date(lead.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                     </div>
                </div>
            )}

            {/* Modals */}
            {isQuoteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-fade-in">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl p-10 relative border border-slate-200 animate-slide-up">
                        <button onClick={() => setIsQuoteModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                        <h3 className="text-3xl font-black text-[#0B2240] mb-2 flex items-center gap-3">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><FileText className="h-6 w-6" /></div>
                            Life Quote Entry
                        </h3>
                        <p className="text-slate-500 mb-8 font-medium">Quickly add a manual quote to the pipeline.</p>
                        <form onSubmit={handleQuoteSubmit} className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Client Name</label>
                                <input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none" value={quoteForm.name || ''} onChange={e => setQuoteForm({...quoteForm, name: e.target.value})} placeholder="Full Name" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Email</label>
                                <input type="email" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none" value={quoteForm.email || ''} onChange={e => setQuoteForm({...quoteForm, email: e.target.value})} placeholder="jane@example.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Phone</label>
                                <input type="tel" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none" value={quoteForm.phone || ''} onChange={e => setQuoteForm({...quoteForm, phone: e.target.value})} placeholder="(555) 555-5555" />
                            </div>
                            <div className="col-span-2 pt-4">
                                <button type="submit" className="w-full bg-[#0B2240] text-white py-5 rounded-full font-black shadow-xl shadow-blue-900/20 hover:bg-blue-900 transition-all transform active:scale-95">Create Quote Lead</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
