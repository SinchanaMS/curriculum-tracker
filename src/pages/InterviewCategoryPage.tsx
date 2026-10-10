import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ChevronLeft, ChevronDown, ChevronUp, CheckCircle2,
  AlertCircle, Circle, MessageSquare, Code, Lightbulb,
  AlertTriangle, Target
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { interviewCategories } from '../data/interviewQuestions';
import { useCurriculumStore } from '../store';
import { InterviewQuestionStatus, InterviewDifficulty } from '../types/curriculum';
import { clsx } from 'clsx';

export default function InterviewCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'not_reviewed' | 'needs_practice' | 'confident'>('all');

  const category = interviewCategories.find(c => c.id === categoryId);
  const interviewProgress = useCurriculumStore(state => state.interviewProgress) || {};
  const updateInterviewProgress = useCurriculumStore(state => state.updateInterviewProgress);

  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Category not found</p>
        <Link to="/interview-prep" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Interview Prep
        </Link>
      </div>
    );
  }

  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getQuestionStatus = (questionId: string): InterviewQuestionStatus => {
    return interviewProgress[questionId]?.status || InterviewQuestionStatus.NOT_REVIEWED;
  };

  const handleStatusChange = (questionId: string, status: InterviewQuestionStatus) => {
    updateInterviewProgress(questionId, {
      questionId,
      status,
      lastReviewedAt: new Date().toISOString(),
      reviewCount: (interviewProgress[questionId]?.reviewCount || 0) + 1,
      notes: interviewProgress[questionId]?.notes || ''
    });
  };

  const filteredQuestions = category.questions.filter(q => {
    if (filter === 'all') return true;
    const status = getQuestionStatus(q.id);
    return status === filter;
  });

  const getDifficultyBadge = (difficulty: InterviewDifficulty) => {
    switch (difficulty) {
      case InterviewDifficulty.BASIC:
        return <Badge variant="success">Basic</Badge>;
      case InterviewDifficulty.INTERMEDIATE:
        return <Badge variant="warning">Intermediate</Badge>;
      case InterviewDifficulty.ADVANCED:
        return <Badge variant="info">Advanced</Badge>;
    }
  };

  const getStatusIcon = (status: InterviewQuestionStatus) => {
    switch (status) {
      case InterviewQuestionStatus.CONFIDENT:
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case InterviewQuestionStatus.NEEDS_PRACTICE:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const statusCounts = {
    all: category.questions.length,
    not_reviewed: category.questions.filter(q => getQuestionStatus(q.id) === InterviewQuestionStatus.NOT_REVIEWED).length,
    needs_practice: category.questions.filter(q => getQuestionStatus(q.id) === InterviewQuestionStatus.NEEDS_PRACTICE).length,
    confident: category.questions.filter(q => getQuestionStatus(q.id) === InterviewQuestionStatus.CONFIDENT).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/interview-prep"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {category.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {category.description}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'not_reviewed', 'needs_practice', 'confident'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              filter === f
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
            )}
          >
            {f === 'all' && `All (${statusCounts.all})`}
            {f === 'not_reviewed' && `Not Reviewed (${statusCounts.not_reviewed})`}
            {f === 'needs_practice' && `Needs Practice (${statusCounts.needs_practice})`}
            {f === 'confident' && `Confident (${statusCounts.confident})`}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question, index) => {
          const isExpanded = expandedQuestions.has(question.id);
          const status = getQuestionStatus(question.id);

          return (
            <Card key={question.id} className="overflow-hidden">
              {/* Question Header */}
              <button
                onClick={() => toggleQuestion(question.id)}
                className="w-full p-4 flex items-start gap-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Q{index + 1}
                    </span>
                    {getDifficultyBadge(question.difficulty)}
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {question.question}
                  </h3>
                </div>
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                  {/* Answer */}
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Answer
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      {question.answer}
                    </p>
                  </div>

                  {/* Key Points */}
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Key Points to Mention
                    </h4>
                    <ul className="space-y-1">
                      {question.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-blue-500 mt-1">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Follow-up Questions */}
                  {question.followUps.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Follow-up Questions They Might Ask
                      </h4>
                      <div className="space-y-3">
                        {question.followUps.map((followUp, i) => (
                          <div key={i} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">
                              "{followUp.question}"
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {followUp.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Code Example */}
                  {(question.example || question.codeExample) && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Example
                      </h4>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{question.codeExample || question.example}</code>
                      </pre>
                    </div>
                  )}

                  {/* Common Mistakes */}
                  {question.commonMistakes && question.commonMistakes.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        Common Mistakes to Avoid
                      </h4>
                      <ul className="space-y-1">
                        {question.commonMistakes.map((mistake, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-yellow-700 dark:text-yellow-400">
                            <span className="mt-1">×</span>
                            {mistake}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What Interviewer Expects */}
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">
                      What the Interviewer Expects
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      {question.interviewerExpects}
                    </p>
                  </div>

                  {/* Status Buttons */}
                  <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2 self-center">
                      Mark as:
                    </span>
                    <Button
                      size="sm"
                      variant={status === InterviewQuestionStatus.CONFIDENT ? 'primary' : 'ghost'}
                      onClick={() => handleStatusChange(question.id, InterviewQuestionStatus.CONFIDENT)}
                      className={clsx(
                        status === InterviewQuestionStatus.CONFIDENT && 'bg-green-500 hover:bg-green-600'
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Confident
                    </Button>
                    <Button
                      size="sm"
                      variant={status === InterviewQuestionStatus.NEEDS_PRACTICE ? 'primary' : 'ghost'}
                      onClick={() => handleStatusChange(question.id, InterviewQuestionStatus.NEEDS_PRACTICE)}
                      className={clsx(
                        status === InterviewQuestionStatus.NEEDS_PRACTICE && 'bg-yellow-500 hover:bg-yellow-600'
                      )}
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Needs Practice
                    </Button>
                    <Button
                      size="sm"
                      variant={status === InterviewQuestionStatus.NOT_REVIEWED ? 'primary' : 'ghost'}
                      onClick={() => handleStatusChange(question.id, InterviewQuestionStatus.NOT_REVIEWED)}
                    >
                      <Circle className="w-4 h-4 mr-1" />
                      Not Reviewed
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filteredQuestions.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No questions match the selected filter
          </p>
        </Card>
      )}
    </div>
  );
}
