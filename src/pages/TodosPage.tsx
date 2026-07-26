import { useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/ui';
import { useDailyTodos, useCurriculumStore } from '../store';
import { TodoPriority } from '../types';
import { format, addDays, subDays, isToday, isTomorrow, isYesterday } from 'date-fns';

export default function TodosPage() {
  const dailyTodos = useDailyTodos();
  const addTodo = useCurriculumStore(state => state.addTodo);
  const toggleTodo = useCurriculumStore(state => state.toggleTodo);
  const deleteTodo = useCurriculumStore(state => state.deleteTodo);
  const updateTodoPriority = useCurriculumStore(state => state.updateTodoPriority);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<TodoPriority>(TodoPriority.MEDIUM);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const todosForDate = dailyTodos.find(d => d.date === dateKey)?.items || [];

  const completedCount = todosForDate.filter(t => t.completed).length;
  const totalCount = todosForDate.length;

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMM d');
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    addTodo({
      text: newTodoText.trim(),
      completed: false,
      priority: newTodoPriority,
      dueDate: dateKey,
      completedAt: null,
      linkedModuleId: null,
      linkedProjectId: null
    });

    setNewTodoText('');
  };

  const getPriorityBadge = (priority: TodoPriority) => {
    const variants = {
      [TodoPriority.LOW]: 'default',
      [TodoPriority.MEDIUM]: 'warning',
      [TodoPriority.HIGH]: 'danger',
    } as const;
    return <Badge variant={variants[priority]} size="sm">{priority}</Badge>;
  };

  const cyclePriority = (current: TodoPriority): TodoPriority => {
    if (current === TodoPriority.LOW) return TodoPriority.MEDIUM;
    if (current === TodoPriority.MEDIUM) return TodoPriority.HIGH;
    return TodoPriority.LOW;
  };

  // Sort todos: incomplete first, then by priority
  const sortedTodos = [...todosForDate].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { [TodoPriority.HIGH]: 0, [TodoPriority.MEDIUM]: 1, [TodoPriority.LOW]: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Todos</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your daily tasks and build consistency
        </p>
      </div>

      {/* Date Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getDateLabel(selectedDate)}
            </h2>
            <p className="text-sm text-gray-500">
              {format(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>

          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Progress */}
        {totalCount > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {completedCount}/{totalCount} completed
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Add Todo Form */}
      <Card>
        <form onSubmit={handleAddTodo} className="flex gap-3">
          <div className="flex-1">
            <Input
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Add a new task..."
            />
          </div>
          <select
            value={newTodoPriority}
            onChange={(e) => setNewTodoPriority(e.target.value as TodoPriority)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value={TodoPriority.LOW}>Low</option>
            <option value={TodoPriority.MEDIUM}>Medium</option>
            <option value={TodoPriority.HIGH}>High</option>
          </select>
          <Button type="submit">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </form>
      </Card>

      {/* Todo List */}
      {sortedTodos.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No tasks for this day
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Add a task above to get started
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedTodos.map((todo) => (
            <Card
              key={todo.id}
              className={`p-4 ${todo.completed ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    todo.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                  }`}
                >
                  {todo.completed && <Check className="w-4 h-4 text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-gray-900 dark:text-white ${
                    todo.completed ? 'line-through text-gray-500' : ''
                  }`}>
                    {todo.text}
                  </p>
                  {todo.completedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Completed at {format(new Date(todo.completedAt), 'h:mm a')}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => updateTodoPriority(todo.id, cyclePriority(todo.priority))}
                  title="Click to change priority"
                >
                  {getPriorityBadge(todo.priority)}
                </button>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Add Suggestions */}
      {isToday(selectedDate) && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Quick Add Suggestions
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              'Morning study session',
              'Solve 1 DSA problem',
              'Work on project',
              'Review notes',
              'Practice coding',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  addTodo({
                    text: suggestion,
                    completed: false,
                    priority: TodoPriority.MEDIUM,
                    dueDate: dateKey,
                    completedAt: null,
                    linkedModuleId: null,
                    linkedProjectId: null
                  });
                }}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
