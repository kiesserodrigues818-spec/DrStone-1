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
  category: "Anatomia" | "Fisiologia" | "Patologia" | "Farmacologia" | "Clínica" | "Cirurgia" | "Medicina Dentária" | "Enfermagem Geral";
  difficulty: "Fácil" | "Médio" | "Difícil";
  completed: boolean;
  xpReward: number;
  description?: string;
}

export const INITIAL_STATS: UserStats = {
  level: 12,
  xp: 450,
  xpToNextLevel: 2400,
  streak: 15,
  totalQuestionsAnswered: 1240,
  correctAnswers: 1080,
  gems: 320,
};

export const STUDY_MODULES: StudyModule[] = [
  // Cirurgia Médica - Princípios e Práticas (Book Chapters)
  { id: "b1", title: "Abscesso de Bezold", category: "Cirurgia", difficulty: "Médio", completed: false, xpReward: 600, description: "Complicação grave de otites e mastoidites." },
  { id: "b2", title: "Mastectomia Total", category: "Cirurgia", difficulty: "Difícil", completed: false, xpReward: 800, description: "Técnicas e esvaziamento axilar no câncer de mama." },
  { id: "b3", title: "Feocromocitoma: Manejo", category: "Cirurgia", difficulty: "Difícil", completed: false, xpReward: 900, description: "Manejo pré-operatório e tempestade catecolaminérgica." },
  { id: "b4", title: "Síndrome de Marfan", category: "Cirurgia", difficulty: "Médio", completed: false, xpReward: 700, description: "Cirurgia plástica reconstrutiva em deformidades anatômicas." },
  { id: "b5", title: "Segurança do Paciente", category: "Cirurgia", difficulty: "Fácil", completed: false, xpReward: 400, description: "Normas e procedimentos pré, intra e pós-operatórios." },
  { id: "b6", title: "Hemorragia Pós-Parto", category: "Cirurgia", difficulty: "Difícil", completed: false, xpReward: 850, description: "Manejo cirúrgico e protocolos de emergência." },
  { id: "b7", title: "Nefroblastoma (Wilms)", category: "Cirurgia", difficulty: "Médio", completed: false, xpReward: 750, description: "Indicações e abordagens cirúrgicas pediátricas." },
  { id: "b8", title: "Tonsilectomia Pediátrica", category: "Cirurgia", difficulty: "Médio", completed: false, xpReward: 600, description: "Indicações e complicações pós-operatórias." },
  { id: "b9", title: "Pneumotórax Espontâneo", category: "Cirurgia", difficulty: "Médio", completed: false, xpReward: 700, description: "Fisiopatologia e indicação cirúrgica." },
  { id: "b10", title: "Reconstrução de Mama", category: "Cirurgia", difficulty: "Difícil", completed: false, xpReward: 850, description: "Técnicas autólogas e aloplásticas." },
  { id: "b11", title: "Fissuras Labiopalatinas", category: "Cirurgia", difficulty: "Difícil", completed: false, xpReward: 900, description: "Queiloplastia e palatoplastia." },
  { id: "b12", title: "Cirurgia das Mãos", category: "Cirurgia", difficulty: "Médio", completed: false, xpReward: 750, description: "Microcirurgia reconstrutiva e lesões comuns." },
  { id: "b13", title: "Oclusão de Apêndice Atrial", category: "Cirurgia", difficulty: "Difícil", completed: false, xpReward: 950, description: "Abordagem cirúrgica na fibrilação atrial." },
  { id: "b14", title: "Bioética em Cirurgia", category: "Cirurgia", difficulty: "Fácil", completed: false, xpReward: 400, description: "Desafios na prática do anestesiologista." },

  // Medicina Dentária - New Materials
  { id: "d4", title: "Abcesso Dentário", category: "Medicina Dentária", difficulty: "Médio", completed: false, xpReward: 500, description: "Causas, sintomas e protocolos de tratamento." },
  { id: "d5", title: "Alveolite: Tratamento", category: "Medicina Dentária", difficulty: "Médio", completed: false, xpReward: 550, description: "Ocorrência e manejo clínico pós-exodontia." },
  { id: "d6", title: "Angina de Ludwig", category: "Medicina Dentária", difficulty: "Difícil", completed: false, xpReward: 850, description: "Etiologia, diagnóstico e tratamento de urgência." },
  
  // Medicina Dentária
  { id: "d1", title: "Anatomia Dental", category: "Medicina Dentária", difficulty: "Fácil", completed: false, xpReward: 300, description: "Estrutura e morfologia dos dentes humanos." },
  { id: "d2", title: "Periodontia Básica", category: "Medicina Dentária", difficulty: "Médio", completed: false, xpReward: 500, description: "Doenças periodontais e técnicas de raspagem." },
  { id: "d3", title: "Cirurgia Oral Menor", category: "Medicina Dentária", difficulty: "Difícil", completed: false, xpReward: 800, description: "Exodontias e pequenos procedimentos cirúrgicos." },

  // Enfermagem Geral
  { id: "e1", title: "Fundamentos de Enfermagem", category: "Enfermagem Geral", difficulty: "Fácil", completed: false, xpReward: 350, description: "Sinais vitais, higiene e conforto do paciente." },
  { id: "e2", title: "Cálculo de Medicação", category: "Enfermagem Geral", difficulty: "Difícil", completed: false, xpReward: 700, description: "Regra de três e dosagens complexas." },
  { id: "e3", title: "Cuidados Perioperatórios", category: "Enfermagem Geral", difficulty: "Médio", completed: false, xpReward: 550, description: "Papel da enfermagem no centro cirúrgico." },

  // Original Modules (Updated)
  { id: "1", title: "Fisiologia Cardiovascular", category: "Fisiologia", difficulty: "Médio", completed: false, xpReward: 500 },
  { id: "2", title: "Anatomia do Membro Superior", category: "Anatomia", difficulty: "Fácil", completed: true, xpReward: 300 },
  { id: "3", title: "Mecanismos de Antibióticos", category: "Farmacologia", difficulty: "Difícil", completed: false, xpReward: 800 },
];
