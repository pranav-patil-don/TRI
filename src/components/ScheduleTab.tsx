import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Waves,
  Bike,
  Flame,
  BedDouble
} from 'lucide-react';
import { ScheduleDay } from '../types';

interface ScheduleTabProps {
  schedule: ScheduleDay[];
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({ schedule }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDayFilter, setSelectedDayFilter] = useState('All');
  const [selectedDisciplineFilter, setSelectedDisciplineFilter] = useState('All');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 35; // One full 5-week block per page

  const filteredSchedule = useMemo(() => {
    return schedule.filter((day) => {
      // Search text
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesQuery =
          day.date.includes(query) ||
          day.dayOfWeek.toLowerCase().includes(query) ||
          day.sessionType.toLowerCase().includes(query) ||
          day.focus.toLowerCase().includes(query) ||
          day.phase.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Day filter
      if (selectedDayFilter !== 'All' && day.dayOfWeek !== selectedDayFilter) {
        return false;
      }

      // Discipline filter
      if (selectedDisciplineFilter !== 'All') {
        if (!day.sessionType.toLowerCase().includes(selectedDisciplineFilter.toLowerCase())) {
          return false;
        }
      }

      // Phase filter
      if (selectedPhaseFilter !== 'All') {
        if (selectedPhaseFilter === 'Recovery' && !day.phase.includes('Recovery')) return false;
        if (selectedPhaseFilter === 'Base' && !day.phase.includes('Base')) return false;
      }

      return true;
    });
  }, [schedule, searchTerm, selectedDayFilter, selectedDisciplineFilter, selectedPhaseFilter]);

  const totalPages = Math.ceil(filteredSchedule.length / itemsPerPage) || 1;
  const paginatedSchedule = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSchedule.slice(start, start + itemsPerPage);
  }, [filteredSchedule, currentPage, itemsPerPage]);

  // Styling helper for day rows according to prompt's exact color specifications:
  // "Mondays highlighted light red, swim days light blue, bike days light green, run days light yellow."
  const getRowHighlightClass = (day: ScheduleDay) => {
    if (day.dayOfWeek === 'Monday') {
      return 'bg-red-50/70 border-l-4 border-l-red-400 hover:bg-red-100/50';
    }
    if (day.sessionType.includes('Bike')) {
      return 'bg-emerald-50/60 border-l-4 border-l-emerald-400 hover:bg-emerald-100/50';
    }
    if (day.sessionType.includes('Run')) {
      return 'bg-amber-50/60 border-l-4 border-l-amber-400 hover:bg-amber-100/50';
    }
    if (day.sessionType.includes('Swim')) {
      return 'bg-blue-50/60 border-l-4 border-l-blue-400 hover:bg-blue-100/50';
    }
    return 'bg-white hover:bg-slate-50';
  };

  const getSessionBadge = (sessionType: string) => {
    if (sessionType.includes('Rest')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          <BedDouble className="w-3.5 h-3.5 text-red-600" /> Rest / Mobility
        </span>
      );
    }
    if (sessionType === 'Swim') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <Waves className="w-3.5 h-3.5 text-blue-600" /> Swim
        </span>
      );
    }
    if (sessionType === 'Swim + Bike') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <Waves className="w-3 h-3 text-blue-600" />
          <span className="text-slate-400">+</span>
          <Bike className="w-3.5 h-3.5 text-emerald-600" /> Swim + Bike
        </span>
      );
    }
    if (sessionType === 'Swim + Run') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <Waves className="w-3 h-3 text-blue-600" />
          <span className="text-slate-400">+</span>
          <Flame className="w-3.5 h-3.5 text-amber-600" /> Swim + Run
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800">
        {sessionType}
      </span>
    );
  };

  return (
    <div className="space-y-4" id="schedule-tab-content">
      {/* Schedule Rules Summary Card */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Complete Training Schedule (Through Dec 31, 2027 &bull; {schedule.length} Days)
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            5-Week Macrocycle Periodization (4 Weeks Base + 1 Week Recovery)
          </span>
        </div>

        {/* Legend / Rules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 shrink-0" />
            <div>
              <strong className="text-red-900 block">Mondays = Rest & Mobility</strong>
              <span className="text-red-700">Hard rule: Active recovery only. Strictly NO swim.</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0" />
            <div>
              <strong className="text-blue-900 block">Swim (Tue - Sun)</strong>
              <span className="text-blue-700">6 days/week continuous maintenance (~3:00/100m).</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
            <div>
              <strong className="text-emerald-900 block">Bike (Wed / Fri / Sun)</strong>
              <span className="text-emerald-700">Rotating: Intervals, Long Ride, Brick Ride.</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
            <div>
              <strong className="text-amber-900 block">Run (Tue / Thu)</strong>
              <span className="text-amber-700">Alternating Tempo (5:15-5:25/km) & Easy (6:00/km).</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search dates, workout details, or phases..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs sm:text-sm bg-transparent border-0 focus:ring-0 text-slate-900 placeholder:text-slate-400"
            id="schedule-search-input"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedDisciplineFilter}
            onChange={(e) => {
              setSelectedDisciplineFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium focus:bg-white"
            id="filter-discipline-select"
          >
            <option value="All">All Disciplines</option>
            <option value="Rest">Mondays (Rest)</option>
            <option value="Swim">Swim Days</option>
            <option value="Bike">Bike Days (Wed/Fri/Sun)</option>
            <option value="Run">Run Days (Tue/Thu)</option>
          </select>

          <select
            value={selectedDayFilter}
            onChange={(e) => {
              setSelectedDayFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium focus:bg-white"
            id="filter-day-select"
          >
            <option value="All">All Days</option>
            <option value="Monday">Monday (Rest)</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>

          <select
            value={selectedPhaseFilter}
            onChange={(e) => {
              setSelectedPhaseFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium focus:bg-white"
            id="filter-phase-select"
          >
            <option value="All">All Phases</option>
            <option value="Base">Base Phases (Weeks 1-4)</option>
            <option value="Recovery">Recovery Weeks (Week 5)</option>
          </select>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" id="schedule-data-table">
            <thead className="bg-blue-900 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Day</th>
                <th className="py-3 px-4 font-semibold">Session Type</th>
                <th className="py-3 px-4 font-semibold min-w-[320px]">Focus & Workout Details</th>
                <th className="py-3 px-4 font-semibold">Phase (5-Wk Cycle)</th>
                <th className="py-3 px-4 font-semibold text-center">Vol (min)</th>
                <th className="py-3 px-4 font-semibold">Volume Safety Progression</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
              {paginatedSchedule.map((day, idx) => (
                <tr key={`${day.date}-${idx}`} className={`transition-colors ${getRowHighlightClass(day)}`}>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                    {day.date}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {day.dayOfWeek}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getSessionBadge(day.sessionType)}
                  </td>
                  <td className="py-3 px-4 text-slate-700 leading-relaxed">
                    {day.focus}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        day.phase.includes('Recovery')
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {day.phase}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-center text-slate-800">
                    {day.volumeMinutes}m
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium ${
                        day.volumeFlag.includes('Alert')
                          ? 'bg-red-100 text-red-800 font-bold border border-red-300'
                          : day.volumeFlag.includes('Deload')
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {day.volumeFlag.includes('Alert') ? (
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                      ) : (
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      )}
                      {day.volumeFlag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredSchedule.length)} of {filteredSchedule.length} days
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
