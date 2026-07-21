import { Component, ViewEncapsulation, signal } from '@angular/core';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';

interface PackDocument {
  id: string;
  group: string;
  title: string;
  summary: string;
  path: string;
}

const PACK_DOCUMENTS: PackDocument[] = [
  { id: 'vision', group: 'Discover', title: 'Architecture Vision', summary: 'Problem, scope, users, constraints, and solution direction.', path: 'architecture-examples/artefacts/architecture-vision.md' },
  { id: 'asrs', group: 'Discover', title: 'ASRs & NFRs', summary: 'Requirements that materially shape the architecture.', path: 'architecture-examples/artefacts/asrs-and-nfrs.md' },
  { id: 'domain', group: 'Design', title: 'Domain & Data Ownership', summary: 'Contexts, language, ownership, and persistence rules.', path: 'architecture-examples/artefacts/domain-and-data-ownership.md' },
  { id: 'integrations', group: 'Design', title: 'Integration Catalogue', summary: 'Protocols, criticality, timeouts, and contingency.', path: 'architecture-examples/artefacts/integration-catalog.md' },
  { id: 'adr', group: 'Decide', title: 'ADR — OrderCreated', summary: 'A real trade-off recorded with consequences.', path: 'architecture-examples/artefacts/adr-014-order-created.md' },
  { id: 'api', group: 'Decide', title: 'API Contract', summary: 'OpenAPI contract for delivery creation.', path: 'architecture-examples/artefacts/order-api.yaml' },
  { id: 'event', group: 'Decide', title: 'Event Contract', summary: 'Event ownership, compatibility, and consumers.', path: 'architecture-examples/artefacts/order-created-event.yaml' },
  { id: 'poc', group: 'Decide', title: 'Outbox POC', summary: 'Hypothesis, experiment, success criteria, decision rule.', path: 'architecture-examples/artefacts/outbox-poc.md' },
  { id: 'risk', group: 'Operate', title: 'Risks & Resilience', summary: 'Risk register, consistency, retries, DLQ, and recovery.', path: 'architecture-examples/artefacts/tradeoffs-risks-and-resilience.md' },
  { id: 'threat', group: 'Operate', title: 'Threat Model', summary: 'Trust boundaries, abuse paths, controls, evidence.', path: 'architecture-examples/artefacts/threat-model.md' },
  { id: 'observability', group: 'Operate', title: 'Observability, Capacity & DR', summary: 'SLIs, SLOs, capacity, RTO, RPO, and recovery.', path: 'architecture-examples/artefacts/observability-capacity-and-dr.md' },
  { id: 'runbook', group: 'Operate', title: 'Runbook — Consumer Lag', summary: 'A safe, actionable incident response.', path: 'architecture-examples/artefacts/runbook-consumer-lag.md' },
  { id: 'evolution', group: 'Evolve', title: 'Delivery, Governance & Evolution', summary: 'CI/CD, IaC, fitness functions, roadmap, migration.', path: 'architecture-examples/artefacts/delivery-governance-and-evolution.md' }
];

const DIAGRAMS = [
  { src: 'assets/architecture-examples/c4/01-system-context.svg', level: 'C4 · System context', title: 'System context', text: 'People, ParcelFlow, and its direct external dependencies.', wide: true },
  { src: 'assets/architecture-examples/c4/02-container-view.svg', level: 'C4 · Container', title: 'Container diagram', text: 'Deployable applications, data stores, event broker, and technologies.', wide: true },
  { src: 'assets/architecture-examples/c4/03-delivery-api-components.svg', level: 'C4 · Component', title: 'Delivery API components', text: 'Internal responsibilities and adapters inside the Delivery API.', wide: true },
  { src: 'assets/architecture-examples/c4/04-create-delivery-dynamic.svg', level: 'C4 · Dynamic', title: 'Create delivery flow', text: 'The ordered interactions of the delivery-creation use case.' },
  { src: 'assets/architecture-examples/c4/05-event-recovery-dynamic.svg', level: 'C4 · Dynamic', title: 'Event recovery flow', text: 'Retry, dead-letter handling, correction, and replay.' },
  { src: 'assets/architecture-examples/c4/06-deployment.svg', level: 'C4 · Deployment', title: 'Deployment diagram', text: 'Production nodes, deployed containers, managed data, and external services.', wide: true }
];

@Component({
  selector: 'app-architecture-pack',
  standalone: true,
  imports: [MarkdownPipe],
  templateUrl: './architecture-pack.component.html',
  styleUrl: './architecture-pack.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ArchitecturePackComponent {
  readonly documents = PACK_DOCUMENTS;
  readonly diagrams = DIAGRAMS;
  readonly selected = signal<PackDocument>(PACK_DOCUMENTS[0]);
  readonly content = signal('Loading architecture artefact…');
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() { void this.open(PACK_DOCUMENTS[0]); }

  grouped(group: string): PackDocument[] { return this.documents.filter(doc => doc.group === group); }

  async open(document: PackDocument): Promise<void> {
    this.selected.set(document);
    this.loading.set(true);
    this.error.set('');
    try {
      const response = await fetch(new URL(document.path, globalThis.document.baseURI).href);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.text();
      this.content.set(document.path.endsWith('.yaml') ? `\`\`\`yaml\n${body}\n\`\`\`` : body);
    } catch {
      this.error.set('The artefact could not be loaded. Start the application through its web server and try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
