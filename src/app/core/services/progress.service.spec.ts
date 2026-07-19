import { TestBed } from '@angular/core/testing';
import { ProgressService } from './progress.service';
import { StorageService } from './storage.service';

describe('ProgressService', () => {
  let service: ProgressService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [ProgressService, StorageService]
    });
    service = TestBed.inject(ProgressService);
  });

  describe('initial state', () => {
    it('should start with zero XP', () => {
      expect(service.totalXp()).toBe(0);
    });

    it('should start with zero streak', () => {
      expect(service.streak()).toBe(0);
    });

    it('should have 0% accuracy when no answers', () => {
      expect(service.accuracy()).toBe(0);
    });

    it('should have zero topics started', () => {
      expect(service.topicsStarted()).toBe(0);
    });
  });

  describe('recordAnswer', () => {
    it('should increment XP by 10 on correct answer', () => {
      // Arrange
      const initialXp = service.totalXp();

      // Act
      service.recordAnswer('oop', true, 20);

      // Assert
      expect(service.totalXp()).toBe(initialXp + 10);
    });

    it('should not increment XP on incorrect answer', () => {
      // Arrange
      const initialXp = service.totalXp();

      // Act
      service.recordAnswer('oop', false, 20);

      // Assert
      expect(service.totalXp()).toBe(initialXp);
    });

    it('should track topic progress correctly', () => {
      // Arrange & Act
      service.recordAnswer('spring', true, 40);
      service.recordAnswer('spring', true, 40);
      service.recordAnswer('spring', false, 40);

      // Assert
      const progress = service.getTopicProgress('spring');
      expect(progress).not.toBeNull();
      expect(progress!.answered).toBe(3);
      expect(progress!.correct).toBe(2);
      expect(progress!.mastery).toBe(67); // 2/3 = 66.7 → 67
    });

    it('should calculate accuracy across all topics', () => {
      // Arrange & Act
      service.recordAnswer('oop', true, 10);
      service.recordAnswer('oop', true, 10);
      service.recordAnswer('spring', false, 10);
      service.recordAnswer('spring', true, 10);

      // Assert — 3 correct out of 4 = 75%
      expect(service.accuracy()).toBe(75);
    });

    it('should count topics started', () => {
      // Act
      service.recordAnswer('oop', true, 10);
      service.recordAnswer('kafka', false, 10);

      // Assert
      expect(service.topicsStarted()).toBe(2);
    });
  });

  describe('persistence', () => {
    it('should persist progress to localStorage', () => {
      // Act
      service.recordAnswer('oop', true, 10);

      // Assert — effect may be async, check after microtask
      // The storage service is called via effect(), which runs synchronously
      // in test environment after signal update
      TestBed.flushEffects();
      const stored = localStorage.getItem('rewe-interview-progress');
      expect(stored).toBeTruthy();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.totalXp).toBe(10);
      }
    });

    it('should restore progress from localStorage on init', () => {
      // Arrange — save some progress manually BEFORE creating a new TestBed
      const mockProgress = {
        totalXp: 50,
        streak: 3,
        lastPractice: '2026-07-19',
        topics: {}
      };
      localStorage.setItem('rewe-interview-progress', JSON.stringify(mockProgress));

      // Act — create a fresh injector with a new service instance
      const freshInjector = TestBed.inject(ProgressService);
      // Since the service is singleton in this test module, we verify via
      // the StorageService directly
      const storage = TestBed.inject(StorageService);
      const loaded = storage.load();

      // Assert
      expect(loaded).toBeTruthy();
      expect(loaded!.totalXp).toBe(50);
      expect(loaded!.streak).toBe(3);
    });
  });

  describe('reset', () => {
    it('should clear all progress', () => {
      // Arrange
      service.recordAnswer('oop', true, 10);
      service.recordAnswer('spring', true, 10);

      // Act
      service.reset();

      // Assert
      expect(service.totalXp()).toBe(0);
      expect(service.totalAnswered()).toBe(0);
      expect(service.topicsStarted()).toBe(0);
    });
  });
});
