---
inclusion: auto
name: java-bistro-angular
description: Steering para migração Java Bistro → Angular 19. Define workflow, qualidade de código, testes, arquitetura, performance e responsividade. Ativado em toda interação no projeto java-bistro/angular.
---

# Java Bistro Angular 19 — Steering de Qualidade

## 0. Princípio Fundamental

O papel da IA é de **implementador disciplinado**, não de "vibe coder". Toda geração de código deve respeitar restrições de design, estado e performance. O desenvolvedor atua como **arquiteto e revisor rigoroso**.

---

## 1. Fluxo de Trabalho (Workflow)

### Modo Planejamento Primeiro
- **NUNCA** gerar código sem antes definir: (1) qual componente, (2) quais inputs/outputs, (3) onde se encaixa na árvore
- Cada feature nova: desenhar a interface TypeScript ANTES de implementar
- Componentes existentes no design system: REUTILIZAR, nunca duplicar

### Princípio de Registro Único (Single Record Principle)
- Cada dado existe em **1 único signal** — nunca duplicar estado entre componentes
- Services detêm o estado; componentes apenas LEEM via computed signals
- PROIBIDO: estado local em componente que também existe no service
- PROIBIDO: dois services gerenciando o mesmo domínio de dados

### Restrições Estruturais
- Máximo **1 componente por arquivo** (nunca inline múltiplos components)
- Máximo **150 linhas** por arquivo de componente (template + lógica)
- Se passar de 150 → extrair subcomponente ou mover lógica para service
- Templates inline até 30 linhas; acima → arquivo `.html` separado
- Styles inline até 20 linhas; acima → arquivo `.scss` separado

---

## 2. Qualidade do Código

### TypeScript Strict
- `strict: true` no tsconfig — sem exceções
- Toda interface pública tipada (sem `any`, sem `unknown` como escape)
- Discriminated unions para tipos variantes (ex: Question types)
- `readonly` em signals e propriedades imutáveis

### Componentes Enxutos
- Componente = **apresentação** (template + binding)
- Service = **lógica** (cálculos, transformações, HTTP)
- PROIBIDO: lógica de negócio dentro de template ou component class
- PROIBIDO: manipulação direta de DOM (`document.querySelector`, `innerHTML`)

### Padrões Angular 19 Obrigatórios
- `standalone: true` em TUDO (zero NgModules)
- `inject()` function-based DI (não constructor injection)
- `@if` / `@for` / `@switch` (não `*ngIf` / `*ngFor`)
- `signal()` / `computed()` / `effect()` para estado
- `ChangeDetectionStrategy.OnPush` em componentes de apresentação
- `input()` / `output()` signal-based (Angular 17.1+)
- `DestroyRef` para cleanup (não `ngOnDestroy` manual)

### Naming Conventions
```
feature-name.component.ts     ← componente
feature-name.service.ts       ← service
feature-name.model.ts         ← tipos/interfaces locais
feature-name.pipe.ts          ← pipe
feature-name.directive.ts     ← directive
feature-name.guard.ts         ← guard
feature-name.resolver.ts      ← resolver
feature-name.interceptor.ts   ← interceptor
```

### Imports e Barrel Files
- Cada pasta de feature tem `index.ts` exportando interface pública
- `models/index.ts` — ponto único de importação de tipos
- Imports relativos dentro do mesmo feature; absolutos entre features

---

## 3. Testes Automatizados

### Meta de Cobertura: 65-85%
- Services core (QuizEngine, Progress, Storage): **90%+**
- Pipes e utilities: **95%+**
- Componentes de apresentação: **70%+** (testar binding, não visual)
- NUNCA gerar testes falsos para preencher métrica

### Padrão AAA (Arrange-Act-Assert)
```typescript
describe('QuizEngineService', () => {
  describe('submitAnswer', () => {
    it('should increment combo on correct answer', () => {
      // Arrange
      const service = createService();
      service.start('java-core');

      // Act
      const result = service.submitAnswer(correctAnswer);

      // Assert
      expect(result).toBe('correct');
      expect(service.combo()).toBe(1);
    });
  });
});
```

### Pirâmide de Testes
| Camada | Proporção | O que testa |
|--------|:---------:|-------------|
| Unit (services, pipes) | 60% | Lógica isolada, sem DOM |
| Integration (components) | 30% | Binding, interação, routing |
| E2E (fluxos críticos) | 10% | Happy path completo |

### Regras
- Teste deve falhar por motivo claro (não "test passed" com assertion vazia)
- Mocks apenas para dependências externas
- 1 assertion principal por teste (assertions auxiliares permitidas)
- Nomes descritivos: `should [behavior] when [condition]`

---

## 4. Arquitetura e Performance

### Modularização (Token Efficiency)
```
src/app/
├── core/          ← Singletons globais (1 instância)
├── shared/        ← Componentes reutilizáveis (importados por features)
├── features/      ← Lazy-loaded por rota (code splitting)
├── models/        ← Interfaces puras (zero runtime)
└── data/          ← JSONs estáticos (tree-shakeable)
```
- Cada feature é **self-contained** — só importa de `shared/` e `core/`
- Features NUNCA importam entre si diretamente
- Comunicação entre features: via services em `core/`

### Performance — Regras Obrigatórias
- **OnPush** em todo componente de apresentação
- **@defer** para componentes pesados (code blocks, charts)
- **trackBy** (via track expression em `@for`) para listas
- **Lazy loading** via `loadComponent` em rotas
- **Signals** (não BehaviorSubject) para estado reativo
- **PROIBIDO**: `subscribe()` sem cleanup (usar `toSignal()` ou `DestroyRef`)

### CSS e Animações — Zero Reflow
- PROIBIDO: animar `width`, `height`, `top`, `left`, `margin`, `padding`
- PERMITIDO: animar `transform`, `opacity`, `filter`, `clip-path`
- Transições: usar `transform: scale()` em vez de mudar dimensões
- Usar `will-change` apenas quando necessário (não como default)
- Preferir CSS animations/transitions sobre `@angular/animations` quando possível

### Design Tokens + TailwindCSS
- Cores, espaçamentos, tipografia: via CSS custom properties (`--color-*`, `--space-*`)
- Tailwind para utilitários de layout (flex, grid, padding, margin)
- PROIBIDO: CSS redundante — se Tailwind resolve, usar Tailwind
- PROIBIDO: valores mágicos (`padding: 13px`) — usar escala (`var(--space-md)`)
- Componentes custom: SCSS com BEM quando precisar de estilo específico

---

## 5. Responsividade

### Unidades — Regras
| Contexto | Unidade | Exemplo |
|----------|---------|---------|
| Font size | `rem` | `font-size: 0.875rem` |
| Spacing (padding/margin) | `rem` ou CSS var | `padding: var(--space-md)` |
| Layout widths | `%`, `fr`, `vw` | `width: 100%`, `grid: 1fr 3fr` |
| Max widths | `rem` ou `ch` | `max-width: 65ch` |
| Borders, outlines | `px` | `border: 1px solid` |
| Media queries | `px` (breakpoints padrão) | `@media (min-width: 768px)` |

### PROIBIDO
- `px` para font-size, padding, margin, width/height de layout
- Valores fixos sem media query (`width: 350px` sem responsividade)
- `!important` (exceto para override de third-party)

### Breakpoints Padrão (Tailwind-aligned)
```scss
// Mobile first — sem media query = mobile
@media (min-width: 640px)  { /* sm  — landscape phones */ }
@media (min-width: 768px)  { /* md  — tablets */ }
@media (min-width: 1024px) { /* lg  — laptops */ }
@media (min-width: 1280px) { /* xl  — desktops */ }
@media (min-width: 1536px) { /* 2xl — large screens */ }
```

### Acessibilidade Responsiva
- Touch targets: mínimo `44px × 44px` em mobile
- Font size mínimo: `0.875rem` (14px equivalente)
- `prefers-reduced-motion`: respeitar (desabilitar animações)
- `prefers-color-scheme`: dark mode automático

---

## 6. Angular CDK — Componentes Custom

Construímos componentes usando Angular CDK como base (mesma abordagem do Design System UNIFY da REWE):

| CDK Primitive | Nosso componente |
|---------------|-----------------|
| `CdkAccordion` | `<app-theory-accordion>` |
| `CdkDrag` | Drag-to-reorder em ORDER_STEPS |
| `A11yModule` (FocusTrap) | Modais e feedback cards |
| `OverlayModule` | Tooltips e popovers |
| `BreakpointObserver` | Sidebar responsiva |
| `Clipboard` | Copiar code blocks |

### Regra: CDK provê COMPORTAMENTO, nós provemos VISUAL
- Nunca usar Angular Material components (visual Google não é nosso design)
- Sempre usar CDK primitives + Tailwind/SCSS para styling

---

## 7. Checklist — Antes de Cada Commit

- [ ] Arquivo tem menos de 150 linhas?
- [ ] Componente usa OnPush?
- [ ] Nenhum `any` no TypeScript?
- [ ] Listas usam `track` no `@for`?
- [ ] Animações usam apenas transform/opacity?
- [ ] Unidades responsivas (rem, %, fr)?
- [ ] Teste unitário para lógica nova?
- [ ] Nenhum estado duplicado entre service e component?
- [ ] Imports necessários (sem imports mortos)?
- [ ] Nenhum `subscribe()` sem cleanup?

---

## 8. O Que Este Projeto Demonstra ao Entrevistador

| Competência | Como demonstra |
|-------------|----------------|
| Angular 19 moderno | Signals, standalone, @if/@for, inject() |
| Arquitetura enterprise | Feature-based, CDK custom components, DI |
| TypeScript avançado | Discriminated unions, generics, strict |
| Performance | OnPush, lazy loading, @defer, zero reflow |
| Design System thinking | CDK + tokens + Tailwind (como UNIFY/REWE) |
| Testing | AAA pattern, pirâmide, coverage realista |
| Responsividade | Mobile-first, rem, breakpoints padrão |
| DevOps mindset | PWA, CI-ready, Lighthouse 100 |
