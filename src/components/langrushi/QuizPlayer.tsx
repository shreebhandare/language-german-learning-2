import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Exercise, Question } from '@/lib/langrushi-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, HelpCircle, Lightbulb, Headphones, RotateCcw, Award, X, Check, FileText, Clock } from 'lucide-react';

interface Props { exercise: Exercise; onClose: () => void; }

const QuizPlayer: React.FC<Props> = ({ exercise, onClose }) => {
  const { recordAttempt, user, exercises, answerDisplayMode } = useAppContext();
  
  const allowSkip = exercise.allowSkip !== false;

  const questions = exercise.questions || [];
  const [queue, setQueue] = useState<number[]>(() => questions.map((_, i) => i));
  const [queueIdx, setQueueIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [scores, setScores] = useState<Record<string, boolean>>({});
  const [startTime] = useState(Date.now());
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishConfirmText, setFinishConfirmText] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  
  if (exercise.type === 'Passive') return <PassiveExercise exercise={exercise} onClose={onClose} isCourseMatch={user?.tier === 'course' && user.courseLevel === exercise.level} />;

  if (questions.length === 0) return <div className="p-8 text-center">No questions found</div>;

  const qIdx = queue[queueIdx];
  const q = questions[qIdx];
  const totalUnique = questions.length;
  const currentAnswer = answers[q.id] || '';

  const checkAnswer = (question: Question, val: string) => {
    if (question.type === 'FILL_BLANK') return val.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    return val === question.correctAnswer;
  };

  const isCorrect = () => checkAnswer(q, currentAnswer);

  const evaluateAndNext = (currentScores: Record<string, boolean>) => {
    const nextIdx = queueIdx + 1;
    if (nextIdx >= queue.length) {
      const correctCount = Object.values(currentScores).filter(Boolean).length;
      recordAttempt(exercise.id, correctCount, totalUnique);
      setShowResults(true);
    } else {
      setQueueIdx(nextIdx);
      setSubmitted(false);
      setShowHint(false);
    }
  };

  const handleSubmit = () => {
    if (answerDisplayMode === 'instant') {
      if (!submitted) {
        const correct = isCorrect();
        setScores(prev => {
          if (q.id in prev) return prev; // Keep original score (0 points)
          return { ...prev, [q.id]: correct };
        });
        setSubmitted(true);
      } else {
        evaluateAndNext(scores);
      }
    } else {
      // For 'end' or 'none' display mode
      const correct = isCorrect();
      let newScores = { ...scores };
      if (!(q.id in newScores)) newScores[q.id] = correct;
      setScores(newScores);
      evaluateAndNext(newScores);
    }
  };

  const canSubmit = (answerDisplayMode === 'instant' && submitted) || currentAnswer.trim().length > 0;

  const handleSkip = () => {
    setAnswers(prev => ({ ...prev, [q.id]: '' })); // Clear any partial answer
    const newScores = { ...scores, [q.id]: false };
    setScores(newScores); // Mark as incorrect permanently
    
    const nextIdx = queueIdx + 1;
    if (nextIdx >= queue.length) {
      const correctCount = Object.values(newScores).filter(Boolean).length;
      recordAttempt(exercise.id, correctCount, totalUnique);
      setShowResults(true);
    } else {
      setQueueIdx(nextIdx);
      setSubmitted(false);
      setShowHint(false);
    }
  };

  const forceSubmit = () => {
    if (finishConfirmText.trim() !== 'SUBMIT') return;
    
    let newScores = { ...scores };
    if (currentAnswer.trim() && !(q.id in newScores)) {
      newScores[q.id] = isCorrect();
      setScores(newScores);
    }
    const correctCount = Object.values(newScores).filter(Boolean).length;
    recordAttempt(exercise.id, correctCount, totalUnique);
    setShowResults(true);
    setShowFinishModal(false);
  };

  if (showResults) {
    const correctCount = Object.values(scores).filter(Boolean).length;
    const pct = Math.round((correctCount / totalUnique) * 100);
    const passed = pct >= 70;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;

    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 text-center animate-in zoom-in duration-300">
            {passed && <div className="text-5xl mb-4">🎉</div>}
            <div className={`text-6xl font-bold font-serif leading-none mb-2 ${pct >= 70 ? 'text-green-500' : pct >= 40 ? 'text-orange-500' : 'text-red-500'}`}>{pct}%</div>
            <p className={`text-lg font-bold mb-2 ${pct >= 70 ? 'text-green-500' : pct >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
              {pct >= 70 ? "Excellent work!" : pct >= 40 ? "Good effort — keep practicing!" : "Keep going — you'll improve!"}
            </p>
            <p className="text-sm text-slate-400 flex items-center justify-center gap-1 mt-2 mb-8">
              <Clock className="w-4 h-4" /> {mins}m {secs}s
            </p>
            <div className="text-lg text-slate-500 mb-2">{correctCount} / {totalUnique} correct</div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-500">{correctCount}</div>
                <div className="text-xs text-slate-400 mt-1">Correct</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-500">{totalUnique - correctCount}</div>
                <div className="text-xs text-slate-400 mt-1">Wrong</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className={`text-2xl font-bold ${pct >= 70 ? 'text-green-500' : pct >= 40 ? 'text-orange-500' : 'text-red-500'}`}>{pct}%</div>
                <div className="text-xs text-slate-400 mt-1">Score</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <Button variant="outline" size="lg" onClick={() => { setQueue(questions.map((_, i) => i)); setQueueIdx(0); setAnswers({}); setScores({}); setSubmitted(false); setShowResults(false); }}>
                <RotateCcw className="w-4 h-4 mr-2" /> Retake
              </Button>
              <Button size="lg" className="bg-[#0a192f] hover:bg-[#020c1b]" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
              </Button>
            </div>

            {/* Review Section */}
            {(answerDisplayMode === 'instant' || answerDisplayMode === 'end') && (
              <div className="mt-12 text-left border-t pt-8">
                <h3 className="text-xl font-bold mb-6 font-serif">Review Answers</h3>
                <div className="space-y-6">
                  {questions.map((question, idx) => {
                    const ans = answers[question.id] || '';
                    const isQCorrect = !!scores[question.id];
                    return (
                      <div key={question.id} className={`p-5 rounded-xl border ${isQCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                        <p className="font-bold mb-3">{idx + 1}. {question.text}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500 block mb-1">Your answer:</span>
                            <div className={`font-medium ${isQCorrect ? 'text-green-700' : 'text-red-700'}`}>
                              {ans || <span className="italic opacity-50">Skipped/No answer</span>}
                            </div>
                          </div>
                          {!isQCorrect && (
                            <div>
                              <span className="text-slate-500 block mb-1">Correct answer:</span>
                              <div className="font-bold text-green-700">{question.correctAnswer}</div>
                            </div>
                          )}
                        </div>
                        {question.explanation && (
                          <div className="mt-4 text-sm text-slate-600 bg-white/50 p-3 rounded border border-white">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const questionElement = (
    <div className="w-full">
      <h2 className="text-xl md:text-2xl font-bold text-center mb-8 leading-relaxed font-serif">
        {q.text}
      </h2>

      {/* MCQ */}
      {q.type === 'MCQ' && (
        <div className="flex flex-col gap-3">
          {q.options?.map((opt, i) => {
            const selected = currentAnswer === opt;
            const correct = submitted && opt === q.correctAnswer;
            const wrong = submitted && selected && opt !== q.correctAnswer;
            
            let bg = 'bg-white', border = 'border-slate-200', text = 'text-slate-800';
            if (correct) { bg = 'bg-green-500'; border = 'border-green-500'; text = 'text-white'; }
            else if (wrong) { bg = 'bg-red-500'; border = 'border-red-500'; text = 'text-white'; }
            else if (selected) { bg = 'bg-blue-600'; border = 'border-blue-600'; text = 'text-white'; }

            return (
              <button 
                key={opt} 
                onClick={() => !submitted && setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                disabled={submitted}
                className={`w-full min-h-[56px] p-4 border rounded-xl flex items-center gap-3 text-left text-base font-medium transition-all ${bg} ${border} ${text} ${!submitted && 'hover:border-blue-400 hover:shadow-sm cursor-pointer'}`}
              >
                <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold border border-white/30 shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
                {submitted && opt === q.correctAnswer && <CheckCircle2 className="w-5 h-5 ml-auto shrink-0" />}
                {submitted && selected && opt !== q.correctAnswer && <XCircle className="w-5 h-5 ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Fill in the Blank */}
      {q.type === 'FILL_BLANK' && (
        <div className="w-full">
          {(q.options && q.options.filter(o => o.trim()).length > 0) ? (
            <select
              value={currentAnswer}
              onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
              disabled={submitted}
              className={`w-full h-14 px-4 text-center text-lg font-medium rounded-xl border-2 outline-none ${submitted ? (isCorrect() ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-slate-200 focus:border-blue-500'}`}
            >
              <option value="" disabled>Select an option...</option>
              {q.options.filter(o => o.trim()).map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <Input 
              value={currentAnswer} 
              onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} 
              disabled={submitted} 
              placeholder="Type your answer..." 
              className={`h-14 text-center text-lg rounded-xl border-2 ${submitted ? (isCorrect() ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-slate-200 focus-visible:border-blue-500 focus-visible:ring-0'}`} 
            />
          )}
          {submitted && !isCorrect() && (
            <div className="mt-4 text-center text-green-600 font-medium">
              Correct answer: <strong className="font-bold">{q.correctAnswer}</strong>
            </div>
          )}
        </div>
      )}

      {/* True / False */}
      {q.type === 'TRUE_FALSE' && (
        <div className="grid grid-cols-2 gap-4">
          {(q.options || ['True', 'False']).map((opt) => {
            const selected = currentAnswer === opt;
            const correct = submitted && opt === q.correctAnswer;
            const wrong = submitted && selected && opt !== q.correctAnswer;
            
            let bg = 'bg-white', border = 'border-slate-200', text = 'text-slate-800';
            if (correct) { bg = 'bg-green-500'; border = 'border-green-500'; text = 'text-white'; }
            else if (wrong) { bg = 'bg-red-500'; border = 'border-red-500'; text = 'text-white'; }
            else if (selected) { bg = 'bg-blue-600'; border = 'border-blue-600'; text = 'text-white'; }

            return (
              <button 
                key={opt} 
                onClick={() => !submitted && setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                disabled={submitted}
                className={`h-20 border rounded-xl flex flex-col items-center justify-center gap-1.5 text-base font-bold transition-all ${bg} ${border} ${text} ${!submitted && 'hover:border-blue-400 hover:shadow-sm cursor-pointer'}`}
              >
                {opt === 'True' ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Hint */}
      {!submitted && q.hint && (
        <div className="mt-6 text-center">
          <button onClick={() => setShowHint(!showHint)} className="text-blue-500 hover:underline text-sm font-medium inline-flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4" /> {showHint ? "Hide Hint" : "Show Hint"}
          </button>
          {showHint && (
            <div className="mt-3 bg-blue-50 text-blue-800 p-3 rounded-lg text-sm text-left animate-in slide-in-from-top-2 duration-200 border border-blue-100">
              💡 {q.hint}
            </div>
          )}
        </div>
      )}

      {/* Feedback after submission */}
      {submitted && (
        <div className="mt-8 animate-in slide-in-from-bottom-4 duration-300">
          <div className={`p-4 rounded-xl mb-4 border flex items-center gap-3 font-semibold ${isCorrect() ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {isCorrect() ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {isCorrect() ? "Correct! Well done!" : "Not quite. Keep going!"}
          </div>
          
          {q.explanation && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-700 mb-1">Explanation</p>
                <p className="text-sm text-slate-700 leading-relaxed">{q.explanation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top progress bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="h-2 bg-slate-100">
          <div 
            className="h-full bg-blue-600 transition-all duration-500" 
            style={{ width: `${((queueIdx + (submitted ? 1 : 0)) / queue.length) * 100}%` }} 
          />
        </div>
        <div className="flex items-center justify-between px-6 h-14">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex items-center gap-1.5 text-sm font-medium transition-colors">
            <X className="w-4 h-4" /> Quit
          </button>
          <span className="text-sm font-bold text-slate-500">Question {queueIdx + 1} of {queue.length}</span>
          <button onClick={() => setShowFinishModal(true)} className="text-blue-500 hover:text-blue-700 text-sm font-bold transition-colors">
            Finish Early
          </button>
        </div>
      </div>

      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-bold mb-2">Finish Quiz Early?</h3>
            <p className="text-sm text-slate-500 mb-6">
              You will be scored based on your current progress. Unanswered questions will receive 0 points.
            </p>
            <p className="text-sm font-bold mb-2">Type SUBMIT to confirm:</p>
            <Input 
              value={finishConfirmText}
              onChange={e => setFinishConfirmText(e.target.value)}
              placeholder="SUBMIT"
              className="text-center mb-6 font-mono font-bold"
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setShowFinishModal(false); setFinishConfirmText(''); }}>Cancel</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={forceSubmit} disabled={finishConfirmText.trim() !== 'SUBMIT'}>Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-4 py-8 pb-32">
        {exercise.category === 'Reading' && exercise.transcript ? (
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Reading Passage Column */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:sticky md:top-20 max-h-[70vh] overflow-y-auto shadow-sm">
              <h3 className="text-lg font-bold font-serif mb-4 flex items-center gap-2 text-slate-800 border-b pb-3">
                <FileText className="w-5 h-5 text-blue-600" /> Lesetext (Reading Passage)
              </h3>
              <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line font-serif">
                {exercise.transcript}
              </p>
            </div>
            
            {/* Questions Column */}
            <div className="w-full">
              {questionElement}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl">
            {exercise.mediaUrl && (
              <div className="mb-8 bg-gradient-to-br from-blue-50 to-orange-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between text-sm font-medium text-black mb-2">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-red-600" /> Listen to the audio for context
                  </div>
                  {exercise.transcript && (
                    <button
                      onClick={() => setShowTranscript(prev => !prev)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white/80 hover:bg-white border border-blue-200 rounded-lg px-3 py-1.5 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
                    </button>
                  )}
                </div>
                <audio controls className="w-full" src={exercise.mediaUrl} />
              </div>
            )}

            {/* Transcript Sidebar */}
            {exercise.transcript && (
              <div
                className={`fixed top-0 right-0 h-full w-[340px] z-50 bg-white/95 backdrop-blur-xl border-l border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out ${showTranscript ? 'translate-x-0' : 'translate-x-full'}`}
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" /> Transcript
                  </h3>
                  <button
                    onClick={() => setShowTranscript(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{exercise.transcript}</p>
                </div>
              </div>
            )}

            {questionElement}
          </div>
        )}
      </div>

      {/* Bottom submit bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          {allowSkip && !submitted && (
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base font-bold text-slate-500 hover:text-slate-800"
              onClick={handleSkip}
            >
              Skip
            </Button>
          )}
          <Button 
            size="lg" 
            className="flex-1 h-14 text-base font-bold bg-[#0a192f] hover:bg-[#020c1b]" 
            onClick={handleSubmit} 
            disabled={!canSubmit}
          >
            {answerDisplayMode === 'instant' && submitted ? (queueIdx + 1 >= queue.length ? "See Results" : "Next Question") : "Submit Answer"}
            {answerDisplayMode === 'instant' && submitted && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

const PassiveExercise: React.FC<{ exercise: Exercise; onClose: () => void; isCourseMatch: boolean }> = ({ exercise, onClose, isCourseMatch }) => {
  const { recordAttempt, exercises, setActiveExerciseId } = useAppContext();
  useEffect(() => { recordAttempt(exercise.id, 1, 1); }, [recordAttempt, exercise.id]);

  const sameCategoryEx = exercises.filter(e => e.category === exercise.category && e.level === exercise.level);
  const idx = sameCategoryEx.findIndex(e => e.id === exercise.id);
  const next = sameCategoryEx[idx + 1];
  const prev = sameCategoryEx[idx - 1];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-8">
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-6">
          <Button variant="ghost" onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded uppercase">{exercise.level}</span>
            <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded uppercase">{exercise.category}</span>
            {isCourseMatch && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">🔔 Course match</span>}
          </div>
          <h1 className="text-3xl font-bold text-black font-serif mb-8">{exercise.title}</h1>

          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Task</h2>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-slate-800 leading-relaxed">
              {exercise.prompt}
            </div>
          </div>

          {exercise.guidance && (
            <div className="mt-8">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Include</h2>
              <ul className="space-y-2">
                {exercise.guidance.map((g, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Model answer</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 whitespace-pre-line text-slate-800 font-serif leading-relaxed text-lg">
              {exercise.modelAnswer}
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between gap-3">
            <Button variant="outline" disabled={!prev} onClick={() => prev && setActiveExerciseId(prev.id)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button className="bg-[#0a192f] hover:bg-[#020c1b]" disabled={!next} onClick={() => next && setActiveExerciseId(next.id)}>
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPlayer;
