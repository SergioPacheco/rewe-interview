import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { loggingInterceptor } from './core/interceptors/logging.interceptor';

/**
 * Application configuration — functional providers (no NgModule).
 *
 * Advanced techniques:
 * - provideAnimationsAsync: lazy-loads animation engine
 * - withViewTransitions: smooth page transitions (View Transitions API)
 * - withInterceptors: functional interceptor chain
 * - provideZoneChangeDetection: optimized for signals (eventCoalescing)
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([loggingInterceptor])),
    provideAnimationsAsync()
  ]
};
