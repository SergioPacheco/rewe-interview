import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { TopicService } from '../services/topic.service';
import { Topic } from '../../models';

/**
 * Route Resolver (functional — Angular 15+ pattern).
 * Pre-loads topic data before the component renders.
 *
 * Demonstrates: ResolveFn (not class-based resolver — modern pattern)
 */
export const topicResolver: ResolveFn<Topic | undefined> = (route) => {
  const topicService = inject(TopicService);
  const topicId = route.paramMap.get('topicId') ?? '';
  return topicService.getTopic(topicId);
};
