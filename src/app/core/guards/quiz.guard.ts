import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TopicService } from '../services/topic.service';

/**
 * Route Guard (functional — Angular 15+ pattern).
 * Prevents navigation to quiz if topic ID is missing.
 * Allows access when data is still loading (component handles loading state).
 *
 * Demonstrates: CanActivateFn (not class-based guard — modern pattern)
 */
export const quizGuard: CanActivateFn = (route) => {
  const topicService = inject(TopicService);
  const router = inject(Router);

  const topicId = route.paramMap.get('topicId');
  if (!topicId) {
    return router.createUrlTree(['/']);
  }

  // Always allow — the component will handle missing data gracefully
  return true;
};
