import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ModulesPage from './pages/ModulesPage';
import ModuleDetailPage from './pages/ModuleDetailPage';
import StudyGuidePage from './pages/StudyGuidePage';
import LearnPage from './pages/LearnPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import DSAPage from './pages/DSAPage';
import DSAFormPage from './pages/DSAFormPage';
import ReflectionsPage from './pages/ReflectionsPage';
import ReflectionDetailPage from './pages/ReflectionDetailPage';
import TodosPage from './pages/TodosPage';
import SettingsPage from './pages/SettingsPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import InterviewCategoryPage from './pages/InterviewCategoryPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'modules', element: <ModulesPage /> },
      { path: 'modules/:moduleId', element: <ModuleDetailPage /> },
      { path: 'modules/:moduleId/study/:topicId', element: <StudyGuidePage /> },
      { path: 'modules/:moduleId/learn', element: <LearnPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:projectId', element: <ProjectDetailPage /> },
      { path: 'dsa', element: <DSAPage /> },
      { path: 'dsa/new', element: <DSAFormPage /> },
      { path: 'dsa/:problemId', element: <DSAFormPage /> },
      { path: 'reflections', element: <ReflectionsPage /> },
      { path: 'reflections/:weekNumber', element: <ReflectionDetailPage /> },
      { path: 'todos', element: <TodosPage /> },
      { path: 'interview-prep', element: <InterviewPrepPage /> },
      { path: 'interview-prep/:categoryId', element: <InterviewCategoryPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  }
]);
