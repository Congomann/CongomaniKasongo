
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Lead, Client, CallbackRequest, DashboardMetrics, ProductType, LeadStatus, User, UserRole, Notification, Commission, CalendarEvent, Email, Colleague, ChatMessage, AdvisorCategory, CompanySettings, Resource, Carrier, AdvisorAssignment, Testimonial, Application, ApplicationStatus, PerformanceTargets, LifeDetails, ChatAttachment, JobApplication, PropertyListing, EscrowTransaction, ClientPortfolio, ComplianceDocument, AdvisoryFee } from '../types';

interface DataContextType {
  user: User | null;
  allUsers: User[]; // For Admin Panel & Advisor Directory
  leads: Lead[];
  clients: Client[];
  callbacks: CallbackRequest[];
  metrics: DashboardMetrics;
  notifications: Notification[];
  commissions: Commission[];
  events: CalendarEvent[];
  emails: Email[];
  // Chat
  colleagues: Colleague[];
  chatMessages: ChatMessage[];
  
  // Carrier Management
  availableCarriers: Carrier[];
  advisorAssignments: AdvisorAssignment[];
  assignCarriers: (advisorIds: string[], carriers: Carrier[]) => void;
  getAdvisorAssignments: (advisorId: string) => AdvisorAssignment[];

  // Website Settings
  companySettings: CompanySettings;
  resources: Resource[];

  // Resource Interactions
  likeResource: (id: string) => void;
  dislikeResource: (id: string) => void;
  shareResource: (id: string) => void;
  addResourceComment: (id: string, text: string, userName: string) => void;
  addResource: (resource: Partial<Resource>) => void;
  deleteResource: (id: string) => void;

  // Testimonials
  testimonials: Testimonial[];
  addTestimonial: (testimonial: Omit<Testimonial, 'id' | 'status' | 'date'>) => void;
  approveTestimonial: (id: string) => void;
  deleteTestimonial: (id: string) => void;
  submitTestimonialEdit: (id: string, edits: Partial<Testimonial>) => void;
  approveTestimonialEdit: (id: string) => void;
  rejectTestimonialEdit: (id: string) => void;

  // App & Workflow
  login: (email: string) => void;
  logout: () => void;
  addCallback: (request: Partial<CallbackRequest>) => void;
  addLead: (lead: Partial<Lead>, assignTo?: string) => void;
  updateLeadStatus: (id: string, status: LeadStatus, analysis?: string) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  assignLeads: (leadIds: string[], advisorId: string, priority?: string, notes?: string) => void;
  handleAdvisorLeadAction: (leadId: string, action: 'accept' | 'decline', reason?: string) => void;
  
  updateClient: (id: string, data: Partial<Client>) => void;
  
  // Events & Calendar
  addEvent: (event: Partial<CalendarEvent>) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  isGoogleConnected: boolean;
  toggleGoogleSync: () => void;
  
  // Chat
  sendChatMessage: (receiverId: string, text: string, attachment?: ChatAttachment) => void;
  
  // Admin User Mgmt
  addAdvisor: (user: User) => void;
  deleteAdvisor: (id: string) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  restoreUser: (id: string) => void;
  permanentlyDeleteUser: (id: string) => void;
  
  // Company Settings
  updateCompanySettings: (settings: CompanySettings) => void;
  
  // Job Applications
  jobApplications: JobApplication[];
  submitJobApplication: (application: Omit<JobApplication, 'id' | 'status' | 'date'>) => void;
  updateJobApplicationStatus: (id: string, status: 'Approved' | 'Rejected' | 'Pending', config?: any) => void;
  
  // New CRM Modules
  applications: Application[];
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  
  performanceTargets: PerformanceTargets;
  
  properties: PropertyListing[];
  transactions: EscrowTransaction[];
  updateTransactionStatus: (id: string, status: string, stage?: string) => void;
  
  portfolios: ClientPortfolio[];
  complianceDocs: ComplianceDocument[];
  addComplianceDoc: (doc: Partial<ComplianceDocument>) => void;
  
  advisoryFees: AdvisoryFee[];
  updateFeeStatus: (id: string, status: 'Paid' | 'Overdue') => void;
  
  // Notifications
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// --- MOCK DATA ---

const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@nhfg.com', role: UserRole.ADMIN, category: AdvisorCategory.ADMIN },
  { id: '2', name: 'John Advisor', email: 'insurance@nhfg.com', role: UserRole.ADVISOR, category: AdvisorCategory.INSURANCE, productsSold: [ProductType.LIFE, ProductType.ANNUITY], micrositeEnabled: true, phone: '(555) 111-2222', bio: 'Experienced in Life Insurance.', calendarUrl: 'https://calendly.com/john-advisor' },
  { id: '3', name: 'Sarah RealEstate', email: 'realestate@nhfg.com', role: UserRole.ADVISOR, category: AdvisorCategory.REAL_ESTATE, productsSold: [ProductType.REAL_ESTATE], micrositeEnabled: true },
  { id: '4', name: 'Mike Securities', email: 'securities@nhfg.com', role: UserRole.ADVISOR, category: AdvisorCategory.SECURITIES, productsSold: [ProductType.SECURITIES, ProductType.INVESTMENT], micrositeEnabled: true },
  { id: '5', name: 'Michael Manager', email: 'manager@nhfg.com', role: UserRole.MANAGER, category: AdvisorCategory.INSURANCE, productsSold: [ProductType.LIFE, ProductType.ANNUITY, ProductType.BUSINESS] },
  { id: '6', name: 'Sarah SubAdmin', email: 'subadmin@nhfg.com', role: UserRole.SUB_ADMIN, category: AdvisorCategory.ADMIN },
  { id: 'client-1', name: 'Jane Doe', email: 'jane@client.com', role: UserRole.CLIENT, category: AdvisorCategory.ADMIN }, 
];

const MOCK_LEADS: Lead[] = [
  { id: 'l1', name: 'Alice Smith', email: 'alice@test.com', phone: '555-0101', interest: ProductType.LIFE, message: 'Interested in Term Life.', date: new Date().toISOString(), status: LeadStatus.NEW, score: 85, qualification: 'Warm' },
  { id: 'l2', name: 'Bob Jones', email: 'bob@test.com', phone: '555-0102', interest: ProductType.REAL_ESTATE, message: 'Looking to buy a home.', date: new Date().toISOString(), status: LeadStatus.CONTACTED, score: 92, qualification: 'Hot', assignedTo: '3' },
];

const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Charlie Day', policyNumber: 'POL-12345', premium: 1200, product: ProductType.LIFE, renewalDate: '2024-12-01' },
  { id: 'c2', name: 'Dana White', policyNumber: 'RE-99887', premium: 5000, product: ProductType.REAL_ESTATE, renewalDate: '2024-06-15' },
];

const MOCK_RESOURCES: Resource[] = [
  { id: 'r1', title: 'Life Insurance Guide 101', type: 'PDF', url: '#', dateAdded: new Date().toISOString(), likes: 12, dislikes: 0, shares: 5, comments: [] },
  { id: 'r2', title: 'Market Outlook 2024', type: 'Video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', dateAdded: new Date().toISOString(), likes: 25, dislikes: 1, shares: 10, comments: [] },
];

const MOCK_APPLICATIONS: Application[] = [
    { id: 'app1', leadId: 'l3', clientName: 'Eve Polastri', carrier: 'Prudential', policyNumber: 'PENDING-001', status: ApplicationStatus.UNDERWRITING, premium: 2400 }
] as any;

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  
  // New CRM Data
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [portfolios, setPortfolios] = useState<ClientPortfolio[]>([]);
  const [complianceDocs, setComplianceDocs] = useState<ComplianceDocument[]>([]);
  const [advisoryFees, setAdvisoryFees] = useState<AdvisoryFee[]>([]);
  
  // Settings
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
      phone: '(800) 555-0199',
      email: 'contact@newholland.com',
      address: '123 Finance Way',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      heroBackgroundType: 'image',
      heroBackgroundUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070',
      heroTitle: 'Securing Your Future',
      heroSubtitle: 'Comprehensive financial solutions for every stage of life.'
  });

  const metrics: DashboardMetrics = {
      totalRevenue: clients.reduce((acc, c) => acc + c.premium, 0),
      activeClients: clients.length,
      pendingLeads: leads.length,
      monthlyPerformance: [
          { month: 'Jan', revenue: 12000, leads: 5 },
          { month: 'Feb', revenue: 19000, leads: 8 },
          { month: 'Mar', revenue: 15000, leads: 12 },
          { month: 'Apr', revenue: 22000, leads: 15 },
      ],
      totalCommission: 8500 // Mock
  };

  const performanceTargets: PerformanceTargets = {
      monthly: 50000,
      quarterly: 150000,
      presidentsClub: 500000
  };

  // --- Auth ---
  const login = (email: string) => {
      const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (foundUser) {
          setUser(foundUser);
      } else {
          // Fallback or demo create
          alert('User not found. Logging in as Demo Admin.');
          setUser(MOCK_USERS[0]);
      }
  };

  const logout = () => setUser(null);

  // --- User Management ---
  const addAdvisor = (newUser: User) => {
      setAllUsers(prev => [...prev, { ...newUser, id: Math.random().toString(36).substr(2, 9) }]);
  };
  const deleteAdvisor = (id: string) => {
      setAllUsers(prev => prev.map(u => u.id === id ? { ...u, deletedAt: new Date().toISOString() } : u));
  };
  const updateUser = (id: string, data: Partial<User>) => {
      setAllUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
      if (user && user.id === id) setUser(prev => prev ? { ...prev, ...data } : null);
  };
  const restoreUser = (id: string) => {
      setAllUsers(prev => prev.map(u => u.id === id ? { ...u, deletedAt: undefined } : u));
  };
  const permanentlyDeleteUser = (id: string) => {
      setAllUsers(prev => prev.filter(u => u.id !== id));
  };

  // --- Lead Management ---
  const addLead = (lead: Partial<Lead>, assignTo?: string) => {
      const newLead: Lead = {
          id: Math.random().toString(36).substr(2, 9),
          name: lead.name || 'Unknown',
          email: lead.email || '',
          phone: lead.phone || '',
          interest: lead.interest || ProductType.LIFE,
          message: lead.message || '',
          date: new Date().toISOString(),
          status: LeadStatus.NEW,
          score: 50,
          qualification: 'Warm',
          assignedTo: assignTo,
          ...lead
      };
      setLeads(prev => [...prev, newLead]);
      // Notify
      if (assignTo) {
          addNotification(assignTo, 'New Lead Assigned', `You have been assigned lead: ${newLead.name}`, 'lead', newLead.id);
      }
  };

  const updateLeadStatus = (id: string, status: LeadStatus, analysis?: string) => {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status, aiAnalysis: analysis || l.aiAnalysis } : l));
  };

  const updateLead = (id: string, data: Partial<Lead>) => {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
  };

  const assignLeads = (leadIds: string[], advisorId: string, priority?: string, notes?: string) => {
      setLeads(prev => prev.map(l => leadIds.includes(l.id) ? { ...l, assignedTo: advisorId, priority: priority as any, notes: notes ? (l.notes + '\n' + notes) : l.notes, status: LeadStatus.ASSIGNED } : l));
      addNotification(advisorId, 'Leads Assigned', `You have been assigned ${leadIds.length} new leads.`, 'lead');
  };

  const handleAdvisorLeadAction = (leadId: string, action: 'accept' | 'decline', reason?: string) => {
      if (action === 'accept') {
          updateLeadStatus(leadId, LeadStatus.CONTACTED); // Or some active status
      } else {
          // Decline Logic: Unassign and set to Lost or back to Pool?
          // For now, set to unassigned
          setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignedTo: undefined, notes: l.notes + `\nDeclined by advisor: ${reason}` } : l));
      }
  };

  // --- Client Management ---
  const updateClient = (id: string, data: Partial<Client>) => {
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  // --- Callbacks ---
  const addCallback = (request: Partial<CallbackRequest>) => {
      setCallbacks(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), resolved: false, name: request.name || '', phone: request.phone || '', timeRequested: request.timeRequested || '' }]);
  };

  // --- Notifications ---
  const addNotification = (userId: string, title: string, message: string, type: any, relatedId?: string) => {
      // In a real app, this would be a push to backend. Here we just update state if current user matches or for demo purposes
      if (user && user.id === userId) {
          setNotifications(prev => [{ id: Math.random().toString(), title, message, type: 'info', timestamp: new Date(), read: false, relatedId, resourceType: type }, ...prev]);
      }
  };

  const markNotificationRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
      setNotifications([]);
  };

  // --- Resources ---
  const likeResource = (id: string) => {
      setResources(prev => prev.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r));
  };
  const dislikeResource = (id: string) => {
      setResources(prev => prev.map(r => r.id === id ? { ...r, dislikes: r.dislikes + 1 } : r));
  };
  const shareResource = (id: string) => {
      setResources(prev => prev.map(r => r.id === id ? { ...r, shares: r.shares + 1 } : r));
  };
  const addResourceComment = (id: string, text: string, userName: string) => {
      setResources(prev => prev.map(r => r.id === id ? { ...r, comments: [...r.comments, { id: Math.random().toString(), text, user: userName, date: new Date().toISOString() }] } : r));
  };
  const addResource = (res: Partial<Resource>) => {
      setResources(prev => [...prev, { ...res, id: Math.random().toString(), dateAdded: new Date().toISOString(), likes: 0, dislikes: 0, shares: 0, comments: [] } as Resource]);
  };
  const deleteResource = (id: string) => {
      setResources(prev => prev.filter(r => r.id !== id));
  };

  // --- Testimonials ---
  const addTestimonial = (t: any) => {
      setTestimonials(prev => [...prev, { ...t, id: Math.random().toString(), status: 'pending', date: new Date().toISOString() }]);
  };
  const approveTestimonial = (id: string) => {
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
  };
  const deleteTestimonial = (id: string) => {
      setTestimonials(prev => prev.filter(t => t.id !== id));
  };
  const submitTestimonialEdit = (id: string, edits: Partial<Testimonial>) => {
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: 'pending_edit', editedClientName: edits.clientName, editedRating: edits.rating, editedReviewText: edits.reviewText } : t));
  };
  const approveTestimonialEdit = (id: string) => {
      setTestimonials(prev => prev.map(t => {
          if (t.id === id) {
              return { 
                  ...t, 
                  clientName: t.editedClientName || t.clientName, 
                  rating: t.editedRating || t.rating, 
                  reviewText: t.editedReviewText || t.reviewText, 
                  status: 'approved',
                  editedClientName: undefined, editedRating: undefined, editedReviewText: undefined
              };
          }
          return t;
      }));
  };
  const rejectTestimonialEdit = (id: string) => {
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: 'approved', editedClientName: undefined, editedRating: undefined, editedReviewText: undefined } : t));
  };

  // --- Job Applications ---
  const submitJobApplication = (app: any) => {
      setJobApplications(prev => [...prev, { ...app, id: Math.random().toString(), status: 'Pending', date: new Date().toISOString() }]);
  };
  const updateJobApplicationStatus = (id: string, status: any, config?: any) => {
      setJobApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      if (status === 'Approved' && config) {
          // Auto create user from application
          const app = jobApplications.find(a => a.id === id);
          if (app) {
              addAdvisor({
                  id: Math.random().toString(),
                  name: app.fullName,
                  email: app.email,
                  phone: app.phone,
                  role: UserRole.ADVISOR,
                  category: AdvisorCategory.INSURANCE, // Default
                  productsSold: config.products,
                  contractLevel: config.contractLevel,
                  micrositeEnabled: false
              });
          }
      }
  };

  // --- Calendar ---
  const addEvent = (evt: Partial<CalendarEvent>) => {
      setEvents(prev => [...prev, { ...evt, id: Math.random().toString() } as CalendarEvent]);
  };
  const updateEvent = (evt: CalendarEvent) => {
      setEvents(prev => prev.map(e => e.id === evt.id ? evt : e));
  };
  const deleteEvent = (id: string) => {
      setEvents(prev => prev.filter(e => e.id !== id));
  };
  const toggleGoogleSync = () => setIsGoogleConnected(prev => !prev);

  // --- Chat ---
  const sendChatMessage = (receiverId: string, text: string, attachment?: ChatAttachment) => {
      console.log(`Sending to ${receiverId}: ${text}`, attachment);
      // In a real app, this would be a socket emit or API call
  };

  // --- Carriers ---
  const assignCarriers = (advisorIds: string[], carriers: Carrier[]) => {
      // Mock logic
      console.log('Assigned carriers', carriers, 'to', advisorIds);
  };
  const getAdvisorAssignments = (advisorId: string) => {
      // Mock return
      return [
          { id: '1', advisorId, carrierName: 'Prudential', category: 'Life', assignedBy: 'Admin', assignedAt: new Date().toISOString() },
          { id: '2', advisorId, carrierName: 'Allstate', category: 'Auto', assignedBy: 'Admin', assignedAt: new Date().toISOString() }
      ];
  };

  // --- Misc Updates ---
  const updateCompanySettings = (settings: CompanySettings) => setCompanySettings(settings);
  const updateApplicationStatus = (id: string, status: ApplicationStatus) => setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  
  // --- New CRM Features ---
  const updateTransactionStatus = (id: string, status: string, stage?: string) => {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: status as any, stage: stage as any || t.stage } : t));
  };
  const updateFeeStatus = (id: string, status: 'Paid' | 'Overdue') => {
      setAdvisoryFees(prev => prev.map(f => f.id === id ? { ...f, status } : f));
  };
  const addComplianceDoc = (doc: Partial<ComplianceDocument>) => {
      setComplianceDocs(prev => [...prev, { ...doc, id: Math.random().toString(), uploadDate: new Date().toISOString(), status: 'Pending Review' } as ComplianceDocument]);
  };

  return (
    <DataContext.Provider value={{
      user,
      allUsers,
      leads,
      clients,
      callbacks,
      metrics,
      notifications,
      commissions: [], // Mock empty
      events,
      emails: [], // Mock empty
      colleagues: allUsers.map(u => ({ id: u.id, name: u.name, role: u.role, status: 'online', avatar: u.avatar || '' })),
      chatMessages: [], // Mock empty
      availableCarriers: [{ name: 'Prudential', category: 'LIFE INSURANCE' }, { name: 'Allstate', category: 'AUTO / COMMERCIAL' }], // Mock
      advisorAssignments: [],
      companySettings,
      resources,
      likeResource,
      dislikeResource,
      shareResource,
      addResourceComment,
      testimonials,
      addTestimonial,
      approveTestimonial,
      deleteTestimonial,
      submitTestimonialEdit,
      approveTestimonialEdit,
      rejectTestimonialEdit,
      login,
      logout,
      addAdvisor,
      deleteAdvisor,
      updateUser,
      restoreUser,
      permanentlyDeleteUser,
      addLead,
      updateLeadStatus,
      updateLead,
      assignLeads,
      handleAdvisorLeadAction,
      updateClient,
      addCallback,
      assignCarriers,
      getAdvisorAssignments,
      addResource,
      deleteResource,
      updateCompanySettings,
      markNotificationRead,
      clearNotifications,
      sendChatMessage,
      addEvent,
      updateEvent,
      deleteEvent,
      isGoogleConnected,
      toggleGoogleSync,
      submitJobApplication,
      updateJobApplicationStatus,
      jobApplications,
      applications,
      updateApplicationStatus,
      performanceTargets,
      properties,
      transactions,
      updateTransactionStatus,
      portfolios,
      complianceDocs,
      addComplianceDoc,
      advisoryFees,
      updateFeeStatus
    }}>
      {children}
    </DataContext.Provider>
  );
};
