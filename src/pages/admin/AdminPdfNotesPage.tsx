import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/db';
import type { PdfNote, Subject } from '../../types';
import { PdfModalViewer } from '../../components/PdfModalViewer';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Upload,
  Eye,
  Download,
  X,
  Search,
  FileText
} from 'lucide-react';

export const AdminPdfNotesPage: React.FC = () => {
  const [notes, setNotes] = useState<PdfNote[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingPdf, setViewingPdf] = useState<PdfNote | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileSize, setFileSize] = useState('2.5 MB');
  const [pageCount, setPageCount] = useState(15);
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setNotes(DatabaseService.getPdfNotes(true));
    const loadedSubs = DatabaseService.getSubjects();
    setSubjects(loadedSubs);
    if (loadedSubs.length > 0 && !subjectId) {
      setSubjectId(loadedSubs[0].id);
    }
  };

  const openAddModal = () => {
    setEditingNoteId(null);
    setTitle('');
    if (subjects.length > 0) setSubjectId(subjects[0].id);
    setDescription('');
    setFileUrl('');
    setFileSize('2.5 MB');
    setPageCount(15);
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (note: PdfNote) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setSubjectId(note.subjectId);
    setDescription(note.description);
    setFileUrl(note.fileUrl);
    setFileSize(note.fileSize);
    setPageCount(note.pageCount || 10);
    setIsPublished(note.isPublished);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Calculate human readable file size
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setFileSize(sizeInMb);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFileUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    if (editingNoteId) {
      DatabaseService.updatePdfNote(editingNoteId, {
        title: title.trim(),
        subjectId,
        description: description.trim(),
        fileUrl: fileUrl || undefined,
        fileSize,
        pageCount: Number(pageCount),
        isPublished,
      });
    } else {
      DatabaseService.createPdfNote({
        title: title.trim(),
        subjectId,
        description: description.trim(),
        fileUrl: fileUrl || undefined,
        fileSize,
        pageCount: Number(pageCount),
        isPublished,
      });
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleTogglePublish = (note: PdfNote) => {
    DatabaseService.updatePdfNote(note.id, {
      isPublished: !note.isPublished,
    });
    loadData();
  };

  const handleDelete = (id: string, noteTitle: string) => {
    if (window.confirm(`Delete note "${noteTitle}"?`)) {
      DatabaseService.deletePdfNote(id);
      loadData();
    }
  };

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manage PDF Notes
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Upload study documents, revision materials, and manage student downloads.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload PDF Note</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search PDF notes by title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          {filteredNotes.length} PDF Documents
        </span>
      </div>

      {/* Notes Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredNotes.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No PDF notes uploaded</p>
            <p className="text-xs mt-1">Click "Upload PDF Note" to add study materials.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Document Title</th>
                  <th className="py-3 px-5">Subject</th>
                  <th className="py-3 px-5">File Size</th>
                  <th className="py-3 px-5">Downloads</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900 max-w-xs">
                      <div>{note.title}</div>
                      <div className="text-[10px] text-slate-400 font-normal truncate">{note.description}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium">
                        {note.subjectName}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-medium">{note.fileSize}</td>
                    <td className="py-4 px-5 font-bold">{note.downloadsCount}</td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => handleTogglePublish(note)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                          note.isPublished
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {note.isPublished ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{note.isPublished ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>
                    <td className="py-4 px-5 text-right space-x-2">
                      <button
                        onClick={() => setViewingPdf(note)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Preview Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(note)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id, note.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload / Edit PDF Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingNoteId ? 'Edit PDF Note' : 'Upload New PDF Document'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  PDF Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Physics Formulas & Derivations"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Subject
                </label>
                <select
                  required
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Upload PDF File
                </label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Select a PDF from your computer, or leave empty to generate standard academic document.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Study Summary
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Key concepts, formula sheets, chapters included..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="notePublish"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="notePublish" className="font-semibold text-slate-800 cursor-pointer">
                  Publish document immediately (visible in student portal)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  {editingNoteId ? 'Update PDF Note' : 'Upload Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <PdfModalViewer note={viewingPdf} onClose={() => setViewingPdf(null)} />
      )}

    </div>
  );
};
