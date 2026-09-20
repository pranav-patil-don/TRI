import React, { useState } from 'react';
import { 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Timer, 
  Gauge, 
  FileText,
  FileSpreadsheet,
  Loader2,
  Filter
} from 'lucide-react';
import { WorkoutLogEntry, SessionType } from '../types';

interface LogTabProps {
  logs: WorkoutLogEntry[];
  onAddLog: (log: WorkoutLogEntry) => Promise<void>;
  sheetUrl: string | null;
}

export const LogTab: React.FC<LogTabProps> = ({ logs, onAddLog, sheetUrl }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');

  // New log form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState<SessionType>('Swim');
  const [distance, setDistance] = useState('750m');
  const [duration, setDuration] = useState('00:23:00');
  const [paceOrSpeed, setPaceOrSpeed] = useState('3:04/100m');
  const [rpe, setRpe] = useState(7);
  const [notes, setNotes] = useState('');

  const handleTypeChange = (newType: SessionType) => {
    setSessionType(newType);
    if (newType === 'Swim') {
      setDistance('750m');
      setDuration('00:23:00');
      setPaceOrSpeed('3:04/100m');
    } else if (newType === 'Bike') {
      setDistance('20km');
      setDuration('00:51:30');
      setPaceOrSpeed('23.3 km/h');
    } else if (newType === 'Run') {
      setDistance('5km');
      setDuration('00:27:30');
      setPaceOrSpeed('5:30/km');
    } else if (newType === 'Rest') {
      setDistance('0km');
      setDuration('00:30:00');
      setPaceOrSpeed('-');
      setRpe(2);
    } else if (newType === 'Brick') {
      setDistance('20km + 3km');
      setDuration('01:05:00');
      setPaceOrSpeed('Combined');
      setRpe(8);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddLog({
        date,
        sessionType,
        distance,
        duration,
        paceOrSpeed,
        rpe: Number(rpe),
        notes,
      });
      setShowAddModal(false);
      setNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedTypeFilter !== 'All' && log.sessionType !== selectedTypeFilter) {
      return false;
    }
    return true;
  });

  const highRpeCount = logs.filter((l) => l.rpe > 9).length;

  return (
    <div className="space-y-4" id="log-tab-content">
      {/* Top Action Bar & Overtraining Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Workout Training Logs
            {highRpeCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold border border-red-300">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                {highRpeCount} Overtraining Alert{highRpeCount > 1 ? 's' : ''} (RPE &gt; 9)
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500">
            Data validation on Session Type &bull; Rows with RPE &gt; 9 conditionally highlight red in Google Sheet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium text-xs"
              id="log-type-filter"
            >
              <option value="All">All Disciplines</option>
              <option value="Swim">Swim Only</option>
              <option value="Bike">Bike Only</option>
              <option value="Run">Run Only</option>
              <option value="Rest">Rest / Mobility</option>
              <option value="Brick">Brick</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs transition-colors shadow-xs"
            id="add-workout-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Log Workout</span>
          </button>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" id="workout-log-table">
            <thead className="bg-blue-900 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Session Type (Dropdown)</th>
                <th className="py-3 px-4 font-semibold">Distance</th>
                <th className="py-3 px-4 font-semibold">Duration</th>
                <th className="py-3 px-4 font-semibold">Pace or Speed</th>
                <th className="py-3 px-4 font-semibold text-center">RPE (1-10)</th>
                <th className="py-3 px-4 font-semibold">Notes & Workout Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
              {filteredLogs.map((log, idx) => {
                const isHighRpe = log.rpe > 9;
                return (
                  <tr
                    key={log.id || idx}
                    className={`transition-colors ${
                      isHighRpe
                        ? 'bg-red-50 border-l-4 border-l-red-500 hover:bg-red-100/60'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          log.sessionType === 'Swim'
                            ? 'bg-blue-100 text-blue-800'
                            : log.sessionType === 'Bike'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.sessionType === 'Run'
                            ? 'bg-amber-100 text-amber-800'
                            : log.sessionType === 'Rest'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {log.sessionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {log.distance}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {log.duration}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {log.paceOrSpeed}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          isHighRpe
                            ? 'bg-red-600 text-white animate-pulse'
                            : log.rpe >= 8
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                        title={isHighRpe ? 'Overtraining Warning: RPE > 9' : `RPE ${log.rpe}`}
                      >
                        {log.rpe}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-md">
                      <div className="flex items-center gap-1.5">
                        {isHighRpe && (
                          <span title="Overtraining Warning">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                          </span>
                        )}
                        <span>{log.notes}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Log Training Session
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Session Type (Dropdown)
                  </label>
                  <select
                    value={sessionType}
                    onChange={(e) => handleTypeChange(e.target.value as SessionType)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 font-semibold"
                  >
                    <option value="Swim">Swim</option>
                    <option value="Bike">Bike</option>
                    <option value="Run">Run</option>
                    <option value="Rest">Rest</option>
                    <option value="Brick">Brick</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Distance</label>
                  <input
                    type="text"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="e.g. 750m, 20km, 5km"
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Duration (hh:mm:ss)</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="00:23:00"
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pace / Speed</label>
                  <input
                    type="text"
                    value={paceOrSpeed}
                    onChange={(e) => setPaceOrSpeed(e.target.value)}
                    placeholder="3:00/100m or 23 km/h"
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-slate-700">
                    RPE (Rate of Perceived Exertion 1-10)
                  </label>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-xs ${
                      rpe > 9
                        ? 'bg-red-100 text-red-700'
                        : rpe >= 7
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    Level {rpe} {rpe > 9 ? '⚠️ High Risk Warning' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rpe}
                  onChange={(e) => setRpe(Number(e.target.value))}
                  className="w-full accent-blue-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>1 (Very Light)</span>
                  <span>5 (Moderate)</span>
                  <span>8 (Hard)</span>
                  <span className="text-red-500 font-semibold">10 (Max Exhaustion)</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Notes & Observations</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Cadence, bike drag, nutrition, stroke feel, heart rate..."
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-medium flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save to Log &amp; Google Sheet</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
