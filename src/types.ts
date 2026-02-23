export interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  gems: number;
}

export interface StudyModule {
  id: string;
  title: string;
  category: "Anatomia" | "Fisiologia" | "Patologia" | "Farmacologia" | "Clínica";
  difficulty: "Fácil" | "Médio" | "Difícil";
  completed: boolean;
  xpReward: number;
}

export const INITIAL_STATS: UserStats = {
  level: 1,
  xp: 0,
  xpToNextLevel: 1000,
  streak: 3,
  totalQuestionsAnswered: 150,
  correctAnswers: 120,
  gems: 50,
};

export const STUDY_MODULES: StudyModule[] = [
  { id: "1", title: "Fisiologia Cardiovascular", category: "Fisiologia", difficulty: "Médio", completed: false, xpReward: 500 },
  { id: "2", title: "Anatomia do Membro Superior", category: "Anatomia", difficulty: "Fácil", completed: true, xpReward: 300 },
  { id: "3", title: "Mecanismos de Antibióticos", category: "Farmacologia", difficulty: "Difícil", completed: false, xpReward: 800 },
  { id: "4", title: "Síndrome Coronariana Aguda", category: "Clínica", difficulty: "Difícil", completed: false, xpReward: 1000 },
  { id: "5", title: "Lesão Celular e Adaptação", category: "Patologia", difficulty: "Médio", completed: false, xpReward: 600 },
];
