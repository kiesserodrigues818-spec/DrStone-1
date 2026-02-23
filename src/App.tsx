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
  X
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
    try {
      const content = await generateStudyContent(module.title);
      setStudyContent(content);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (topic: string) => {
    setLoading(true);
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

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    const correct = index === quizQuestions[currentQuestionIndex].correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setQuizScore(prev => prev + 1);
      addXP(50);
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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-medical-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-medical-primary/20">
            <BrainCircuit size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">DrStone</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={<BookOpen size={20} />} 
            label="Biblioteca de Estudo" 
            active={activeTab === 'study'} 
            onClick={() => setActiveTab('study')} 
          />
          <SidebarItem 
            icon={<Zap size={20} />} 
            label="Quiz Diário" 
            active={activeTab === 'quiz'} 
            onClick={() => setActiveTab('quiz')} 
          />
          <SidebarItem 
            icon={<Star size={20} />} 
            label="Loja de Recompensas" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
          <SidebarItem 
            icon={<Trophy size={20} />} 
            label="Conquistas" 
            active={false} 
            onClick={() => {}} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
              <User size={20} className="text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Dr. Estudante</p>
              <p className="text-xs text-slate-400">Nível {stats.level} Interno</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Top Header Stats */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-bottom border-slate-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Flame className="text-orange-500" size={20} />
              <span className="font-bold text-slate-700">Sequência de {stats.streak} Dias</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500" size={20} />
              <span className="font-bold text-slate-700">{stats.gems} Gemas</span>
            </div>
          </div>

          <div className="flex items-center gap-4 w-64">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 font-medium">XP Nível {stats.level}</span>
                <span className="text-slate-400">{stats.xp} / {stats.xpToNextLevel}</span>
              </div>
              <div className="xp-bar">
                <div 
                  className="xp-progress" 
                  style={{ width: `${(stats.xp / stats.xpToNextLevel) * 100}%` }} 
                />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
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
                    title="Total de Questões" 
                    value={stats.totalQuestionsAnswered.toString()} 
                    subValue="+12 hoje"
                    icon={<BrainCircuit className="text-medical-primary" />}
                  />
                  <StatCard 
                    title="Precisão" 
                    value={`${Math.round((stats.correctAnswers / stats.totalQuestionsAnswered) * 100)}%`} 
                    subValue="Top 5% dos estudantes"
                    icon={<CheckCircle2 className="text-medical-accent" />}
                  />
                  <StatCard 
                    title="Tempo de Estudo" 
                    value="24.5h" 
                    subValue="Esta semana"
                    icon={<Timer className="text-medical-secondary" />}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass-panel rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Award size={20} className="text-medical-primary" />
                      Tendência de Desempenho
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={PERFORMANCE_DATA}>
                          <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                          <YAxis hide />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#0ea5e9" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorScore)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-panel rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Módulos Recomendados</h3>
                    <div className="space-y-4">
                      {STUDY_MODULES.slice(0, 3).map(module => (
                        <div 
                          key={module.id} 
                          className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-medical-primary/30 hover:bg-medical-primary/5 transition-all group cursor-pointer"
                          onClick={() => startStudy(module)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              module.category === 'Anatomia' ? "bg-red-100 text-red-600" :
                              module.category === 'Fisiologia' ? "bg-blue-100 text-blue-600" :
                              "bg-emerald-100 text-emerald-600"
                            )}>
                              <BookOpen size={20} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700">{module.title}</p>
                              <p className="text-xs text-slate-400">{module.category} • {module.difficulty}</p>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-slate-300 group-hover:text-medical-primary transition-colors" />
                        </div>
                      ))}
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
                className="space-y-6"
              >
                {!selectedModule ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {STUDY_MODULES.map(module => (
                      <div 
                        key={module.id} 
                        className="glass-panel rounded-2xl p-6 gamified-card relative overflow-hidden group"
                        onClick={() => startStudy(module)}
                      >
                        <div className="absolute top-0 right-0 p-4">
                          {module.completed && <CheckCircle2 className="text-medical-accent" size={20} />}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-medical-primary mb-2 block">
                          {module.category}
                        </span>
                        <h4 className="text-lg font-bold text-slate-800 mb-4">{module.title}</h4>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                            <Zap size={14} className="text-yellow-500" />
                            {module.xpReward} XP
                          </div>
                          <button className="text-medical-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                            Estudar <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel rounded-3xl p-8 max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                      <button 
                        onClick={() => setSelectedModule(null)}
                        className="text-slate-400 hover:text-slate-600 flex items-center gap-2 text-sm font-medium"
                      >
                        <X size={18} /> Voltar para Biblioteca
                      </button>
                      <button 
                        onClick={() => startQuiz(selectedModule.title)}
                        className="bg-medical-primary text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-medical-primary/90 transition-all shadow-lg shadow-medical-primary/20"
                      >
                        Fazer Quiz
                      </button>
                    </div>

                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-medical-primary" size={40} />
                        <p className="text-slate-500 font-medium">Gerando conteúdo de alto rendimento...</p>
                      </div>
                    ) : (
                      <div className="markdown-body prose prose-slate max-w-none">
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
                      <h2 className="text-3xl font-bold text-slate-800 mb-2">Desafio Médico Diário</h2>
                      <p className="text-slate-500">Teste seus conhecimentos e ganhe XP em dobro hoje!</p>
                    </div>
                    <button 
                      onClick={() => startQuiz("Conhecimento Médico Geral")}
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
                        <span className="font-bold text-slate-700">{quizScore} Corretas</span>
                      </div>
                    </div>

                    <div className="glass-panel rounded-3xl p-8 space-y-8">
                      <h3 className="text-xl font-bold text-slate-800 leading-relaxed">
                        {quizQuestions[currentQuestionIndex].question}
                      </h3>

                      <div className="grid grid-cols-1 gap-4">
                        {quizQuestions[currentQuestionIndex].options.map((option, idx) => (
                          <button
                            key={idx}
                            disabled={selectedAnswer !== null}
                            onClick={() => handleAnswer(idx)}
                            className={cn(
                              "p-5 rounded-2xl text-left font-medium transition-all border-2",
                              selectedAnswer === null 
                                ? "border-slate-100 hover:border-medical-primary hover:bg-medical-primary/5 text-slate-600"
                                : idx === quizQuestions[currentQuestionIndex].correctAnswer
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                  : selectedAnswer === idx
                                    ? "border-red-500 bg-red-50 text-red-700"
                                    : "border-slate-100 opacity-50 text-slate-400"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              {selectedAnswer !== null && idx === quizQuestions[currentQuestionIndex].correctAnswer && (
                                <CheckCircle2 size={20} />
                              )}
                              {selectedAnswer === idx && idx !== quizQuestions[currentQuestionIndex].correctAnswer && (
                                <X size={20} />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>

                      <AnimatePresence>
                        {selectedAnswer !== null && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-slate-50 rounded-2xl border border-slate-200"
                          >
                            <p className="text-sm font-bold text-slate-800 mb-2">Explicação</p>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {quizQuestions[currentQuestionIndex].explanation}
                            </p>
                            <button 
                              onClick={nextQuestion}
                              className="mt-6 w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
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
                    <h2 className="text-3xl font-bold text-slate-800">Loja de Recompensas</h2>
                    <p className="text-slate-500 font-medium">Troque suas Gemas por vantagens exclusivas de estudo médico.</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 px-6 py-3 rounded-2xl flex items-center gap-3">
                    <Star className="text-yellow-500 fill-yellow-500" size={24} />
                    <span className="text-xl font-bold text-yellow-700">{stats.gems} Gemas</span>
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
    <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h4 className="text-lg font-bold text-slate-800 mb-2">{title}</h4>
      <p className="text-sm text-slate-500 mb-6 flex-1">{description}</p>
      <button 
        onClick={onBuy}
        className="w-full py-3 rounded-xl border-2 border-yellow-500 text-yellow-600 font-bold hover:bg-yellow-50 transition-all flex items-center justify-center gap-2"
      >
        <Star size={16} className="fill-yellow-500" />
        {cost} Gemas
      </button>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all",
        active 
          ? "bg-medical-primary text-white shadow-lg shadow-medical-primary/20" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({ title, value, subValue, icon }: { title: string, value: string, subValue: string, icon: React.ReactNode }) {
  return (
    <div className="glass-panel rounded-2xl p-6 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-slate-800 mb-1">{value}</h4>
        <p className="text-xs font-bold text-emerald-500">{subValue}</p>
      </div>
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}
