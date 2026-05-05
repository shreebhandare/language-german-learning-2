import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { LEVELS, Level, AccessFlag, Exercise } from '@/lib/langrushi-data';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Download, Upload, CheckCircle, XCircle, ChevronDown, ChevronUp, AlertTriangle, Eye, Trash2 } from 'lucide-react';

interface ParsedExercise {
  id: string;
  title: string;
  level: string;
  category: string;
  subPart: string;
  type: string;
  access: string;
  mediaUrl: string;
  questions: { text: string; type: string; correctAnswer: string; options: string[]; hint: string; explanation: string }[];
  errors: string[];
  valid: boolean;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
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
  const exerciseMap = new Map<string, ParsedExercise>();

  lines.forEach((line, i) => {
    const cols = parseCSVLine(line);
    const rowErrors: string[] = [];
    const rowNum = i + 2;

    const level = cols[0] || '';
    const category = cols[1] || '';
    const subPart = cols[2] || '';
    const title = cols[3] || '';
    const exType = cols[4] || 'Interactive';
    const qText = cols[5] || '';
    const qType = cols[6] || 'MCQ';
    const correctAnswer = cols[7] || '';
    const opt1 = cols[8] || '';
    const opt2 = cols[9] || '';
    const opt3 = cols[10] || '';
    const opt4 = cols[11] || '';
    const mediaUrl = cols[12] || '';
    const hint = cols[13] || '';
    const explanation = cols[14] || '';
    const access = cols[15] || 'FREE_ALL';

    // Validate
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
    if (!exerciseMap.has(key)) {
      exerciseMap.set(key, {
        id: 'e' + Date.now() + Math.random().toString(36).slice(2, 6),
        title, level, category, subPart, type: exType, access, mediaUrl,
        questions: [], errors: [], valid: true,
      });
    }

    const ex = exerciseMap.get(key)!;
    ex.errors.push(...rowErrors);
    if (rowErrors.length > 0) ex.valid = false;

    if (exType === 'Interactive' && qText) {
      ex.questions.push({
        text: qText, type: qType, correctAnswer,
        options: [opt1, opt2, opt3, opt4].filter(Boolean),
        hint, explanation,
      });
    }
  });

  return Array.from(exerciseMap.values());
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
        return `${e.level},${e.category},${e.subPart},"${e.title}",Interactive,"${q.text}",${q.type},"${q.correctAnswer}","${opts[0] || ''}","${opts[1] || ''}","${opts[2] || ''}","${opts[3] || ''}","${e.mediaUrl || ''}","${q.hint || ''}","${q.explanation || ''}",${e.access}`;
      });
    });
    const csv = header + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'exercises.csv'; a.click();
    toast({ title: 'Exported CSV' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseCSV(text);
      setParsed(result);
      setExcluded(new Set());
      setExpandedIdx(null);
      const validCount = result.filter(r => r.valid).length;
      const invalidCount = result.length - validCount;
      toast({
        title: `Parsed ${result.length} exercises`,
        description: `${validCount} valid, ${invalidCount} with errors. Review below before importing.`,
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportAll = async () => {
    if (!parsed) return;
    const toImport = parsed.filter((ex, i) => ex.valid && !excluded.has(i));
    if (toImport.length === 0) { toast({ title: 'No valid exercises to import' }); return; }

    setImporting(true);
    let imported = 0;
    for (const ex of toImport) {
      try {
        const exercise: Exercise = {
          id: ex.id,
          title: ex.title,
          level: ex.level as Level,
          category: ex.category as any,
          subPart: ex.subPart,
          type: ex.type as any,
          access: (ex.access || 'FREE_ALL') as AccessFlag,
          mediaUrl: ex.mediaUrl || undefined,
          questions: ex.type === 'Interactive' ? ex.questions.map((q, qi) => ({
            id: `${ex.id}_q${qi}`,
            text: q.text, type: q.type as any, correctAnswer: q.correctAnswer,
            options: q.type === 'MCQ' ? q.options : undefined,
            hint: q.hint || undefined, explanation: q.explanation || undefined,
          })) : undefined,
        };
        await addExercise(exercise);
        imported++;
      } catch (err) {
        console.error('Failed to import:', ex.title, err);
      }
    }
    setImporting(false);
    toast({ title: `Imported ${imported} exercises`, description: 'They are now live in the quiz library.' });
    setParsed(null);
  };

  const validCount = parsed ? parsed.filter((ex, i) => ex.valid && !excluded.has(i)).length : 0;
  const totalErrors = parsed ? parsed.reduce((s, ex) => s + ex.errors.length, 0) : 0;

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-xl">CSV Bulk Import / Export</h2>

      {/* Export & Import cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold mb-2">Export</h3>
          <p className="text-sm text-slate-600 mb-3">Download all {exercises.length} exercises as CSV.</p>
          <Button onClick={exportCSV} variant="outline"><Download className="w-4 h-4 mr-1" /> Download CSV</Button>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold mb-2">Import</h3>
          <p className="text-sm text-slate-600 mb-3">Upload CSV → preview & validate → then import.</p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a192f] text-white rounded cursor-pointer hover:bg-[#020c1b]">
            <Upload className="w-4 h-4" /> Choose CSV file
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Schema reference */}
      <div className="bg-slate-50 border rounded-lg p-4">
        <div className="text-xs font-mono text-slate-600 break-all">
          <span className="font-bold text-black">Schema:</span> level, category, sub_part, exercise_title, exercise_type, question_text, question_type, correct_answer, option1, option2, option3, option4, media_url, hint, explanation, access_flag
        </div>
        <p className="text-xs text-slate-500 mt-2">Rows sharing the same level + category + title are grouped into one exercise with multiple questions.</p>
      </div>

      {/* Preview table */}
      {parsed && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="bg-white border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-bold text-black">{parsed.length}</div>
                <div className="text-xs text-slate-500">Exercises parsed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{validCount}</div>
                <div className="text-xs text-slate-500">Ready to import</div>
              </div>
              {totalErrors > 0 && (
                <div>
                  <div className="text-2xl font-bold text-red-500">{totalErrors}</div>
                  <div className="text-xs text-slate-500">Errors found</div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setParsed(null)}>Discard</Button>
              <Button
                onClick={handleImportAll}
                disabled={importing || validCount === 0}
                className="bg-[#0a192f] hover:bg-[#020c1b]"
              >
                {importing ? 'Importing...' : `Import ${validCount} Exercises`}
              </Button>
            </div>
          </div>

          {/* Exercise list */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="divide-y divide-slate-100">
              {parsed.map((ex, idx) => {
                const isExpanded = expandedIdx === idx;
                const isExcluded = excluded.has(idx);
                return (
                  <div key={idx} className={isExcluded ? 'opacity-40' : ''}>
                    <button
                      onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                      className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      {ex.valid ? (
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-black truncate">{ex.title || '(untitled)'}</div>
                        <div className="text-xs text-slate-500">
                          {ex.level} · {ex.category} · {ex.type} · {ex.questions.length} questions
                        </div>
                      </div>
                      {ex.errors.length > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold shrink-0">
                          {ex.errors.length} errors
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                        {ex.access.replace('_', ' ')}
                      </span>
                      {!isExcluded && ex.valid && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setExcluded(prev => new Set([...prev, idx])); }}
                          className="text-slate-400 hover:text-red-500 shrink-0"
                          title="Exclude from import"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                    </button>

                    {isExpanded && (
                      <div className="bg-slate-50 px-4 pb-4 space-y-3">
                        {/* Errors */}
                        {ex.errors.length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <h4 className="text-xs font-bold text-red-800 mb-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Validation Errors
                            </h4>
                            <ul className="text-xs text-red-700 space-y-0.5">
                              {ex.errors.map((err, ei) => <li key={ei}>• {err}</li>)}
                            </ul>
                          </div>
                        )}

                        {/* Questions preview */}
                        {ex.questions.length > 0 && (
                          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                            <div className="p-3 border-b border-slate-100 bg-slate-50">
                              <h4 className="text-xs font-bold text-black flex items-center gap-1">
                                <Eye className="w-3 h-3" /> Questions Preview
                              </h4>
                            </div>
                            <table className="w-full text-xs">
                              <thead className="bg-slate-50 text-left">
                                <tr>
                                  <th className="p-2.5 w-8">#</th>
                                  <th className="p-2.5">Question</th>
                                  <th className="p-2.5">Type</th>
                                  <th className="p-2.5">Answer</th>
                                  <th className="p-2.5">Options</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {ex.questions.map((q, qi) => (
                                  <tr key={qi} className="hover:bg-slate-50">
                                    <td className="p-2.5 font-bold text-slate-400">{qi + 1}</td>
                                    <td className="p-2.5 font-medium text-black max-w-[200px] truncate">{q.text}</td>
                                    <td className="p-2.5">
                                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">{q.type}</span>
                                    </td>
                                    <td className="p-2.5 font-bold text-green-700">{q.correctAnswer}</td>
                                    <td className="p-2.5 text-slate-500">
                                      {q.type === 'MCQ' ? q.options.join(' | ') : '—'}
                                    </td>
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
        </div>
      )}
    </div>
  );
};

export default CSVAdmin;
