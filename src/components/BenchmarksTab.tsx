import React from 'react';
import { 
  Target, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Bike, 
  Waves, 
  Flame, 
  Timer,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { INITIAL_BENCHMARKS } from '../data/initialData';

interface BenchmarksTabProps {
  daysRemaining: number;
}

export const BenchmarksTab: React.FC<BenchmarksTabProps> = ({ daysRemaining }) => {
  const weeksRemaining = Math.max(1, Math.floor(daysRemaining / 7));

  return (
    <div className="space-y-6" id="benchmarks-tab-content">
      {/* Benchmarks Header Summary */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Discipline Benchmarks &amp; Weekly Progression Targets
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
            {weeksRemaining} Training Weeks Remaining to Dec 31, 2027
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          To achieve the <strong>Sub-1:10:00</strong> finish, the total finish time must drop by <strong>36 minutes</strong> (from 01:46:00 to 01:10:00).
          The primary bottleneck is the <strong>20km Bike (52 min on 17kg MTB)</strong>, which accounts for <strong>13 minutes of the gap</strong>.
          Swim is already competitive and requires maintenance only; Run requires sharpening to 5:12/km off the bike.
        </p>
      </div>

      {/* Benchmarks Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" id="benchmarks-data-table">
            <thead className="bg-blue-900 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Discipline &amp; Event</th>
                <th className="py-3 px-4 font-semibold">Current Metric</th>
                <th className="py-3 px-4 font-semibold">1:10 Target Metric</th>
                <th className="py-3 px-4 font-semibold">Deficit / Gap</th>
                <th className="py-3 px-4 font-semibold">Weekly Improvement Rate Needed</th>
                <th className="py-3 px-4 font-semibold min-w-[300px]">Strategic Roadmap &amp; Equipment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
              {INITIAL_BENCHMARKS.map((item, idx) => {
                const isTotal = item.discipline.includes('Total');
                const isBottleneck = item.status === 'bottleneck';

                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isBottleneck
                        ? 'bg-amber-50/70 border-l-4 border-l-amber-500 font-medium'
                        : isTotal
                        ? 'bg-slate-50 font-bold border-t-2 border-slate-300'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-slate-900">
                      <div className="flex items-center gap-2">
                        {item.discipline.includes('Swim') && (
                          <Waves className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                        {item.discipline.includes('Bike') && (
                          <Bike className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        {item.discipline.includes('Run') && (
                          <Flame className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                        {item.discipline.includes('Transition') && (
                          <Timer className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        {isTotal && <Trophy className="w-4 h-4 text-amber-500 shrink-0" />}
                        <div>
                          <span className="font-semibold block">{item.discipline}</span>
                          <span className="text-[11px] text-slate-500 font-normal">
                            {item.distance}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {item.currentMetric}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700 whitespace-nowrap">
                      {item.targetMetric}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                      <span
                        className={
                          item.gap.startsWith('-')
                            ? isBottleneck
                              ? 'text-red-700'
                              : 'text-amber-700'
                            : 'text-emerald-700'
                        }
                      >
                        {item.gap}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-xs px-2.5 py-1 rounded-md font-bold ${
                          isBottleneck
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : isTotal
                            ? 'bg-blue-100 text-blue-900 font-bold'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <TrendingDown className="w-3.5 h-3.5" />
                        {item.weeklyImprovementNeeded}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 leading-relaxed">
                      {isBottleneck && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded mr-1.5 uppercase">
                          <AlertTriangle className="w-3 h-3" /> Priority Bottleneck
                        </span>
                      )}
                      <span>{item.notes}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Roadmap Deep Dive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Swim Strategy */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
            <Waves className="w-4 h-4 text-blue-600" />
            <span>Swim Maintenance Strategy</span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            Baseline: 23:00 &rarr; Target: 22:00 (Gap: 1 min)
          </div>
          <p className="text-slate-600 leading-relaxed">
            At age 15 with 22-24 min continuous 750m capability, you already possess competitive youth swim form.
            Preserve energy with high elbow catch drills and bilateral breathing. Do not overtrain swimming at the expense of cycling.
          </p>
        </div>

        {/* Bike Strategy */}
        <div className="bg-amber-50/60 p-5 rounded-xl border border-amber-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <Bike className="w-4 h-4 text-amber-600" />
            <span>Bike Bottleneck Solution</span>
          </div>
          <div className="text-amber-700 font-mono text-[11px]">
            Baseline: 52:00 &rarr; Target: 39:00 (Gap: 13 min)
          </div>
          <p className="text-amber-900 leading-relaxed">
            Riding a 17kg MTB creates severe rolling resistance and aerodynamic drag.
            Wed/Fri/Sun rotations (Intervals + Long Ride + Brick) will raise Functional Threshold Power (FTP).
            Transitioning to clip-on aero bars and narrower slicks or a road bike will yield massive ~8-10 min instant gains.
          </p>
        </div>

        {/* Run Strategy */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
            <Flame className="w-4 h-4 text-red-500" />
            <span>Run Off-The-Bike Strategy</span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            Baseline: 5:36/km &rarr; Target: 5:12/km (Gap: 2 min)
          </div>
          <p className="text-slate-600 leading-relaxed">
            5:36/km is a solid stand-alone pace. Running 5:12/km with heavy bike legs requires targeted brick training.
            Tuesday tempo workouts build aerobic threshold, while Friday brick rides train neuromuscular transition.
          </p>
        </div>
      </div>
    </div>
  );
};
