import React from 'react';
import type { PdfNote } from '../types';
import { DatabaseService } from '../services/db';
import { X, Download, BookOpen, ExternalLink } from 'lucide-react';

interface PdfModalViewerProps {
  note: PdfNote | null;
  onClose: () => void;
}

export const PdfModalViewer: React.FC<PdfModalViewerProps> = ({ note, onClose }) => {
  if (!note) return null;

  const handleDownload = () => {
    DatabaseService.incrementDownload(note.id);
    const link = document.createElement('a');
    link.href = note.fileUrl;
    link.download = note.fileName || `${note.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden pr-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-sm sm:text-base text-white truncate">{note.title}</h3>
              <p className="text-xs text-slate-400">
                Subject: {note.subjectName} • Size: {note.fileSize}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <a
              href={note.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Open in new window"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Container */}
        <div className="flex-1 bg-slate-100 flex flex-col items-center justify-center p-4 overflow-auto">
          {note.fileUrl.startsWith('data:image/svg+xml') || note.fileUrl.startsWith('data:') ? (
            <div className="w-full max-w-2xl bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
              <img 
                src={note.fileUrl} 
                alt={note.title} 
                className="w-full h-auto object-contain select-none"
              />
            </div>
          ) : (
            <iframe
              src={note.fileUrl}
              title={note.title}
              className="w-full h-full rounded-lg border border-slate-200 bg-white"
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>{note.description}</span>
          <span className="font-medium text-slate-700">Student Online Test Portal Document Viewer</span>
        </div>

      </div>
    </div>
  );
};
