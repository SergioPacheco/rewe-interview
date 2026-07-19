import { Injectable } from '@angular/core';
import { UserProgress } from '../../models';

const STORAGE_KEY = 'rewe-interview-progress';

/**
 * Persists user progress to localStorage.
 * Single responsibility: serialization/deserialization + storage access.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {

  save(progress: UserProgress): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('[StorageService] Failed to save progress:', e);
    }
  }

  load(): UserProgress | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as UserProgress;
    } catch (e) {
      console.warn('[StorageService] Failed to load progress:', e);
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  getDefaultProgress(): UserProgress {
    return {
      totalXp: 0,
      streak: 0,
      lastPractice: null,
      topics: {}
    };
  }
}
