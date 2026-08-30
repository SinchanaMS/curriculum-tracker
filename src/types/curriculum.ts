// ============================================
// ENUMS
// ============================================

export enum TopicStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum MilestoneStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// ============================================
// MODULE & TOPIC TYPES
// ============================================

export interface SubTopic {
  id: string;
  name: string;
  completed: boolean;
  importance?: 1 | 2 | 3; // 1 = ⭐, 2 = ⭐⭐, 3 = ⭐⭐⭐ (critical)
  keyQuestions?: string[]; // Questions to answer to understand this
}

export interface SelfAssessmentQuestion {
  id: string;
  question: string;
  answer: string; // User's answer
  answeredAt: string | null;
}

export interface Topic {
  id: string;
  name: string;
  status: TopicStatus;
  startedAt: string | null;
  completedAt: string | null;
  dueDate: string;
  notes: string;
  resources: string[];
  subtopics: SubTopic[];
  // Enhanced learning fields
  whyItMatters?: string; // The problem this topic solves
  keyQuestion?: string; // The main question to answer
  selfAssessment?: SelfAssessmentQuestion[]; // Homework questions
  relatedTopics?: string[]; // What this builds foundation for
  recommendedDSA?: string[]; // Suggested DSA problems
}

export interface Module {
  id: string;
  name: string;
  weekStart: number;
  weekEnd: number;
  topics: Topic[];
  color: string;
}

// ============================================
// DSA PROBLEM LOG TYPES
// ============================================

export interface DSAProblem {
  id: string;
  name: string;
  platform: 'leetcode' | 'hackerrank' | 'codeforces' | 'other';
  url: string;
  pattern: string;
  difficulty: Difficulty;
  status: TopicStatus;
  solvedAt: string | null;
  timeSpentMinutes: number;
  notes: string;
  tags: string[];
  revisitCount: number;
  lastRevisitedAt: string | null;
}

// ============================================
// PROJECT & MILESTONE TYPES
// ============================================

export interface Milestone {
  id: string;
  name: string;
  description: string;
  status: MilestoneStatus;
  completedAt: string | null;
  learnings: string;
  prerequisites?: string[]; // Topics to know before this milestone
}

export interface ImplementationStep {
  id: string;
  text: string;
  completed: boolean;
}

export interface ImplementationPhase {
  id: string;
  name: string;
  steps: ImplementationStep[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  milestones: Milestone[];
  implementationGuide?: ImplementationPhase[];
  startedAt: string | null;
  completedAt: string | null;
  dueDate: string;
  weekStart: number;
  weekEnd: number;
  githubUrl: string;
  demoUrl: string;
  techStack: string[];
  notes: string;
}

// ============================================
// WEEKLY REFLECTION TYPES
// ============================================

export interface WeeklyReflection {
  id: string;
  weekNumber: number;
  year: number;
  createdAt: string;
  updatedAt: string;
  questions: {
    learned: string;
    confused: string;
    built: string;
    change: string;
  };
  rating: 1 | 2 | 3 | 4 | 5;
  highlights: string[];
}

// ============================================
// DAILY TODO TYPES
// ============================================

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: TodoPriority;
  dueDate: string;
  createdAt: string;
  completedAt: string | null;
  linkedModuleId: string | null;
  linkedProjectId: string | null;
}

export interface DailyTodos {
  date: string;
  items: TodoItem[];
}

// ============================================
// STREAK & PROGRESS TRACKING
// ============================================

export interface DailyActivity {
  date: string;
  topicsCompleted: number;
  problemsSolved: number;
  milestonesCompleted: number;
  todosCompleted: number;
  minutesStudied: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalActiveDays: number;
  activityLog: DailyActivity[];
}

// ============================================
// APP SETTINGS
// ============================================

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  dailyGoal: {
    topics: number;
    problems: number;
    studyMinutes: number;
  };
  notifications: boolean;
  exportFormat: 'json' | 'csv';
  lastSyncedAt?: string;
}

// ============================================
// APP STATE
// ============================================

export interface CurriculumState {
  startDate: string;
  currentDay: number;
  modules: Module[];
  projects: Project[];
  dsaProblems: DSAProblem[];
  weeklyReflections: WeeklyReflection[];
  dailyTodos: DailyTodos[];
  streakData: StreakData;
  settings: AppSettings;
}

// ============================================
// CHART DATA TYPES
// ============================================

export interface ProgressChartData {
  date: string;
  topicsCompleted: number;
  cumulativeTopics: number;
  problemsSolved: number;
  cumulativeProblems: number;
}

export interface ModuleProgressData {
  moduleId: string;
  moduleName: string;
  totalTopics: number;
  completedTopics: number;
  percentComplete: number;
  color: string;
}

export interface WeeklyStatsData {
  weekNumber: number;
  topicsCompleted: number;
  problemsSolved: number;
  milestonesCompleted: number;
  studyHours: number;
}
