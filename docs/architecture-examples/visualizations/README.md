# Visualisation catalogue

| View | Answers | Source | Rendered in Learn |
|---|---|---|---|
| System context | Who uses ParcelFlow and which external systems matter? | `01-system-context.puml` | Yes |
| Container | What deployable applications, data stores, and brokers compose the system? | `02-container-view.puml` | Yes |
| Component | What responsibilities and adapters exist inside the Delivery API? | `03-delivery-api-components.puml` | Yes |
| Dynamic — create delivery | In what order does the delivery-creation use case interact? | `04-create-delivery-dynamic.puml` | Yes |
| Dynamic — event recovery | How do retry, DLQ, correction, and replay interact? | `05-event-recovery-dynamic.puml` | Yes |
| Deployment | Where are the containers deployed and which services do they use? | `06-deployment.puml` | Yes |

The sources use the official C4-PlantUML library vendored in `c4-lib/`. Render them with PlantUML and `-DRELATIVE_INCLUDE=1`; output SVGs are stored in `public/assets/architecture-examples/c4/`.
