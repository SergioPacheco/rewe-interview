# Domain model, bounded contexts, and data ownership

## Ubiquitous language

| Term | Meaning | Owner |
|---|---|---|
| DeliveryRequest | Customer request to move goods between locations | Order context |
| Shipment | Physical movement planned from a delivery request | Logistics context |
| Invoice | Financial record generated for completed work | Billing context |
| DeliveryEvent | Immutable fact about state change | Producing context |

## Bounded contexts

| Context | Responsibility | Publishes | Consumes |
|---|---|---|---|
| Order | Validate and create delivery requests | OrderCreated | PaymentAuthorized, StockReserved |
| Logistics | Plan and execute shipment | ShipmentDispatched, DeliveryCompleted | OrderCreated |
| Billing | Create and reconcile invoices | InvoiceCreated | DeliveryCompleted |
| Notification | Notify customer | NotificationSent | OrderCreated, DeliveryCompleted |

## Data responsibility matrix

| Data | Source of truth | Readers | Rule |
|---|---|---|---|
| Delivery request | Order service | Logistics, Billing, Support | No direct database access by readers |
| Shipment status | Logistics service | Order, Notification | Published as versioned events |
| Invoice | Billing service | Finance, Support | Financial retention policy applies |
| Customer contact | Customer profile service | Notification | Minimum required fields only |

## Persistence rules

- Each bounded context owns its schema and migrations.
- Cross-context reads use API or materialised projection, never shared-table queries.
- Changes use backward-compatible expand-contract migration.
- Retention, encryption, backup, and recovery are defined per data class.
