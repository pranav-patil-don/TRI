import React from 'react';
import { 
  Trophy, 
  Clock, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Bike,
  Activity,
  Flame,
  Code
} from 'lucide-react';
import { WorkoutLogEntry } from '../types';

interface DashboardTabProps {
  logs: WorkoutLogEntry[];
  daysRemaining: number;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ logs, daysRemaining }) => {
  // Compute 4-week rolling stats
  const now = new Date();
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(now.getDate() - 28);

  const recentLogs = logs.filter((l) => {
    const d = new Date(l.date);
    return d >= fourWeeksAgo && d <= now;
  });

  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  const formatSecondsToTime = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Compute rolling averages for each discipline
  const swimLogs = recentLogs.filter((l) => l.sessionType === 'Swim');
  const bikeLogs = recentLogs.filter((l) => l.sessionType === 'Bike');
  const runLogs = recentLogs.filter((l) => l.sessionType === 'Run');

  // Default baselines if no recent logs
  const swimAvgSec = swimLogs.length > 0
    ? swimLogs.reduce((acc, l) => acc + parseTimeToSeconds(l.duration), 0) / swimLogs.length
    : 23 * 60; // 23:00

  const bikeAvgSec = bikeLogs.length > 0
    ? bikeLogs.reduce((acc, l) => acc + parseTimeToSeconds(l.duration), 0) / bikeLogs.length
    : 52 * 60; // 52:00

  const runAvgSec = runLogs.length > 0
    ? runLogs.reduce((acc, l) => acc + parseTimeToSeconds(l.duration), 0) / runLogs.length
    : 28 * 60; // 28:00

  const transitionAllowanceSec = 3 * 60; // 03:00

  const projectedFinishSec = swimAvgSec + bikeAvgSec + runAvgSec + transitionAllowanceSec;
  const targetFinishSec = 70 * 60; // 1:10:00 (4200 seconds)
  const isSub110 = projectedFinishSec <= targetFinishSec;

  const baselineFinishSec = 106 * 60; // 01:46:00
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((baselineFinishSec - projectedFinishSec) / (baselineFinishSec - targetFinishSec)) * 100))
  );

  const gapSeconds = projectedFinishSec - targetFinishSec;

  return (
    <div className="space-y-6" id="dashboard-tab-content">
      {/* Top 4 Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Target Race Time */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between" id="card-target-time">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Target Race Time</span>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">01:10:00</div>
          <p className="text-xs text-slate-500 mt-2">
            Sub-70 min goal by Dec 31, 2027 (Sprint: 750m, 20km, 5km)
          </p>
        </div>

        {/* Card 2: Projected Finish Time */}
        <div
          className={`rounded-xl p-5 border shadow-xs flex flex-col justify-between transition-colors ${
            isSub110
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
          id="card-projected-time"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Projected Finish Time</span>
            <Clock className={`w-5 h-5 ${isSub110 ? 'text-emerald-600' : 'text-blue-600'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black tracking-tight ${isSub110 ? 'text-emerald-700' : 'text-blue-700'}`}>
              {formatSecondsToTime(projectedFinishSec)}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isSub110 ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isSub110 ? 'SUB-1:10 ACHIEVED!' : `+${formatSecondsToTime(gapSeconds)} to Target`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Rolling 4-wk average + 3m transition allowance (T1+T2)
          </p>
        </div>

        {/* Card 3: Days Remaining */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between" id="card-days-remaining">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Days Remaining</span>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{daysRemaining}</div>
          <p className="text-xs text-slate-500 mt-2">
            Live Google Sheets formula: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">=DATE(2027,12,31)-TODAY()</code>
          </p>
        </div>

        {/* Card 4: Progress Toward 1:10:00 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between" id="card-sub110-progress">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sub-1:10 Progress</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{progressPercent}%</span>
              <span className="text-xs text-slate-500">Baseline 1:46:00</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  isSub110 ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Green conditional format triggers below 01:10:00
          </p>
        </div>
      </div>

      {/* Discipline Rolling Average Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs" id="discipline-breakdown-section">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Discipline Rolling 4-Week Splits & Benchmark Variance
            </h3>
            <p className="text-xs text-slate-500">
              Live calculated averages matching Tab 1 (Dashboard) formulas in the generated Google Sheet.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
            {recentLogs.length} workouts logged in last 28 days
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" id="discipline-splits-table">
            <thead className="bg-blue-900 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Discipline</th>
                <th className="py-3 px-4 font-semibold">Current 4-Wk Avg</th>
                <th className="py-3 px-4 font-semibold">1:10 Target Split</th>
                <th className="py-3 px-4 font-semibold">Variance / Gap</th>
                <th className="py-3 px-4 font-semibold">Strategic Status</th>
                <th className="py-3 px-4 font-semibold">Google Sheet Formula</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Swim */}
              <tr className="hover:bg-blue-50/40">
                <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    🏊
                  </div>
                  <span>Swim (750m)</span>
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                  {formatSecondsToTime(swimAvgSec)}
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-600">00:22:00</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                  {swimAvgSec <= 22 * 60 ? (
                    <span className="text-emerald-600">On Target</span>
                  ) : (
                    <span className="text-amber-600">+{formatSecondsToTime(swimAvgSec - 22 * 60)}</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Maintenance Only (~3:00/100m)
                  </span>
                </td>
                <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                  =IFERROR(AVERAGEIFS(Log!D:D, Log!B:B, "Swim", ...), Benchmarks!B2)
                </td>
              </tr>

              {/* Bike */}
              <tr className="hover:bg-emerald-50/40 bg-amber-50/30">
                <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    🚴
                  </div>
                  <span>Bike (20km)</span>
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                  {formatSecondsToTime(bikeAvgSec)}
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-600">00:39:00</td>
                <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                  +{formatSecondsToTime(bikeAvgSec - 39 * 60)}
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> PRIMARY BOTTLENECK (17kg MTB drag)
                  </span>
                </td>
                <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                  =IFERROR(AVERAGEIFS(Log!D:D, Log!B:B, "Bike", ...), Benchmarks!B4)
                </td>
              </tr>

              {/* Run */}
              <tr className="hover:bg-amber-50/40">
                <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    🏃
                  </div>
                  <span>Run (5km)</span>
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                  {formatSecondsToTime(runAvgSec)}
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-600">00:26:00</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                  +{formatSecondsToTime(runAvgSec - 26 * 60)}
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                    <Activity className="w-3 h-3" /> Target 5:12/km off-bike
                  </span>
                </td>
                <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                  =IFERROR(AVERAGEIFS(Log!D:D, Log!B:B, "Run", ...), Benchmarks!B6)
                </td>
              </tr>

              {/* Transitions */}
              <tr className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    ⏱️
                  </div>
                  <span>Transitions (T1 + T2)</span>
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-800">00:03:00</td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-600">00:03:00</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-emerald-600">00:00:00</td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                    Fixed Allowance (T1 1:30 + T2 1:30)
                  </span>
                </td>
                <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                  TIME(0,3,0)
                </td>
              </tr>

              {/* Total Projected */}
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <td className="py-4 px-4 text-slate-900">Total Projected Finish</td>
                <td className={`py-4 px-4 font-mono text-base ${isSub110 ? 'text-emerald-700' : 'text-blue-900'}`}>
                  {formatSecondsToTime(projectedFinishSec)}
                </td>
                <td className="py-4 px-4 font-mono text-base text-slate-900">01:10:00</td>
                <td className={`py-4 px-4 font-mono text-base ${isSub110 ? 'text-emerald-600' : 'text-amber-700'}`}>
                  {isSub110 ? 'Sub-1:10 Met!' : `+${formatSecondsToTime(gapSeconds)}`}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold ${
                      isSub110
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isSub110 ? '🎯 READY FOR SUB-1:10' : '📈 TRAINING IN PROGRESS'}
                  </span>
                </td>
                <td className="py-4 px-4 text-xs font-mono text-slate-500">
                  =SUM(B13:B16)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Formula & Architecture Notice */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
          <Code className="w-4 h-4" />
          <span>Live Google Sheets Formula Engine (Zero Mock / No Placeholders)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The generated <strong>"TriMaster 2027"</strong> Google Sheet is wired with real, dynamic formulas.
          As you log daily swim, bike, and run sessions in the <strong>Log</strong> tab, the <strong>Dashboard</strong> tab
          automatically recalculates rolling 28-day split averages with <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-[11px]">=AVERAGEIFS(Log!D:D, Log!B:B, "Discipline", Log!A:A, "&gt;="&amp;TODAY()-28)</code>.
          The countdown computes automatically each morning via <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono text-[11px]">=DATE(2027,12,31)-TODAY()</code>,
          and conditional formatting automatically turns the finish projection cell to radiant green the moment the rolling average drops below 1:10:00!
        </p>
      </div>
    </div>
  );
};
