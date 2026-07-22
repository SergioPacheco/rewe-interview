import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <div class="profile-layout">
      <aside class="profile-sidebar" [class.profile-sidebar--open]="sidebarOpen()">
        <nav class="profile-sidebar__nav" aria-label="Profile navigation">
          <button
            class="profile-sidebar__toggle"
            type="button"
            (click)="sidebarOpen.set(!sidebarOpen())"
            aria-label="Toggle profile menu"
          >
            ☰ Menu
          </button>

          @for (item of navItems; track item.path) {
            <a
              class="profile-sidebar__link"
              [routerLink]="item.path"
              routerLinkActive="profile-sidebar__link--active"
            >
              <span class="profile-sidebar__icon">{{ item.icon }}</span>
              <span class="profile-sidebar__label">{{ item.labelKey | t }}</span>
            </a>
          }
        </nav>
      </aside>

      <section class="profile-content">
        <router-outlet />
      </section>
    </div>
  `,
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  readonly sidebarOpen = signal(true);

  readonly navItems = [
    { path: 'about-me', icon: '👤', labelKey: 'profile.nav.aboutMe' },
    { path: 'resume', icon: '📄', labelKey: 'profile.nav.resume' },
    { path: 'case-studies', icon: '📊', labelKey: 'profile.nav.caseStudies' },
    { path: 'engineering-journey', icon: '🛤️', labelKey: 'profile.nav.engineeringJourney' },
    { path: 'cover-letter', icon: '✉️', labelKey: 'profile.nav.coverLetter' },
    { path: 'contact', icon: '📞', labelKey: 'profile.nav.contact' },
  ];
}
