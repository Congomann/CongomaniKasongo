
import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { UserRole } from '../../types';
import { Copy, Check, Save, Upload, Download, Mail, Phone, Globe, MapPin, X, PenTool } from 'lucide-react';

type Tab = 'Personal' | 'Contact' | 'Social' | 'Legal' | 'Calendar' | 'Assets' | 'Layout';

export const EmailSignature: React.FC = () => {
  const { allUsers, companySettings, updateUser } = useData();
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<Tab>('Personal');
  const [copied, setCopied] = useState(false);
  const signatureRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable fields state
  const [editForm, setEditForm] = useState<{
      firstName: string;
      lastName: string;
      title: string;
      companyName: string;
      email: string;
      phone: string;
      website: string;
      address: string;
      calendarUrl: string;
      avatar: string;
      showAvatar: boolean;
      showLogo: boolean;
      legalText: string;
  }>({
      firstName: '',
      lastName: '',
      title: '',
      companyName: 'New Holland Financial Group',
      email: '',
      phone: '',
      website: 'www.newhollandfinancial.com',
      address: '',
      calendarUrl: '',
      avatar: '',
      showAvatar: true,
      showLogo: true,
      legalText: "Securities offered through New Holland Financial Group. Investment advisory services offered through NHFG Investment Advisors.\n\nConfidential: Intended only for the named recipient."
  });

  // Filter for advisors
  const advisors = allUsers.filter(u => u.role === UserRole.ADVISOR);

  // Default selected advisor
  useEffect(() => {
    if (advisors.length > 0 && !selectedAdvisorId) {
      setSelectedAdvisorId(advisors[0].id);
    }
  }, [advisors, selectedAdvisorId]);

  // Update form when advisor changes
  useEffect(() => {
      const adv = allUsers.find(u => u.id === selectedAdvisorId);
      if (adv) {
          const nameParts = adv.name.split(' ');
          const first = nameParts[0];
          const last = nameParts.slice(1).join(' ');

          setEditForm(prev => ({
              ...prev,
              firstName: first || '',
              lastName: last || '',
              title: adv.title || `${adv.category} Advisor`,
              email: adv.email,
              phone: adv.phone || companySettings.phone,
              address: companySettings.address + ', ' + companySettings.city + ', ' + companySettings.state + ' ' + companySettings.zip,
              calendarUrl: adv.calendarUrl || '',
              avatar: adv.avatar || '',
              companyName: 'New Holland Financial Group'
          }));
      }
  }, [selectedAdvisorId, allUsers, companySettings]);

  const handleInputChange = (field: string, value: any) => {
      setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setEditForm(prev => ({ ...prev, avatar: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSaveChanges = () => {
      if (selectedAdvisorId) {
          updateUser(selectedAdvisorId, {
              name: `${editForm.firstName} ${editForm.lastName}`,
              title: editForm.title,
              email: editForm.email,
              phone: editForm.phone,
              calendarUrl: editForm.calendarUrl,
              avatar: editForm.avatar
          });
          alert("Advisor profile updated successfully!");
      }
  };

  const handleCopy = () => {
    if (signatureRef.current) {
      const range = document.createRange();
      range.selectNode(signatureRef.current);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      document.execCommand('copy');
      window.getSelection()?.removeAllRanges();
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
      if (!signatureRef.current) return;
      const html = signatureRef.current.innerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${editForm.firstName}_${editForm.lastName}_Signature.html`;
      a.click();
      URL.revokeObjectURL(url);
  };

  if (!selectedAdvisorId) return null;

  const cleanPhone = editForm.phone.replace(/\D/g, '');
  const tabs: Tab[] = ['Personal', 'Contact', 'Social', 'Legal', 'Calendar', 'Assets', 'Layout'];
  
  // Apple iOS 26 Aesthetic Colors & Styles
  const STYLES = {
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      colors: {
          darkBlue: '#0B2240',
          blue: '#2563EB',
          textDark: '#111827',
          textGray: '#6B7280',
          border: '#E5E7EB',
          bgGray: '#F9FAFB',
          gold: '#FBBF24'
      }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2240]">Email Signature Generator</h1>
          <p className="text-slate-500">Apple iOS 26 / macOS Aesthetic</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-full border border-slate-200 shadow-sm">
            <span className="pl-4 text-xs font-bold text-slate-400 uppercase">Advisor:</span>
            <select 
                className="bg-slate-50 border-none rounded-full px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                value={selectedAdvisorId}
                onChange={(e) => setSelectedAdvisorId(e.target.value)}
            >
                {advisors.map(adv => (
                    <option key={adv.id} value={adv.id}>{adv.name}</option>
                ))}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Editor Side */}
        <div className="xl:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
                <div className="flex overflow-x-auto border-b border-slate-100 p-2 bg-slate-50/50 no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-6 flex-grow">
                    {activeTab === 'Personal' && (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.title} onChange={(e) => handleInputChange('title', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'Contact' && (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Website</label>
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.website} onChange={(e) => handleInputChange('website', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                                <textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={2} value={editForm.address} onChange={(e) => handleInputChange('address', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'Social' && (
                        <div className="space-y-4 animate-fade-in">
                            <p className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-2xl">Social links are pulled from the Advisor's Profile Settings. Please update them there.</p>
                        </div>
                    )}

                    {activeTab === 'Legal' && (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Legal Disclaimer</label>
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                                    rows={6} 
                                    value={editForm.legalText} 
                                    onChange={(e) => handleInputChange('legalText', e.target.value)} 
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                <PenTool className="h-3 w-3"/> You have permission to edit this text.
                            </p>
                        </div>
                    )}

                    {activeTab === 'Calendar' && (
                        <div className="space-y-4 animate-fade-in">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Calendar URL</label>
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.calendarUrl} onChange={(e) => handleInputChange('calendarUrl', e.target.value)} placeholder="https://calendly.com/..." />
                        </div>
                    )}

                    {activeTab === 'Assets' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-slate-100 overflow-hidden border border-slate-200 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    {editForm.avatar ? <img src={editForm.avatar} className="w-full h-full object-cover" alt="avatar" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{editForm.firstName[0]}</div>}
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload className="h-5 w-5 text-white" /></div>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[10px] bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-full hover:bg-blue-100">Change Photo</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Layout' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                                <span className="text-sm font-bold text-slate-700">Show Avatar</span>
                                <input type="checkbox" checked={editForm.showAvatar} onChange={(e) => handleInputChange('showAvatar', e.target.checked)} className="accent-blue-600 h-4 w-4" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                                <span className="text-sm font-bold text-slate-700">Show Logo</span>
                                <input type="checkbox" checked={editForm.showLogo} onChange={(e) => handleInputChange('showLogo', e.target.checked)} className="accent-blue-600 h-4 w-4" />
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="p-6 bg-slate-50 border-t border-slate-200">
                    <button onClick={handleSaveChanges} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0B2240] text-white rounded-2xl font-bold text-sm hover:bg-blue-900 transition-colors shadow-lg">
                        <Save className="h-4 w-4" /> Save Advisor Data
                    </button>
                </div>
            </div>
        </div>

        {/* Preview Side */}
        <div className="xl:col-span-8 flex flex-col h-full min-h-[600px]">
            <div className="bg-[#F5F5F7] p-0 md:p-12 rounded-[3rem] border border-slate-200 shadow-inner flex flex-col items-center justify-center flex-grow overflow-hidden relative">
                
                <div className="w-full flex-grow flex items-center justify-center">
                    {/* PREVIEW CONTAINER - NOW END TO END WIDTH WITHOUT MAX-WIDTH */}
                    <div 
                        ref={signatureRef}
                        style={{ 
                            width: '100%', 
                            fontFamily: STYLES.fontFamily,
                            color: STYLES.colors.textDark,
                            fontSize: '14px',
                            lineHeight: '1.4'
                        }}
                    >
                        {/* The Horizontal Footer Bar Signature - Fills Entire Width */}
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{ 
                            backgroundColor: '#ffffff',
                            borderRadius: '0', 
                            border: `1px solid ${STYLES.colors.border}`,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            borderCollapse: 'separate',
                            overflow: 'hidden',
                            margin: '0'
                        }}>
                            {/* Company Branding - Middle and Fixed */}
                            <tr>
                                <td height="120" style={{ 
                                    backgroundColor: STYLES.colors.darkBlue, 
                                    padding: '20px 60px',
                                    verticalAlign: 'middle',
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ position: 'relative', zIndex: 10, display: 'inline-flex', alignItems: 'center', gap: '24px' }}>
                                        <div style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                                            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
                                                <path d="M50 0L100 40V100H0V40L50 0Z" fill={STYLES.colors.gold}/>
                                            </svg>
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <span style={{ display: 'block', fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.8px', lineHeight: '1' }}>New Holland</span>
                                            <span style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#9ca3af', letterSpacing: '5px', textTransform: 'uppercase', marginTop: '6px' }}>FINANCIAL GROUP</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>

                            {/* Info Body - True Horizontal Spread across the whole viewport footer width */}
                            <tr>
                                <td style={{ padding: '40px 60px', backgroundColor: '#ffffff' }}>
                                    <table width="100%" cellPadding="0" cellSpacing="0">
                                        <tr>
                                            {/* Avatar Area */}
                                            {editForm.showAvatar && (
                                                <td width="120" valign="middle" style={{ paddingRight: '40px' }}>
                                                    <img
                                                        src={editForm.avatar || `https://ui-avatars.com/api/?name=${editForm.firstName}+${editForm.lastName}&background=f3f4f6&color=6b7280`}
                                                        alt=""
                                                        width="100"
                                                        height="100"
                                                        style={{ 
                                                            borderRadius: '16px', 
                                                            objectFit: 'cover', 
                                                            display: 'block',
                                                            border: `1px solid ${STYLES.colors.border}`,
                                                            boxShadow: '0 8px 16px rgba(0,0,0,0.05)'
                                                        }}
                                                    />
                                                </td>
                                            )}
                                            {/* Name & Title Area */}
                                            <td valign="middle" style={{ paddingRight: '60px', borderRight: `2px solid ${STYLES.colors.border}` }}>
                                                <div style={{ fontSize: '30px', fontWeight: '900', color: STYLES.colors.textDark, letterSpacing: '-0.8px', lineHeight: '1.1', marginBottom: '4px' }}>
                                                    {editForm.firstName} {editForm.lastName}
                                                </div>
                                                <div style={{ fontSize: '16px', fontWeight: '800', color: STYLES.colors.blue, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                    {editForm.title}
                                                </div>
                                            </td>
                                            {/* Contact Grid - Expansive Horizontal */}
                                            <td valign="middle" style={{ paddingLeft: '60px' }}>
                                                <table cellPadding="0" cellSpacing="0" width="100%">
                                                    <tr>
                                                        <td width="50%" style={{ paddingBottom: '12px', fontSize: '15px' }}>
                                                            <Mail size={16} color={STYLES.colors.blue} style={{ verticalAlign: 'middle', marginRight: '10px' }} strokeWidth={2.5}/>
                                                            <a href={`mailto:${editForm.email}`} style={{ color: STYLES.colors.textGray, textDecoration: 'none', fontWeight: '700' }}>{editForm.email}</a>
                                                        </td>
                                                        <td width="50%" style={{ paddingBottom: '12px', fontSize: '15px' }}>
                                                            <Phone size={16} color={STYLES.colors.blue} style={{ verticalAlign: 'middle', marginRight: '10px' }} strokeWidth={2.5}/>
                                                            <a href={`tel:${cleanPhone}`} style={{ color: STYLES.colors.textGray, textDecoration: 'none', fontWeight: '700' }}>{editForm.phone}</a>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ fontSize: '15px' }}>
                                                            <Globe size={16} color={STYLES.colors.blue} style={{ verticalAlign: 'middle', marginRight: '10px' }} strokeWidth={2.5}/>
                                                            <a href={`https://${editForm.website.replace(/^https?:\/\//, '')}`} style={{ color: STYLES.colors.textGray, textDecoration: 'none', fontWeight: '700' }}>{editForm.website}</a>
                                                        </td>
                                                        <td style={{ fontSize: '14px' }}>
                                                            <MapPin size={16} color={STYLES.colors.blue} style={{ verticalAlign: 'middle', marginRight: '10px' }} strokeWidth={2.5}/>
                                                            <span style={{ color: STYLES.colors.textGray, fontWeight: '600' }}>{editForm.address}</span>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            {/* Legal Disclaimer Footer - Spans Edge-to-Edge */}
                            <tr>
                                <td style={{ backgroundColor: STYLES.colors.bgGray, padding: '20px 60px', borderTop: `1px solid ${STYLES.colors.border}` }}>
                                    <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.6', textAlign: 'center', whiteSpace: 'pre-line', margin: '0 auto' }}>
                                        {editForm.legalText}
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>

                {/* ACTION BUTTONS - FIXED FLOW BELOW SIGNATURE, AS PART OF THE FOOTER AREA OF THE PAGE */}
                <div className="w-full bg-white/50 backdrop-blur-md border-t border-slate-200 py-10 flex gap-6 justify-center">
                    <button onClick={handleCopy} className="flex-1 max-w-[260px] flex items-center justify-center gap-3 px-10 py-5 bg-white border border-slate-200 text-slate-800 rounded-3xl font-black shadow-xl hover:bg-slate-50 transition-all hover:scale-105 active:scale-95">
                        {copied ? <Check className="h-6 w-6 text-green-600" /> : <Copy className="h-6 w-6" />} 
                        <span className="text-base">{copied ? 'Copied!' : 'Copy HTML Signature'}</span>
                    </button>
                    <button onClick={handleDownload} className="flex-1 max-w-[260px] flex items-center justify-center gap-3 px-10 py-5 bg-[#0A62A7] text-white rounded-3xl font-black shadow-xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95">
                        <Download className="h-6 w-6" /> 
                        <span className="text-base">Download HTML File</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
