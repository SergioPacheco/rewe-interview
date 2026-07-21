import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { TopicService } from '../services/topic.service';
import { QuizEngineService } from '../services/quiz-engine.service';

/**
 * Practice guard — waits for the catalogue before displaying the practice setup.
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

  // A visit to /practice always starts at setup, never in a stale session.
  engine.end();

  // The component lets the user choose mixed practice or a specific topic.
  return true;
};
