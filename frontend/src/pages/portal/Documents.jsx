import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import CitationModal from '../../components/CitationModal';
import { 
  Files, 
  Search, 
  Calendar, 
  Lock, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';

export default function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassification, setSelectedClassification] = useState('ALL');

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    api.getAuthorizedDocuments()
      .then(data => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = (doc.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.doc_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.summary && doc.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesClass = selectedClassification === 'ALL' || (doc.classification || '').toUpperCase() === selectedClassification.toUpperCase();
    return matchesSearch && matchesClass;
  });

  const handleOpenDoc = (doc) => {
    setSelectedDoc({
      document_id: doc.doc_id,
      title: doc.title,
      version: doc.version,
      effective_date: doc.effective_date,
      classification: doc.classification,
      excerpt: doc.summary
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <Files className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Corporate Knowledge Vault</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Your Authorized Documents</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Internal company documents permitted under your clearance ({user?.clearance}) and department ({user?.department}).
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Pre-LLM Verified Access Only</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search authorized titles or DOC-IDs..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Classification:</span>
          <select
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none font-medium text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Authorized</option>
            <option value="PUBLIC">Public</option>
            <option value="INTERNAL">Internal</option>
            <option value="CONFIDENTIAL">Confidential</option>
            <option value="RESTRICTED">Restricted</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading authorized records...
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Lock className="w-5 h-5" />
          </div>
          <div className="font-semibold text-slate-800 dark:text-slate-200">No authorized documents match your query.</div>
          <p className="text-slate-400 max-w-sm mx-auto">
            Documents outside your department or clearance level are strictly excluded by the deterministic policy engine.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.doc_id}
              onClick={() => handleOpenDoc(doc)}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {doc.doc_id}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
                    {doc.classification}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {doc.summary || 'Authorized internal document record.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center space-x-1 font-mono">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>v{doc.version} ? {doc.effective_date}</span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline flex items-center space-x-0.5">
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CitationModal
        citation={selectedDoc}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
