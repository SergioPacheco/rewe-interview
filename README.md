# ☕ REWE Interview Prep

**Angular 19 · Signals · Standalone · REWE.de Design System**

An interactive interview preparation app for the **Fullstack Developer** position at REWE Digital Spain (Team TRAB). Built with Angular 19 using advanced techniques: Signals, standalone components, lazy loading, and a pixel-perfect header replicating REWE.de's visual design.

🔗 **Live:** [GitHub Pages](https://sergiopacheco.github.io/rewe-interview/)

---

## 🚀 Quick Start

```bash
npm install
npx ng serve --port 4200
# → http://localhost:4200
```

## 📦 Build

```bash
npx ng build              # Production build → dist/
npx ng test --watch=false # Unit tests
```

---

## ✨ Features

- **REWE.de Header** — Pixel-perfect reproduction: red topbar with active tab connecting to white catbar (rounded top corners), search + topic shortcuts
- **Functional Search** — Client-side filtering of sidebar topics in real-time with auto-expand
- **Dashboard** — Product-card grid (e-commerce style) with topic cards
- **Learn Tab** — Theory chapters with `white-space: pre-line` for bullet points, `<strong>`, `<pre><code>` blocks
- **Practice Tab** — Flashcard-style questions with reveal pattern, dark IDE code blocks, markdown-rendered answers
- **Resume Page** — Full CV with professional styling
- **Portfolio Page** — Project showcase (SinapiPRO)
- **Sidebar** — Collapsible topic tree with subtopics, priority grouping, and search filtering
- **155 OCA/OCP Questions** — Extracted from PDF, code separated into dark theme blocks
- **Markdown Pipe** — Renders `**bold**`, `` `code` ``, ```fenced blocks```, bullet lists in answers

---

## 🏗️ Architecture

```
src/app/
├── core/services/
│   ├── quiz-engine.service.ts    ← Quiz state machine (Signals)
│   ├── progress.service.ts       ← XP, streak, mastery (localStorage)
│   ├── storage.service.ts        ← localStorage abstraction
│   └── topic.service.ts          ← JSON data loader, getGrouped(), getQuestions()
├── features/
│   ├── dashboard/                ← Product grid (REWE e-commerce cards)
│   ├── theory/                   ← Learn + Practice tabs, markdown answers
│   ├── quiz/                     ← Standalone quiz (fallback route)
│   └── resume/                   ← Full CV page
├── shared/pipes/
│   └── markdown.pipe.ts          ← Converts MD → HTML for [innerHTML]
├── models/index.ts               ← Topic, Question, TheoryChapter interfaces
├── app.component.*               ← Shell: header (REWE exact) + sidebar + content
├── app.config.ts                 ← Providers (functional)
└── app.routes.ts                 ← Lazy routes + guards + resolvers

public/data/
├── exercises/                    ← 12 JSON files, 358+ exercises
└── topics/                       ← 18 theory files + index.json (18 topics)
```

---

## 🎯 Angular 19 Techniques Demonstrated

| Technique | Where |
|-----------|-------|
| `signal()` / `computed()` | All services, app.component |
| `@if` / `@for` / `@switch` | All templates |
| `inject()` function-based DI | All injectables |
| `standalone: true` (zero NgModules) | Every component |
| `loadComponent` lazy loading | app.routes.ts |
| `CanActivateFn` functional guard | quiz.guard.ts |
| `ResolveFn` functional resolver | topic.resolver.ts |
| `routerLinkActive` | Header nav, catbar icons |
| `FormsModule` + `ngModel` with signals | Search bar |
| `[innerHTML]` + custom Pipe | Markdown rendering |
| `withViewTransitions()` | app.config.ts |

---

## 📊 Content

- **18 topics** — Java Core (OCA), OOP, SOLID, Spring Boot, Kafka, SQL, REST, JPA, Concurrency, Patterns, Testing, Docker, K8s, Kotlin, Angular, System Design, Behavioral, REWE-specific
- **358+ exercises** — ORAL_ANSWER, PREDICT_OUTPUT, FILL_BLANK, PICK_INVALID, ORDER_STEPS
- **86 theory chapters** — With code examples, tables, bullet points
- **REWE-specific** — Team TRAB context, NEO platform, job description analysis, interview prep

---

## 🎨 Design System (REWE.de Reproduction)

| Element | Implementation |
|---------|---------------|
| **Topbar** | Red `#cc071e`, 58px, active tab with `margin-top: 14px` + `border-radius: 18px 18px 0 0` connecting to catbar |
| **Catbar** | White, `border-radius: 20px 20px 0 0`, search input (border 2px `#1c1c1c`) + topic icon shortcuts |
| **Search** | Functional filter with clear (✕) button, REWE-style outline border |
| **Sidebar** | Priority-grouped topics, collapsible subtopics, real-time search filter |
| **Cards** | Product-card style with border, image area, footer tags |
| **Code blocks** | Dark theme (`#1e1e1e`), JetBrains Mono, `white-space: pre` |
| **Container** | Max-width 1290px, centered |

---

## 📄 License

[Mozilla Public License 2.0](LICENSE)
