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
 * - Parent/child routes with redirects
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
  // Legacy redirect: /resume → /profile/resume
  {
    path: 'resume',
    redirectTo: 'profile/resume',
    pathMatch: 'full'
  },
  // Legacy redirect: /topic/stories → /profile/case-studies
  {
    path: 'topic/stories',
    redirectTo: 'profile/case-studies',
    pathMatch: 'full'
  },
  // Profile section with child routes
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component')
      .then(m => m.ProfileComponent),
    title: 'Profile',
    children: [
      { path: '', redirectTo: 'about-me', pathMatch: 'full' },
      {
        path: 'about-me',
        loadComponent: () => import('./features/profile/about-me.component')
          .then(m => m.AboutMeComponent),
        title: 'About Me'
      },
      {
        path: 'resume',
        loadComponent: () => import('./features/resume/resume.component')
          .then(m => m.ResumeComponent),
        title: 'Resume'
      },
      {
        path: 'case-studies',
        loadComponent: () => import('./features/profile/case-studies.component')
          .then(m => m.CaseStudiesComponent),
        title: 'Case Studies'
      },
      {
        path: 'engineering-journey',
        loadComponent: () => import('./features/profile/engineering-journey.component')
          .then(m => m.EngineeringJourneyComponent),
        title: 'Engineering Journey'
      },
      {
        path: 'cover-letter',
        loadComponent: () => import('./features/profile/cover-letter.component')
          .then(m => m.CoverLetterComponent),
        title: 'Cover Letter'
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/profile/contact.component')
          .then(m => m.ContactComponent),
        title: 'Contact'
      }
    ]
  },
  {
    path: 'portfolio',
    redirectTo: 'topic/portfolio',
    pathMatch: 'full'
  },
  {
    path: 'architecture-examples',
    loadComponent: () => import('./features/architecture-pack/architecture-pack.component')
      .then(m => m.ArchitecturePackComponent),
    title: 'Architecture Example Pack'
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
