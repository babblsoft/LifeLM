import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format, subDays, isSameDay } from 'date-fns';
import { Calendar, PenTool, BookOpen, CalendarDays } from 'lucide-react';

export const StreamsPage = () => {
  const { diaryEntries, setPage } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'FACT' | 'LIFE'>('FACT');
  const dateInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredEntries = diaryEntries.filter(
    entry => isSameDay(new Date(entry.date), selectedDate) && entry.type === activeTab
  );

  // Generate Date Strip - Chronological Order: [Today-29, ... , Today]
  // This places past days on the left and Today on the right.
  const dateStrip = Array.from({ length: 30 }).map((_, i) => {
    return subDays(new Date(), 29 - i);
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value) {
          setSelectedDate(new Date(e.target.value));
      }
  };

  const isSelectedDateInStrip = dateStrip.some(d => isSameDay(d, selectedDate));

  // Auto-scroll to the end (Today) on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, []);

  return (
    <div className="h-full bg-cream flex flex-col pt-12">
      <div className="px-6 mb-4 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-serif font-bold text-charcoal mb-1">Streams</h1>
            <p className="text-gray-400 text-xs uppercase tracking-widest">Your Life's Data Log</p>
        </div>
        
        {/* Date Picker Button */}
        <div className="relative">
            <button 
                onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.click()}
                className="p-3 bg-white border border-gray-200 rounded-xl text-charcoal shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                title="Jump to date"
            >
                <CalendarDays size={20} />
            </button>
            <input 
                type="date" 
                ref={dateInputRef}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                onChange={handleDateChange}
                max={format(new Date(), 'yyyy-MM-dd')} // Disable future days
            />
        </div>
      </div>

      {/* Date Navigation - Horizontal Scroll */}
      <div 
        ref={scrollContainerRef}
        className="mb-6 overflow-x-auto no-scrollbar pb-2 pl-6"
      >
        <div className="flex space-x-3 w-max pr-6 items-center">
            
            {/* If selected date is older than the strip, show it pinned at the start */}
            {!isSelectedDateInStrip && (
                <button
                    className="flex flex-col items-center justify-center w-14 h-24 rounded-2xl bg-charcoal text-white shadow-lg scale-110 transition-all shrink-0 relative border-2 border-terra mr-2"
                >
                    <span className="text-[10px] font-bold uppercase tracking-widest mb-0.5">{format(selectedDate, 'EEE')}</span>
                    <span className="text-[10px] opacity-70 mb-1">{format(selectedDate, 'MMM')}</span>
                    <span className="text-xl font-bold font-serif">{format(selectedDate, 'd')}</span>
                </button>
            )}

            {/* Recent 30 Days Strip */}
            {dateStrip.map((date, idx) => {
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());
                return (
                    <button
                        key={idx}
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center justify-center w-14 h-20 rounded-2xl transition-all shrink-0 ${
                            isSelected 
                            ? 'bg-charcoal text-white shadow-lg scale-110 z-10' 
                            : 'bg-white text-gray-400 border border-gray-100 hover:border-terra/30'
                        }`}
                    >
                        {/* Day Name e.g. Mon */}
                        <span className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${isSelected ? 'text-terra' : 'text-gray-400'}`}>
                            {format(date, 'EEE')}
                        </span>
                        
                        {/* Month e.g. Dec */}
                        <span className="text-[9px] opacity-70 mb-1">{format(date, 'MMM')}</span>
                        
                        {/* Date e.g. 12 */}
                        <span className="text-xl font-bold font-serif">{format(date, 'd')}</span>
                        
                        {/* Today Indicator dot */}
                        {isToday && !isSelected && <span className="absolute bottom-2 w-1 h-1 bg-terra rounded-full"></span>}
                    </button>
                );
            })}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="bg-gray-100 p-1 rounded-xl flex">
          <button
            onClick={() => setActiveTab('FACT')}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'FACT' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-400'
            }`}
          >
            Fact Stream
          </button>
          <button
            onClick={() => setActiveTab('LIFE')}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'LIFE' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-400'
            }`}
          >
            Life Stream
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 pb-24 overflow-y-auto">
        <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
            {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'EEEE, MMMM do, yyyy')}
        </div>

        {filteredEntries.length > 0 ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-1 h-full bg-terra opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center space-x-2 mb-3 text-gray-400 text-xs">
                    <Calendar size={12} />
                    <span>{format(new Date(entry.lastUpdated), 'h:mm a')}</span>
                </div>
                <p className="text-charcoal leading-relaxed font-serif text-lg whitespace-pre-wrap">
                    {entry.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-3xl">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                    {activeTab === 'FACT' ? <PenTool size={24} /> : <BookOpen size={24} />}
                </div>
                <h3 className="text-charcoal font-bold mb-2">Empty Stream</h3>
                <p className="text-gray-400 text-sm">
                    {isSameDay(selectedDate, new Date()) 
                        ? (activeTab === 'FACT' ? "What happened today? Log it." : "How did today feel?")
                        : `No ${activeTab === 'FACT' ? 'Facts' : 'Life Story'} recorded for this date.`
                    }
                </p>
                <button 
                  onClick={() => setPage('BASEPULSE')}
                  className="mt-6 px-6 py-3 bg-terra text-white rounded-xl text-sm font-bold shadow-lg hover:bg-opacity-90 transition-all"
                >
                    {isSameDay(selectedDate, new Date()) ? 'Log with BasePulse' : 'Backfill Entry'}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};