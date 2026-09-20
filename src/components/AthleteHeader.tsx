import React from 'react';
import { User } from 'firebase/auth';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  ExternalLink, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  LogOut,
  Sparkles
} from 'lucide-react';
import { ATHLETE_PROFILE } from '../data/initialData';

interface AthleteHeaderProps {
  user: User | null;
  accessToken: string | null;
  isLoggingIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onCreateSheet: () => void;
  isCreatingSheet: boolean;
  sheetUrl: string | null;
  daysRemaining: number;
}

export const AthleteHeader: React.FC<AthleteHeaderProps> = ({
  user,
  accessToken,
  isLoggingIn,
  onLogin,
  onLogout,
  onCreateSheet,
  isCreatingSheet,
  sheetUrl,
  daysRemaining,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white" id="athlete-header">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-600 font-semibold text-[11px] tracking-wide uppercase">
            Athlete Profile
          </span>
          <span className="text-slate-300 font-medium">
            {ATHLETE_PROFILE.name} &bull; Target: Sub-1:10:00 Sprint Triathlon by Dec 31, 2027
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <strong className="text-white">{daysRemaining}</strong> days until Dec 31, 2027
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-300">
            Current Baseline: <strong className="text-white">01:46:00</strong> &rarr; Target: <strong className="text-emerald-400">01:10:00</strong>
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-sm border border-blue-800">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                TriMaster 2027
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Sprint Tri Blueprint
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Structured 4-tab training engine &bull; Swim maintenance &bull; 20km Bike bottleneck fix &bull; Run 5:12/km
            </p>
          </div>
        </div>

        {/* Integration Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {sheetUrl ? (
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm"
              id="open-sheet-btn"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Open "TriMaster 2027" Sheet</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
            </a>
          ) : (
            <button
              onClick={accessToken ? onCreateSheet : onLogin}
              disabled={isLoggingIn || isCreatingSheet}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              id="create-sync-sheet-btn"
            >
              {isCreatingSheet ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-300" />
                  <span>Generating Google Sheet...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>{accessToken ? 'Generate "TriMaster 2027" Google Sheet' : 'Sign in to Create Google Sheet'}</span>
                </>
              )}
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-slate-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
              )}
              <div className="hidden lg:block text-left text-xs">
                <div className="font-semibold text-slate-800 truncate max-w-[120px]">
                  {user.displayName || user.email?.split('@')[0]}
                </div>
                <div className="text-slate-500 text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sheets Connected
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                id="logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              id="google-signin-btn"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Athlete Bottleneck Highlight Bar */}
      <div className="bg-amber-50 border-t border-amber-200/60 px-4 py-2 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Primary Bottleneck:</strong> Bike 20km (52 min on 17kg MTB). Needs ~38-40 min (30.8 km/h). Swim (23 min) is maintenance only.
          </span>
        </div>
        <div className="flex items-center gap-3 text-amber-800 font-medium">
          <span>Run Target: 5:12/km off-bike</span>
          <span>&bull;</span>
          <span>4-Week Rolling Finish Avg + 3m Transitions</span>
        </div>
      </div>
    </header>
  );
};
