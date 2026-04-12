import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AceEditor from 'react-ace';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import DOMPurify from 'dompurify';

import '../../imports/AceBuildImports';
import { getProblemById } from '../../services/problemService';
import { createSubmission } from '../../services/submissionService';
import { useSocket } from '../../hooks/useSocket';
import { Problem, SubmissionResult } from '../../types/problem.types';
import DifficultyBadge from '../../components/DifficultyBadge';
import { SkeletonBlock } from '../../components/LoadingSkeleton';
import Themes from '../../constants/Themes';

const LANG_MAP: Record<string, string> = {
  CPP: 'c_cpp',
  JAVA: 'java',
  PYTHON: 'python',
  JAVASCRIPT: 'javascript',
};

type Tab = 'statement' | 'editorial' | 'submissions';

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ConsolePanel({ 
  result, 
  submitting, 
  problem 
}: { 
  result: SubmissionResult | null; 
  submitting: boolean; 
  problem: Problem | null 
}) {
  const [activeConsoleTab, setActiveConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);

  // Switch to result tab automatically when result arrives
  useEffect(() => {
    if (result) setActiveConsoleTab('result');
  }, [result]);

  if (submitting) {
    return (
      <div className="cx-result-pending" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px' }}>
        <span className="cx-spinner" />
        <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Running your code...</span>
      </div>
    );
  }

  const cases = problem?.testCases || [];
  const results = result?.testCaseResults || [];
  const totalCases = Math.max(cases.length, results.length);

  return (
    <div className="cx-console-container">
      <div className="cx-console-tabs-row">
        <div 
          className={`cx-console-tab-item ${activeConsoleTab === 'testcase' ? 'active' : ''}`}
          onClick={() => setActiveConsoleTab('testcase')}
        >
          Testcase
        </div>
        <div 
          className={`cx-console-tab-item ${activeConsoleTab === 'result' ? 'active' : ''}`}
          onClick={() => setActiveConsoleTab('result')}
        >
          Result
          {result && (
            <span className={`cx-status-dot ${result.status === 'AC' || result.status === 'SUCCESS' ? 'success' : 'fail'}`} />
          )}
        </div>
      </div>

      <div className="cx-console-content">
        {/* Case selector */}
        <div className="cx-case-selector">
          {Array.from({ length: totalCases }).map((_, idx) => {
            const res = results[idx];
            let statusClass = '';
            if (activeConsoleTab === 'result' && res) {
              statusClass = res.status === 'SUCCESS' ? 'text-success' : 'text-danger';
            }
            return (
              <button 
                key={idx}
                className={`cx-case-btn ${activeCaseIndex === idx ? 'active' : ''} ${statusClass}`}
                onClick={() => setActiveCaseIndex(idx)}
              >
                Case {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Case Detail */}
        <div className="cx-case-detail cx-fade-in" key={`${activeConsoleTab}-${activeCaseIndex}`}>
          {activeConsoleTab === 'testcase' ? (
            <>
              <div className="cx-detail-item">
                <label>Input</label>
                <div className="cx-code-block">{cases[activeCaseIndex]?.input || 'N/A'}</div>
              </div>
            </>
          ) : (
            <>
              {!result ? (
                <div style={{ color: 'var(--text-muted)', padding: '12px 0' }}>Submit your code to see the result.</div>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div className={`cx-result-status ${result.status === 'AC' || result.status === 'SUCCESS' ? 'cx-result-accepted' : 'cx-result-wa'}`}>
                      {result.status === 'AC' || result.status === 'SUCCESS' ? 'Accepted' : result.status}
                    </div>
                  </div>
                  
                  {results[activeCaseIndex] ? (
                    <>
                      <div className="cx-detail-item">
                        <label>Input</label>
                        <div className="cx-code-block">{results[activeCaseIndex].input}</div>
                      </div>
                      <div className="cx-detail-item">
                        <label>Output</label>
                        <div className={`cx-code-block ${results[activeCaseIndex].status !== 'SUCCESS' ? 'error' : ''}`}>
                          {results[activeCaseIndex].output || ' (No output)'}
                        </div>
                      </div>
                      <div className="cx-detail-item">
                        <label>Expected</label>
                        <div className="cx-code-block">{results[activeCaseIndex].expected}</div>
                      </div>
                    </>
                  ) : (
                     <div className="cx-detail-item">
                        <label>Error</label>
                        <div className="cx-code-block error">{result.error || 'N/A'}</div>
                     </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProblemDescription() {
  const { id } = useParams<{ id: string }>();
  const { isConnected, result, userId, clearResult } = useSocket();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('statement');
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [leftWidth, setLeftWidth] = useState(45);

  const [selectedLangKey, setSelectedLangKey] = useState('');
  const [code, setCode] = useState('');
  const [theme, setTheme] = useState('monokai');
  const [submitting, setSubmitting] = useState(false);

  // Fetch problem from API
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProblemById(id)
      .then((p) => {
        setProblem(p);
        if (p.codeStubs && p.codeStubs.length > 0) {
          const firstStub = p.codeStubs[0];
          setSelectedLangKey(firstStub.language);
          setCode(firstStub.userSnippet ?? '');
        }
      })
      .catch(() => setError('Failed to load problem. Is the Problem Service running?'))
      .finally(() => setLoading(false));
  }, [id]);

  // When language changes, load the code stub
  useEffect(() => {
    if (!problem || !selectedLangKey) return;
    const stub = problem.codeStubs.find((s) => s.language === selectedLangKey);
    if (stub) setCode(stub.userSnippet ?? '');
  }, [selectedLangKey, problem]);

  // When result arrives, open console
  useEffect(() => {
    if (result) setConsoleOpen(true);
  }, [result]);

  const aceMode = LANG_MAP[selectedLangKey] ?? 'java';

  const handleSubmit = async () => {
    if (!problem || !code.trim()) return;
    clearResult();
    setSubmitting(true);
    setConsoleOpen(true);
    try {
      await createSubmission({
        code,
        language: selectedLangKey,
        userId,
        problemId: problem._id,
      });
      // Result will arrive via socket
    } catch {
      setSubmitting(false);
    }
  };

  // Stop submitting spinner once result arrives
  useEffect(() => {
    if (result) setSubmitting(false);
  }, [result]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const newW = (e.clientX / window.innerWidth) * 100;
    if (newW > 20 && newW < 80) setLeftWidth(newW);
  }, [isDragging]);

  const stopDragging = useCallback(() => setIsDragging(false), []);

  if (loading) {
    return (
      <div className="cx-split">
        <div className="cx-left-panel" style={{ width: '45%' }}>
          <div className="cx-tabs">
            {['Problem Statement', 'Editorial', 'Submissions'].map((t) => (
              <div key={t} className="cx-tab">{t}</div>
            ))}
          </div>
          <div className="cx-left-inner" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SkeletonBlock className="h-8 w-3/4" style={{}} />
            <SkeletonBlock className="h-4 w-1/4" style={{}} />
            <SkeletonBlock className="h-4 w-full" style={{ marginTop: 16 }} />
            <SkeletonBlock className="h-4 w-5/6" style={{}} />
            <SkeletonBlock className="h-4 w-4/6" style={{}} />
            <SkeletonBlock className="h-4 w-full" style={{ marginTop: 12 }} />
            <SkeletonBlock className="h-4 w-3/4" style={{}} />
          </div>
        </div>
        <div className="cx-divider" />
        <div className="cx-right-panel" style={{ flex: 1, background: 'var(--bg-primary)' }}>
          <div className="cx-editor-toolbar">
            <SkeletonBlock className="h-7 w-28" style={{}} />
            <SkeletonBlock className="h-7 w-24" style={{}} />
          </div>
          <div style={{ flex: 1, background: 'var(--bg-primary)' }} />
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="cx-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>⚠️</div>
          <div style={{ color: 'var(--hard)', fontWeight: 600, marginBottom: 8 }}>{error ?? 'Problem not found'}</div>
          <Link to="/problems" className="cx-btn cx-btn-ghost" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            ← Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  const sanitized = DOMPurify.sanitize(problem.description ?? '');

  return (
    <div
      className="cx-split"
      onMouseMove={onMouseMove}
      onMouseUp={stopDragging}
      style={{ userSelect: isDragging ? 'none' : 'auto' }}
    >
      {/* LEFT PANEL */}
      <div className="cx-left-panel" style={{ width: `${leftWidth}%` }}>
        {/* Tab bar */}
        <div className="cx-tabs">
          <Link to="/problems" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', padding: '12px 8px 12px 0', textDecoration: 'none', fontSize: '0.82rem' }}>
            <BackIcon /> List
          </Link>
          {(['statement', 'editorial', 'submissions'] as Tab[]).map((t) => (
            <div
              key={t}
              className={`cx-tab ${activeTab === t ? 'cx-tab-active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t === 'statement' ? 'Problem' : t.charAt(0).toUpperCase() + t.slice(1)}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="cx-left-inner">
          {activeTab === 'statement' && (
            <div className="cx-fade-in">
              <h1 className="cx-prob-title">{problem.title}</h1>
              <div className="cx-prob-meta">
                <DifficultyBadge difficulty={problem.difficulty} />
                {(problem.tags ?? []).map((tag) => (
                  <span key={tag} className="cx-tag">{tag}</span>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: isConnected ? 'var(--easy)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: isConnected ? 'var(--easy)' : 'var(--text-muted)', display: 'inline-block' }} />
                  {isConnected ? 'Live' : 'Disconnected'}
                </span>
              </div>
              <div className="cx-prose">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{sanitized}</ReactMarkdown>
              </div>
            </div>
          )}

          {activeTab === 'editorial' && (
            <div className="cx-fade-in">
              <h2 className="cx-prob-title" style={{ fontSize: '1rem' }}>Editorial</h2>
              {problem.editorial ? (
                <div className="cx-prose">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {DOMPurify.sanitize(problem.editorial)}
                  </ReactMarkdown>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: '0.88rem' }}>
                  No editorial available for this problem yet.
                </p>
              )}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="cx-fade-in">
              <h2 className="cx-prob-title" style={{ fontSize: '1rem' }}>Your Submissions</h2>
              {result ? (
                <div style={{ marginTop: 16 }}>
                  <ConsolePanel result={result} submitting={false} problem={problem} />
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: '0.88rem' }}>
                  No submissions yet. Submit your code to see results here.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DIVIDER */}
      <div
        className={`cx-divider ${isDragging ? 'dragging' : ''}`}
        onMouseDown={() => setIsDragging(true)}
      />

      {/* RIGHT PANEL */}
      <div className="cx-right-panel" style={{ flex: 1 }}>
        {/* Editor toolbar */}
        <div className="cx-editor-toolbar">
          <button className="cx-btn cx-btn-primary" onClick={handleSubmit} disabled={submitting || !isConnected}>
            {submitting ? <><span className="cx-spinner" /> Running...</> : '▶ Submit'}
          </button>

          <select
            className="cx-select"
            value={selectedLangKey}
            onChange={(e) => setSelectedLangKey(e.target.value)}
          >
            {(problem.codeStubs ?? []).map((stub) => (
              <option key={stub.language} value={stub.language}>
                {stub.language}
              </option>
            ))}
          </select>

          <select
            className="cx-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            {Themes.map((t) => (
              <option key={t.value} value={t.value}>{t.themeName}</option>
            ))}
          </select>

          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {problem.testCases?.length ?? 0} test cases
          </span>
        </div>

        {/* Code editor fills remaining space */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <AceEditor
            mode={aceMode}
            theme={theme}
            value={code}
            onChange={(v: string) => setCode(v)}
            name="codeX-editor"
            width="100%"
            height="100%"
            style={{ position: 'absolute', inset: 0 }}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              showLineNumbers: true,
              fontSize: 14,
              tabSize: 4,
              showPrintMargin: false,
              highlightActiveLine: true,
            }}
          />
        </div>

        {/* Console panel */}
        <div className="cx-console">
          <div className="cx-console-header" onClick={() => setConsoleOpen((p) => !p)}>
            <span>Console / Result</span>
            <ChevronIcon open={consoleOpen} />
          </div>
          {consoleOpen && (
            <div className="cx-console-body cx-fade-in">
              <ConsolePanel result={result} submitting={submitting} problem={problem} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
