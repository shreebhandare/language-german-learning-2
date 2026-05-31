import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { LEVELS, Level, AccessFlag, Exercise } from '@/lib/langrushi-data';
import { toast } from '@/components/ui/use-toast';
import { Download, Upload, CheckCircle, XCircle, ChevronDown, ChevronUp, AlertTriangle, Eye, Trash2 } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';

interface ParsedExercise {
  id: string; title: string; level: string; category: string; subPart: string;
  type: string; access: string; mediaUrl: string;
  questions: { text: string; type: string; correctAnswer: string; options: string[]; hint: string; explanation: string }[];
  errors: string[]; valid: boolean;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []; let current = ''; let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; continue; }
    current += ch;
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): ParsedExercise[] {
  const lines = text.split('\n').slice(1).filter(l => l.trim());
  const map = new Map<string, ParsedExercise>();
  lines.forEach((line, i) => {
    const cols = parseCSVLine(line);
    const rowErrors: string[] = [];
    const rowNum = i + 2;
    const level = cols[0] || ''; const category = cols[1] || ''; const subPart = cols[2] || '';
    const title = cols[3] || ''; const exType = cols[4] || 'Interactive';
    const qText = cols[5] || ''; const qType = cols[6] || 'MCQ';
    const correctAnswer = cols[7] || '';
    const opt1 = cols[8] || ''; const opt2 = cols[9] || '';
    const opt3 = cols[10] || ''; const opt4 = cols[11] || '';
    const mediaUrl = cols[12] || ''; const hint = cols[13] || '';
    const explanation = cols[14] || ''; const access = cols[15] || 'FREE_ALL';
    if (cols.length < 8) rowErrors.push(`Row ${rowNum}: Not enough columns (${cols.length}/16)`);
    if (!LEVELS.includes(level as any)) rowErrors.push(`Row ${rowNum}: Invalid level "${level}"`);
    if (!title) rowErrors.push(`Row ${rowNum}: Missing exercise title`);
    if (exType === 'Interactive') {
      if (!qText) rowErrors.push(`Row ${rowNum}: Missing question text`);
      if (!correctAnswer) rowErrors.push(`Row ${rowNum}: Missing correct answer`);
      if (qType === 'MCQ' && !opt1 && !opt2) rowErrors.push(`Row ${rowNum}: MCQ needs at least 2 options`);
      if (!['MCQ', 'FILL_BLANK', 'TRUE_FALSE'].includes(qType)) rowErrors.push(`Row ${rowNum}: Invalid question type "${qType}"`);
    }
    const key = `${level}|${category}|${title}`;
    if (!map.has(key)) map.set(key, { id: 'e' + Date.now() + Math.random().toString(36).slice(2, 6), title, level, category, subPart, type: exType, access, mediaUrl, questions: [], errors: [], valid: true });
    const ex = map.get(key)!;
    ex.errors.push(...rowErrors);
    if (rowErrors.length > 0) ex.valid = false;
    if (exType === 'Interactive' && qText) ex.questions.push({ text: qText, type: qType, correctAnswer, options: [opt1, opt2, opt3, opt4].filter(Boolean), hint, explanation });
  });
  return Array.from(map.values());
}

const CSVAdmin: React.FC = () => {
  const { exercises, addExercise } = useAppContext();
  const [parsed, setParsed] = useState<ParsedExercise[] | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [excluded, setExcluded] = useState<Set<number>>(new Set());

  const exportCSV = () => {
    const header = 'level,category,sub_part,exercise_title,exercise_type,question_text,question_type,correct_answer,option1,option2,option3,option4,media_url,hint,explanation,access_flag\n';
    const rows = exercises.flatMap(e => {
      if (e.type === 'Passive') return [`${e.level},${e.category},${e.subPart},"${e.title}",Passive,"${e.prompt || ''}",,,,,,,,,,${e.access}`];
      return (e.questions || []).map(q => {
        const opts = q.options || ['', '', '', ''];
        return `${e.level},${e.category},${e.subPart},"${e.title}",Interactive,"${q.text}",${q.type},"${q.correctAnswer}","${opts[0]||''}","${opts[1]||''}","${opts[2]||''}","${opts[3]||''}","${e.mediaUrl||''}","${q.hint||''}","${q.explanation||''}",${e.access}`;
      });
    });
    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'exercises.csv'; a.click();
    toast({ title: 'Exported CSV' });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = parseCSV(ev.target?.result as string);
      setParsed(result); setExcluded(new Set()); setExpandedIdx(null);
      const valid = result.filter(r => r.valid).length;
      toast({ title: `Parsed ${result.length} exercises`, description: `${valid} valid, ${result.length - valid} with errors.` });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!parsed) return;
    const toImport = parsed.filter((ex, i) => ex.valid && !excluded.has(i));
    if (!toImport.length) { toast({ title: 'No valid exercises to import' }); return; }
    setImporting(true);
    let imported = 0;
    for (const ex of toImport) {
      try {
        const exercise: Exercise = {
          id: ex.id, title: ex.title, level: ex.level as Level, category: ex.category as any,
          subPart: ex.subPart, type: ex.type as any, access: (ex.access || 'FREE_ALL') as AccessFlag,
          mediaUrl: ex.mediaUrl || undefined,
          questions: ex.type === 'Interactive' ? ex.questions.map((q, qi) => ({
            id: `${ex.id}_q${qi}`, text: q.text, type: q.type as any, correctAnswer: q.correctAnswer,
            options: q.type === 'MCQ' ? q.options : undefined,
            hint: q.hint || undefined, explanation: q.explanation || undefined,
          })) : undefined,
        };
        await addExercise(exercise); imported++;
      } catch { /* continue */ }
    }
    setImporting(false);
    toast({ title: `Imported ${imported} exercises` });
    setParsed(null);
  };

  const validCount = parsed ? parsed.filter((ex, i) => ex.valid && !excluded.has(i)).length : 0;
  const totalErrors = parsed ? parsed.reduce((s, ex) => s + ex.errors.length, 0) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div className="section-label">Data Management</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>CSV Import / Export</h2>
      </div>

      {/* Export & Import cards */}
      <CollapsibleCard label="Export / Import">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>Export</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>Download all {exercises.length} exercises as CSV.</p>
            <button className="btn-ghost" onClick={exportCSV} style={{ gap: '6px', fontSize: '13px' }}>
              <Download className="w-4 h-4" /> Download CSV
            </button>
          </div>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>Import</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>Upload CSV → preview & validate → import.</p>
            <label className="btn-primary" style={{ cursor: 'pointer', gap: '6px', fontSize: '13px', display: 'inline-flex', alignItems: 'center' }}>
              <Upload className="w-4 h-4" /> Choose CSV File
              <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
            </label>
          </div>
        </div>
      </CollapsibleCard>

      {/* Schema */}
      <CollapsibleCard label="CSV Schema" defaultCollapsed>
        <div style={{ padding: '12px 16px', borderRadius: '9px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Schema: </span>
            level, category, sub_part, exercise_title, exercise_type, question_text, question_type, correct_answer, option1, option2, option3, option4, media_url, hint, explanation, access_flag
          </div>
          <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', marginBottom: 0 }}>
            Rows sharing the same level + category + title are grouped into one exercise with multiple questions.
          </p>
        </div>
      </CollapsibleCard>

      {/* Preview */}
      {parsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Summary */}
          <CollapsibleCard
            label="Import Preview"
            badge={
              <span style={{ background: parsed && validCount > 0 ? 'var(--success)' : 'var(--accent)', color: '#fff', borderRadius: '999px', fontSize: '10px', fontWeight: 700, padding: '1px 8px', lineHeight: '18px' }}>
                {validCount} ready
              </span>
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {[
                  { val: parsed.length, label: 'Parsed', color: 'var(--text-primary)' },
                  { val: validCount, label: 'Ready to import', color: 'var(--success)' },
                  ...(totalErrors > 0 ? [{ val: totalErrors, label: 'Errors', color: 'var(--danger)' }] : []),
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: '22px', color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-ghost" onClick={() => setParsed(null)}>Discard</button>
                <button className="btn-primary" onClick={handleImport} disabled={importing || validCount === 0} style={{ opacity: (importing || validCount === 0) ? 0.6 : 1 }}>
                  {importing ? 'Importing...' : `Import ${validCount} Exercises`}
                </button>
              </div>
            </div>
          </CollapsibleCard>

          {/* Exercise list */}
          <div className="card" style={{ overflow: 'hidden' }}>
            {parsed.map((ex, idx) => {
              const isExpanded = expandedIdx === idx;
              const isExcluded = excluded.has(idx);
              return (
                <div key={idx} style={{ opacity: isExcluded ? 0.45 : 1 }}>
                  <button
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '13px 16px', background: 'none', border: 'none',
                      borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left',
                      transition: 'background 180ms ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    {ex.valid
                      ? <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--success)' }} />
                      : <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--danger)' }} />
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ex.title || '(untitled)'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ex.level} · {ex.category} · {ex.type} · {ex.questions.length} questions</div>
                    </div>
                    {ex.errors.length > 0 && <span className="badge badge-red">{ex.errors.length} errors</span>}
                    <span className="badge badge-slate">{ex.access.replace('_', ' ')}</span>
                    {!isExcluded && ex.valid && (
                      <button
                        onClick={e => { e.stopPropagation(); setExcluded(prev => new Set([...prev, idx])); }}
                        title="Exclude from import"
                        style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', borderRadius: '4px', transition: 'color 180ms ease' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
                  </button>

                  {isExpanded && (
                    <div style={{ background: 'var(--bg-elevated)', padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {ex.errors.length > 0 && (
                        <div style={{ padding: '12px 14px', borderRadius: '9px', background: 'var(--danger-bg)', border: '1px solid rgba(220,38,38,0.15)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Figtree, sans-serif', fontWeight: 700, fontSize: '12px', color: 'var(--danger)', marginBottom: '6px' }}>
                            <AlertTriangle className="w-3.5 h-3.5" /> Validation Errors
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--danger)', lineHeight: 1.6 }}>
                            {ex.errors.map((err, ei) => <li key={ei}>{err}</li>)}
                          </ul>
                        </div>
                      )}
                      {ex.questions.length > 0 && (
                        <div style={{ borderRadius: '9px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                            <Eye className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                            <span style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>Questions Preview</span>
                          </div>
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th style={{ width: '28px' }}>#</th>
                                <th>Question</th><th>Type</th><th>Answer</th><th>Options</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ex.questions.map((q, qi) => (
                                <tr key={qi}>
                                  <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px' }}>{qi + 1}</td>
                                  <td style={{ fontWeight: 500, color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.text}</td>
                                  <td><span className="badge badge-blue">{q.type}</span></td>
                                  <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600, color: 'var(--success)', fontSize: '12px' }}>{q.correctAnswer}</td>
                                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{q.type === 'MCQ' ? q.options.join(' | ') : '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVAdmin;
