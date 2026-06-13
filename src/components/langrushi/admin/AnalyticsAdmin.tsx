import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { BarChart3, RefreshCw, Eye, CheckSquare, Users, Activity } from 'lucide-react';
import * as db from '@/lib/db';
import CollapsibleCard from './CollapsibleCard';

interface AnalyticsRow {
  id: string;
  visitorId: string;
  userEmail: string | null;
  actionType: string;
  details: string;
  createdAt: string;
}

const AnalyticsAdmin: React.FC = () => {
  const { cookieConsent } = useAppContext();
  const [rows, setRows] = useState<AnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'page_view' | 'exercise_complete'>('all');

  const load = async () => {
    setLoading(true);
    const data = await db.fetchAnalytics();
    setRows(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? rows : rows.filter(r => r.actionType === filter);

  // Aggregate stats
  const uniqueVisitors = new Set(rows.map(r => r.visitorId)).size;
  const totalPageViews = rows.filter(r => r.actionType === 'page_view').length;
  const totalCompletions = rows.filter(r => r.actionType === 'exercise_complete').length;
  const uniqueLoggedInUsers = new Set(rows.filter(r => r.userEmail).map(r => r.userEmail)).size;

  // Page view breakdown
  const pageViewCounts: Record<string, number> = {};
  rows.filter(r => r.actionType === 'page_view').forEach(r => {
    const page = r.details || '/';
    pageViewCounts[page] = (pageViewCounts[page] || 0) + 1;
  });
  const topPages = Object.entries(pageViewCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const maxPageViews = topPages[0]?.[1] || 1;

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  };

  const actionBadge = (type: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      page_view: { bg: 'var(--accent-light)', color: 'var(--accent)', label: 'Page View' },
      exercise_complete: { bg: 'var(--success-bg)', color: 'var(--success)', label: 'Completed' },
    };
    const s = styles[type] || { bg: 'var(--bg-elevated)', color: 'var(--text-secondary)', label: type };
    return (
      <span style={{
        display: 'inline-block', padding: '2px 8px', borderRadius: '6px',
        background: s.bg, color: s.color, fontFamily: 'IBM Plex Mono, monospace',
        fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        {s.label}
      </span>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div className="section-label">GDPR Analytics</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Visitor Activity</h2>
          <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Only recorded for visitors who accepted cookies.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={load}
          style={{ gap: '6px', height: '36px', padding: '0 14px', fontSize: '13px' }}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {[
          { icon: Users, label: 'Unique Visitors', value: uniqueVisitors, color: 'var(--accent)', bg: 'var(--accent-light)' },
          { icon: Eye, label: 'Page Views', value: totalPageViews, color: 'var(--purple)', bg: 'var(--purple-bg)' },
          { icon: CheckSquare, label: 'Completions', value: totalCompletions, color: 'var(--success)', bg: 'var(--success-bg)' },
          { icon: Activity, label: 'Logged-in Users', value: uniqueLoggedInUsers, color: 'var(--warning)', bg: 'var(--warning-bg)' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: '24px', color: 'var(--text-primary)', lineHeight: 1 }}>
                {loading ? '—' : s.value}
              </div>
              <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Pages Bar Chart */}
      {topPages.length > 0 && (
        <CollapsibleCard label="Top Pages">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topPages.map(([page, count]) => (
              <div key={page} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)', width: '120px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {page || '/'}
                </div>
                <div style={{ flex: 1, background: 'var(--bg-elevated)', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${(count / maxPageViews) * 100}%`,
                    background: 'var(--accent)', borderRadius: '4px',
                    transition: 'width 500ms ease',
                  }} />
                </div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', width: '28px', textAlign: 'right', flexShrink: 0 }}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleCard>
      )}

      {/* Activity Log Table */}
      <CollapsibleCard
        label="Activity Log"
        badge={
          <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: '999px', fontSize: '10px', fontWeight: 700, padding: '1px 8px', lineHeight: '18px' }}>
            {filtered.length}
          </span>
        }
        style={{ marginBottom: 0 }}
      >
        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {(['all', 'page_view', 'exercise_complete'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 12px', borderRadius: '6px', border: '1px solid var(--border)',
                background: filter === f ? 'var(--accent)' : 'var(--bg-elevated)',
                color: filter === f ? '#fff' : 'var(--text-secondary)',
                fontFamily: 'Figtree, sans-serif', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                transition: 'all 180ms ease',
              }}
            >
              {f === 'all' ? 'All Events' : f === 'page_view' ? 'Page Views' : 'Completions'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontFamily: 'Figtree, sans-serif', fontSize: '14px' }}>
            Loading analytics data...
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <BarChart3 className="w-8 h-8" style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 4px' }}>
              No analytics data yet
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Data is recorded only when visitors accept cookie consent.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', margin: '-20px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Visitor ID</th>
                  <th>User</th>
                  <th>Event</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.id}>
                    <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(row.createdAt)}
                    </td>
                    <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px', color: 'var(--text-muted)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.visitorId}
                    </td>
                    <td style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {row.userEmail || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>guest</span>}
                    </td>
                    <td>{actionBadge(row.actionType)}</td>
                    <td style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CollapsibleCard>
    </div>
  );
};

export default AnalyticsAdmin;
