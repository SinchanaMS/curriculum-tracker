import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  CurriculumState,
  TopicStatus,
  MilestoneStatus,
  DSAProblem,
  WeeklyReflection,
  TodoItem,
  TodoPriority,
  AppSettings,
  DailyActivity
} from '../types';
import { createInitialState, CURRICULUM_START_DATE } from '../data/initialData';
import { auth, saveProgressToFirestore } from '../lib/firebase';

interface CurriculumActions {
  // Module & Topic Actions
  updateTopicStatus: (moduleId: string, topicId: string, status: TopicStatus) => void;
  updateTopicNotes: (moduleId: string, topicId: string, notes: string) => void;
  addTopicResource: (moduleId: string, topicId: string, resource: string) => void;
  toggleSubtopic: (moduleId: string, topicId: string, subtopicId: string) => void;
  updateSelfAssessmentAnswer: (moduleId: string, topicId: string, questionId: string, answer: string) => void;

  // Project & Milestone Actions
  updateMilestoneStatus: (projectId: string, milestoneId: string, status: MilestoneStatus) => void;
  updateMilestoneLearnings: (projectId: string, milestoneId: string, learnings: string) => void;
  updateProjectLinks: (projectId: string, githubUrl: string, demoUrl: string) => void;
  updateProjectNotes: (projectId: string, notes: string) => void;

  // DSA Problem Actions
  addDSAProblem: (problem: Omit<DSAProblem, 'id'>) => void;
  updateDSAProblem: (problemId: string, updates: Partial<DSAProblem>) => void;
  deleteDSAProblem: (problemId: string) => void;

  // Weekly Reflection Actions
  saveReflection: (reflection: WeeklyReflection) => void;
  updateReflection: (weekNumber: number, updates: Partial<WeeklyReflection>) => void;

  // Todo Actions
  addTodo: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => void;
  toggleTodo: (todoId: string) => void;
  deleteTodo: (todoId: string) => void;
  updateTodoPriority: (todoId: string, priority: TodoPriority) => void;
  updateTodoText: (todoId: string, text: string) => void;

  // Streak & Activity Actions
  recordActivity: (activity: Partial<DailyActivity>) => void;

  // Settings Actions
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Data Management
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  resetAllData: () => void;

  // Computed Helpers
  getCurrentWeek: () => number;
  getCurrentDay: () => number;
  getModuleProgress: (moduleId: string) => number;
  getTotalProgress: () => number;
  getTotalTopics: () => number;
  getCompletedTopics: () => number;
  getTotalMilestones: () => number;
  getCompletedMilestones: () => number;
}

type CurriculumStore = CurriculumState & CurriculumActions;

export const useCurriculumStore = create<CurriculumStore>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
      ...createInitialState(),

      // ============ MODULE & TOPIC ACTIONS ============
      updateTopicStatus: (moduleId, topicId, status) => {
        set((state) => {
          const module = state.modules.find(m => m.id === moduleId);
          if (!module) return;

          const topic = module.topics.find(t => t.id === topicId);
          if (!topic) return;

          const prevStatus = topic.status;
          topic.status = status;

          if (status === TopicStatus.IN_PROGRESS && !topic.startedAt) {
            topic.startedAt = new Date().toISOString();
          }
          if (status === TopicStatus.COMPLETED && !topic.completedAt) {
            topic.completedAt = new Date().toISOString();
          }

          // Update streak if completing a topic
          if (status === TopicStatus.COMPLETED && prevStatus !== TopicStatus.COMPLETED) {
            const today = new Date().toISOString().split('T')[0];
            let todayActivity = state.streakData.activityLog.find(a => a.date === today);

            if (!todayActivity) {
              todayActivity = {
                date: today,
                topicsCompleted: 0,
                problemsSolved: 0,
                milestonesCompleted: 0,
                todosCompleted: 0,
                minutesStudied: 0
              };
              state.streakData.activityLog.push(todayActivity);
            }

            todayActivity.topicsCompleted += 1;
            updateStreak(state.streakData, today);
          }
        });
      },

      updateTopicNotes: (moduleId, topicId, notes) => {
        set((state) => {
          const module = state.modules.find(m => m.id === moduleId);
          const topic = module?.topics.find(t => t.id === topicId);
          if (topic) topic.notes = notes;
        });
      },

      addTopicResource: (moduleId, topicId, resource) => {
        set((state) => {
          const module = state.modules.find(m => m.id === moduleId);
          const topic = module?.topics.find(t => t.id === topicId);
          if (topic && !topic.resources.includes(resource)) {
            topic.resources.push(resource);
          }
        });
      },

      toggleSubtopic: (moduleId, topicId, subtopicId) => {
        set((state) => {
          const module = state.modules.find(m => m.id === moduleId);
          const topic = module?.topics.find(t => t.id === topicId);
          const subtopic = topic?.subtopics?.find(s => s.id === subtopicId);
          if (subtopic && topic) {
            const wasCompleted = subtopic.completed;
            subtopic.completed = !subtopic.completed;

            // Auto-update topic status based on subtopic progress
            const completedCount = topic.subtopics?.filter(s => s.completed).length || 0;
            const totalCount = topic.subtopics?.length || 0;

            if (completedCount > 0 && topic.status === TopicStatus.PENDING) {
              // Started working on subtopics → move to In Progress
              topic.status = TopicStatus.IN_PROGRESS;
              topic.startedAt = new Date().toISOString();
            }

            if (completedCount === totalCount && totalCount > 0) {
              // All subtopics done → mark topic as Completed
              topic.status = TopicStatus.COMPLETED;
              topic.completedAt = new Date().toISOString();
            } else if (completedCount < totalCount && topic.status === TopicStatus.COMPLETED) {
              // Unchecked a subtopic → move back to In Progress
              topic.status = TopicStatus.IN_PROGRESS;
              topic.completedAt = null;
            }

            // Update streak when completing a subtopic (not when unchecking)
            if (!wasCompleted && subtopic.completed) {
              const today = new Date().toISOString().split('T')[0];
              let todayActivity = state.streakData.activityLog.find(a => a.date === today);

              if (!todayActivity) {
                todayActivity = {
                  date: today,
                  topicsCompleted: 0,
                  problemsSolved: 0,
                  milestonesCompleted: 0,
                  todosCompleted: 0,
                  minutesStudied: 0
                };
                state.streakData.activityLog.push(todayActivity);
              }

              // Count subtopic as partial topic progress
              todayActivity.topicsCompleted += 0.1;
              updateStreak(state.streakData, today);
            }
          }
        });
      },

      updateSelfAssessmentAnswer: (moduleId, topicId, questionId, answer) => {
        set((state) => {
          const module = state.modules.find(m => m.id === moduleId);
          const topic = module?.topics.find(t => t.id === topicId);
          const question = topic?.selfAssessment?.find(q => q.id === questionId);
          if (question) {
            question.answer = answer;
            question.answeredAt = answer ? new Date().toISOString() : null;
          }
        });
      },

      // ============ PROJECT & MILESTONE ACTIONS ============
      updateMilestoneStatus: (projectId, milestoneId, status) => {
        set((state) => {
          const project = state.projects.find(p => p.id === projectId);
          const milestone = project?.milestones.find(m => m.id === milestoneId);
          if (milestone) {
            const prevStatus = milestone.status;
            milestone.status = status;

            if (status === MilestoneStatus.IN_PROGRESS && !project?.startedAt) {
              project!.startedAt = new Date().toISOString();
            }
            if (status === MilestoneStatus.COMPLETED && !milestone.completedAt) {
              milestone.completedAt = new Date().toISOString();

              // Check if all milestones complete
              const allComplete = project?.milestones.every(m => m.status === MilestoneStatus.COMPLETED);
              if (allComplete && project) {
                project.completedAt = new Date().toISOString();
              }

              // Update streak
              if (prevStatus !== MilestoneStatus.COMPLETED) {
                const today = new Date().toISOString().split('T')[0];
                let todayActivity = state.streakData.activityLog.find(a => a.date === today);

                if (!todayActivity) {
                  todayActivity = {
                    date: today,
                    topicsCompleted: 0,
                    problemsSolved: 0,
                    milestonesCompleted: 0,
                    todosCompleted: 0,
                    minutesStudied: 0
                  };
                  state.streakData.activityLog.push(todayActivity);
                }

                todayActivity.milestonesCompleted += 1;
                updateStreak(state.streakData, today);
              }
            }
          }
        });
      },

      updateMilestoneLearnings: (projectId, milestoneId, learnings) => {
        set((state) => {
          const project = state.projects.find(p => p.id === projectId);
          const milestone = project?.milestones.find(m => m.id === milestoneId);
          if (milestone) milestone.learnings = learnings;
        });
      },

      updateProjectLinks: (projectId, githubUrl, demoUrl) => {
        set((state) => {
          const project = state.projects.find(p => p.id === projectId);
          if (project) {
            project.githubUrl = githubUrl;
            project.demoUrl = demoUrl;
          }
        });
      },

      updateProjectNotes: (projectId, notes) => {
        set((state) => {
          const project = state.projects.find(p => p.id === projectId);
          if (project) project.notes = notes;
        });
      },

      // ============ DSA PROBLEM ACTIONS ============
      addDSAProblem: (problem) => {
        set((state) => {
          const newProblem: DSAProblem = {
            ...problem,
            id: `dsa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          };
          state.dsaProblems.push(newProblem);

          // Update streak if solved
          if (problem.status === TopicStatus.COMPLETED) {
            const today = new Date().toISOString().split('T')[0];
            let todayActivity = state.streakData.activityLog.find(a => a.date === today);

            if (!todayActivity) {
              todayActivity = {
                date: today,
                topicsCompleted: 0,
                problemsSolved: 0,
                milestonesCompleted: 0,
                todosCompleted: 0,
                minutesStudied: 0
              };
              state.streakData.activityLog.push(todayActivity);
            }

            todayActivity.problemsSolved += 1;
            updateStreak(state.streakData, today);
          }
        });
      },

      updateDSAProblem: (problemId, updates) => {
        set((state) => {
          const index = state.dsaProblems.findIndex(p => p.id === problemId);
          if (index !== -1) {
            const prevStatus = state.dsaProblems[index].status;
            Object.assign(state.dsaProblems[index], updates);

            // Update streak if just completed
            if (updates.status === TopicStatus.COMPLETED && prevStatus !== TopicStatus.COMPLETED) {
              const today = new Date().toISOString().split('T')[0];
              let todayActivity = state.streakData.activityLog.find(a => a.date === today);

              if (!todayActivity) {
                todayActivity = {
                  date: today,
                  topicsCompleted: 0,
                  problemsSolved: 0,
                  milestonesCompleted: 0,
                  todosCompleted: 0,
                  minutesStudied: 0
                };
                state.streakData.activityLog.push(todayActivity);
              }

              todayActivity.problemsSolved += 1;
              updateStreak(state.streakData, today);
            }
          }
        });
      },

      deleteDSAProblem: (problemId) => {
        set((state) => {
          state.dsaProblems = state.dsaProblems.filter(p => p.id !== problemId);
        });
      },

      // ============ WEEKLY REFLECTION ACTIONS ============
      saveReflection: (reflection) => {
        set((state) => {
          const existingIndex = state.weeklyReflections.findIndex(
            r => r.weekNumber === reflection.weekNumber
          );
          if (existingIndex !== -1) {
            state.weeklyReflections[existingIndex] = reflection;
          } else {
            state.weeklyReflections.push(reflection);
          }
        });
      },

      updateReflection: (weekNumber, updates) => {
        set((state) => {
          const reflection = state.weeklyReflections.find(r => r.weekNumber === weekNumber);
          if (reflection) {
            Object.assign(reflection, updates, { updatedAt: new Date().toISOString() });
          }
        });
      },

      // ============ TODO ACTIONS ============
      addTodo: (todo) => {
        set((state) => {
          const dateKey = todo.dueDate;
          let dailyTodos = state.dailyTodos.find(d => d.date === dateKey);

          if (!dailyTodos) {
            dailyTodos = { date: dateKey, items: [] };
            state.dailyTodos.push(dailyTodos);
          }

          dailyTodos.items.push({
            ...todo,
            id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString()
          });
        });
      },

      toggleTodo: (todoId) => {
        set((state) => {
          for (const daily of state.dailyTodos) {
            const todo = daily.items.find(t => t.id === todoId);
            if (todo) {
              const wasCompleted = todo.completed;
              todo.completed = !todo.completed;
              todo.completedAt = todo.completed ? new Date().toISOString() : null;

              // Update streak
              if (todo.completed && !wasCompleted) {
                const today = new Date().toISOString().split('T')[0];
                let todayActivity = state.streakData.activityLog.find(a => a.date === today);

                if (!todayActivity) {
                  todayActivity = {
                    date: today,
                    topicsCompleted: 0,
                    problemsSolved: 0,
                    milestonesCompleted: 0,
                    todosCompleted: 0,
                    minutesStudied: 0
                  };
                  state.streakData.activityLog.push(todayActivity);
                }

                todayActivity.todosCompleted += 1;
                updateStreak(state.streakData, today);
              }
              break;
            }
          }
        });
      },

      deleteTodo: (todoId) => {
        set((state) => {
          for (const daily of state.dailyTodos) {
            daily.items = daily.items.filter(t => t.id !== todoId);
          }
        });
      },

      updateTodoPriority: (todoId, priority) => {
        set((state) => {
          for (const daily of state.dailyTodos) {
            const todo = daily.items.find(t => t.id === todoId);
            if (todo) {
              todo.priority = priority;
              break;
            }
          }
        });
      },

      updateTodoText: (todoId, text) => {
        set((state) => {
          for (const daily of state.dailyTodos) {
            const todo = daily.items.find(t => t.id === todoId);
            if (todo) {
              todo.text = text;
              break;
            }
          }
        });
      },

      // ============ STREAK & ACTIVITY ACTIONS ============
      recordActivity: (activity) => {
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          let todayActivity = state.streakData.activityLog.find(a => a.date === today);

          if (!todayActivity) {
            todayActivity = {
              date: today,
              topicsCompleted: 0,
              problemsSolved: 0,
              milestonesCompleted: 0,
              todosCompleted: 0,
              minutesStudied: 0
            };
            state.streakData.activityLog.push(todayActivity);
          }

          Object.assign(todayActivity, activity);
          updateStreak(state.streakData, today);
        });
      },

      // ============ SETTINGS ACTIONS ============
      updateSettings: (settings) => {
        set((state) => {
          Object.assign(state.settings, settings);
        });
      },

      // ============ DATA MANAGEMENT ============
      exportData: () => {
        const state = get();
        const {
          startDate, modules, projects, dsaProblems,
          weeklyReflections, dailyTodos, streakData, settings
        } = state;
        return JSON.stringify({
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          data: { startDate, modules, projects, dsaProblems, weeklyReflections, dailyTodos, streakData, settings }
        }, null, 2);
      },

      importData: (jsonData) => {
        try {
          const parsed = JSON.parse(jsonData);
          if (parsed.data) {
            set(parsed.data);
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      resetAllData: () => {
        set(createInitialState());
      },

      // ============ COMPUTED HELPERS ============
      getCurrentWeek: () => {
        const start = new Date(CURRICULUM_START_DATE);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return Math.min(12, Math.max(1, Math.ceil((diffDays + 1) / 7)));
      },

      getCurrentDay: () => {
        const start = new Date(CURRICULUM_START_DATE);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return Math.min(88, Math.max(1, diffDays + 1));
      },

      getModuleProgress: (moduleId) => {
        const module = get().modules.find(m => m.id === moduleId);
        if (!module || module.topics.length === 0) return 0;
        const completed = module.topics.filter(t => t.status === TopicStatus.COMPLETED).length;
        return Math.round((completed / module.topics.length) * 100);
      },

      getTotalProgress: () => {
        const modules = get().modules;
        const totalTopics = modules.reduce((acc, m) => acc + m.topics.length, 0);
        if (totalTopics === 0) return 0;
        const completedTopics = modules.reduce(
          (acc, m) => acc + m.topics.filter(t => t.status === TopicStatus.COMPLETED).length,
          0
        );
        return Math.round((completedTopics / totalTopics) * 100);
      },

      getTotalTopics: () => {
        return get().modules.reduce((acc, m) => acc + m.topics.length, 0);
      },

      getCompletedTopics: () => {
        return get().modules.reduce(
          (acc, m) => acc + m.topics.filter(t => t.status === TopicStatus.COMPLETED).length,
          0
        );
      },

      getTotalMilestones: () => {
        return get().projects.reduce((acc, p) => acc + p.milestones.length, 0);
      },

      getCompletedMilestones: () => {
        return get().projects.reduce(
          (acc, p) => acc + p.milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length,
          0
        );
      }
    })),
    {
      name: 'curriculum-tracker-storage',
      storage: createJSONStorage(() => localStorage),
      version: 5,
      partialize: (state) => ({
        startDate: state.startDate,
        modules: state.modules,
        projects: state.projects,
        dsaProblems: state.dsaProblems,
        weeklyReflections: state.weeklyReflections,
        dailyTodos: state.dailyTodos,
        streakData: state.streakData,
        settings: state.settings
      }),
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as CurriculumState;
        const initialState = createInitialState();

        // Migration from v1 to v2: Add subtopics array to topics that don't have it
        if (version < 2) {
          // Migrate each module's topics to include subtopics
          state.modules = state.modules.map(module => {
            const initialModule = initialState.modules.find(m => m.id === module.id);

            return {
              ...module,
              topics: module.topics.map(topic => {
                // Find matching topic from initial data to get subtopics
                const initialTopic = initialModule?.topics.find(t => t.id === topic.id);

                return {
                  ...topic,
                  subtopics: topic.subtopics ?? initialTopic?.subtopics ?? []
                };
              })
            };
          });
        }

        // Migration to v3: Add dueDate to topics and projects
        if (version < 3) {
          // Migrate topics to include dueDate
          state.modules = state.modules.map(module => {
            const initialModule = initialState.modules.find(m => m.id === module.id);

            return {
              ...module,
              topics: module.topics.map(topic => {
                const initialTopic = initialModule?.topics.find(t => t.id === topic.id);
                return {
                  ...topic,
                  dueDate: (topic as any).dueDate ?? initialTopic?.dueDate ?? ''
                };
              })
            };
          });

          // Migrate projects to include dueDate, weekStart, weekEnd
          state.projects = state.projects.map(project => {
            const initialProject = initialState.projects.find(p => p.id === project.id);
            return {
              ...project,
              dueDate: (project as any).dueDate ?? initialProject?.dueDate ?? '',
              weekStart: (project as any).weekStart ?? initialProject?.weekStart ?? 1,
              weekEnd: (project as any).weekEnd ?? initialProject?.weekEnd ?? 12
            };
          });
        }

        // Migration to v4: Add enhanced learning fields (selfAssessment, keyQuestions, etc.)
        if (version < 4) {
          state.modules = state.modules.map(module => {
            const initialModule = initialState.modules.find(m => m.id === module.id);

            return {
              ...module,
              topics: module.topics.map(topic => {
                const initialTopic = initialModule?.topics.find(t => t.id === topic.id);
                return {
                  ...topic,
                  whyItMatters: (topic as any).whyItMatters ?? initialTopic?.whyItMatters,
                  keyQuestion: (topic as any).keyQuestion ?? initialTopic?.keyQuestion,
                  selfAssessment: (topic as any).selfAssessment ?? initialTopic?.selfAssessment,
                  relatedTopics: (topic as any).relatedTopics ?? initialTopic?.relatedTopics,
                  recommendedDSA: (topic as any).recommendedDSA ?? initialTopic?.recommendedDSA,
                  subtopics: topic.subtopics?.map((subtopic, idx) => {
                    const initialSubtopic = initialTopic?.subtopics?.[idx];
                    return {
                      ...subtopic,
                      importance: (subtopic as any).importance ?? initialSubtopic?.importance,
                      keyQuestions: (subtopic as any).keyQuestions ?? initialSubtopic?.keyQuestions
                    };
                  }) ?? []
                };
              })
            };
          });
        }

        // Migration to v5: Update due dates (revised timeline) and add DSA Practice module
        if (version < 5) {
          // Revised due dates mapping (module weekEnd -> new due date)
          const revisedDueDates: Record<string, string> = {
            'mod-js-foundations': '2026-08-20',
            'mod-browser-internals': '2026-08-27',
            'mod-react': '2026-09-07',
            'mod-nextjs': '2026-09-14',
            'mod-frontend-architecture': '2026-09-23',
            'mod-system-design': '2026-10-03',
            'mod-engineering-breadth': '2026-10-15',
          };

          // Update due dates for existing modules
          state.modules = state.modules.map(module => {
            const newDueDate = revisedDueDates[module.id];
            if (newDueDate) {
              return {
                ...module,
                topics: module.topics.map(topic => ({
                  ...topic,
                  dueDate: newDueDate
                }))
              };
            }
            return module;
          });

          // Add DSA Practice module if it doesn't exist
          const hasDsaModule = state.modules.some(m => m.id === 'mod-dsa-practice');
          if (!hasDsaModule) {
            const dsaModule = initialState.modules.find(m => m.id === 'mod-dsa-practice');
            if (dsaModule) {
              state.modules.push(dsaModule);
            }
          }

          // Update project due dates too
          const projectDueDates: Record<string, string> = {
            'proj-data-table': '2026-08-20',
            'proj-command-palette': '2026-08-27',
            'proj-infinite-feed': '2026-09-07',
            'proj-component-library': '2026-09-14',
            'proj-file-upload': '2026-09-23',
            'proj-realtime-dashboard': '2026-10-03',
            'proj-notion-editor': '2026-10-15',
          };

          state.projects = state.projects.map(project => {
            const newDueDate = projectDueDates[project.id];
            if (newDueDate) {
              return {
                ...project,
                dueDate: newDueDate
              };
            }
            return project;
          });
        }

        return state as CurriculumStore;
      }
    }
  ))
);

// Helper function to update streak
function updateStreak(streakData: CurriculumState['streakData'], today: string) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (streakData.lastActiveDate === yesterdayStr) {
    streakData.currentStreak += 1;
  } else if (streakData.lastActiveDate !== today) {
    streakData.currentStreak = 1;
  }

  streakData.lastActiveDate = today;
  streakData.longestStreak = Math.max(
    streakData.longestStreak,
    streakData.currentStreak
  );
  streakData.totalActiveDays = new Set(streakData.activityLog.map(a => a.date)).size;
}

// Selector hooks for optimized re-renders
export const useModules = () => useCurriculumStore(state => state.modules);
export const useProjects = () => useCurriculumStore(state => state.projects);
export const useDSAProblems = () => useCurriculumStore(state => state.dsaProblems);
export const useStreakData = () => useCurriculumStore(state => state.streakData);
export const useSettings = () => useCurriculumStore(state => state.settings);
export const useDailyTodos = () => useCurriculumStore(state => state.dailyTodos);
export const useWeeklyReflections = () => useCurriculumStore(state => state.weeklyReflections);

// Auto-sync to Firebase when state changes (debounced)
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

const syncToFirebase = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const state = useCurriculumStore.getState();
  const dataToSync = {
    modules: state.modules,
    projects: state.projects,
    dsaProblems: state.dsaProblems,
    weeklyReflections: state.weeklyReflections,
    dailyTodos: state.dailyTodos,
    streakData: state.streakData,
    settings: state.settings
  };

  await saveProgressToFirestore(user.uid, dataToSync);
};

// Subscribe to state changes and sync to Firebase (debounced to avoid too many writes)
useCurriculumStore.subscribe(
  (state) => ({
    modules: state.modules,
    projects: state.projects,
    dsaProblems: state.dsaProblems,
    weeklyReflections: state.weeklyReflections,
    dailyTodos: state.dailyTodos,
    streakData: state.streakData
  }),
  () => {
    // Debounce the sync to avoid too many Firebase writes
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
    syncTimeout = setTimeout(() => {
      syncToFirebase();
    }, 2000); // Sync after 2 seconds of no changes
  },
  { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) }
);
