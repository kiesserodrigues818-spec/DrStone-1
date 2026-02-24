/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  User, 
  Flame, 
  Zap, 
  ChevronRight, 
  CheckCircle2, 
  BrainCircuit,
  Star,
  Timer,
  Award,
  ArrowRight,
  Loader2,
  X,
  Moon,
  Sun,
  Library,
  GraduationCap,
  Stethoscope,
  Syringe,
  Book,
  Share2,
  Link as LinkIcon,
  Download,
  CloudOff,
  Database,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import confetti from 'canvas-confetti';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { INITIAL_STATS, STUDY_MODULES, type UserStats, type StudyModule } from './types';
import { generateMedicalQuiz, generateStudyContent, type QuizQuestion } from './services/geminiService';
import { storageService } from './services/storageService';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PERFORMANCE_DATA = [
  { day: 'Seg', score: 65 },
  { day: 'Ter', score: 72 },
  { day: 'Qua', score: 68 },
  { day: 'Qui', score: 85 },
  { day: 'Sex', score: 78 },
  { day: 'Sáb', score: 92 },
  { day: 'Dom', score: 88 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'study' | 'quiz' | 'profile'>('dashboard');
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [selectedModule, setSelectedModule] = useState<StudyModule | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizActive, setQuizActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studyContent, setStudyContent] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);

  const categories = Array.from(new Set(STUDY_MODULES.map(m => m.category)));

  const handleShare = () => {
    try {
      const url = process.env.APP_URL || window.location.origin;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          setShowShareToast(true);
          setTimeout(() => setShowShareToast(false), 3000);
        }).catch(err => {
          console.error('Failed to copy: ', err);
          alert(`Link do DrStone: ${url}`);
        });
      } else {
        alert(`Link do DrStone: ${url}`);
      }
    } catch (e) {
      console.error('Share error', e);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const addXP = (amount: number) => {
    setStats(prev => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let newXPToNext = prev.xpToNextLevel;

      while (newXP >= newXPToNext) {
        newXP -= newXPToNext;
        newLevel += 1;
        newXPToNext = Math.floor(newXPToNext * 1.2);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0ea5e9', '#10b981', '#f59e0b']
        });
      }

      return { ...prev, xp: newXP, level: newLevel, xpToNextLevel: newXPToNext };
    });
  };

  const startStudy = async (module: StudyModule) => {
    setLoading(true);
    setSelectedModule(module);
    setActiveTab('study');
    
    // Check offline storage first
    const offline = storageService.getContent(module.id);
    if (offline) {
      setStudyContent(offline.content);
      setLoading(false);
      return;
    }

    try {
      const content = await generateStudyContent(module.title);
      setStudyContent(content);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (topic: string, moduleId?: string) => {
    setLoading(true);
    
    // Check offline storage first if we have a moduleId
    if (moduleId) {
      const offline = storageService.getContent(moduleId);
      if (offline && offline.quiz && offline.quiz.length > 0) {
        setQuizQuestions(offline.quiz);
        setQuizActive(true);
        setCurrentQuestionIndex(0);
        setQuizScore(0);
        setActiveTab('quiz');
        setLoading(false);
        return;
      }
    }

    try {
      const questions = await generateMedicalQuiz(topic);
      setQuizQuestions(questions);
      setQuizActive(true);
      setCurrentQuestionIndex(0);
      setQuizScore(0);
      setActiveTab('quiz');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveForOffline = async () => {
    if (!selectedModule || !studyContent) return;
    setLoading(true);
    try {
      // Generate quiz questions to save along with content
      const questions = await generateMedicalQuiz(selectedModule.title);
      storageService.saveContent(selectedModule.id, selectedModule.title, studyContent, questions);
      confetti({
        particleCount: 50,
        spread: 30,
        origin: { y: 0.8 },
        colors: ['#0ea5e9', '#ffffff']
      });
    } catch (error) {
      console.error("Failed to save for offline", error);
    } finally {
      setLoading(false);
    }
  };

  const removeOffline = (id: string) => {
    storageService.removeContent(id);
    // Force re-render if needed or just let the UI update on next check
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    const correct = index === quizQuestions[currentQuestionIndex].correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setQuizScore(prev => prev + 1);
      addXP(50);
      // Success burst
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#10b981', '#ffffff']
      });
    } else {
      // Subtle error feedback could go here
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      // Quiz finished
      setQuizActive(false);
      addXP(200); // Bonus for finishing
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-colors duration-300">
        <div className="p-8 flex items-center gap-3 border-b border-slate-800/50 mb-4">
          <div className="w-10 h-10 bg-medical-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-medical-primary/40">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">DrStone</h1>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Medical OS</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="px-4 py-2 mb-2">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Menu Principal</span>
          </div>
          <SidebarItem 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={<Library size={18} />} 
            label="Biblioteca" 
            active={activeTab === 'study'} 
            onClick={() => setActiveTab('study')} 
          />
          <SidebarItem 
            icon={<Zap size={18} />} 
            label="Quiz Diário" 
            active={activeTab === 'quiz'} 
            onClick={() => setActiveTab('quiz')} 
          />
          
          <div className="px-4 py-6 mb-2">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Gamificação</span>
          </div>
          <SidebarItem 
            icon={<Star size={18} />} 
            label="Recompensas" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
          <SidebarItem 
            icon={<Trophy size={18} />} 
            label="Conquistas" 
            active={false} 
            onClick={() => {}} 
          />

          {Object.keys(storageService.getAllSaved()).length > 0 && (
            <>
              <div className="px-4 py-6 mb-2">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Acesso Offline</span>
              </div>
              <div className="px-4 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                {Object.values(storageService.getAllSaved()).map(item => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      const module = STUDY_MODULES.find(m => m.id === item.id);
                      if (module) startStudy(module);
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all truncate flex items-center gap-2"
                  >
                    <Database size={12} className="text-emerald-500 flex-shrink-0" />
                    <span className="truncate">{item.topic}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
              <User size={20} className="text-slate-300" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate">Dr. Estudante</p>
              <p className="text-[10px] text-slate-500 font-mono">NÍVEL {stats.level} INTERNO</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Top Header Stats */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Flame className="text-orange-500" size={20} />
              <span className="font-bold text-slate-700 dark:text-slate-300">Sequência de {stats.streak} Dias</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500" size={20} />
              <span className="font-bold text-slate-700 dark:text-slate-300">{stats.gems} Gemas</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative group"
              title="Compartilhar App"
            >
              <Share2 size={20} />
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Copiar Link
              </span>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
            <div className="flex items-center gap-4 w-64">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">XP Nível {stats.level}</span>
                  <span className="text-slate-400 dark:text-slate-500">{stats.xp} / {stats.xpToNextLevel}</span>
                </div>
                <div className="xp-bar">
                  <motion.div 
                    className="xp-progress" 
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.xp / stats.xpToNextLevel) * 100}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          <AnimatePresence>
            {showShareToast && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold">Link Copiado!</p>
                  <p className="text-[10px] text-slate-400">Compartilhe o DrStone com seus colegas.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard 
                    title="Questões Respondidas" 
                    value={stats.totalQuestionsAnswered.toString()} 
                    subValue="+12 hoje"
                    icon={<BrainCircuit className="text-medical-primary" size={20} />}
                  />
                  <StatCard 
                    title="Taxa de Precisão" 
                    value={`${Math.round((stats.correctAnswers / stats.totalQuestionsAnswered) * 100)}%`} 
                    subValue="Acima da média"
                    icon={<CheckCircle2 className="text-emerald-500" size={20} />}
                  />
                  <SidebarItem 
                    icon={<Star size={18} />} 
                    label={`${stats.gems} Gemas`} 
                    active={false} 
                    onClick={() => setActiveTab('profile')} 
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 glass-panel rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Análise de Rendimento</h3>
                        <p className="text-xs text-slate-400 font-mono mt-1">DATA_STREAM: PERFORMANCE_METRICS</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">ESTÁVEL</div>
                        <div className="px-3 py-1 rounded-lg bg-medical-primary/10 text-medical-primary text-[10px] font-bold border border-medical-primary/20">TOP 5%</div>
                      </div>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={PERFORMANCE_DATA}>
                          <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '12px', 
                              border: '1px solid #e2e8f0', 
                              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                              backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                              color: darkMode ? '#f1f5f9' : '#1e293b'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#0ea5e9" 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#colorScore)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="glass-panel rounded-2xl p-6 bg-medical-primary text-white border-none shadow-lg shadow-medical-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <BrainCircuit size={16} />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-80">Insight do Dia</h3>
                      </div>
                      <p className="text-xs font-medium leading-relaxed">
                        "A tríade de Virchow (estase, lesão endotelial e hipercoagulabilidade) é fundamental para entender a patogênese da TVP."
                      </p>
                    </div>

                    <div className="glass-panel rounded-2xl p-6 border-t-4 border-t-medical-primary">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-widest">Status do Sistema</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">Nível de Acesso</span>
                          <span className="text-xs font-mono font-bold text-medical-primary">INTERNO_SR</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">Especialidade</span>
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">CIRURGIA_GERAL</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-xs text-slate-500">Próximo Desbloqueio</span>
                          <span className="text-xs font-bold text-yellow-500">Caso Clínico #42</span>
                        </div>
                      </div>
                    </div>

                    <div className="glass-panel rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-widest">Leitura Atual</h3>
                      <div className="flex gap-4">
                        <div className="w-16 h-24 bg-slate-900 rounded shadow-lg flex items-center justify-center border border-slate-700">
                          <Book size={24} className="text-medical-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Cirurgia Médica</h4>
                          <p className="text-[10px] text-slate-400 mt-1">Capítulo 3: Mastectomia</p>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                            <div className="bg-medical-primary h-full w-[45%]" />
                          </div>
                          <p className="text-[8px] text-slate-500 mt-1">45% concluído</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-panel rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-widest">Atividade Recente</h3>
                      <div className="space-y-3">
                        {[
                          { title: "Mastectomia", type: "ESTUDO", val: "+120 XP" },
                          { title: "Anatomia Dental", type: "QUIZ", val: "+50 XP" },
                          { title: "Bioética", type: "ESTUDO", val: "+80 XP" }
                        ].map((act, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div>
                              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{act.title}</p>
                              <p className="text-[8px] text-slate-400 font-mono">{act.type}</p>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-500">{act.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'study' && (
              <motion.div
                key="study"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {!selectedModule ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Biblioteca Profissional</h2>
                      <div className="flex gap-2 overflow-x-auto pb-2 max-w-md md:max-w-none">
                        <button 
                          onClick={() => setSelectedCategory(null)}
                          className={cn(
                            "px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                            selectedCategory === null 
                              ? "bg-medical-primary text-white shadow-md shadow-medical-primary/20" 
                              : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800"
                          )}
                        >
                          Todos
                        </button>
                        {categories.map(cat => (
                          <button 
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                              "px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                              selectedCategory === cat 
                                ? "bg-medical-primary text-white shadow-md shadow-medical-primary/20" 
                                : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-3">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Livros Recomendados</h3>
                        <div className="flex gap-6 overflow-x-auto pb-4">
                          <div className="flex-shrink-0 w-48 h-64 bg-slate-900 rounded-xl p-4 flex flex-col justify-between shadow-xl border border-slate-800 relative group cursor-pointer overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                              <Book size={64} className="text-medical-primary" />
                            </div>
                            <div className="relative z-10">
                              <span className="text-[8px] font-bold text-medical-primary uppercase tracking-widest">Editora Pasteur</span>
                              <h4 className="text-sm font-bold text-white mt-2 leading-tight">Cirurgia Médica: Princípios e Práticas</h4>
                            </div>
                            <div className="relative z-10">
                              <p className="text-[10px] text-slate-500">Edição 1 • 2023</p>
                              <button 
                                onClick={() => setSelectedCategory("Cirurgia")}
                                className="mt-2 w-full py-2 bg-medical-primary text-white text-[10px] font-bold rounded-lg"
                              >
                                ABRIR LIVRO
                              </button>
                            </div>
                          </div>

                          <div className="flex-shrink-0 w-48 h-64 bg-slate-900 rounded-xl p-4 flex flex-col justify-between shadow-xl border border-slate-800 relative group cursor-pointer overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                              <GraduationCap size={64} className="text-emerald-500" />
                            </div>
                            <div className="relative z-10">
                              <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">U. PORTO</span>
                              <h4 className="text-sm font-bold text-white mt-2 leading-tight">Medicina Dentária: Patologias Orais</h4>
                            </div>
                            <div className="relative z-10">
                              <p className="text-[10px] text-slate-500">Monografia • 2010</p>
                              <button 
                                onClick={() => setSelectedCategory("Medicina Dentária")}
                                className="mt-2 w-full py-2 bg-emerald-500 text-white text-[10px] font-bold rounded-lg"
                              >
                                ABRIR LIVRO
                              </button>
                            </div>
                          </div>

                          <div className="flex-shrink-0 w-48 h-64 bg-slate-900 rounded-xl p-4 flex flex-col justify-between shadow-xl border border-slate-800 relative group cursor-pointer overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                              <Syringe size={64} className="text-blue-500" />
                            </div>
                            <div className="relative z-10">
                              <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Manual Prático</span>
                              <h4 className="text-sm font-bold text-white mt-2 leading-tight">Fundamentos de Enfermagem Geral</h4>
                            </div>
                            <div className="relative z-10">
                              <p className="text-[10px] text-slate-500">Edição 4 • 2024</p>
                              <button 
                                onClick={() => setSelectedCategory("Enfermagem Geral")}
                                className="mt-2 w-full py-2 bg-blue-500 text-white text-[10px] font-bold rounded-lg"
                              >
                                ABRIR LIVRO
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0 w-48 h-64 bg-white dark:bg-slate-900 rounded-xl p-4 flex flex-col justify-between shadow-md border border-slate-200 dark:border-slate-800 opacity-50 grayscale">
                            <div className="text-center py-10">
                              <Library size={32} className="mx-auto text-slate-300" />
                              <p className="text-[10px] font-bold text-slate-400 mt-4">EM BREVE</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {STUDY_MODULES
                        .filter(m => !selectedCategory || m.category === selectedCategory)
                        .map(module => (
                        <div 
                          key={module.id} 
                          className="glass-panel rounded-2xl p-6 gamified-card relative overflow-hidden group flex flex-col border-l-4 border-l-medical-primary"
                          onClick={() => startStudy(module)}
                        >
                          <div className="absolute top-0 right-0 p-4">
                            {module.completed && <CheckCircle2 className="text-medical-accent" size={20} />}
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-medical-primary/10 rounded-lg text-medical-primary">
                              {module.category === 'Medicina Dentária' ? <GraduationCap size={16} /> : 
                               module.category === 'Enfermagem Geral' ? <Syringe size={16} /> :
                               module.category === 'Cirurgia' ? <Stethoscope size={16} /> :
                               <BookOpen size={16} />}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {module.category}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 leading-tight">{module.title}</h4>
                          {module.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">{module.description}</p>
                          )}
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-800/50">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <Zap size={14} className="text-yellow-500" />
                                {module.xpReward} XP
                              </div>
                              {storageService.isSaved(module.id) && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                  <Database size={10} /> SALVO
                                </div>
                              )}
                            </div>
                            <button className="text-medical-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                              Estudar <ArrowRight size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="glass-panel rounded-3xl p-8 max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                      <button 
                        onClick={() => setSelectedModule(null)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-2 text-sm font-medium transition-colors"
                      >
                        <X size={18} /> Voltar para Biblioteca
                      </button>
                      <div className="flex items-center gap-4">
                        {!storageService.isSaved(selectedModule.id) ? (
                          <button 
                            onClick={saveForOffline}
                            disabled={loading || !studyContent}
                            className="flex items-center gap-2 text-slate-500 hover:text-medical-primary text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            <Download size={16} /> SALVAR OFFLINE
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              removeOffline(selectedModule.id);
                              // Force update
                              setSelectedModule({...selectedModule});
                            }}
                            className="flex items-center gap-2 text-emerald-500 text-xs font-bold"
                          >
                            <Database size={16} /> SALVO
                          </button>
                        )}
                        <button 
                          onClick={() => startQuiz(selectedModule.title, selectedModule.id)}
                          className="bg-medical-primary text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-medical-primary/90 transition-all shadow-lg shadow-medical-primary/20"
                        >
                          Fazer Quiz
                        </button>
                      </div>
                    </div>

                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-medical-primary" size={40} />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Gerando conteúdo de alto rendimento...</p>
                      </div>
                    ) : (
                      <div className="markdown-body prose prose-slate dark:prose-invert max-w-none">
                        <Markdown>{studyContent || ''}</Markdown>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="max-w-3xl mx-auto"
              >
                {!quizActive ? (
                  <div className="text-center py-20 space-y-8">
                    <div className="w-24 h-24 bg-medical-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Zap size={48} className="text-medical-primary" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Desafio Médico Diário</h2>
                      <p className="text-slate-500 dark:text-slate-400">
                        {Object.keys(storageService.getAllSaved()).length > 0 
                          ? "Baseado nos livros que você salvou offline!" 
                          : "Teste seus conhecimentos e ganhe XP em dobro hoje!"}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        const saved = Object.values(storageService.getAllSaved());
                        if (saved.length > 0) {
                          const random = saved[Math.floor(Math.random() * saved.length)];
                          startQuiz(random.topic, random.id);
                        } else {
                          startQuiz("Conhecimento Médico Geral");
                        }
                      }}
                      disabled={loading}
                      className="bg-medical-primary text-white px-12 py-4 rounded-2xl font-bold text-lg hover:bg-medical-primary/90 transition-all shadow-xl shadow-medical-primary/20 disabled:opacity-50 flex items-center gap-3 mx-auto"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <Zap />}
                      Começar Desafio
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-slate-400">Questão {currentQuestionIndex + 1} de {quizQuestions.length}</span>
                        <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-medical-primary transition-all duration-300"
                            style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={20} />
                        <span className="font-bold text-slate-700 dark:text-slate-200">{quizScore} Corretas</span>
                      </div>
                    </div>

                    <div className="glass-panel rounded-3xl p-8 space-y-8">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                        {quizQuestions[currentQuestionIndex].question}
                      </h3>

                      <div className="grid grid-cols-1 gap-4">
                        {quizQuestions[currentQuestionIndex].options.map((option, idx) => (
                          <motion.button
                            key={idx}
                            disabled={selectedAnswer !== null}
                            onClick={() => handleAnswer(idx)}
                            whileHover={selectedAnswer === null ? { scale: 1.02, x: 5 } : {}}
                            whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                            animate={
                              selectedAnswer !== null
                                ? idx === quizQuestions[currentQuestionIndex].correctAnswer
                                  ? { scale: [1, 1.05, 1], transition: { duration: 0.3 } }
                                  : selectedAnswer === idx
                                    ? { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } }
                                    : {}
                                : {}
                            }
                            className={cn(
                              "p-5 rounded-2xl text-left font-medium transition-all border-2 flex items-center justify-between",
                              selectedAnswer === null 
                                ? "border-slate-100 dark:border-slate-800 hover:border-medical-primary hover:bg-medical-primary/5 text-slate-600 dark:text-slate-400"
                                : idx === quizQuestions[currentQuestionIndex].correctAnswer
                                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-lg shadow-emerald-200/50"
                                  : selectedAnswer === idx
                                    ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 shadow-lg shadow-red-200/50"
                                    : "border-slate-100 dark:border-slate-800 opacity-50 text-slate-400 dark:text-slate-600"
                            )}
                          >
                            <span>{option}</span>
                            <AnimatePresence>
                              {selectedAnswer !== null && idx === quizQuestions[currentQuestionIndex].correctAnswer && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                  <CheckCircle2 size={24} className="text-emerald-500" />
                                </motion.div>
                              )}
                              {selectedAnswer === idx && idx !== quizQuestions[currentQuestionIndex].correctAnswer && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                  <X size={24} className="text-red-500" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        ))}
                      </div>

                      <AnimatePresence>
                        {selectedAnswer !== null && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800"
                          >
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Explicação</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                              {quizQuestions[currentQuestionIndex].explanation}
                            </p>
                            <button 
                              onClick={nextQuestion}
                              className="mt-6 w-full bg-slate-800 dark:bg-medical-primary text-white py-3 rounded-xl font-bold hover:bg-slate-700 dark:hover:bg-medical-primary/90 transition-all flex items-center justify-center gap-2"
                            >
                              {currentQuestionIndex === quizQuestions.length - 1 ? 'Finalizar Quiz' : 'Próxima Questão'}
                              <ArrowRight size={18} />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="rewards"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Loja de Recompensas</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Troque suas Gemas por vantagens exclusivas de estudo médico.</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-6 py-3 rounded-2xl flex items-center gap-3">
                    <Star className="text-yellow-500 fill-yellow-500" size={24} />
                    <span className="text-xl font-bold text-yellow-700 dark:text-yellow-500">{stats.gems} Gemas</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <RewardCard 
                    title="Impulsionador de XP (2h)" 
                    description="Dobre seu ganho de XP pelas próximas 2 horas de estudo."
                    cost={100}
                    icon={<Zap className="text-yellow-500" />}
                    onBuy={() => {}}
                  />
                  <RewardCard 
                    title="Congelamento de Sequência" 
                    description="Protege sua sequência se você perder um dia de estudo."
                    cost={250}
                    icon={<Flame className="text-orange-500" />}
                    onBuy={() => {}}
                  />
                  <RewardCard 
                    title="Distintivo Mestre em Anatomia" 
                    description="Distintivo de perfil exclusivo para especialistas em Anatomia."
                    cost={500}
                    icon={<Award className="text-purple-500" />}
                    onBuy={() => {}}
                  />
                  <RewardCard 
                    title="Desbloqueio de Caso Clínico" 
                    description="Desbloqueie um caso clínico premium com análise de especialistas."
                    cost={150}
                    icon={<BrainCircuit className="text-medical-primary" />}
                    onBuy={() => {}}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function RewardCard({ title, description, cost, icon, onBuy }: { title: string, description: string, cost: number, icon: React.ReactNode, onBuy: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel rounded-2xl p-6 flex flex-col h-full border-t-4 border-t-yellow-500"
    >
      <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
        {icon}
      </div>
      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 flex-1 leading-relaxed">{description}</p>
      <button 
        onClick={onBuy}
        className="w-full py-2.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-bold uppercase tracking-widest hover:bg-medical-primary dark:hover:bg-medical-primary dark:hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-black/10"
      >
        <Star size={12} className="fill-yellow-500 text-yellow-500" />
        RECOMPENSA: {cost} GEMAS
      </button>
    </motion.div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all",
        active 
          ? "bg-medical-primary/10 text-medical-primary border border-medical-primary/20 shadow-sm" 
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      )}
    >
      <span className={cn(active ? "text-medical-primary" : "text-slate-500")}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function StatCard({ title, value, subValue, icon }: { title: string, value: string, subValue: string, icon: React.ReactNode }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-6 flex items-center gap-5 border-l-4 border-l-medical-primary shadow-sm"
    >
      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</h4>
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">{subValue}</span>
        </div>
      </div>
    </motion.div>
  );
}
