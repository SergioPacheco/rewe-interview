import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { TopicService } from '../services/topic.service';
import { QuizEngineService } from '../services/quiz-engine.service';

/**
 * Practice guard — starts a random quiz session immediately.
 * Picks a topic with exercises and starts the engine before component loads.
 */
export const practiceRedirectGuard: CanActivateFn = async () => {
  const topicService = inject(TopicService);
  const engine = inject(QuizEngineService);

  // Wait for data to load if needed
  if (topicService.loading()) {
    await new Promise<void>(resolve => {
      const check = () => {
        if (!topicService.loading()) resolve();
        else setTimeout(check, 50);
      };
      check();
    });
  }

  // Get all topics that have exercises
  const topics = topicService.topics().filter(t =>
    topicService.getQuestions(t.id).length > 0
  );

  if (topics.length === 0) return true;

  // Pick a random topic
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];

  // Start the engine with all questions across all topics (mixed practice)
  engine.startMixed();

  return true;
};
