import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { LEVELS, Level, AccessFlag, Exercise } from '@/lib/langrushi-data';
import { toast } from '@/components/ui/use-toast';
import { Download, Upload, CheckCircle, XCircle, ChevronDown, ChevronUp, AlertTriangle, Eye, Trash2 } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';

interface ParsedExercise {
  id: string; title: string; level: string; category: string; subPart: string;
  type: string; access: string; mediaUrl: string; transcript: string;
  guidance: string; modelAnswer: string;
  questions: { text: string; type: string; correctAnswer: string; options: string[]; hint: string; explanation: string }[];
  errors: string[]; valid: boolean;
}

function escapeCSVField(field: any): string {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function parseCSV(text: string): ParsedExercise[] {
  const map = new Map<string, ParsedExercise>();
  
  // Custom CSV parser that handles newlines inside quotes correctly
  const rows: string[][] = [];
  let currentField = '';
  let currentRow: string[] = [];
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const nextCh = text[i + 1];
    
    if (ch === '"') {
      if (inQuotes && nextCh === '"') {
        currentField += '"';
        i++; // Skip the second quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((ch === '\r' || ch === '\n') && !inQuotes) {
      if (ch === '\r' && nextCh === '\n') {
        i++; // Skip \n
      }
      currentRow.push(currentField.trim());
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += ch;
    }
  }
  // Push last field/row if any
  if (currentRow.length > 0 || currentField.trim()) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  // The first row is the header
  const dataRows = rows.slice(1);

  dataRows.forEach((cols, i) => {
    // Skip completely empty rows (e.g. all empty or just commas)
    const isAllEmpty = cols.every(col => !col.trim());
    if (isAllEmpty) return;

    const rowErrors: string[] = [];
    const rowNum = i + 2; // +2 because header is row 1
    
    const parsedLength = cols.length;
    while (cols.length < 19) {
      cols.push('');
    }

    const level = cols[0]; const category = cols[1]; const subPart = cols[2];
    const title = cols[3]; const exType = cols[4] || 'Interactive';
    const qText = cols[5]; const qType = cols[6] || 'MCQ';
    const correctAnswer = cols[7];
    const opt1 = cols[8]; const opt2 = cols[9];
    const opt3 = cols[10]; const opt4 = cols[11];
    const mediaUrl = cols[12]; const hint = cols[13];
    const explanation = cols[14]; const access = cols[15] || 'FREE_ALL';
    const transcript = cols[16];
    const guidance = cols[17];
    const modelAnswer = cols[18];

    if (parsedLength < 8) rowErrors.push(`Row ${rowNum}: Not enough columns (${parsedLength}/19)`);
    if (!LEVELS.includes(level as any)) rowErrors.push(`Row ${rowNum}: Invalid level "${level}"`);
    if (!['Listening', 'Writing', 'Reading', 'Grammar', 'Games'].includes(category)) rowErrors.push(`Row ${rowNum}: Invalid category "${category}"`);
    if (!title) rowErrors.push(`Row ${rowNum}: Missing exercise title`);
    if (exType === 'Interactive') {
      if (!qText) rowErrors.push(`Row ${rowNum}: Missing question text`);
      if (!correctAnswer) rowErrors.push(`Row ${rowNum}: Missing correct answer`);
      if (qType === 'MCQ' && !opt1 && !opt2) rowErrors.push(`Row ${rowNum}: MCQ needs at least 2 options`);
      if (!['MCQ', 'FILL_BLANK', 'TRUE_FALSE'].includes(qType)) {
        rowErrors.push(`Row ${rowNum}: Invalid question type "${qType}"`);
      } else if (qType === 'FILL_BLANK') {
        const blanks = (qText.match(/_{3,}|\[blank\]/g) || []).length;
        if (blanks > 1) {
          const ansCount = correctAnswer.split('|').length;
          if (ansCount !== blanks) {
            rowErrors.push(`Row ${rowNum}: Question text has ${blanks} blanks, but correct_answer has ${ansCount} pipe-separated values ('${correctAnswer}')`);
          }
        }
      }
    }

    const key = `${level}|${category}|${title}`;
    if (!map.has(key)) {
      map.set(key, {
        id: 'e' + Date.now() + Math.random().toString(36).slice(2, 6),
        title, level, category, subPart, type: exType, access, mediaUrl,
        transcript, guidance, modelAnswer,
        questions: [], errors: [], valid: true
      });
    }
    const ex = map.get(key)!;
    ex.errors.push(...rowErrors);
    if (rowErrors.length > 0) ex.valid = false;
    if (exType === 'Interactive' && qText) {
      ex.questions.push({ text: qText, type: qType, correctAnswer, options: [opt1, opt2, opt3, opt4].filter(Boolean), hint, explanation });
    }
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
    const header = 'level,category,sub_part,exercise_title,exercise_type,question_text,question_type,correct_answer,option1,option2,option3,option4,media_url,hint,explanation,access_flag,transcript,guidance,model_answer\n';
    const rows = exercises.flatMap(e => {
      const guidanceStr = e.guidance ? JSON.stringify(e.guidance) : '';
      if (e.type === 'Passive') {
        return [`${escapeCSVField(e.level)},${escapeCSVField(e.category)},${escapeCSVField(e.subPart)},${escapeCSVField(e.title)},Passive,${escapeCSVField(e.prompt || '')},,,,,,,,,,${escapeCSVField(e.access)},${escapeCSVField(e.transcript || '')},${escapeCSVField(guidanceStr)},${escapeCSVField(e.modelAnswer || '')}`];
      }
      return (e.questions || []).map(q => {
        const opts = q.options || ['', '', '', ''];
        return `${escapeCSVField(e.level)},${escapeCSVField(e.category)},${escapeCSVField(e.subPart)},${escapeCSVField(e.title)},Interactive,${escapeCSVField(q.text)},${escapeCSVField(q.type)},${escapeCSVField(q.correctAnswer)},${escapeCSVField(opts[0] || '')},${escapeCSVField(opts[1] || '')},${escapeCSVField(opts[2] || '')},${escapeCSVField(opts[3] || '')},${escapeCSVField(e.mediaUrl || '')},${escapeCSVField(q.hint || '')},${escapeCSVField(q.explanation || '')},${escapeCSVField(e.access)},${escapeCSVField(e.transcript || '')},${escapeCSVField(guidanceStr)},${escapeCSVField(e.modelAnswer || '')}`;
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
          transcript: ex.transcript || undefined,
          prompt: ex.type === 'Passive' ? ex.questions[0]?.text || undefined : undefined,
          guidance: (() => {
            if (!ex.guidance) return undefined;
            try {
              return JSON.parse(ex.guidance);
            } catch (e) {
              return ex.guidance.split(',').map(s => s.trim());
            }
          })(),
          modelAnswer: ex.modelAnswer || undefined,
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '12px 16px', borderRadius: '9px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)', wordBreak: 'break-all', lineHeight: 1.8 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>19 Columns: </span>
              level, category, sub_part, exercise_title, exercise_type, question_text, question_type, correct_answer, option1, option2, option3, option4, media_url, hint, explanation, access_flag, <span style={{ color: 'var(--accent-text)', fontWeight: 600 }}>transcript, guidance, model_answer</span>
            </div>
            <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', marginBottom: 0 }}>
              Rows sharing the same level + category + title are grouped into one exercise with multiple questions.
            </p>
          </div>

          {/* Per-category notes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { cat: 'Listening', type: 'Interactive', fields: 'media_url (audio), transcript (optional), MCQ / FILL_BLANK / TRUE_FALSE questions' },
              { cat: 'Reading',   type: 'Interactive', fields: 'transcript (reading passage text), MCQ / FILL_BLANK / TRUE_FALSE questions' },
              { cat: 'Writing',   type: 'Passive',     fields: 'question_text = prompt, guidance (comma-separated bullets), model_answer' },
              { cat: 'Grammar',   type: 'Interactive', fields: 'MCQ / FILL_BLANK / TRUE_FALSE questions. No media or transcript needed.' },
              { cat: 'Games',     type: 'Interactive', fields: 'MCQ / FILL_BLANK questions. No media or transcript needed.' },
            ].map(n => (
              <div key={n.cat} style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>{n.cat}</span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', padding: '1px 6px', borderRadius: '999px', background: 'var(--accent-light)', color: 'var(--accent-text)' }}>{n.type}</span>
                </div>
                <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{n.fields}</p>
              </div>
            ))}
          </div>

          {/* Valid values */}
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <div><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>level: </span>A1 | A2 | B1 | B2</div>
            <div><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>category: </span>Listening | Reading | Writing | Grammar | Games</div>
            <div><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>exercise_type: </span>Interactive | Passive</div>
            <div><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>question_type: </span>MCQ | FILL_BLANK | TRUE_FALSE</div>
            <div><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>access_flag: </span>FREE_ALL | FREE_REGISTERED | PAID</div>
          </div>
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
