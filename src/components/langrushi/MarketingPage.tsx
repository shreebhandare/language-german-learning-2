import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ArrowRight, BookOpen, Headphones, PenTool, Gamepad2, CheckCircle2, Star, Users, Award, Globe } from 'lucide-react';

const MarketingPage: React.FC = () => {
  const { setView, setAuthModal, user } = useAppContext();
  const [email, setEmail] = useState('');

  const features = [
    { icon: Headphones, title: 'Listening Practice', desc: 'Audio exercises with native speakers, A1 to B2.' },
    { icon: PenTool, title: 'Writing Models', desc: 'Read full-length model answers and improve your style.' },
    { icon: BookOpen, title: 'Grammar Drills', desc: 'Bite-size grammar quizzes — always free, no login.' },
    { icon: Gamepad2, title: 'Vocabulary Games', desc: 'Learn through play. Earn streaks. Stay motivated.' },
  ];

  const levels = [
    { code: 'A1', name: 'Beginner', desc: 'Greetings, numbers, basic conversations' },
    { code: 'A2', name: 'Elementary', desc: 'Daily life, shopping, travel basics' },
    { code: 'B1', name: 'Intermediate', desc: 'Work, opinions, complex topics' },
    { code: 'B2', name: 'Upper-Int.', desc: 'Argumentation, abstract themes, fluency' },
  ];

  const testimonials = [
    { name: 'Maria K.', level: 'B1 student', text: 'Passed my Goethe B1 first try. The listening exercises are gold.' },
    { name: 'Daniel S.', level: 'A2 student', text: 'Finally a platform that explains German grammar without making my head spin.' },
    { name: 'Aisha R.', level: 'B2 student', text: 'The model answers transformed my writing. Worth every euro.' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white border border-blue-200 px-3 py-1.5 rounded-full text-sm font-medium text-red-600 mb-5">
                <span className="w-2 h-2 rounded-full bg-[#0a192f] animate-pulse"></span>
                New: B2 listening exercises now live
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight tracking-tight">
                Master German
                <span className="block bg-gradient-to-r from-[#1D4ED8] to-[#EA580C] bg-clip-text text-transparent">with confidence.</span>
              </h1>
              <p className="mt-6 text-lg text-black max-w-xl">
                From A1 to B2 — practice listening, writing, grammar, and vocabulary with hand-crafted exercises that mirror real Goethe & telc exams.
              </p>

              {/* <div className="mt-6 flex items-center gap-6 text-sm text-black">
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-600" /> No credit card</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-600" /> Grammar always free</div>
              </div> */}
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-200/50 to-orange-200/50 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold bg-blue-100 text-red-600 px-2 py-1 rounded">A1 · LISTENING</span>
                  <span className="text-xs text-black">Question 2 of 5</span>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0a192f] flex items-center justify-center text-white">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Am Bahnhof</div>
                    <div className="flex gap-0.5 mt-1">
                      {[3, 5, 7, 4, 6, 8, 5, 4, 6, 7, 3, 5, 7].map((h, i) => (
                        <div key={i} className="w-1 bg-[#0a192f] rounded" style={{ height: h * 2 }}></div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="font-medium text-black mb-3">Wo befindet sich die Person?</p>
                <div className="space-y-2">
                  {['Im Park', 'Am Bahnhof', 'Im Café', 'Zu Hause'].map((opt, i) => (
                    <div key={i} className={`p-3 rounded-lg border text-sm ${i === 1 ? 'bg-green-50 border-green-300 text-green-800' : 'border-slate-200'}`}>
                      {opt} {i === 1 && <CheckCircle2 className="inline w-4 h-4 ml-1" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-slate-200">
            {[
              { icon: Users, num: '12,400+', label: 'Active learners' },
              { icon: BookOpen, num: '500+', label: 'Exercises' },
              { icon: Award, num: '94%', label: 'Pass rate' },
              { icon: Globe, num: '60+', label: 'Countries' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <s.icon className="w-6 h-6 mx-auto text-red-600 mb-2" />
                <div className="text-2xl font-bold text-black">{s.num}</div>
                <div className="text-sm text-black">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black">Everything you need to pass your exam</h2>
            <p className="mt-3 text-lg text-black">Four pillars of German mastery, structured by CEFR level.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group p-6 rounded-xl border border-slate-200 hover:border-[#1D4ED8] hover:shadow-lg transition cursor-pointer" onClick={() => setView('learn')}>
                <div className="w-12 h-12 rounded-lg bg-blue-50 group-hover:bg-[#0a192f] flex items-center justify-center mb-4 transition">
                  <f.icon className="w-6 h-6 text-red-600 group-hover:text-white transition" />
                </div>
                <h3 className="font-semibold text-lg text-black mb-1">{f.title}</h3>
                <p className="text-sm text-black">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Levels */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black">Learn at your level</h2>
            <p className="mt-3 text-lg text-black">Structured CEFR-aligned content. Start anywhere.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {levels.map((l, i) => (
              <button key={i} onClick={() => setView('learn')} className="text-left bg-white p-6 rounded-xl border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full text-white font-bold text-lg mb-4 ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-[#0a192f]' : i === 2 ? 'bg-purple-600' : 'bg-[#0a192f]'
                  }`}>{l.code}</div>
                <h3 className="font-bold text-xl text-black">{l.name}</h3>
                <p className="text-sm text-black mt-1">{l.desc}</p>
                <div className="mt-4 text-sm font-medium text-red-600 flex items-center gap-1">
                  Browse exercises <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-12">Loved by learners worldwide</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex gap-0.5 text-yellow-400 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-black mb-4">"{t.text}"</p>
                <div className="text-sm">
                  <div className="font-semibold text-black">{t.name}</div>
                  <div className="text-black">{t.level}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#1D4ED8] to-[#EA580C]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to speak German with confidence?</h2>
          <p className="mt-3 text-lg text-blue-50">Join 12,000+ learners. Start practicing in 30 seconds.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-white text-red-600 hover:bg-slate-100 h-12 px-6 text-base font-semibold" onClick={() => user ? setView('learn') : setAuthModal('register')}>
              Try free quizzes <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10 h-12 px-6 text-base bg-transparent" onClick={() => setView('pricing')}>
              View pricing
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MarketingPage;
