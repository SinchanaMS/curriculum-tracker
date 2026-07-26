import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { Card, Button, Textarea, Input } from '../components/ui';
import { useWeeklyReflections, useCurriculumStore } from '../store';
import { WeeklyReflection } from '../types';
import { useState, useEffect } from 'react';

const QUESTIONS = [
  { key: 'learned', title: 'What did I learn this week?', placeholder: 'Key concepts, new skills, insights...' },
  { key: 'confused', title: 'What confused me?', placeholder: 'Topics that need more clarity, areas to revisit...' },
  { key: 'built', title: 'What did I build?', placeholder: 'Projects, features, practice problems...' },
  { key: 'change', title: 'What should change next week?', placeholder: 'Improvements, different approaches, time allocation...' },
];

export default function ReflectionDetailPage() {
  const { weekNumber } = useParams();
  const navigate = useNavigate();
  const reflections = useWeeklyReflections();
  const saveReflection = useCurriculumStore(state => state.saveReflection);

  const week = parseInt(weekNumber || '1');
  const existingReflection = reflections.find(r => r.weekNumber === week);

  const [formData, setFormData] = useState({
    learned: '',
    confused: '',
    built: '',
    change: '',
    rating: 3 as 1 | 2 | 3 | 4 | 5,
    highlights: ''
  });

  useEffect(() => {
    if (existingReflection) {
      setFormData({
        learned: existingReflection.questions.learned,
        confused: existingReflection.questions.confused,
        built: existingReflection.questions.built,
        change: existingReflection.questions.change,
        rating: existingReflection.rating,
        highlights: existingReflection.highlights.join(', ')
      });
    }
  }, [existingReflection]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reflection: WeeklyReflection = {
      id: existingReflection?.id || `reflection-${week}`,
      weekNumber: week,
      year: new Date().getFullYear(),
      createdAt: existingReflection?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: {
        learned: formData.learned,
        confused: formData.confused,
        built: formData.built,
        change: formData.change,
      },
      rating: formData.rating,
      highlights: formData.highlights.split(',').map(h => h.trim()).filter(Boolean)
    };

    saveReflection(reflection);
    navigate('/reflections');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/reflections"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Week {week} Reflection
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {QUESTIONS.map(({ key, title, placeholder }) => (
          <Card key={key}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              {title}
            </h3>
            <Textarea
              value={formData[key as keyof typeof formData] as string}
              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
              placeholder={placeholder}
              rows={4}
            />
          </Card>
        ))}

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Week Rating
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            How productive was this week overall?
          </p>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as const).map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setFormData({ ...formData, rating })}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Star
                  className={`w-8 h-8 ${
                    rating <= formData.rating
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Highlights
          </h3>
          <Input
            value={formData.highlights}
            onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
            placeholder="Key wins, breakthroughs, proud moments (comma separated)"
            helperText="These will be shown as badges on your reflection card"
          />
        </Card>

        <div className="flex gap-4">
          <Button type="submit">
            Save Reflection
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/reflections')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
