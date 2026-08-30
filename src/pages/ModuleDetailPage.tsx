import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Circle, ChevronDown, ChevronRight, Calendar, AlertCircle, BookOpen, Star, GraduationCap } from 'lucide-react';
import { Card, Badge, Button, ProgressBar, Textarea } from '../components/ui';
import { useModules, useCurriculumStore } from '../store';
import { TopicStatus } from '../types';
import { useState } from 'react';
import { hasModuleContent } from '../content';

export default function ModuleDetailPage() {
  const { moduleId } = useParams();
  const modules = useModules();
  const updateTopicStatus = useCurriculumStore(state => state.updateTopicStatus);
  const updateTopicNotes = useCurriculumStore(state => state.updateTopicNotes);
  const toggleSubtopic = useCurriculumStore(state => state.toggleSubtopic);

  const module = modules.find(m => m.id === moduleId);
  const [filter, setFilter] = useState<'all' | TopicStatus>('all');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  if (!module) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Module not found</p>
        <Link to="/modules" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Modules
        </Link>
      </div>
    );
  }

  const filteredTopics = filter === 'all'
    ? module.topics
    : module.topics.filter(t => t.status === filter);

  const completed = module.topics.filter(t => t.status === TopicStatus.COMPLETED).length;
  const progress = Math.round((completed / module.topics.length) * 100);

  // Count total subtopics (with null safety for data migration)
  const totalSubtopics = module.topics.reduce((acc, t) => acc + (t.subtopics?.length || 0), 0);
  const completedSubtopics = module.topics.reduce(
    (acc, t) => acc + (t.subtopics?.filter(s => s.completed).length || 0),
    0
  );

  const getNextStatus = (current: TopicStatus): TopicStatus => {
    if (current === TopicStatus.PENDING) return TopicStatus.IN_PROGRESS;
    if (current === TopicStatus.IN_PROGRESS) return TopicStatus.COMPLETED;
    return TopicStatus.PENDING;
  };

  const getStatusIcon = (status: TopicStatus) => {
    if (status === TopicStatus.COMPLETED) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
    if (status === TopicStatus.IN_PROGRESS) {
      return <Clock className="w-5 h-5 text-blue-500" />;
    }
    return <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />;
  };

  const getStatusBadge = (status: TopicStatus) => {
    if (status === TopicStatus.COMPLETED) {
      return <Badge variant="success">Completed</Badge>;
    }
    if (status === TopicStatus.IN_PROGRESS) {
      return <Badge variant="info">In Progress</Badge>;
    }
    return <Badge variant="default">Pending</Badge>;
  };

  const toggleExpanded = (topicId: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const formatDueDate = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDueDateStatus = (dateStr: string | undefined, status: TopicStatus) => {
    if (!dateStr || status === TopicStatus.COMPLETED) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays <= 3) return 'soon';
    return 'normal';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 md:gap-4">
        <Link
          to="/modules"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div
              className="w-3 h-3 md:w-4 md:h-4 rounded-full shrink-0"
              style={{ backgroundColor: module.color }}
            />
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {module.name}
            </h1>
          </div>
          <div className="text-gray-600 dark:text-gray-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span>Week {module.weekStart}{module.weekEnd !== module.weekStart ? `-${module.weekEnd}` : ''}</span>
            <span className="hidden sm:inline">•</span>
            <span>{module.topics.length} topics</span>
            <span className="hidden sm:inline">•</span>
            <span>{totalSubtopics} subtopics</span>
            {module.topics[0]?.dueDate && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Due {formatDueDate(module.topics[0].dueDate)}
                </span>
              </>
            )}
          </div>
          {/* Learn Button */}
          {hasModuleContent(module.id) && (
            <Link to={`/modules/${module.id}/learn`} className="mt-3">
              <Button variant="primary" size="sm" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Start Learning
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Progress */}
      <Card>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Topics Progress
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {completed}/{module.topics.length} completed
              </span>
            </div>
            <ProgressBar value={progress} size="lg" color={`bg-[${module.color}]`} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Subtopics Progress
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {completedSubtopics}/{totalSubtopics} completed
              </span>
            </div>
            <ProgressBar
              value={totalSubtopics > 0 ? (completedSubtopics / totalSubtopics) * 100 : 0}
              size="sm"
              color="bg-green-500"
            />
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', TopicStatus.PENDING, TopicStatus.IN_PROGRESS, TopicStatus.COMPLETED] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === TopicStatus.IN_PROGRESS ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Topics List */}
      <div className="space-y-3">
        {filteredTopics.map((topic) => {
          const isExpanded = expandedTopics.has(topic.id);
          const subtopics = topic.subtopics || [];
          const subtopicsDone = subtopics.filter(s => s.completed).length;
          const subtopicsTotal = subtopics.length;

          return (
            <Card key={topic.id} className="p-3 md:p-4">
              <div className="flex items-start gap-3 md:gap-4">
                <button
                  onClick={() => updateTopicStatus(module.id, topic.id, getNextStatus(topic.status))}
                  className="mt-0.5 hover:scale-110 transition-transform shrink-0"
                  title="Click to change status"
                >
                  {getStatusIcon(topic.status)}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {topic.name}
                        </h3>
                        {subtopicsTotal > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({subtopicsDone}/{subtopicsTotal})
                          </span>
                        )}
                      </div>
                      {/* Study Guide link for topics with enhanced content */}
                      {(topic.whyItMatters || topic.selfAssessment?.length) && (
                        <Link
                          to={`/modules/${module.id}/study/${topic.id}`}
                          className="inline-flex items-center gap-1 text-xs md:text-sm text-purple-600 dark:text-purple-400 hover:underline mt-1"
                        >
                          <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span className="hidden sm:inline">Open</span> Study Guide
                          {topic.selfAssessment && topic.selfAssessment.length > 0 && (
                            <span className="text-xs text-gray-500">
                              ({topic.selfAssessment.filter(q => q.answer).length}/{topic.selfAssessment.length} answered)
                            </span>
                          )}
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 shrink-0">
                      {getStatusBadge(topic.status)}
                      {subtopicsTotal > 0 && (
                        <button
                          onClick={() => toggleExpanded(topic.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Subtopics */}
                  {isExpanded && subtopicsTotal > 0 && (
                    <div className="mt-3 ml-1 space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                      {subtopics.map((subtopic) => (
                        <label
                          key={subtopic.id}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={subtopic.completed}
                            onChange={() => toggleSubtopic(module.id, topic.id, subtopic.id)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className={`text-sm flex items-center gap-1 ${
                            subtopic.completed
                              ? 'text-gray-400 line-through'
                              : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                          }`}>
                            {subtopic.name}
                            {subtopic.importance && (
                              <span className="inline-flex gap-0.5 ml-1">
                                {Array.from({ length: subtopic.importance }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                ))}
                              </span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Quick subtopic preview when collapsed */}
                  {!isExpanded && subtopicsTotal > 0 && (
                    <button
                      onClick={() => toggleExpanded(topic.id)}
                      className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mr-auto"
                    >
                      {subtopicsTotal} subtopics to cover
                    </button>
                  )}

                 

                  {/* Notes */}
                  {editingNotes === topic.id ? (
                    <div className="mt-3">
                      <Textarea
                        value={topic.notes}
                        onChange={(e) => updateTopicNotes(module.id, topic.id, e.target.value)}
                        placeholder="Add notes about this topic..."
                        rows={3}
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-2"
                        onClick={() => setEditingNotes(null)}
                      >
                        Done
                      </Button>
                    </div>
                  ) : topic.notes ? (
                    <div className="mt-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <p className={`text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap ${
                        !expandedNotes.has(topic.id) && topic.notes.length > 150 ? 'line-clamp-2' : ''
                      }`}>
                        {topic.notes}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        {topic.notes.length > 150 && (
                          <button
                            onClick={() => {
                              setExpandedNotes(prev => {
                                const next = new Set(prev);
                                if (next.has(topic.id)) {
                                  next.delete(topic.id);
                                } else {
                                  next.add(topic.id);
                                }
                                return next;
                              });
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {expandedNotes.has(topic.id) ? 'Show less' : 'Read more'}
                          </button>
                        )}
                        <button
                          onClick={() => setEditingNotes(topic.id)}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingNotes(topic.id)}
                      className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      + Add notes
                    </button>
                  )}

                  {/* Due Date & Timestamps */}
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    {topic.dueDate && topic.status !== TopicStatus.COMPLETED && (
                      <span className={`flex items-center gap-1 ${
                        getDueDateStatus(topic.dueDate, topic.status) === 'overdue' ? 'text-red-500 font-medium' :
                        getDueDateStatus(topic.dueDate, topic.status) === 'today' ? 'text-orange-500 font-medium' :
                        getDueDateStatus(topic.dueDate, topic.status) === 'soon' ? 'text-yellow-600 dark:text-yellow-500' : ''
                      }`}>
                        {getDueDateStatus(topic.dueDate, topic.status) === 'overdue' && (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        <Calendar className="w-3.5 h-3.5" />
                        Due: {formatDueDate(topic.dueDate)}
                        {getDueDateStatus(topic.dueDate, topic.status) === 'overdue' && ' (Overdue)'}
                        {getDueDateStatus(topic.dueDate, topic.status) === 'today' && ' (Today!)'}
                      </span>
                    )}
                    {topic.startedAt && (
                      <span>Started: {new Date(topic.startedAt).toLocaleDateString()}</span>
                    )}
                    {topic.completedAt && (
                      <span>Completed: {new Date(topic.completedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
