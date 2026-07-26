import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, HelpCircle, CheckCircle2, BookOpen, Code2, Lightbulb, Link2 } from 'lucide-react';
import { Card, Badge, Button, Textarea } from '../components/ui';
import { useModules, useCurriculumStore } from '../store';
import { useState } from 'react';

export default function StudyGuidePage() {
  const { moduleId, topicId } = useParams();
  const modules = useModules();
  const updateSelfAssessmentAnswer = useCurriculumStore(state => state.updateSelfAssessmentAnswer);
  const toggleSubtopic = useCurriculumStore(state => state.toggleSubtopic);

  const module = modules.find(m => m.id === moduleId);
  const topic = module?.topics.find(t => t.id === topicId);

  const [expandedSubtopic, setExpandedSubtopic] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  if (!module || !topic) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Topic not found</p>
        <Link to="/modules" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Modules
        </Link>
      </div>
    );
  }

  const subtopics = topic.subtopics || [];
  const answeredQuestions = topic.selfAssessment?.filter(q => q.answer.trim()).length || 0;
  const totalQuestions = topic.selfAssessment?.length || 0;

  const renderImportanceStars = (importance?: number) => {
    if (!importance) return null;
    return (
      <span className="inline-flex gap-0.5 ml-2">
        {Array.from({ length: importance }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          to={`/modules/${moduleId}`}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors mt-1"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div className="flex-1">
          <Badge variant="purple" size="sm" className="mb-2">{module.name}</Badge>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {topic.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Study Guide</p>
        </div>
      </div>

      {/* Why It Matters */}
      {topic.whyItMatters && (
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Why does this matter?</h2>
              <p className="text-gray-600 dark:text-gray-400">{topic.whyItMatters}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Key Question */}
      {topic.keyQuestion && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">By the end, you should be able to answer:</h2>
              <p className="text-lg text-purple-800 dark:text-purple-200 italic">"{topic.keyQuestion}"</p>
            </div>
          </div>
        </Card>
      )}

      {/* Subtopics to Cover */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Topics to Cover
        </h2>

        <div className="space-y-3">
          {subtopics.map((subtopic, index) => (
            <Card
              key={subtopic.id}
              className={`cursor-pointer transition-all ${
                subtopic.completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''
              }`}
            >
              <div
                className="flex items-start gap-4"
                onClick={() => setExpandedSubtopic(expandedSubtopic === subtopic.id ? null : subtopic.id)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSubtopic(module.id, topic.id, subtopic.id);
                  }}
                  className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    subtopic.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                  }`}
                >
                  {subtopic.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>

                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <h3 className={`font-semibold ${
                      subtopic.completed
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {subtopic.name}
                    </h3>
                    {renderImportanceStars(subtopic.importance)}
                  </div>

                  {/* Key Questions for this subtopic */}
                  {expandedSubtopic === subtopic.id && subtopic.keyQuestions && subtopic.keyQuestions.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Understand:
                      </p>
                      <ul className="space-y-2">
                        {subtopic.keyQuestions.map((question, qIdx) => (
                          <li key={qIdx} className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span className="text-gray-700 dark:text-gray-300">{question}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!expandedSubtopic && subtopic.keyQuestions && subtopic.keyQuestions.length > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {subtopic.keyQuestions.length} questions to answer • Click to expand
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Related Topics */}
      {topic.relatedTopics && topic.relatedTopics.length > 0 && (
        <Card>
          <div className="flex items-start gap-3">
            <Link2 className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">This topic is foundation for:</h2>
              <div className="flex flex-wrap gap-2">
                {topic.relatedTopics.map((related, idx) => (
                  <Badge key={idx} variant="default">{related}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recommended DSA */}
      {topic.recommendedDSA && topic.recommendedDSA.length > 0 && (
        <Card className="border-l-4 border-l-green-500">
          <div className="flex items-start gap-3">
            <Code2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Recommended DSA Practice</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Easy problems to establish the solving process:
              </p>
              <div className="flex flex-wrap gap-2">
                {topic.recommendedDSA.map((problem, idx) => (
                  <Badge key={idx} variant="success">{problem}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Self Assessment / Homework */}
      {topic.selfAssessment && topic.selfAssessment.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Self Assessment
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {answeredQuestions}/{totalQuestions} answered
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnswers(!showAnswers)}
              >
                {showAnswers ? 'Hide Answers' : 'Show Answers'}
              </Button>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            Answer these <strong>without Googling</strong>. If you can answer confidently, you truly understand the topic.
          </p>

          <div className="space-y-4">
            {topic.selfAssessment.map((question, index) => (
              <Card key={question.id}>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-semibold text-sm">
                      Q{index + 1}
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white pt-1">
                      {question.question}
                    </p>
                  </div>

                  {showAnswers && (
                    <div className="ml-11">
                      <Textarea
                        value={question.answer}
                        onChange={(e) => updateSelfAssessmentAnswer(module.id, topic.id, question.id, e.target.value)}
                        placeholder="Write your answer here..."
                        rows={3}
                      />
                      {question.answeredAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last updated: {new Date(question.answeredAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Drawing Reminder */}
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✏️</span>
          <div>
            <h2 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Don't just read—draw!</h2>
            <p className="text-yellow-700 dark:text-yellow-300">
              Create a visual diagram of the concepts. If you can draw it from memory, you understand it.
            </p>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          to={`/modules/${moduleId}`}
          className="text-blue-600 hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {module.name}
        </Link>
      </div>
    </div>
  );
}
