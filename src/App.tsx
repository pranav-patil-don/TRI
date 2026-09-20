import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { 
  Trophy, 
  Calendar, 
  FileText, 
  Target, 
  BarChart3, 
  FileSpreadsheet, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2
} from 'lucide-react';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getCachedAccessToken, 
  setCachedAccessToken 
} from './services/firebaseAuth';
import { generateTriMasterSchedule } from './services/scheduleGenerator';
import { 
  createTriMasterGoogleSheet, 
  appendWorkoutLogToGoogleSheet 
} from './services/sheetsService';
import { INITIAL_LOG_ENTRIES, ATHLETE_PROFILE } from './data/initialData';
import { WorkoutLogEntry, SheetCreationStatus } from './types';
import { AthleteHeader } from './components/AthleteHeader';
import { DashboardTab } from './components/DashboardTab';
import { ScheduleTab } from './components/ScheduleTab';
import { LogTab } from './components/LogTab';
import { BenchmarksTab } from './components/BenchmarksTab';
import { SheetGeneratorModal } from './components/SheetGeneratorModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'log' | 'benchmarks'>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [logs, setLogs] = useState<WorkoutLogEntry[]>(INITIAL_LOG_ENTRIES);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);

  const [creationStatus, setCreationStatus] = useState<SheetCreationStatus>({
    step: 'idle',
    message: '',
  });

  // Calculate live days remaining until Dec 31, 2027
  const daysRemaining = useMemo(() => {
    const targetDate = new Date(2027, 11, 31);
    const today = new Date();
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, []);

  // Pre-generate the 468-day schedule through Dec 31, 2027
  const schedule = useMemo(() => {
    return generateTriMasterSchedule();
  }, []);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        // Automatically prompt sheet generation if not created yet
        handleCreateSheet(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setCreationStatus({
        step: 'error',
        message: err?.message || 'Failed to authenticate with Google. Please try again.',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setCachedAccessToken(null);
  };

  const handleCreateSheet = async (tokenOverride?: string) => {
    const token = tokenOverride || accessToken || getCachedAccessToken();
    if (!token) {
      handleLogin();
      return;
    }

    setCreationStatus({
      step: 'authorizing',
      message: 'Connecting with Google Sheets API...',
    });

    try {
      const result = await createTriMasterGoogleSheet(token, (msg) => {
        setCreationStatus((prev) => {
          let step = prev.step;
          if (msg.includes('Initializing')) step = 'creating';
          else if (msg.includes('Generating') || msg.includes('Writing')) step = 'populating';
          else if (msg.includes('Applying')) step = 'formatting';
          else if (msg.includes('created')) step = 'completed';
          return { ...prev, step, message: msg };
        });
      });

      setSheetUrl(result.spreadsheetUrl);
      setSpreadsheetId(result.spreadsheetId);
      setCreationStatus({
        step: 'completed',
        message: 'Successfully generated "TriMaster 2027" with all live formulas!',
        spreadsheetId: result.spreadsheetId,
        spreadsheetUrl: result.spreadsheetUrl,
      });
    } catch (err: any) {
      console.error('Sheet creation error:', err);
      setCreationStatus({
        step: 'error',
        message: err?.message || 'An error occurred while generating the Google Sheet.',
      });
    }
  };

  const handleAddLog = async (newLog: WorkoutLogEntry) => {
    const logWithId = {
      ...newLog,
      id: `log-${Date.now()}`,
    };

    // Update local state so Dashboard rolling averages recalculate live
    setLogs((prev) => [logWithId, ...prev]);

    // If connected to Google Sheet, also append to live sheet
    const token = accessToken || getCachedAccessToken();
    if (token && spreadsheetId) {
      try {
        await appendWorkoutLogToGoogleSheet(token, spreadsheetId, logWithId);
      } catch (err) {
        console.warn('Failed to append log to Google Sheet:', err);
      }
    }
  };

  const downloadScheduleCsv = () => {
    const headers = ['Date,Day,Session Type,Focus,Phase,Est. Volume (min),Volume Progression Flag'];
    const rows = schedule.map((d) => 
      `"${d.date}","${d.dayOfWeek}","${d.sessionType}","${d.focus.replace(/"/g, '""')}","${d.phase}",${d.volumeMinutes},"${d.volumeFlag}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'TriMaster_2027_Schedule.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header with Athlete Profile & Google Auth Integration */}
      <AthleteHeader
        user={user}
        accessToken={accessToken}
        isLoggingIn={isLoggingIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onCreateSheet={() => handleCreateSheet()}
        isCreatingSheet={creationStatus.step !== 'idle' && creationStatus.step !== 'completed' && creationStatus.step !== 'error'}
        sheetUrl={sheetUrl}
        daysRemaining={daysRemaining}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Tabs (matching the 4 sheet tabs) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
          <nav className="flex flex-wrap gap-2 text-xs sm:text-sm font-semibold" aria-label="Sheet Tabs" id="tab-navigation">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200'
              }`}
              id="nav-tab-dashboard"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Tab 1: Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'schedule'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200'
              }`}
              id="nav-tab-schedule"
            >
              <Calendar className="w-4 h-4" />
              <span>Tab 2: Schedule ({schedule.length} Days)</span>
            </button>

            <button
              onClick={() => setActiveTab('log')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'log'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200'
              }`}
              id="nav-tab-log"
            >
              <FileText className="w-4 h-4" />
              <span>Tab 3: Workout Log ({logs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('benchmarks')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'benchmarks'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200'
              }`}
              id="nav-tab-benchmarks"
            >
              <Target className="w-4 h-4" />
              <span>Tab 4: Benchmarks</span>
            </button>
          </nav>

          {/* Quick actions */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={downloadScheduleCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-2xs"
              id="export-csv-btn"
              title="Download Schedule CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export Schedule CSV</span>
            </button>

            {sheetUrl && (
              <a
                href={sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-medium transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Open Live Sheet</span>
                <ExternalLink className="w-3 h-3 text-emerald-600" />
              </a>
            )}
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <DashboardTab logs={logs} daysRemaining={daysRemaining} />
        )}

        {activeTab === 'schedule' && (
          <ScheduleTab schedule={schedule} />
        )}

        {activeTab === 'log' && (
          <LogTab logs={logs} onAddLog={handleAddLog} sheetUrl={sheetUrl} />
        )}

        {activeTab === 'benchmarks' && (
          <BenchmarksTab daysRemaining={daysRemaining} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <p>
          TriMaster 2027 &bull; Sprint Triathlon Performance Blueprint for Age 15 &bull; Target: Sub-1:10:00 Finish by Dec 31, 2027.
        </p>
      </footer>

      {/* Modal Progress for Google Sheets Creation */}
      <SheetGeneratorModal
        status={creationStatus}
        onClose={() => setCreationStatus({ step: 'idle', message: '' })}
        onRetry={() => handleCreateSheet()}
      />
    </div>
  );
}
