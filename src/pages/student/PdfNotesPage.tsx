import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/db';
import type { PdfNote, Subject } from '../../types';
import { PdfModalViewer } from '../../components/PdfModalViewer';
import { 
  BookOpen, 
  Search, 
  Download, 
  Eye, 
  FileText, 
  Sparkles,
  Layers
} from 'lucide-react';

export const PdfNotesPage: React.FC = () => {
  const [notes, setNotes] = useState<PdfNote[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPdf, setSelectedPdf] = useState<PdfNote | null>(null);

  useEffect(() => {
    const refreshData = () => {
      setNotes(DatabaseService.getPdfNotes());
      setSubjects(DatabaseService.getSubjects());
    };
    refreshData();
    const unsubscribe = DatabaseService.subscribe(refreshData);
    return () => unsubscribe();
  }, []);

  const filteredNotes = notes.filter((note) => {
    const matchesSubject = selectedSubjectId === 'all' || note.subjectId === selectedSubjectId;
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const handleDownload = (note: PdfNote) => {
    DatabaseService.incrementDownload(note.id);
    // Refresh notes to update download counters
    setNotes(DatabaseService.getPdfNotes());

    const link = document.createElement('a');
    link.href = note.fileUrl;
    link.download = note.fileName || `${note.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Digital Academic Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            PDF STUDY NOTES
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Download and read comprehensive subject notes, formula handbooks, and revision guides.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl self-start md:self-auto shadow-xs">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>{notes.length} Available Documents</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Subject Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedSubjectId('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedSubjectId === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            All Subjects
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedSubjectId === sub.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search notes by title or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* PDF Notes Cards Grid */}
      {notes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No PDF Notes Currently Available</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            No study documents have been uploaded yet. Revision notes and formula books will appear here once added by faculty or administrators.
          </p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No PDF notes match your filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try switching subjects or broadening your search query.</p>
          <button
            onClick={() => { setSelectedSubjectId('all'); setSearchQuery(''); }}
            className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {note.subjectName}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {note.fileSize}
                  </span>
                </div>

                <div className="flex items-start space-x-3 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-rose-100 transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {note.title}
                    </h3>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {note.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>{note.pageCount ? `${note.pageCount} Pages` : 'Multi-page document'}</span>
                  <span>{note.downloadsCount} downloads</span>
                </div>
              </div>

              {/* Action Buttons: Open PDF & Download PDF */}
              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPdf(note)}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-slate-600" />
                  <span>Open PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(note)}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Embedded PDF Viewer Modal */}
      {selectedPdf && (
        <PdfModalViewer note={selectedPdf} onClose={() => setSelectedPdf(null)} />
      )}
    </div>
  );
};
