import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { 
  Files, 
  Plus, 
  UploadCloud, 
  Search, 
  Edit2, 
  Trash2, 
  Lock, 
  Calendar, 
  CheckCircle2, 
  X, 
  Layers, 
  Building2,
  FileText,
  FileCheck,
  AlertCircle
} from 'lucide-react';

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    classification: 'Internal',
    required_clearance: 'Internal',
    allowed_departments: 'Finance',
    allowed_roles: '',
    explicit_denies: '',
    owner_department: 'Finance',
    version: '1.0',
    lineage_group: '',
    effective_date: '2026-09-01',
    status: 'ACTIVE'
  });
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Edit Form State
  const [editFormData, setEditFormData] = useState({});
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  const loadDocuments = () => {
    setLoading(true);
    api.getAllDocuments()
      .then(data => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleOpenUpload = () => {
    setSelectedFile(null);
    setUploadData({
      title: '',
      description: '',
      classification: 'Internal',
      required_clearance: 'Internal',
      allowed_departments: '',
      allowed_roles: '',
      explicit_denies: '',
      owner_department: 'Corporate',
      version: '1.0',
      lineage_group: '',
      effective_date: '2026-09-01',
      status: 'ACTIVE'
    });
    setUploadError('');
    setIsUploadModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!uploadData.title) {
        // Default title to file name without extension
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setUploadData(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload (PDF, DOCX, TXT, MD).');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description || '');
      formData.append('classification', uploadData.classification);
      formData.append('required_clearance', uploadData.required_clearance || uploadData.classification);
      formData.append('allowed_departments', uploadData.allowed_departments);
      formData.append('allowed_roles', uploadData.allowed_roles);
      formData.append('explicit_denies', uploadData.explicit_denies);
      formData.append('owner_department', uploadData.owner_department);
      formData.append('version', uploadData.version);
      formData.append('lineage_group', uploadData.lineage_group || uploadData.title);
      formData.append('effective_date', uploadData.effective_date);
      formData.append('status', uploadData.status);

      await api.uploadDocument(formData);
      setIsUploadModalOpen(false);
      loadDocuments();
    } catch (err) {
      setUploadError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenEdit = (doc) => {
    setEditingDoc(doc);
    setEditFormData({
      title: doc.title,
      description: doc.description || doc.summary || '',
      content: doc.content,
      classification: doc.classification,
      required_clearance: doc.required_clearance || doc.classification,
      allowed_departments: doc.allowed_departments || [],
      allowed_roles: doc.allowed_roles || [],
      explicit_denies: doc.explicit_denies || [],
      owner_department: doc.owner_department || 'Corporate',
      version: doc.version,
      lineage_group: doc.lineage_group,
      effective_date: doc.effective_date,
      status: doc.status,
      is_searchable: doc.is_searchable
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditError('');

    try {
      await api.updateDocument(editingDoc.id, editFormData);
      setIsEditModalOpen(false);
      loadDocuments();
    } catch (err) {
      setEditError(err.message || 'Failed to update document');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, docId) => {
    if (confirm(`Are you sure you want to delete document ${docId}?`)) {
      try {
        await api.deleteDocument(id);
        loadDocuments();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.doc_id.toLowerCase().includes(search.toLowerCase()) ||
    d.lineage_group?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            <Files className="w-4 h-4 text-indigo-600" />
            <span>Document Repository Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload enterprise records (PDF, DOCX, TXT, MD), configure ABAC security policies, and manage lineage versions.
          </p>
        </div>

        <button
          onClick={handleOpenUpload}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, DOC-ID, or lineage..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="text-slate-500 font-medium">
          Total: <span className="font-bold text-slate-900 dark:text-white">{documents.length}</span> documents
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading documents...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Doc ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Allowed Depts</th>
                  <th className="py-3 px-4">Allowed Roles</th>
                  <th className="py-3 px-4">Version / Lineage</th>
                  <th className="py-3 px-4">Effective Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{doc.doc_id}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">{doc.title}</td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500 uppercase">
                      {doc.file_type || 'TXT'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        doc.classification === 'Restricted' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        doc.classification === 'Confidential' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {doc.classification}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {doc.allowed_departments?.length > 0 ? doc.allowed_departments.join(', ') : <span className="text-slate-400">All Depts</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {doc.allowed_roles?.length > 0 ? doc.allowed_roles.join(', ') : <span className="text-slate-400">All Roles</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      v{doc.version} <span className="text-slate-400">({doc.lineage_group})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">{doc.effective_date}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        doc.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(doc)}
                        className="p-1 text-slate-500 hover:text-indigo-600 transition"
                        title="Edit Document Policy"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id, doc.doc_id)}
                        className="p-1 text-slate-500 hover:text-red-600 transition"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Upload Enterprise Document</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {/* File Dropzone */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Document File (PDF, DOCX, TXT, MD)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/20 transition space-y-2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  {selectedFile ? (
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{selectedFile.name}</div>
                      <div className="text-[11px] text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-semibold text-slate-700">Click to browse or drag and drop a file</div>
                      <div className="text-[11px] text-slate-400">PDF, Microsoft Word (.docx), Plain Text (.txt), or Markdown (.md)</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  placeholder="e.g. Q4 Executive Strategy Report"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description / Summary</label>
                <textarea
                  rows="2"
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  placeholder="Summary of document purpose and contents..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Classification</label>
                  <select
                    value={uploadData.classification}
                    onChange={(e) => setUploadData({ 
                      ...uploadData, 
                      classification: e.target.value,
                      required_clearance: e.target.value 
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 font-medium"
                  >
                    <option value="Public">Public</option>
                    <option value="Internal">Internal</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Restricted">Restricted</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Required Clearance</label>
                  <select
                    value={uploadData.required_clearance}
                    onChange={(e) => setUploadData({ ...uploadData, required_clearance: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 font-medium"
                  >
                    <option value="Public">Public</option>
                    <option value="Internal">Internal</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Restricted">Restricted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Allowed Departments (comma-separated)</label>
                  <input
                    type="text"
                    value={uploadData.allowed_departments}
                    onChange={(e) => setUploadData({ ...uploadData, allowed_departments: e.target.value })}
                    placeholder="e.g. Finance, Marketing (blank for all)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Allowed Roles (comma-separated)</label>
                  <input
                    type="text"
                    value={uploadData.allowed_roles}
                    onChange={(e) => setUploadData({ ...uploadData, allowed_roles: e.target.value })}
                    placeholder="e.g. Financial Analyst, Manager (blank for all)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Owner Dept</label>
                  <input
                    type="text"
                    required
                    value={uploadData.owner_department}
                    onChange={(e) => setUploadData({ ...uploadData, owner_department: e.target.value })}
                    placeholder="Finance"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Version</label>
                  <input
                    type="text"
                    required
                    value={uploadData.version}
                    onChange={(e) => setUploadData({ ...uploadData, version: e.target.value })}
                    placeholder="1.0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={uploadData.status}
                    onChange={(e) => setUploadData({ ...uploadData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 font-medium"
                  >
                    <option value="ACTIVE">Active (Searchable)</option>
                    <option value="DRAFT">Draft (Hidden)</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center space-x-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{uploading ? 'Extracting & Ingesting...' : 'Upload & Index'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Edit Document Policy: {editingDoc?.doc_id}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Classification</label>
                  <select
                    value={editFormData.classification || 'Internal'}
                    onChange={(e) => setEditFormData({ ...editFormData, classification: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 font-medium"
                  >
                    <option value="Public">Public</option>
                    <option value="Internal">Internal</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Restricted">Restricted</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Required Clearance</label>
                  <select
                    value={editFormData.required_clearance || 'Internal'}
                    onChange={(e) => setEditFormData({ ...editFormData, required_clearance: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 font-medium"
                  >
                    <option value="Public">Public</option>
                    <option value="Internal">Internal</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Restricted">Restricted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Allowed Departments (comma-separated)</label>
                  <input
                    type="text"
                    value={editFormData.allowed_departments?.join(', ') || ''}
                    onChange={(e) => setEditFormData({ 
                      ...editFormData, 
                      allowed_departments: e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : [] 
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Allowed Roles (comma-separated)</label>
                  <input
                    type="text"
                    value={editFormData.allowed_roles?.join(', ') || ''}
                    onChange={(e) => setEditFormData({ 
                      ...editFormData, 
                      allowed_roles: e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : [] 
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Content</label>
                <textarea
                  rows="4"
                  value={editFormData.content || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Policy Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
