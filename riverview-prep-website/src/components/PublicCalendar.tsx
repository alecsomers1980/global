'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { createClient } from '@/lib/supabase-client';
import { ChevronLeft, ChevronRight, Loader2, MapPin, CalendarDays } from 'lucide-react';

// --- Helper Functions ---
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7; // Mon=0, Sun=6
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// --- Types ---
type CalendarEntry = {
  id: string;
  date: string;
  title: string;
  location: string | null;
  type: string | null;
  description: string | null;
};

export default function PublicCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  
  const [events, setEvents] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch events for the current view month
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const supabase = createClient();
      
      const startDate = formatDateKey(year, month, 1);
      const endDate = formatDateKey(year, month, getDaysInMonth(year, month));
      
      // 1. Fetch from calendar_entries
      const { data: calData, error: calError } = await supabase
        .from('calendar_entries')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      // 2. Fetch from events (the ones managed in "Manage Events")
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, event_date, title, venue, category, description, status')
        .gte('event_date', startDate)
        .lte('event_date', endDate)
        .neq('status', 'draft');

      let combined: CalendarEntry[] = [];

      if (!calError && calData) {
        combined = [...calData];
      }

      if (!eventError && eventData) {
        const mappedEvents: CalendarEntry[] = eventData.map(e => ({
          id: e.id,
          date: e.event_date,
          title: e.title,
          location: e.venue,
          type: e.category,
          description: e.description
        }));
        combined = [...combined, ...mappedEvents];
      }
      
      // Sort combined events by date
      combined.sort((a, b) => a.date.localeCompare(b.date));
      
      setEvents(combined);
      setLoading(false);
    };

    fetchEvents();
  }, [year, month]);

  // Memoize event map for quick date lookups
  const eventMap = useMemo(() => {
    const map: Record<string, CalendarEntry[]> = {};
    events.forEach((event) => {
      if (!map[event.date]) map[event.date] = [];
      map[event.date].push(event);
    });
    return map;
  }, [events]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setSelectedDate(null);
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedDate(null);
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  // Calendar grid calculation
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfWeek(year, month);

  // Group days into weeks for the expanding row logic
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = Array(7).fill(null);
  
  // Fill initial offset
  for (let i = 0; i < startDay; i++) {
    currentWeek[i] = null;
  }
  
  // Fill days
  let currentDay = 1;
  while (currentDay <= daysInMonth) {
    const dayOfWeek = (startDay + currentDay - 1) % 7;
    currentWeek[dayOfWeek] = currentDay;
    
    if (dayOfWeek === 6 || currentDay === daysInMonth) {
      weeks.push([...currentWeek]);
      currentWeek = Array(7).fill(null);
    }
    currentDay++;
  }

  const selectedEvents = selectedDate ? eventMap[selectedDate] || [] : [];

  return (
    <div className="bg-brand-cream rounded-3xl shadow-lg border border-brand-green/5 p-6 sm:p-8 font-sans h-full flex flex-col relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand-gold/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Header Controls */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-full text-brand-green hover:bg-brand-green/10 transition-colors"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <h2 className="text-xl sm:text-2xl font-bold text-brand-green tracking-wide uppercase">
          {MONTH_NAMES[month]} {year}
        </h2>
        
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-full text-brand-green hover:bg-brand-green/10 transition-colors"
          aria-label="Next Month"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 mb-2 relative z-10">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="text-center text-[10px] font-black text-brand-green/40 uppercase tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-1 justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
        </div>
      ) : (
        /* Calendar Grid */
        <div className="grid grid-cols-7 gap-1 sm:gap-2 relative z-10">
          {weeks.map((week, weekIndex) => {
            const hasSelectedDateInThisWeek = week.some(day => {
              if (!day) return false;
              return formatDateKey(year, month, day) === selectedDate;
            });

            return (
              <Fragment key={`week-${weekIndex}`}>
                {/* Render days of the week */}
                {week.map((day, dayIndex) => {
                  if (!day) return <div key={`empty-${weekIndex}-${dayIndex}`} className="aspect-square min-h-[4rem] sm:min-h-[5rem]" />;
                  
                  const dateKey = formatDateKey(year, month, day);
                  const dayEvents = eventMap[dateKey];
                  const hasEvents = !!dayEvents;
                  const isSelected = selectedDate === dateKey;

                  return (
                    <button
                      key={dateKey}
                      onClick={() => hasEvents && setSelectedDate(isSelected ? null : dateKey)}
                      disabled={!hasEvents}
                      className={`
                        relative flex flex-col justify-start p-1.5 sm:p-2 aspect-square rounded-2xl text-sm transition-all duration-300
                        ${isSelected 
                          ? 'bg-brand-gold text-white shadow-md scale-105 font-bold z-20' 
                          : hasEvents 
                            ? 'text-brand-green bg-white shadow-sm hover:scale-105 cursor-pointer border border-brand-green/5' 
                            : 'text-brand-green/30 font-semibold cursor-default'}
                      `}
                    >
                      <span className="self-center mb-1 text-base leading-none block">{day}</span>
                      {hasEvents && (
                        <div className="w-full flex-1 overflow-hidden flex flex-col gap-0.5 items-center text-center">
                           {dayEvents.slice(0, 2).map((ev, i) => (
                              <span 
                                key={i} 
                                className={`text-[9px] sm:text-[10px] leading-tight truncate w-full ${isSelected ? 'text-white font-medium' : 'text-brand-green/70 font-semibold'}`}
                              >
                                {ev.title}
                              </span>
                           ))}
                           {dayEvents.length > 2 && (
                             <span className={`text-[8px] font-bold ${isSelected ? 'text-white/80' : 'text-brand-gold'}`}>+{dayEvents.length - 2} more</span>
                           )}
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Inline Events Dropdown for the selected week */}
                {hasSelectedDateInThisWeek && selectedEvents.length > 0 && (
                  <div className="col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-brand-green/10 shadow-inner mt-2 mb-4 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="flex items-center gap-3 mb-5">
                      <CalendarDays className="w-5 h-5 text-brand-gold" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-brand-green">
                        {new Date(selectedDate! + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </h3>
                    </div>
                    
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedEvents.map((event) => (
                        <div 
                          key={event.id} 
                          className="bg-brand-cream/30 rounded-2xl p-4 sm:p-5 border border-brand-green/5 shadow-sm hover:shadow-md transition-shadow group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-1.5 h-full min-h-[4rem] bg-brand-green/10 group-hover:bg-brand-gold transition-colors rounded-full self-stretch flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="text-base sm:text-lg font-bold text-brand-green leading-snug">{event.title}</h4>
                              {event.type && (
                                <span className="inline-block mt-2 px-2.5 py-1 text-[9px] font-black bg-brand-green/5 text-brand-green rounded-full uppercase tracking-widest">
                                  {event.type}
                                </span>
                              )}
                              {(event.location || event.description) && (
                                <div className="mt-4 pt-3 border-t border-brand-green/5 space-y-2 text-brand-green/60 text-xs">
                                  {event.location && (
                                    <p className="flex items-center gap-2 font-semibold">
                                      <MapPin className="w-3.5 h-3.5 text-brand-gold" /> {event.location}
                                    </p>
                                  )}
                                  {event.description && (
                                    <p className="leading-relaxed opacity-80">{event.description}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
