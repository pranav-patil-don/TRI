import React from 'react';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  Layers,
  Table,
  Check,
  X
} from 'lucide-react';
import { SheetCreationStatus } from '../types';

interface SheetGeneratorModalProps {
  status: SheetCreationStatus;
  onClose: () => void;
  onRetry: () => void;
}

export const SheetGeneratorModal: React.FC<SheetGeneratorModalProps> = ({
  status,
  onClose,
  onRetry,
}) => {
  if (status.step === 'idle') return null;

  const isCompleted = status.step === 'completed';
  const isError = status.step === 'error';

  const steps = [
    { key: 'authorizing', label: 'Verifying Google Sheets & Drive permissions' },
    { key: 'creating', label: 'Initializing "TriMaster 2027" with 4 structured tabs' },
    { key: 'populating', label: 'Writing live formulas, 468-day schedule & training logs' },
    { key: 'formatting', label: 'Styling dark blue headers, data validation & conditional highlights' },
    { key: 'completed', label: 'Spreadsheet live in Google Drive' },
  ];

  const getStepStatus = (stepKey: string) => {
    if (isCompleted) return 'done';
    if (isError) return 'error';
    const order = ['authorizing', 'creating', 'populating', 'formatting', 'completed'];
    const currentIndex = order.indexOf(status.step);
    const stepIndex = order.indexOf(stepKey);
    if (currentIndex > stepIndex) return 'done';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" id="sheet-generator-modal">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Google Sheets Generator
              </h3>
              <p className="text-xs text-slate-500">
                Building "TriMaster 2027" with live formulas
              </p>
            </div>
          </div>
          {(isCompleted || isError) && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 rounded-md p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Status Message */}
        <div className="mb-5">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : isError ? (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            ) : (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-medium text-slate-800">
              {status.message}
            </span>
          </div>
        </div>

        {/* Progress Step List */}
        <div className="space-y-3 mb-6 text-xs sm:text-sm">
          {steps.map((s, idx) => {
            const stepState = getStepStatus(s.key);
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold">
                  {stepState === 'done' ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : stepState === 'active' ? (
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <span
                  className={
                    stepState === 'done'
                      ? 'text-slate-700 font-medium'
                      : stepState === 'active'
                      ? 'text-blue-900 font-bold'
                      : 'text-slate-400'
                  }
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          {isCompleted && status.spreadsheetUrl && (
            <a
              href={status.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center gap-2 transition-colors shadow-sm"
              id="modal-open-sheet-link"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Open in Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {isError && (
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs transition-colors"
            >
              Retry Generation
            </button>
          )}

          {(isCompleted || isError) && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
