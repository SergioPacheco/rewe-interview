/**
 * Theory — Angular Basics (for Java developers)
 * Components, Services, TypeScript, Signals, HTTP, Routing
 */
const theoryAngular = [
  {
    id: 'theory-angular-basics',
    title: 'Angular — Core Concepts for Backend Developers',
    sections: [
      {
        heading: 'What is Angular? (and why TRAB uses it)',
        content: `Angular is a TypeScript framework for building SPAs (Single Page Applications). TRAB uses <strong>Angular 19</strong> for logistics interfaces — dashboards, planning tools, driver management.

<strong>For a Java developer, Angular maps naturally:</strong>
<table>
<tr><th>Java/Spring concept</th><th>Angular equivalent</th></tr>
<tr><td>@Service (singleton bean)</td><td>@Injectable() service</td></tr>
<tr><td>@Controller (REST endpoint)</td><td>@Component (UI component)</td></tr>
<tr><td>Constructor injection</td><td>inject() function or constructor DI</td></tr>
<tr><td>Spring Security filter</td><td>Route Guard + HTTP Interceptor</td></tr>
<tr><td>@RequestMapping("/path")</td><td>RouterModule routes</td></tr>
<tr><td>DTO (data transfer)</td><td>TypeScript interface/type</td></tr>
<tr><td>Optional&lt;T&gt;</td><td>T | null (union types)</td></tr>
<tr><td>Spring Events</td><td>Signals / RxJS Observables</td></tr>
</table>

<strong>Your honest position:</strong>
"I built the SinapiPRO frontend with Angular 19, using Signals, standalone components, and PrimeNG. I understand the mental model — components, services, routing, interceptors. I'm not an Angular expert, but I can build functional interfaces and contribute to frontend tasks."`
      },
      {
        heading: 'Components — the building blocks',
        content: `A component = a reusable UI piece with template (HTML) + logic (TypeScript) + styles (CSS).

<pre><code>// delivery-list.component.ts (Standalone — no NgModule!)
@Component({
  selector: 'app-delivery-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  template: \`
    &lt;p-table [value]="deliveries()" [paginator]="true" [rows]="20"&gt;
      &lt;ng-template pTemplate="header"&gt;
        &lt;tr&gt;
          &lt;th&gt;ID&lt;/th&gt;
          &lt;th&gt;Status&lt;/th&gt;
          &lt;th&gt;Driver&lt;/th&gt;
          &lt;th&gt;Scheduled&lt;/th&gt;
        &lt;/tr&gt;
      &lt;/ng-template&gt;
      &lt;ng-template pTemplate="body" let-delivery&gt;
        &lt;tr&gt;
          &lt;td&gt;{{ delivery.id }}&lt;/td&gt;
          &lt;td&gt;&lt;p-tag [severity]="statusSeverity(delivery.status)"&gt;{{ delivery.status }}&lt;/p-tag&gt;&lt;/td&gt;
          &lt;td&gt;{{ delivery.driverName }}&lt;/td&gt;
          &lt;td&gt;{{ delivery.scheduledAt | date:'short' }}&lt;/td&gt;
        &lt;/tr&gt;
      &lt;/ng-template&gt;
    &lt;/p-table&gt;
  \`
})
export class DeliveryListComponent {
  private deliveryService = inject(DeliveryService);
  deliveries = signal&lt;Delivery[]&gt;([]);

  ngOnInit() {
    this.deliveryService.findAll().subscribe(data =&gt; this.deliveries.set(data));
  }
}</code></pre>

<strong>Key concepts:</strong>
• <code>standalone: true</code> — modern Angular (no NgModules needed)
• <code>signal&lt;T&gt;</code> — reactive state (Angular 16+, replaces BehaviorSubject)
• <code>inject()</code> — dependency injection (like Spring @Autowired)
• Template uses PrimeNG components (like PrimeFaces for Angular)`
      }
    ]
  },
  {
    id: 'theory-angular-services',
    title: 'Angular Services, HTTP & State',
    sections: [
      {
        heading: 'Services — like Spring @Service',
        content: `<pre><code>// delivery.service.ts
@Injectable({ providedIn: 'root' })  // singleton — like @Service
export class DeliveryService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/deliveries';

  findAll(): Observable&lt;Delivery[]&gt; {
    return this.http.get&lt;Delivery[]&gt;(this.baseUrl);
  }

  findById(id: number): Observable&lt;Delivery&gt; {
    return this.http.get&lt;Delivery&gt;(\`\${this.baseUrl}/\${id}\`);
  }

  create(request: CreateDeliveryRequest): Observable&lt;Delivery&gt; {
    return this.http.post&lt;Delivery&gt;(this.baseUrl, request);
  }

  dispatch(id: number): Observable&lt;Delivery&gt; {
    return this.http.post&lt;Delivery&gt;(\`\${this.baseUrl}/\${id}/dispatch\`, {});
  }
}

// TypeScript interfaces (like Java DTOs)
interface Delivery {
  id: number;
  status: DeliveryStatus;
  driverName: string;
  scheduledAt: string;
  stops: Stop[];
}

type DeliveryStatus = 'PLANNED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED';</code></pre>

<strong>Observable vs Promise:</strong>
• Observable (RxJS): lazy, cancellable, can emit multiple values (streams)
• Used for HTTP calls, WebSocket, real-time data
• <code>.subscribe()</code> triggers the HTTP call (lazy — nothing happens until subscribed)`
      },
      {
        heading: 'Signals — modern reactive state (Angular 16+)',
        content: `<pre><code>// Signals replace BehaviorSubject for component state
export class DeliveryDashboardComponent {
  // Writable signal (state)
  deliveries = signal&lt;Delivery[]&gt;([]);
  selectedDelivery = signal&lt;Delivery | null&gt;(null);

  // Computed signal (derived — like a computed property)
  activeCount = computed(() =&gt;
    this.deliveries().filter(d =&gt; d.status === 'ACTIVE').length
  );

  delayedCount = computed(() =&gt;
    this.deliveries().filter(d =&gt; d.status === 'DELAYED').length
  );

  // Update signal
  loadDeliveries() {
    this.deliveryService.findAll().subscribe(data =&gt; {
      this.deliveries.set(data);  // triggers re-render of anything using deliveries()
    });
  }

  selectDelivery(d: Delivery) {
    this.selectedDelivery.set(d);
  }
}

// In template:
// {{ activeCount() }} active deliveries
// {{ delayedCount() }} delayed</code></pre>

<strong>Signals vs RxJS:</strong>
• Signals: simple synchronous state, auto-tracks dependencies, no memory leaks
• RxJS: async streams, complex transformations, HTTP calls
• Modern Angular: Signals for component state, RxJS for async operations`
      },
      {
        heading: 'HTTP Interceptors — like Servlet Filters',
        content: `<pre><code>// auth.interceptor.ts — injects JWT token into every request
export const authInterceptor: HttpInterceptorFn = (req, next) =&gt; {
  const token = inject(AuthService).getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: \`Bearer \${token}\` }
    });
  }

  return next(req);
};

// error.interceptor.ts — handles 401/403 globally
export const errorInterceptor: HttpInterceptorFn = (req, next) =&gt; {
  return next(req).pipe(
    catchError(error =&gt; {
      if (error.status === 401) {
        inject(Router).navigate(['/login']);
      }
      return throwError(() =&gt; error);
    })
  );
};

// Register in app config:
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))</code></pre>

Same pattern as Spring Security filters — intercept request, add auth header, handle errors globally.`
      }
    ]
  },
  {
    id: 'theory-angular-routing',
    title: 'Angular Routing, Guards & PrimeNG',
    sections: [
      {
        heading: 'Routing — like Spring @RequestMapping',
        content: `<pre><code>// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]  // like Spring Security — must be authenticated
  },
  {
    path: 'deliveries',
    canActivate: [authGuard],
    children: [
      { path: '', component: DeliveryListComponent },
      { path: ':id', component: DeliveryDetailComponent },
      { path: ':id/edit', component: DeliveryEditComponent }
    ]
  },
  { path: '**', component: NotFoundComponent }  // 404
];

// Route guard (like @PreAuthorize)
export const authGuard: CanActivateFn = () =&gt; {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.navigate(['/login']);
};</code></pre>`
      },
      {
        heading: 'PrimeNG — like PrimeFaces for Angular',
        content: `<strong>If you know PrimeFaces (JSF), you know PrimeNG:</strong>

<table>
<tr><th>PrimeFaces (Java EE)</th><th>PrimeNG (Angular)</th></tr>
<tr><td>&lt;p:dataTable&gt;</td><td>&lt;p-table&gt;</td></tr>
<tr><td>&lt;p:dialog&gt;</td><td>&lt;p-dialog&gt;</td></tr>
<tr><td>&lt;p:autoComplete&gt;</td><td>&lt;p-autoComplete&gt;</td></tr>
<tr><td>&lt;p:chart&gt;</td><td>&lt;p-chart&gt; (or ECharts)</td></tr>
<tr><td>&lt;p:calendar&gt;</td><td>&lt;p-datePicker&gt;</td></tr>
<tr><td>&lt;p:commandButton&gt;</td><td>&lt;p-button&gt;</td></tr>
<tr><td>LazyDataModel</td><td>[lazy]="true" + (onLazyLoad)</td></tr>
<tr><td>rendered="#{}"</td><td>*ngIf / @if</td></tr>
<tr><td>value="#{bean.list}"</td><td>[value]="deliveries()"</td></tr>
</table>

<strong>Interview answer:</strong> "I've used PrimeFaces extensively — PrimeNG is the same component library for Angular. The concepts transfer: data tables with lazy loading, dialogs, forms with validation, charts. The API is different but the mental model is identical."`
      }
    ]
  }
];
