/**
 * OOP Interview Module — UI Renderer
 * Handles rendering for ORAL_ANSWER, CODE_REFACTOR, DESIGN_DECISION, COMPARE_CONCEPTS, FOLLOW_UP
 */

const OopUI = {

  // ============================================================
  // ORAL ANSWER
  // ============================================================
  renderOralAnswer(question, container) {
    container.innerHTML = `
      <div class="oral-question">
        <div class="oral-question__badge">${this.diffBadge(question.difficulty)}</div>
        <h2 class="oral-question__text">"${esc(question.question)}"</h2>
        <p class="oral-question__intent"><em>Interviewer wants to know:</em> ${esc(question.interviewerIntent)}</p>

        <div class="oral-question__prompt">
          <p>🎙️ Practice answering out loud in English. Then check below.</p>
        </div>

        <div class="oral-answer-actions">
          <button class="reveal-btn" data-reveal="structure">Show answer structure</button>
          <button class="reveal-btn" data-reveal="short">Show 30-second answer</button>
          <button class="reveal-btn" data-reveal="full">Show 90-second answer</button>
          <button class="reveal-btn" data-reveal="followups">Show follow-ups</button>
        </div>

        <div class="reveal-panel" id="reveal-structure" hidden>
          <h3>Answer Structure (C-P-D-R-T)</h3>
          <div class="cpdrt">
            <div class="cpdrt__item"><span class="cpdrt__label">C</span> Context — set the scene</div>
            <div class="cpdrt__item"><span class="cpdrt__label">P</span> Problem — what was wrong</div>
            <div class="cpdrt__item"><span class="cpdrt__label">D</span> Decision — what you chose</div>
            <div class="cpdrt__item"><span class="cpdrt__label">R</span> Result — measurable outcome</div>
            <div class="cpdrt__item"><span class="cpdrt__label">T</span> Trade-off — what you gave up</div>
          </div>
        </div>

        <div class="reveal-panel" id="reveal-short" hidden>
          <h3>30-Second Answer</h3>
          <p class="model-answer">${esc(question.shortAnswer)}</p>
        </div>

        <div class="reveal-panel" id="reveal-full" hidden>
          <h3>90-Second Answer</h3>
          <div class="model-answer model-answer--full">${this.formatModelAnswer(question.modelAnswer)}</div>
          ${question.senaiExample ? `<details class="example-detail"><summary>🏢 SENAI Example</summary><p>${esc(question.senaiExample)}</p></details>` : ''}
          ${question.reweExample ? `<details class="example-detail"><summary>🚚 REWE Logistics Example</summary><p>${esc(question.reweExample)}</p></details>` : ''}
        </div>

        <div class="reveal-panel" id="reveal-followups" hidden>
          <h3>Follow-up Questions</h3>
          ${question.followUps.map((f, i) => `
            <div class="followup-item">
              <p class="followup-item__q">${i + 1}. "${esc(f.question)}"</p>
              <details><summary>Answer hint</summary><p class="followup-item__hint">${esc(f.answerHint)}</p></details>
            </div>
          `).join('')}
        </div>

        <div class="reveal-panel" id="reveal-eval" hidden>
          <h3>Self-Evaluation Checklist</h3>
          <div class="self-eval">
            ${question.selfEvaluation.map(s => `
              <label class="self-eval__item">
                <input type="checkbox" class="self-eval__check">
                <span>${esc(s.criterion)}</span>
                <span class="self-eval__weight">${'★'.repeat(s.weight)}</span>
              </label>
            `).join('')}
          </div>
          <button class="reveal-btn" id="btn-show-score">Show my score</button>
          <div id="self-score" hidden></div>
        </div>

        <div class="oral-section-vocab">
          <h3>Key Vocabulary</h3>
          <div class="vocab-grid">
            ${question.vocabulary.map(v => `
              <div class="vocab-card">
                <span class="vocab-card__term">${esc(v.term)}</span>
                <span class="vocab-card__meaning">${esc(v.meaning)}</span>
                <p class="vocab-card__example">"${esc(v.example)}"</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Wire reveal buttons
    container.querySelectorAll('.reveal-btn[data-reveal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = container.querySelector(`#reveal-${btn.dataset.reveal}`);
        if (panel) { panel.hidden = !panel.hidden; btn.classList.toggle('reveal-btn--active'); }
      });
    });

    // Self-evaluation score
    const scoreBtn = container.querySelector('#btn-show-score');
    if (scoreBtn) {
      scoreBtn.addEventListener('click', () => {
        const checks = container.querySelectorAll('.self-eval__check');
        let total = 0, max = 0;
        question.selfEvaluation.forEach((s, i) => {
          max += s.weight;
          if (checks[i] && checks[i].checked) total += s.weight;
        });
        const pct = Math.round(total / max * 100);
        const el = container.querySelector('#self-score');
        el.hidden = false;
        el.innerHTML = `<div class="score-result ${pct >= 70 ? 'score-result--good' : 'score-result--weak'}">${pct}% — ${pct >= 70 ? 'Strong answer!' : 'Practice more — focus on missing points.'}</div>`;
      });
    }
  },

  // ============================================================
  // CODE REFACTOR
  // ============================================================
  renderCodeRefactor(exercise, container) {
    container.innerHTML = `
      <div class="code-refactor">
        <div class="oral-question__badge">${this.diffBadge(exercise.difficulty)}</div>
        <p class="mission">${exercise.mission}</p>

        <div class="code-panel">
          <div class="code-panel__header">❌ Problematic Code</div>
          <pre class="code-block">${esc(exercise.code)}</pre>
        </div>

        <div class="problems-section">
          <h3>Can you identify the problems?</h3>
          <button class="reveal-btn" data-reveal="problems">Show problems</button>
          <div id="reveal-problems" hidden>
            <ul class="problem-list">
              ${exercise.problemsToIdentify.map(p => `<li>${esc(p)}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="refactored-section">
          <button class="reveal-btn" data-reveal="refactored">Show refactored solution</button>
          <div id="reveal-refactored" hidden>
            <div class="code-panel">
              <div class="code-panel__header">✅ Refactored</div>
              <pre class="code-block">${esc(exercise.refactoredCode)}</pre>
            </div>
            <p class="explain-text">${esc(exercise.explain)}</p>
          </div>
        </div>
      </div>
    `;
    this.wireReveals(container);
  },

  // ============================================================
  // DESIGN DECISION
  // ============================================================
  renderDesignDecision(exercise, container) {
    container.innerHTML = `
      <div class="design-decision">
        <div class="oral-question__badge">${this.diffBadge(exercise.difficulty)}</div>
        <p class="mission">${exercise.mission}</p>

        <div class="design-options">
          ${exercise.options.map(opt => `
            <button class="design-option" data-id="${opt.id}">
              <span class="design-option__label">${opt.label}</span>
              <span class="design-option__desc">${esc(opt.desc)}</span>
            </button>
          `).join('')}
        </div>

        <div id="design-feedback" hidden></div>
      </div>
    `;

    container.querySelectorAll('.design-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = btn.dataset.id;
        container.querySelectorAll('.design-option').forEach(b => b.classList.remove('design-option--selected', 'design-option--best'));
        btn.classList.add('design-option--selected');
        if (chosen === exercise.bestChoice) btn.classList.add('design-option--best');

        const fb = container.querySelector('#design-feedback');
        fb.hidden = false;
        fb.innerHTML = this.renderDesignFeedback(exercise, chosen);
      });
    });
  },

  renderDesignFeedback(exercise, chosen) {
    const exp = exercise.explanation;
    return `
      <div class="design-feedback">
        ${Object.entries(exp).map(([key, val]) => `
          <div class="design-verdict ${key === chosen ? 'design-verdict--chosen' : ''} ${key === exercise.bestChoice ? 'design-verdict--best' : ''}">
            <h4>Option ${key.toUpperCase()} ${key === exercise.bestChoice ? '⭐ Recommended' : ''}</h4>
            <div class="verdict-pros"><strong>Pros:</strong> ${val.pros.join(', ')}</div>
            <div class="verdict-cons"><strong>Cons:</strong> ${val.cons.join(', ')}</div>
            <p class="verdict-text">${esc(val.verdict)}</p>
          </div>
        `).join('')}
        <p class="design-nuance"><strong>Nuance:</strong> ${esc(exercise.nuance)}</p>
      </div>
    `;
  },

  // ============================================================
  // COMPARE CONCEPTS
  // ============================================================
  renderCompareConcepts(exercise, container) {
    container.innerHTML = `
      <div class="compare-concepts">
        <div class="oral-question__badge">${this.diffBadge(exercise.difficulty)}</div>
        <p class="mission">${exercise.mission}</p>

        <div class="compare-grid">
          <div class="compare-card">
            <h3 class="compare-card__name">${esc(exercise.conceptA.name)}</h3>
            <p>${esc(exercise.conceptA.definition)}</p>
          </div>
          <div class="compare-vs">VS</div>
          <div class="compare-card">
            <h3 class="compare-card__name">${esc(exercise.conceptB.name)}</h3>
            <p>${esc(exercise.conceptB.definition)}</p>
          </div>
        </div>

        <button class="reveal-btn" data-reveal="diff">Show key difference</button>
        <div id="reveal-diff" hidden>
          <div class="key-difference">
            <p><strong>Key Difference:</strong> ${esc(exercise.keyDifference)}</p>
            <p><strong>Java Example:</strong> ${esc(exercise.javaExample)}</p>
          </div>
        </div>

        <button class="reveal-btn" data-reveal="interview">Show interview answer</button>
        <div id="reveal-interview" hidden>
          <div class="interview-answer">
            <p>"${esc(exercise.interviewAnswer)}"</p>
          </div>
        </div>
      </div>
    `;
    this.wireReveals(container);
  },

  // ============================================================
  // HELPERS
  // ============================================================
  diffBadge(difficulty) {
    const colors = { BASIC: 'badge--basic', INTERMEDIATE: 'badge--inter', SENIOR: 'badge--senior' };
    return `<span class="diff-badge ${colors[difficulty] || ''}">${difficulty}</span>`;
  },

  formatModelAnswer(text) {
    return esc(text).replace(/^(Context|Problem|Decision|Result|Trade-off):/gm, '<strong class="cpdrt-highlight">$1:</strong>');
  },

  wireReveals(container) {
    container.querySelectorAll('.reveal-btn[data-reveal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = container.querySelector(`#reveal-${btn.dataset.reveal}`);
        if (panel) { panel.hidden = !panel.hidden; btn.classList.toggle('reveal-btn--active'); }
      });
    });
  }
};
