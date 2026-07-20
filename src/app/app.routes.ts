import { Routes } from '@angular/router';
import { quizGuard } from './core/guards/quiz.guard';
import { practiceRedirectGuard } from './core/guards/practice-redirect.guard';
import { topicResolver } from './core/guards/topic.resolver';

/**
 * Application routes with lazy loading, guards, and resolvers.
 *
 * Advanced techniques demonstrated:
 * - loadComponent (standalone lazy loading — no NgModule!)
 * - Route parameters (:topicId)
 * - CanActivateFn guard (functional, not class-based)
 * - ResolveFn for data pre-loading
 * - Wildcard redirect
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    title: 'REWE Interview — Dashboard'
  },
  {
    path: 'practice',
    canActivate: [practiceRedirectGuard],
    loadComponent: () => import('./features/quiz/quiz.component')
      .then(m => m.QuizComponent),
    title: 'Practice'
  },
  {
    path: 'resume',
    loadComponent: () => import('./features/resume/resume.component')
      .then(m => m.ResumeComponent),
    title: 'Resume'
  },
  {
    path: 'portfolio',
    redirectTo: 'topic/portfolio',
    pathMatch: 'full'
  },
  {
    path: 'topic/java-modern',
    redirectTo: 'topic/collections',
    pathMatch: 'full'
  },
  {
    path: 'topic/:topicId',
    loadComponent: () => import('./features/theory/theory.component')
      .then(m => m.TheoryComponent),
    resolve: { topic: topicResolver },
    runGuardsAndResolvers: 'always',
    title: 'Theory'
  },
  {
    path: 'quiz/:topicId',
    loadComponent: () => import('./features/quiz/quiz.component')
      .then(m => m.QuizComponent),
    canActivate: [quizGuard],
    title: 'Practice'
  },
  {
    path: 'quiz/:topicId/:subtopicId',
    loadComponent: () => import('./features/quiz/quiz.component')
      .then(m => m.QuizComponent),
    canActivate: [quizGuard],
    title: 'Practice'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
