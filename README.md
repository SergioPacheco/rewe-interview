# ☕ REWE Interview Prep

**Angular 19 · Signals · Standalone · Progressive Learning**

An interview preparation app for the **Fullstack Developer** position at REWE Digital (Team TRAB). Combines progressive learning (foundations → application → interview pressure) with honest experience classification.

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

## 🎯 Structure: Learn → Practice → Interview

The site separates **learning** from **interview simulation**:

| Section | Purpose | Answer visible? |
|---------|---------|:---------------:|
| **Learn** | Concepts, examples, code — full explanations | ✅ Always |
| **Practice** | Exercises with hidden answers — try first | After attempt |
| **Interview** | Senior pressure simulation — clarify, decide, defend | After follow-ups |
| **My Experience** | Real cases with real numbers | ✅ Reference |
| **REWE** | Facts vs inferences — nothing claimed without evidence | ✅ Classified |

---

## 📊 Content

- **21 topics** across backend, distributed systems, frontend, and interview domains
- **126 theory chapters** with code examples and production context
- **695 exercises** — ORAL_ANSWER, PREDICT_OUTPUT, FILL_BLANK, PICK_INVALID, ORDER_STEPS
- **24 senior-level questions** with follow-up pressure and experience classification
- **5 System Design pilots** (schema v2) with scoring rubric and coach debrief
- **REWE content** classified: ✅ Confirmed | 🔶 Inferred | 🚫 Unknown
- **My Stories** — only real cases (26,705 inscriptions, 48k queries → 2 seconds)

---

## 🏗️ Architecture

```
src/app/
├── core/services/
│   ├── topic.service.ts          ← Data loader + subtopic normalization
│   ├── quiz-engine.service.ts    ← Quiz state machine (Signals)
│   ├── interview.service.ts      ← Interview questions loader (lazy per topic)
│   └── progress.service.ts       ← XP, streak, mastery (localStorage)
├── features/
│   ├── dashboard/                ← 5-section landing (Learn/Practice/Interview/Experience/REWE)
│   ├── theory/                   ← Learn + Practice + Interview tabs (topic container)
│   ├── interview/                ← Interview tab component (accordion sections)
│   ├── quiz/                     ← Standalone quiz mode
│   └── resume/                   ← CV page
├── shared/pipes/
│   └── markdown.pipe.ts          ← MD → HTML rendering
└── models/
    ├── index.ts                  ← Core interfaces (Topic, Question, etc.)
    └── interview.model.ts        ← Interview-specific interfaces

public/data/
├── exercises/                    ← 24 JSON files, 695+ exercises
├── interviews/                   ← Interview prep questions per topic
│   └── oop.json                  ← Pilot: 3 OOP interview questions
└── topics/                       ← Theory files + index.json
```

### Topic → 3 Tabs Architecture

Each topic presents three distinct activities:

```
Topic (e.g., "Java OOP")
├── 📖 Learn      — full didactic content (always visible)
├── 🎯 Practice   — quiz with scoring (answer after attempt)
└── 🎙️ Interview  — oral preparation (expandable reference sections)
```

| Tab | Purpose | Data source | Scoring? |
|-----|---------|-------------|:--------:|
| Learn | Understand concepts | `public/data/topics/theory-*.json` | ❌ |
| Practice | Verify knowledge | `public/data/exercises/*.json` | ✅ |
| Interview | Learn to communicate | `public/data/interviews/*.json` | ❌ |

---

## 🎯 Angular 19 Techniques

| Technique | Where |
|-----------|-------|
| `signal()` / `computed()` | All services, components |
| `@if` / `@for` / `@switch` | All templates |
| `inject()` function-based DI | All injectables |
| `standalone: true` (zero NgModules) | Every component |
| `loadComponent` lazy loading | app.routes.ts |
| `ChangeDetectionStrategy.OnPush` | Dashboard |
| `toSignal()` from rxjs | Route params |

---

## ⚠️ Honest Limitations

- **Not a complete interview simulator** — no timer, no recording, no AI evaluation yet
- **REWE content is partially inferred** — clearly labeled, not presented as fact
- **Experience stories are real** — but limited to cases I can defend for 10 minutes
- **Schema v2 exercises** don't have dedicated UI yet — rendered with basic format
- **No distributed tracing, Kafka, or WebSocket production experience** — clearly stated in experienceLevel fields

---

## 📄 License

[Mozilla Public License 2.0](LICENSE)
