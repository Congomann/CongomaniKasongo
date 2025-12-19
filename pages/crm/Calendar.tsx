
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, CheckCircle2, X, Trash2, Edit2, AlertCircle, Video, RefreshCw, Coffee } from 'lucide-react';
import { CalendarEvent } from '../../types';

export const Calendar: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent, isGoogleConnected, toggleGoogleSync } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    date: string;
    endDate: string;
    time: string;
    type: 'meeting' | 'reminder' | 'task' | 'off-day';
    description?: string;
    hasGoogleMeet: boolean;
  }>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'meeting',
    description: '',
    hasGoogleMeet: false
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const today = new Date();

  // Calendar Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const formatTimeForInput = (timeStr: string) => {
    // Try to convert "2:00 PM" to "14:00" for input[type=time]
    try {
        if (timeStr === 'All Day') return '09:00';
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
            hours = '00';
        }
        if (modifier === 'PM') {
            hours = (parseInt(hours, 10) + 12).toString();
        }
        return `${hours.padStart(2, '0')}:${minutes}`;
    } catch (e) {
        return timeStr; // Fallback
    }
  };

  const handleOpenCreateModal = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setEditingId(null);
    setFormData({
        title: '',
        date: todayStr,
        endDate: todayStr,
        time: '09:00',
        type: 'meeting',
        description: '',
        hasGoogleMeet: true
    });
    setIsModalOpen(true);
  };

  const handleDateClick = (dateStr: string) => {
    setEditingId(null);
    setFormData({
        title: '',
        date: dateStr,
        endDate: dateStr,
        time: '09:00',
        type: 'meeting',
        description: '',
        hasGoogleMeet: false
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingId(event.id);
    setFormData({
        title: event.title,
        date: event.date,
        endDate: event.date, // Editing single event implies no range editing yet
        time: formatTimeForInput(event.time),
        type: event.type,
        description: event.description || '',
        hasGoogleMeet: !!event.hasGoogleMeet
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Range creation logic for 'off-day'
    if (!editingId && formData.type === 'off-day' && formData.endDate && formData.endDate > formData.date) {
        const start = new Date(formData.date);
        const end = new Date(formData.endDate);
        
        const loopDate = new Date(start);
        while (loopDate <= end) {
             const dateStr = loopDate.toISOString().split('T')[0];
             addEvent({
                title: formData.title || 'Off Duty',
                date: dateStr,
                time: 'All Day',
                type: 'off-day',
                description: formData.description,
                hasGoogleMeet: false
            });
            loopDate.setDate(loopDate.getDate() + 1);
        }
        setIsModalOpen(false);
        return;
    }

    // Standard Logic
    const [hours, minutes] = formData.time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const formattedTime = formData.type === 'off-day' ? 'All Day' : `${hour12}:${minutes} ${ampm}`;

    if (editingId) {
        updateEvent({
            id: editingId,
            title: formData.title,
            date: formData.date,
            time: formattedTime,
            type: formData.type,
            description: formData.description,
            hasGoogleMeet: formData.hasGoogleMeet
        });
    } else {
        addEvent({
            title: formData.title,
            date: formData.date,
            time: formattedTime,
            type: formData.type,
            description: formData.description,
            hasGoogleMeet: formData.hasGoogleMeet
        });
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (editingId) {
        if(window.confirm('Are you sure you want to delete this event?')) {
            deleteEvent(editingId);
            setIsModalOpen(false);
        }
    }
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
        if (!isGoogleConnected) toggleGoogleSync();
        setIsSyncing(false);
    }, 1500);
  };

  // Style helpers
  const getEventStyles = (type: string) => {
    switch(type) {
      case 'meeting': return 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200';
      case 'reminder': return 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200';
      case 'task': return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200';
      case 'off-day': return 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 opacity-75 bg-stripes-slate';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch(type) {
        case 'meeting': return <CalendarIcon className="h-3 w-3 mr-1.5" />;
        case 'reminder': return <AlertCircle className="h-3 w-3 mr-1.5" />;
        case 'task': return <CheckCircle2 className="h-3 w-3 mr-1.5" />;
        case 'off-day': return <Coffee className="h-3 w-3 mr-1.5" />;
        default: return <CalendarIcon className="h-3 w-3 mr-1.5" />;
    }
  };

  // Grouping events for sidebar
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const upcomingEvents = sortedEvents.filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)));

  const getRelativeLabel = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    if (eventDate.getTime() === todayDate.getTime()) return 'Today';
    if (eventDate.getTime() === tomorrowDate.getTime()) return 'Tomorrow';
    return null;
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-8">
      {/* Left Side - Main Calendar Grid */}
      <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-10 py-8 border-b border-slate-200">
          <div className="flex items-center gap-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{formatDate(currentDate)}</h2>
            <div className="flex items-center gap-2 bg-slate-50 rounded-2xl p-2 border border-slate-100">
              <button onClick={() => changeMonth(-1)} className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all">
                <ChevronLeft className="h-5 w-5 text-slate-600" />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-6 py-2 text-xs font-bold text-slate-600 hover:bg-white hover:shadow-md rounded-xl transition-all uppercase tracking-wide">
                Today
              </button>
              <button onClick={() => changeMonth(1)} className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all">
                <ChevronRight className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            <button 
              onClick={handleSync} 
              disabled={isSyncing}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 ml-4 transition-colors disabled:opacity-50 uppercase tracking-widest"
              title="Sync with Google Calendar"
            >
               <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
               {isGoogleConnected ? 'Synced' : 'Sync'}
            </button>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Event
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} className="py-5 text-center text-xs font-bold text-slate-400 tracking-widest">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
          {/* Empty cells for previous month */}
          {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => (
            <div key={`empty-${i}`} className="border-r border-b border-slate-100 bg-slate-50/30" />
          ))}

          {/* Days of current month */}
          {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);
            const isSelected = isToday(day);
            // Check if off-day exists
            const isOffDay = dayEvents.some(e => e.type === 'off-day');

            return (
              <div 
                key={day} 
                onClick={() => handleDateClick(dateStr)}
                className={`relative border-r border-b border-slate-100 p-4 min-h-[120px] hover:bg-slate-50 transition-colors group cursor-pointer ${isSelected ? 'bg-blue-50/40' : ''} ${isOffDay ? 'bg-stripes-gray' : ''}`}
              >
                <span 
                  className={`
                    inline-flex items-center justify-center w-9 h-9 text-sm font-bold rounded-full mb-3 transition-colors
                    ${isSelected ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-700 group-hover:bg-slate-200'}
                  `}
                >
                  {day}
                </span>
                
                {/* Event Indicators in Grid */}
                <div className="space-y-2">
                  {dayEvents.map(event => (
                    <div 
                        key={event.id} 
                        onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                        className={`flex items-center justify-between text-[11px] leading-tight truncate px-3 py-2 rounded-xl font-bold border cursor-pointer transition-all hover:scale-[1.02] shadow-sm ${getEventStyles(event.type)}`}
                        title={event.title}
                    >
                        <div className="flex items-center overflow-hidden">
                            {getEventIcon(event.type)}
                            <span className="truncate">{event.title}</span>
                        </div>
                        {event.hasGoogleMeet && event.type !== 'off-day' && <Video className="h-3 w-3 flex-shrink-0 ml-1 text-blue-600" />}
                    </div>
                  ))}
                  {isSelected && dayEvents.length === 0 && (
                    <div className="h-2 w-2 bg-blue-400 rounded-full mx-auto mt-6 opacity-50"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Side - Upcoming Events Sidebar */}
      <div className="w-full lg:w-[26rem] flex-shrink-0 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col overflow-hidden h-full">
        <div className="p-10 border-b border-slate-100 bg-slate-50">
          <h3 className="text-2xl font-bold text-slate-900">Upcoming</h3>
          <p className="text-sm text-slate-500 mt-2 font-medium">Agenda for next 7 days</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-5">
          {upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-slate-400">
                <CalendarIcon className="h-16 w-16 mb-4 opacity-10" />
                <p className="text-base font-medium">No upcoming events</p>
            </div>
          ) : (
            upcomingEvents.slice(0, 10).map((event) => {
              const relativeLabel = getRelativeLabel(event.date);
              const displayDate = new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

              return (
                <div 
                    key={event.id} 
                    onClick={() => handleEventClick(event)}
                    className={`p-6 rounded-[2rem] border cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group ${getEventStyles(event.type)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold leading-tight mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            {getEventIcon(event.type)}
                            {event.title}
                        </span>
                      </h4>
                      <div className="flex items-center text-xs font-semibold opacity-80 mb-4">
                        {relativeLabel ? (
                          <span className="font-black mr-2 uppercase tracking-wider text-[10px] bg-white/50 px-2 py-1 rounded-lg">{relativeLabel}</span>
                        ) : null}
                        <span className="ml-1">{displayDate}</span>
                      </div>
                      {event.type !== 'off-day' && (
                        <div className="flex items-center justify-between text-xs font-bold opacity-90">
                            <span className="flex items-center bg-white/40 px-3 py-1.5 rounded-xl"><Clock className="h-3.5 w-3.5 mr-2" /> {event.time}</span>
                            {event.hasGoogleMeet && (
                                <span className="flex items-center text-blue-700 font-black bg-white/60 px-3 py-1.5 rounded-xl shadow-sm">
                                    <Video className="h-3.5 w-3.5 mr-2" /> Meet
                                </span>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-fade-in">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                     {editingId ? <Edit2 className="h-5 w-5"/> : <Plus className="h-5 w-5"/> }
                </div>
                {editingId ? 'Edit Event' : 'Add New Event'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-3 hover:bg-slate-100 rounded-full">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-2 tracking-wider">Event Title</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-[2rem] px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium transition-all hover:bg-slate-50 focus:bg-white"
                  placeholder={formData.type === 'off-day' ? "e.g. Out of Office" : "e.g. Client Meeting"}
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-2 tracking-wider">Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded-[2rem] px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium transition-all hover:bg-slate-50 focus:bg-white"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value, endDate: e.target.value > formData.endDate ? e.target.value : formData.endDate})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-2 tracking-wider">Time</label>
                  <input 
                    type="time" 
                    required
                    disabled={formData.type === 'off-day'}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded-[2rem] px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400 font-medium transition-all hover:bg-slate-50 focus:bg-white"
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-2 tracking-wider">Event Type</label>
                <div className="grid grid-cols-4 gap-3">
                    {['meeting', 'reminder', 'task', 'off-day'].map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({...formData, type: type as any, time: type === 'off-day' ? '09:00' : formData.time})}
                            className={`
                                flex flex-col items-center justify-center py-4 rounded-[1.5rem] border text-[10px] font-bold uppercase tracking-wider transition-all
                                ${formData.type === type 
                                    ? (type === 'meeting' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm scale-105' : 
                                       type === 'reminder' ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm scale-105' : 
                                       type === 'task' ? 'bg-green-50 border-green-500 text-green-700 shadow-sm scale-105' :
                                       'bg-slate-200 border-slate-400 text-slate-700 shadow-sm scale-105')
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}
                            `}
                        >   
                            {type === 'meeting' && <CalendarIcon className="h-5 w-5 mb-2"/>}
                            {type === 'reminder' && <AlertCircle className="h-5 w-5 mb-2"/>}
                            {type === 'task' && <CheckCircle2 className="h-5 w-5 mb-2"/>}
                            {type === 'off-day' && <Coffee className="h-5 w-5 mb-2"/>}
                            <span>{type.replace('-', ' ')}</span>
                        </button>
                    ))}
                </div>
              </div>
              
              {/* Date Range Selector for Off-Day */}
              {!editingId && formData.type === 'off-day' && (
                 <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 animate-fade-in">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-2 tracking-wider">End Date (Inclusive)</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="date" 
                            required
                            min={formData.date}
                            className="w-full bg-white text-slate-900 border border-slate-200 rounded-[2rem] px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                            value={formData.endDate}
                            onChange={e => setFormData({...formData, endDate: e.target.value})}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-3 font-medium ml-2">
                        Marks all days from {formData.date} to {formData.endDate} as off.
                    </p>
                 </div>
              )}

              {formData.type !== 'off-day' && (
                <div className="flex items-center p-5 bg-blue-50 rounded-[2rem] border border-blue-100 cursor-pointer transition-colors hover:bg-blue-100" onClick={() => setFormData({...formData, hasGoogleMeet: !formData.hasGoogleMeet})}>
                    <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-colors ${formData.hasGoogleMeet ? 'bg-blue-600 border-blue-600' : 'bg-white border-blue-300'}`}>
                        {formData.hasGoogleMeet && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <label htmlFor="googleMeet" className="ml-4 block text-sm text-blue-800 font-bold flex items-center cursor-pointer">
                        <Video className="h-5 w-5 mr-2" /> Add Google Meet Link
                    </label>
                </div>
              )}

              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-2 tracking-wider">Description (Optional)</label>
                 <textarea 
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded-[2rem] px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-medium transition-all hover:bg-slate-50 focus:bg-white"
                    rows={3}
                    placeholder="Add details..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                 />
              </div>

              <div className="pt-8 flex justify-between items-center border-t border-slate-100">
                {editingId ? (
                    <button 
                        type="button" 
                        onClick={handleDelete}
                        className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center px-4 py-3 rounded-2xl hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="h-5 w-5 mr-2" /> Delete
                    </button>
                ) : (
                    <div></div> 
                )}
                <div className="flex gap-4">
                    <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-4 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                    >
                    Cancel
                    </button>
                    <button 
                    type="submit" 
                    className="px-10 py-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-xl shadow-blue-600/20 transition-all hover:scale-105 transform"
                    >
                    {editingId ? 'Update Event' : 'Save Event'}
                    </button>
                </div>
              </div>
              
              {editingId && formData.hasGoogleMeet && formData.type !== 'off-day' && (
                  <div className="border-t border-slate-100 pt-6">
                      <a 
                        href="https://meet.google.com/new" 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full flex items-center justify-center px-6 py-4 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors text-sm font-bold border border-blue-100 shadow-sm"
                      >
                        <Video className="h-5 w-5 mr-2" /> Join Google Meet
                      </a>
                  </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
