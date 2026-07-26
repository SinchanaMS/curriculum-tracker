import { Calendar, Clock, Target, Flame } from 'lucide-react';
import { useCurriculumStore, useModules, useProjects, useStreakData } from '../../store';
import { CURRICULUM_START_DATE, TOTAL_DAYS } from '../../data/initialData';
import { TopicStatus } from '../../types';

export function CountdownBanner() {
  const getCurrentDay = useCurriculumStore(state => state.getCurrentDay);
  const getCurrentWeek = useCurriculumStore(state => state.getCurrentWeek);
  const modules = useModules();
  const projects = useProjects();
  const streakData = useStreakData();

  const currentDay = getCurrentDay();
  const currentWeek = getCurrentWeek();
  const daysRemaining = Math.max(0, TOTAL_DAYS - currentDay + 1);
  const progressPercent = Math.round((currentDay / TOTAL_DAYS) * 100);

  // Calculate end date
  const startDate = new Date(CURRICULUM_START_DATE);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + TOTAL_DAYS - 1);

  // Find next upcoming deadline (topic or project)
  const today = new Date().toISOString().split('T')[0];

  const upcomingTopics = modules.flatMap(m =>
    m.topics
      .filter(t => t.status !== TopicStatus.COMPLETED && t.dueDate && t.dueDate >= today)
      .map(t => ({ name: t.name, dueDate: t.dueDate, type: 'topic' as const, moduleName: m.name }))
  ).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const upcomingProjects = projects
    .filter(p => !p.completedAt && p.dueDate && p.dueDate >= today)
    .map(p => ({ name: p.name, dueDate: p.dueDate, type: 'project' as const }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const nextDeadline = [...upcomingTopics.slice(0, 1), ...upcomingProjects.slice(0, 1)]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 0) return 'Overdue';
    return `${diff} days`;
  };

  // Determine urgency color for countdown
  const getUrgencyColor = () => {
    if (daysRemaining <= 7) return 'from-red-500 to-red-600';
    if (daysRemaining <= 21) return 'from-orange-500 to-orange-600';
    if (daysRemaining <= 42) return 'from-yellow-500 to-amber-600';
    return 'from-blue-500 to-indigo-600';
  };

  return (
    <div className={`bg-gradient-to-r ${getUrgencyColor()} text-white px-4 py-3 shadow-lg`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Main Countdown */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <div>
              <div className="text-2xl font-bold leading-none">{daysRemaining}</div>
              <div className="text-xs text-white/80">days left</div>
            </div>
          </div>

          <div className="h-10 w-px bg-white/30" />

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <div>
              <div className="text-sm font-semibold">Day {currentDay} / {TOTAL_DAYS}</div>
              <div className="text-xs text-white/80">Week {currentWeek} of 12</div>
            </div>
          </div>

          <div className="h-10 w-px bg-white/30" />

          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <div>
              <div className="text-sm font-semibold">Ends {formatDate(endDate.toISOString())}</div>
              <div className="text-xs text-white/80">{progressPercent}% complete</div>
            </div>
          </div>

          {streakData.currentStreak > 0 && (
            <>
              <div className="h-10 w-px bg-white/30" />
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-yellow-300" />
                <div>
                  <div className="text-sm font-semibold">{streakData.currentStreak} day streak</div>
                  <div className="text-xs text-white/80">Keep it going!</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Progress Bar - only show when there's meaningful progress */}
        {progressPercent > 0 && (
          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-sm font-medium w-12">{progressPercent}%</span>
          </div>
        )}

        {/* Next Deadline */}
        {nextDeadline && (
          <div className="bg-white/20 rounded-lg px-3 py-2">
            <div className="text-xs text-white/80 uppercase tracking-wide">Next Due</div>
            <div className="text-sm font-semibold truncate max-w-[180px]" title={nextDeadline.name}>
              {nextDeadline.name}
            </div>
            <div className="text-xs text-white/90">
              {getDaysUntil(nextDeadline.dueDate)} ({formatDate(nextDeadline.dueDate)})
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
