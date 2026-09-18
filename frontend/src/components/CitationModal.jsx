import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, ShieldCheck, FileText, Calendar, Tag, Layers, CheckCircle2, Lock } from 'lucide-react';

export default function CitationModal({ citation, isOpen, onClose }) {
  const [docDetail, setDocDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && citation?.document_id) {
      setLoading(true);
      setError(null);
      api.getDocumentDetail(citation.document_id)
        .then((data) => {
          setDocDetail(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Unable to retrieve document details');
          setLoading(false);
        });
    } else {
      setDocDetail(null);
    }
  }, [isOpen, citation]);

  if (!isOpen || !citation) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <span>{citation.title}</span>
                <span className="font-mono text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                  {citation.document_id}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Verified Grounded Source • Version {citation.version}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Metadata Cards */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-slate-400 font-medium mb-0.5 flex items-center space-x-1">
                <Tag className="w-3 h-3" />
                <span>Classification</span>
              </div>
              <div className="font-semibold text-slate-800">
                {citation.classification || docDetail?.classification || 'Internal'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-slate-400 font-medium mb-0.5 flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Effective Date</span>
              </div>
              <div className="font-semibold text-slate-800 font-mono">
                {citation.effective_date}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-slate-400 font-medium mb-0.5 flex items-center space-x-1">
                <Layers className="w-3 h-3" />
                <span>Policy Gate</span>
              </div>
              <div className="font-semibold text-emerald-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Authorized</span>
              </div>
            </div>
          </div>

          {/* Full Content / Excerpt */}
          <div>
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Authorized Excerpt / Content
            </div>
            {loading ? (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-400 animate-pulse">
                Retrieving document record...
              </div>
            ) : error ? (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                {error}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs leading-relaxed font-mono whitespace-pre-wrap">
                {docDetail?.content || citation.excerpt || 'Document content verified.'}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Pre-LLM Verified Evidence</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
