import { TestBed } from '@angular/core/testing';
import { QuizEngineService } from './quiz-engine.service';
import { ProgressService } from './progress.service';
import { TopicService } from './topic.service';
import { Question } from '../../models';

describe('QuizEngineService', () => {
  let service: QuizEngineService;
  let topicService: TopicService;

  const mockQuestions: Question[] = [
    {
      id: 'test-q1',
      type: 'PREDICT_OUTPUT',
      topic: 'test-topic',
      difficulty: 'easy',
      mission: 'What is 1+1?',
      choices: ['1', '2', '3', '4'],
      answer: '2',
    },
    {
      id: 'test-q2',
      type: 'PREDICT_OUTPUT',
      topic: 'test-topic',
      difficulty: 'medium',
      mission: 'What is 2+2?',
      choices: ['2', '3', '4', '5'],
      answer: '4',
    },
    {
      id: 'test-q3',
      type: 'FILL_BLANK',
      topic: 'test-topic',
      difficulty: 'hard',
      mission: 'Complete the blank',
      choices: ['put', 'add', 'set', 'insert'],
      answer: 'put',
    }
  ];

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [QuizEngineService, ProgressService, TopicService]
    });

    service = TestBed.inject(QuizEngineService);
    topicService = TestBed.inject(TopicService);

    // Inject mock questions
    topicService.questions.set(mockQuestions as Question[]);
  });

  describe('start', () => {
    it('should create a session with questions', () => {
      // Act
      service.start('test-topic');

      // Assert
      expect(service.isActive()).toBe(true);
      expect(service.totalInSession()).toBeGreaterThan(0);
      expect(service.questionNumber()).toBe(1);
    });

    it('should not create session if no questions exist', () => {
      // Act
      service.start('nonexistent-topic');

      // Assert
      expect(service.isActive()).toBe(false);
    });

    it('should limit questions to maxQuestions parameter', () => {
      // Act
      service.start('test-topic', undefined, 2);

      // Assert
      expect(service.totalInSession()).toBe(2);
    });

    it('should include oral architecture scenarios in architecture practice', () => {
      topicService.questions.set([{
        id: 'architecture-oral',
        type: 'ORAL_ANSWER',
        topic: 'software-architecture',
        difficulty: 'senior',
        mission: 'Describe the trade-off.',
        answer: 'A reasoned answer'
      }] as Question[]);

      service.start('software-architecture');

      expect(service.totalInSession()).toBe(1);
      expect(service.currentQuestion()?.type).toBe('ORAL_ANSWER');
    });

    it('should include oral portfolio prompts in portfolio practice', () => {
      topicService.questions.set([{
        id: 'portfolio-oral',
        type: 'ORAL_ANSWER',
        topic: 'portfolio',
        difficulty: 'senior',
        mission: 'Explain a project decision.',
        modelAnswer: 'A clear and honest explanation'
      }] as Question[]);

      service.start('portfolio');

      expect(service.totalInSession()).toBe(1);
      expect(service.currentQuestion()?.type).toBe('ORAL_ANSWER');
    });
  });

  describe('submitAnswer', () => {
    beforeEach(() => {
      service.start('test-topic', undefined, 3);
    });

    it('should return correct for right answer', () => {
      // Arrange — answer is string-based in PREDICT_OUTPUT
      const question = service.currentQuestion()!;

      // Act
      const result = service.submitAnswer(question.answer);

      // Assert
      expect(result).toBe('correct');
    });

    it('should return incorrect for wrong answer', () => {
      // Act
      const result = service.submitAnswer('wrong answer');

      // Assert
      expect(result).toBe('incorrect');
    });

    it('should accept answer as the correct field for single-choice exercises', () => {
      topicService.questions.set([{
        id: 'single-choice-answer-field',
        type: 'SINGLE_CHOICE',
        topic: 'test-topic',
        difficulty: 'easy',
        mission: 'Choose the correct option.',
        options: ['Incorrect', 'Correct'],
        answer: 1
      }] as Question[]);
      service.start('test-topic');

      expect(service.submitAnswer(1)).toBe('correct');
      expect(service.submitAnswer(0)).toBe('incorrect');
    });

    it('should increment combo on correct answers', () => {
      // Arrange
      const q = service.currentQuestion()!;

      // Act
      service.submitAnswer(q.answer);

      // Assert
      expect(service.combo()).toBe(1);
    });

    it('should reset combo on incorrect answer', () => {
      // Arrange — get correct first
      const q1 = service.currentQuestion()!;
      service.submitAnswer(q1.answer);
      service.next();

      // Act — get wrong
      service.submitAnswer('totally wrong');

      // Assert
      expect(service.combo()).toBe(0);
      expect(service.maxCombo()).toBe(1);
    });
  });

  describe('next', () => {
    it('should advance to next question', () => {
      // Arrange
      service.start('test-topic', undefined, 3);
      const q = service.currentQuestion()!;
      service.submitAnswer(q.answer);

      // Act
      service.next();

      // Assert
      expect(service.questionNumber()).toBe(2);
    });
  });

  describe('isComplete', () => {
    it('should be complete when all questions answered', () => {
      // Arrange
      service.start('test-topic', undefined, 2);

      // Act — answer both
      const q1 = service.currentQuestion()!;
      service.submitAnswer(q1.answer);
      service.next();
      const q2 = service.currentQuestion()!;
      service.submitAnswer(q2.answer);
      service.next();

      // Assert
      expect(service.isComplete()).toBe(true);
    });
  });

  describe('end', () => {
    it('should clear the session', () => {
      // Arrange
      service.start('test-topic');

      // Act
      service.end();

      // Assert
      expect(service.isActive()).toBe(false);
      expect(service.session()).toBeNull();
    });
  });

  describe('sessionAccuracy', () => {
    it('should calculate accuracy within session', () => {
      // Arrange
      service.start('test-topic', undefined, 3);

      // Act — 2 correct, 1 incorrect
      const q1 = service.currentQuestion()!;
      service.submitAnswer(q1.answer); // correct
      service.next();

      service.submitAnswer('totally wrong'); // wrong
      service.next();

      const q3 = service.currentQuestion()!;
      service.submitAnswer(q3.answer); // correct

      // Assert — 2/3 = 67%
      expect(service.sessionAccuracy()).toBe(67);
    });
  });
});
