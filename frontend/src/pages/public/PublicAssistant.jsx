import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Lock, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  HelpCircle,
  Briefcase,
  Layers,
  Cpu,
  Globe,
  ExternalLink
} from 'lucide-react';

const PUBLIC_SUGGESTIONS = [
  {
    title: "What does Nova Solutions do?",
    prompt: "What does Nova Solutions do and what enterprise services do you offer?",
    category: "Company Profile"
  },
  {
    title: "Project Orion Overview",
    prompt: "Tell me about the Orion Analytics Platform at a high level.",
    category: "Product Overview"
  },
  {
    title: "Atlas Cloud Migration",
    prompt: "What is the Atlas Cloud Migration initiative?",
    category: "Case Studies"
  },
  {
    title: "Project Orion Internal Budget (Boundary Test)",
    prompt: "What is the exact internal Q4 financial budget and profit margin for Project Orion?",
    category: "Access Boundary"
  },
  {
    title: "Open Career Positions",
    prompt: "What open engineering and consulting roles are currently available at Nova Solutions?",
    category: "Careers"
  },
  {
    title: "Contact Enterprise Sales",
    prompt: "How can our organization contact Nova Solutions for enterprise technology advisory?",
    category: "Contact"
  }
];

const PUBLIC_KNOWLEDGE = {
  overview: {
    title: "Nova Solutions Corporate Profile",
    doc_id: "DOC-PUB-01",
    content: "Nova Solutions is a global enterprise technology consulting and software solutions firm. We specialize in digital transformation, zero-trust infrastructure, cloud migrations, and large-scale data engineering platforms. We partner with Fortune 500 enterprises across North America, EMEA, and APAC to modernize legacy systems, design resilient multi-cloud architectures, and implement governed AI workflows."
  },
  orion: {
    title: "Orion Analytics Platform Overview",
    doc_id: "DOC-PUB-02",
    content: "The Orion Analytics Platform is Nova Solutions' flagship retail and supply-chain data fabric. It unifies distributed multi-channel inventory logs, real-time demand forecasting models, and supplier performance metrics. Public case study metrics show a 32% reduction in stockout occurrences and ₹45 Cr in annualized logistics optimization across tier-1 retail deployments."
  },
  atlas: {
    title: "Atlas Cloud Migration Initiative",
    doc_id: "DOC-PUB-03",
    content: "Atlas Cloud Migration is an enterprise hybrid-cloud modernization initiative designed for financial institutions and regulated corporations. It enables zero-downtime database cutovers, automated multi-region failover, and strict compliance with global zero-trust architecture standards."
  },
  careers: {
    title: "Nova Solutions Global Careers 2026",
    doc_id: "DOC-PUB-04",
    content: "Nova Solutions is currently hiring across multiple high-impact technical and domain roles, including: Lead Cloud Architect (Frankfurt / Remote), Senior Data Systems Engineer (Bengaluru / Hybrid), Enterprise Security Consultant (New York), and Solutions Director (Singapore). We offer competitive international compensation, remote flexibility, and comprehensive health and wellness packages."
  },
  contact: {
    title: "Enterprise Advisory & Sales Inquiries",
    doc_id: "DOC-PUB-05",
    content: "To initiate an enterprise consulting partnership, schedule an architectural review, or request a solution demo, you can reach our Global Enterprise Advisory team at contact@novasolutions.com or visit our Contact page. Our technical advisory directors respond within one business day."
  }
};

export default function PublicAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      content: "Welcome to Nova Solutions. I am the public virtual assistant for Nova Solutions. I can answer questions regarding our company profile, technology services, client case studies, open careers, and public product overviews.\n\n*Note: To access confidential internal documents, project budgets, or employee HR actions, please sign in to the internal employee workspace.*",
      citations: [
        { title: "Corporate Profile 2026", document_id: "DOC-PUB-01", version: "1.0" }
      ],
      is_public: true
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = (text) => {
    const query = (text || input).trim();
    if (!query || loading) return;

    setInput('');
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      content: query
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    setTimeout(() => {
      const qLower = query.toLowerCase();
      let answerText = "";
      let citations = [];
      let isBoundary = false;

      // Check boundary conditions: asking for internal budgets, revenue forecasts, employee salaries, internal secrets
      if (/budget|revenue|forecast|salary|salaries|profit margin|compensation|internal|confidential|restricted/i.test(qLower)) {
        isBoundary = true;
        answerText = "I cannot disclose internal project financial budgets, revenue forecasts, or employee compensation on this public channel.\n\n" +
          "Internal corporate documentation is strictly protected and governed by **NexusGuard**, Nova Solutions' identity-aware enterprise AI platform. " +
          "If you are an authorized Nova Solutions employee or contractor, please sign in to your Intranet Workspace using your corporate credentials to view authorized internal documents.";
      } else if (/orion|analytics|inventory|supply chain/i.test(qLower)) {
        answerText = `Based on public corporate releases (${PUBLIC_KNOWLEDGE.orion.title} [${PUBLIC_KNOWLEDGE.orion.doc_id}]):\n\n${PUBLIC_KNOWLEDGE.orion.content}`;
        citations = [{ title: PUBLIC_KNOWLEDGE.orion.title, document_id: PUBLIC_KNOWLEDGE.orion.doc_id, version: "1.0" }];
      } else if (/atlas|migration|cloud|multi-cloud/i.test(qLower)) {
        answerText = `Based on public architecture briefs (${PUBLIC_KNOWLEDGE.atlas.title} [${PUBLIC_KNOWLEDGE.atlas.doc_id}]):\n\n${PUBLIC_KNOWLEDGE.atlas.content}`;
        citations = [{ title: PUBLIC_KNOWLEDGE.atlas.title, document_id: PUBLIC_KNOWLEDGE.atlas.doc_id, version: "1.0" }];
      } else if (/career|job|hiring|role|position|apply/i.test(qLower)) {
        answerText = `Based on Nova Solutions Talent & Careers (${PUBLIC_KNOWLEDGE.careers.title} [${PUBLIC_KNOWLEDGE.careers.doc_id}]):\n\n${PUBLIC_KNOWLEDGE.careers.content}`;
        citations = [{ title: PUBLIC_KNOWLEDGE.careers.title, document_id: PUBLIC_KNOWLEDGE.careers.doc_id, version: "1.0" }];
      } else if (/contact|sales|reach|email|phone|schedule/i.test(qLower)) {
        answerText = `Based on enterprise communication channels (${PUBLIC_KNOWLEDGE.contact.title} [${PUBLIC_KNOWLEDGE.contact.doc_id}]):\n\n${PUBLIC_KNOWLEDGE.contact.content}`;
        citations = [{ title: PUBLIC_KNOWLEDGE.contact.title, document_id: PUBLIC_KNOWLEDGE.contact.doc_id, version: "1.0" }];
      } else {
        answerText = `Based on verified public records (${PUBLIC_KNOWLEDGE.overview.title} [${PUBLIC_KNOWLEDGE.overview.doc_id}]):\n\n${PUBLIC_KNOWLEDGE.overview.content}\n\nFeel free to explore our consulting services, open positions, or contact our enterprise advisory team for detailed proposals.`;
        citations = [{ title: PUBLIC_KNOWLEDGE.overview.title, document_id: PUBLIC_KNOWLEDGE.overview.doc_id, version: "1.0" }];
      }

      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        content: answerText,
        citations: citations,
        is_boundary: isBoundary
      };

      setMessages(prev => [...prev, assistantMsg]);
      setLoading(false);
    }, 450);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-6 flex-1 flex flex-col">
        {/* Header Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5 text-emerald-400 dark:text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base text-slate-900 dark:text-white">Nova Solutions Public AI Assistant</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                  Public Visitor Mode
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Answering inquiries about company profile, services, and public initiatives. Internal data requires corporate authorization.
              </p>
            </div>
          </div>

          <Link
            to="/login"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Employee Login</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        {/* Chat History */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs overflow-y-auto min-h-[420px] max-h-[560px] space-y-5">
          {messages.map((m) => (
            <div key={m.id} className={`flex items-start space-x-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender !== 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
              )}

              <div className={`space-y-2.5 max-w-2xl ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/60 rounded-tl-xs'
                  }`}
                >
                  {m.content}
                </div>

                {m.is_boundary && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300">
                      <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <span>Authorized employees can view confidential budgets inside the intranet workspace.</span>
                    </div>
                    <Link
                      to="/login"
                      className="ml-3 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold rounded-lg shadow-xs transition flex-shrink-0 flex items-center space-x-1"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {m.citations && m.citations.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {m.citations.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px]"
                      >
                        <FileText className="w-3 h-3 text-emerald-500" />
                        <span className="font-semibold">{c.title}</span>
                        <span className="font-mono text-[10px] text-slate-400">({c.document_id})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  V
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Checking public knowledge repository...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Carousel */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
            Suggested Visitor Inquiries
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {PUBLIC_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(item.prompt)}
                className="text-left p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-50/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 transition group flex flex-col justify-between"
              >
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 line-clamp-1">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  {item.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Nova Solutions services, products, careers, or public case studies..."
            className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-900 dark:text-white shadow-xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2.5 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
