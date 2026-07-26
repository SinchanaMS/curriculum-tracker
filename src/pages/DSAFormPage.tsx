import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, Button, Input, Select, Textarea } from '../components/ui';
import { useDSAProblems, useCurriculumStore } from '../store';
import { TopicStatus, Difficulty, DSAProblem } from '../types';
import { DSA_PATTERNS } from '../data/initialData';
import { useState, useEffect } from 'react';

export default function DSAFormPage() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const dsaProblems = useDSAProblems();
  const addDSAProblem = useCurriculumStore(state => state.addDSAProblem);
  const updateDSAProblem = useCurriculumStore(state => state.updateDSAProblem);

  const existingProblem = problemId ? dsaProblems.find(p => p.id === problemId) : null;
  const isEditing = !!existingProblem;

  const [formData, setFormData] = useState({
    name: '',
    platform: 'leetcode' as DSAProblem['platform'],
    url: '',
    pattern: 'Two Pointers',
    difficulty: Difficulty.MEDIUM,
    status: TopicStatus.PENDING,
    timeSpentMinutes: 0,
    notes: '',
    tags: ''
  });

  useEffect(() => {
    if (existingProblem) {
      setFormData({
        name: existingProblem.name,
        platform: existingProblem.platform,
        url: existingProblem.url,
        pattern: existingProblem.pattern,
        difficulty: existingProblem.difficulty,
        status: existingProblem.status,
        timeSpentMinutes: existingProblem.timeSpentMinutes,
        notes: existingProblem.notes,
        tags: existingProblem.tags.join(', ')
      });
    }
  }, [existingProblem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const problemData = {
      name: formData.name,
      platform: formData.platform,
      url: formData.url,
      pattern: formData.pattern,
      difficulty: formData.difficulty,
      status: formData.status,
      solvedAt: formData.status === TopicStatus.COMPLETED ? new Date().toISOString() : null,
      timeSpentMinutes: formData.timeSpentMinutes,
      notes: formData.notes,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      revisitCount: existingProblem?.revisitCount || 0,
      lastRevisitedAt: existingProblem?.lastRevisitedAt || null
    };

    if (isEditing && existingProblem) {
      updateDSAProblem(existingProblem.id, problemData);
    } else {
      addDSAProblem(problemData);
    }

    navigate('/dsa');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/dsa"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Problem' : 'Add Problem'}
        </h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Problem Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Two Sum"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Platform"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value as DSAProblem['platform'] })}
              options={[
                { value: 'leetcode', label: 'LeetCode' },
                { value: 'hackerrank', label: 'HackerRank' },
                { value: 'codeforces', label: 'Codeforces' },
                { value: 'other', label: 'Other' },
              ]}
            />

            <Select
              label="Difficulty"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
              options={[
                { value: Difficulty.EASY, label: 'Easy' },
                { value: Difficulty.MEDIUM, label: 'Medium' },
                { value: Difficulty.HARD, label: 'Hard' },
              ]}
            />
          </div>

          <Input
            label="Problem URL"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://leetcode.com/problems/..."
            type="url"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Pattern"
              value={formData.pattern}
              onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
              options={DSA_PATTERNS.map(p => ({ value: p, label: p }))}
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TopicStatus })}
              options={[
                { value: TopicStatus.PENDING, label: 'Todo' },
                { value: TopicStatus.IN_PROGRESS, label: 'Attempting' },
                { value: TopicStatus.COMPLETED, label: 'Solved' },
              ]}
            />
          </div>

          <Input
            label="Time Spent (minutes)"
            value={formData.timeSpentMinutes.toString()}
            onChange={(e) => setFormData({ ...formData, timeSpentMinutes: parseInt(e.target.value) || 0 })}
            type="number"
            min="0"
          />

          <Input
            label="Tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="array, hash-table, sorting (comma separated)"
            helperText="Separate tags with commas"
          />

          <Textarea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Key insights, approach, things to remember..."
            rows={4}
          />

          <div className="flex gap-4">
            <Button type="submit">
              {isEditing ? 'Update Problem' : 'Add Problem'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/dsa')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
