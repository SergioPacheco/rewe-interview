# Architecture vision — ParcelFlow

## Business problem

Operations staff create delivery requests across multiple channels. Manual handoffs make status unclear, delay billing, and cause duplicate or lost notifications.

## Goals

- Create a delivery request reliably and expose its status to customers.
- Decouple billing and notification from the critical creation path.
- Give operations an observable, recoverable workflow.

## Users and systems

| Actor/system | Need | Boundary |
|---|---|---|
| Customer / driver | Create and track delivery | Browser or mobile client |
| Operations team | Correct delivery data and investigate delay | Support tools |
| Billing | Invoice completed work | Event consumer |
| Notification provider | Send messages | External dependency |

## Scope and constraints

In scope: delivery creation, status, event publication, billing/notification handoff, telemetry. Out of scope: route optimisation and payment settlement. The initial team has six engineers, PostgreSQL is the existing transactional store, and downstream work can be delayed but must not be lost.

## Solution summary

Start with a modular Order API. Persist delivery and outbox event in one transaction. Publish a versioned event to independent consumers. Run the system with SLOs, traces, logs, metrics, security controls, and reversible deployment.
