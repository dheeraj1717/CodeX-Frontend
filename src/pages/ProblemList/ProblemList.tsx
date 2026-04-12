import { useEffect, useMemo, useState } from 'react';
import { getProblems } from '../../services/problemService';
import { ProblemListItem } from '../../types/problem.types';
import { SkeletonRow } from '../../components/LoadingSkeleton';
import ProblemRow from './ProblemRow';

type DiffFilter = 'all' | 'easy' | 'medium' | 'hard';

function StatCard({ value, label, color }: { value: number | string; label: string; color?: string }) {
  return (
    <div className="cx-stat-card">
      <div className="cx-stat-value" style={color ? { color } : {}}>{value}</div>
      <div className="cx-stat-label">{label}</div>
    </div>
  );
}

export default function ProblemList() {
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState<DiffFilter>('all');

  useEffect(() => {
    getProblems()
      .then(setProblems)
      .catch(() => setError('Failed to load problems. Is the Problem Service running on port 4000?'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      const matchesDiff = diffFilter === 'all' || p.difficulty === diffFilter;
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
      return matchesDiff && matchesSearch;
    });
  }, [problems, diffFilter, search]);

  const counts = useMemo(() => ({
    easy: problems.filter((p) => p.difficulty === 'easy').length,
    medium: problems.filter((p) => p.difficulty === 'medium').length,
    hard: problems.filter((p) => p.difficulty === 'hard').length,
  }), [problems]);

  const filters: { key: DiffFilter; label: string; activeClass: string }[] = [
    { key: 'all', label: 'All', activeClass: 'active-all' },
    { key: 'easy', label: 'Easy', activeClass: 'active-easy' },
    { key: 'medium', label: 'Medium', activeClass: 'active-medium' },
    { key: 'hard', label: 'Hard', activeClass: 'active-hard' },
  ];

  return (
    <div className="cx-page">
      <div className="cx-container">
        <h1 className="cx-page-title">Problem Set</h1>
        <p className="cx-page-sub">Sharpen your algorithmic thinking — one problem at a time.</p>

        {/* Stats row */}
        {!loading && !error && (
          <div className="cx-stats-row">
            <StatCard value={problems.length} label="Total" />
            <StatCard value={counts.easy} label="Easy" color="var(--easy)" />
            <StatCard value={counts.medium} label="Medium" color="var(--medium)" />
            <StatCard value={counts.hard} label="Hard" color="var(--hard)" />
          </div>
        )}

        {/* Filters */}
        <div className="cx-filters">
          <input
            className="cx-search"
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {filters.map((f) => (
            <button
              key={f.key}
              className={`cx-filter-btn ${diffFilter === f.key ? f.activeClass : ''}`}
              onClick={() => setDiffFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="cx-table-wrap">
          <table className="cx-table">
            <thead>
              <tr>
                <th className="px-4">#</th>
                <th className="px-4">Title</th>
                <th className="px-4">Difficulty</th>
                <th className="px-4">Tags</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

              {!loading && error && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center" style={{ color: 'var(--hard)' }}>
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                    No problems match your filters.
                  </td>
                </tr>
              )}

              {!loading && !error &&
                filtered.map((p, i) => <ProblemRow key={p._id} problem={p} index={i} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}