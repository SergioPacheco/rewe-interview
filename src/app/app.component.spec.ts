import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';

describe('AppComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have sidebar closed by default', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.sidebarOpen()).toBe(false);
  });

  it('should toggle sidebar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.toggleSidebar();
    expect(app.sidebarOpen()).toBe(true);

    app.toggleSidebar();
    expect(app.sidebarOpen()).toBe(false);
  });

  it('should expand and collapse topics', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.toggleTopic('oop');
    expect(app.expandedTopic()).toBe('oop');

    app.toggleTopic('oop');
    expect(app.expandedTopic()).toBeNull();

    app.toggleTopic('spring');
    expect(app.expandedTopic()).toBe('spring');

    app.toggleTopic('kafka');
    expect(app.expandedTopic()).toBe('kafka');
  });

  it('should have domainGroups defined', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.domainGroups.length).toBeGreaterThan(0);
  });

  it('should handle search', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.onSearch('spring');
    expect(app.searchQuery()).toBe('spring');

    app.onSearch('');
    expect(app.searchQuery()).toBe('');
  });
});
