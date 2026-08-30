import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Menu, X, CheckCircle2, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Card, Button } from '../components/ui';
import { MarkdownRenderer } from '../components/features/MarkdownRenderer';
import { useModules } from '../store';
import { getModuleContent, hasModuleContent, TopicContent } from '../content';
import { useState, useEffect } from 'react';
import { TopicStatus } from '../types';
import { clsx } from 'clsx';

export default function LearnPage() {
  const { moduleId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const modules = useModules();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('learnSidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const module = modules.find(m => m.id === moduleId);
  const content = moduleId ? getModuleContent(moduleId) : [];
  const hasContent = moduleId ? hasModuleContent(moduleId) : false;

  // Get current topic from URL or default to first
  const currentTopicParam = searchParams.get('topic');
  const currentTopicIndex = currentTopicParam
    ? content.findIndex(t => t.topicName.toLowerCase().replace(/\s+/g, '-') === currentTopicParam)
    : 0;
  const currentTopic = content[currentTopicIndex >= 0 ? currentTopicIndex : 0];

  // Close sidebar when topic changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [currentTopicParam]);

  // Scroll to top when topic changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTopicParam]);

  // Save sidebar collapsed state
  const toggleSidebarCollapsed = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('learnSidebarCollapsed', JSON.stringify(newState));
  };

  if (!module) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Module not found</p>
        <Link to="/modules" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Modules
        </Link>
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to={`/modules/${moduleId}`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{module.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">Learning Content</p>
          </div>
        </div>

        <Card className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Content Coming Soon
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Learning materials for {module.name} are being prepared.
            Check back soon or continue with the study guide for individual topics.
          </p>
          <Link to={`/modules/${moduleId}`}>
            <Button className="mt-6">
              Back to Module
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const navigateToTopic = (topic: TopicContent) => {
    const slug = topic.topicName.toLowerCase().replace(/\s+/g, '-');
    setSearchParams({ topic: slug });
  };

  const goToPrevious = () => {
    if (currentTopicIndex > 0) {
      navigateToTopic(content[currentTopicIndex - 1]);
    }
  };

  const goToNext = () => {
    if (currentTopicIndex < content.length - 1) {
      navigateToTopic(content[currentTopicIndex + 1]);
    }
  };

  // Find corresponding topic in module data to check completion status
  const getTopicStatus = (topicName: string): TopicStatus | null => {
    const topic = module.topics.find(t =>
      t.name.toLowerCase() === topicName.toLowerCase()
    );
    return topic?.status ?? null;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-12rem)]">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/modules/${moduleId}`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{module.name}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentTopicIndex + 1} of {content.length} topics
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={clsx(
        "transition-all duration-300 ease-in-out",
        sidebarOpen ? 'block' : 'hidden lg:block',
        sidebarCollapsed ? 'lg:w-[70px]' : 'w-full lg:w-64',
        "shrink-0"
      )}>
        <Card className="sticky top-4 max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
          {/* Sidebar Header - Desktop */}
          <div className={clsx(
            "hidden lg:block border-b border-gray-200 dark:border-gray-700",
            sidebarCollapsed ? "p-2" : "p-4"
          )}>
            {!sidebarCollapsed && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <Link
                    to={`/modules/${moduleId}`}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to module</span>
                  </Link>
                  <button
                    onClick={toggleSidebarCollapsed}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Collapse sidebar"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: module.color }}
                  />
                  <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                    {module.name}
                  </h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {content.length} topics
                </p>
              </>
            )}
            {sidebarCollapsed && (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={toggleSidebarCollapsed}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Expand sidebar"
                >
                  <PanelLeft className="w-5 h-5" />
                </button>
                <Link
                  to={`/modules/${moduleId}`}
                  className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Back to module"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Topic List */}
          <nav className={clsx("flex-1 overflow-y-auto", sidebarCollapsed ? "p-1" : "p-2")}>
            <ul className="space-y-1">
              {content.map((topic, index) => {
                const isActive = index === currentTopicIndex;
                const status = getTopicStatus(topic.topicName);
                const isCompleted = status === TopicStatus.COMPLETED;

                return (
                  <li key={topic.topicName}>
                    <button
                      onClick={() => navigateToTopic(topic)}
                      title={sidebarCollapsed ? topic.topicName : undefined}
                      className={clsx(
                        'w-full text-left rounded-lg text-sm transition-colors flex items-center',
                        sidebarCollapsed ? 'p-2 justify-center' : 'px-3 py-2 gap-2',
                        isActive
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      <span className={clsx(
                        "shrink-0 flex items-center justify-center text-xs font-medium",
                        sidebarCollapsed ? "w-6 h-6" : "w-5 h-5",
                        isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      {!sidebarCollapsed && (
                        <span className="truncate">{topic.topicName}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Progress */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {currentTopicIndex + 1} / {content.length}
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${((currentTopicIndex + 1) / content.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </Card>
      </aside>

      {/* Main Content - Wider now */}
      <main className="flex-1 min-w-0">
        <Card className="p-6 md:p-8 lg:p-10">
          {currentTopic && (
            <article className="max-w-none prose-lg">
              <MarkdownRenderer content={currentTopic.content} />
            </article>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={goToPrevious}
              disabled={currentTopicIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentTopicIndex + 1} of {content.length}
            </span>

            <Button
              variant="outline"
              onClick={goToNext}
              disabled={currentTopicIndex === content.length - 1}
              className="flex items-center gap-2"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
