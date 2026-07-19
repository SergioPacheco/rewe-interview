import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

/**
 * Logging Interceptor (functional — Angular 15+ pattern).
 * Logs HTTP request duration — demonstrates enterprise interceptor pattern.
 *
 * In a real REWE/TRAB app, this would:
 * - Add auth headers (JWT)
 * - Handle 401 → redirect to login
 * - Add correlation IDs for distributed tracing
 */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = performance.now();

  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    console.log(`[HTTP] ${req.method} ${req.url}`);
  }

  return next(req).pipe(
    tap({
      next: () => {
        if (typeof ngDevMode !== 'undefined' && ngDevMode) {
          const duration = Math.round(performance.now() - startTime);
          console.log(`[HTTP] ${req.method} ${req.url} — ${duration}ms`);
        }
      },
      error: (error) => {
        const duration = Math.round(performance.now() - startTime);
        console.error(`[HTTP] ${req.method} ${req.url} — FAILED (${duration}ms)`, error);
      }
    })
  );
};

declare const ngDevMode: boolean | undefined;
