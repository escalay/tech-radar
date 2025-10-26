---
name: Kubernetes
quadrant: Platforms
ring: Adopt
status: Moved In
summary: Production-grade container orchestration platform for automating deployment, scaling, and management of containerized applications.
tags:
  - containers
  - orchestration
  - cloud-native
  - infrastructure
owners:
  - '@team/platform'
  - '@team/sre'
since: '2023-06-01'
last_reviewed: '2024-09-15'
links:
  - title: Official Documentation
    url: https://kubernetes.io/docs/
  - title: Internal Runbook
    url: https://wiki.internal/k8s-runbook
  - title: Getting Started Guide
    url: https://wiki.internal/k8s-getting-started
history:
  - date: '2023-06-01'
    ring: Assess
    note: Initial evaluation for replacing legacy VM-based infrastructure
    pr: '#201'
  - date: '2024-01-15'
    ring: Trial
    note: Successful pilots in staging with 3 services. Positive team feedback on deployment speed
    pr: '#298'
  - date: '2024-09-15'
    ring: Adopt
    note: Production-ready. 15 services migrated, 99.95% uptime achieved. Now org-wide standard
    pr: '#412'
---

## Overview

Kubernetes (K8s) has become our standard container orchestration platform, enabling teams to deploy, scale, and manage containerized applications with confidence. After 15 months of evaluation and piloting, we've achieved production stability and are expanding adoption across all teams.

## Why This Matters

Kubernetes provides:
- **Declarative infrastructure**: Define desired state, K8s makes it happen
- **Self-healing**: Automatic restart, replacement, and rescheduling of failed containers
- **Horizontal scaling**: Scale applications up or down based on demand
- **Service discovery & load balancing**: Built-in networking and traffic distribution
- **Rolling updates**: Zero-downtime deployments with automatic rollback

Our migration to K8s has resulted in:
- 60% reduction in deployment time (from 45 min to 18 min)
- 99.95% uptime (up from 99.7%)
- 40% reduction in infrastructure costs through better resource utilization

## When to Use

Use Kubernetes for:
- **Microservices architectures**: Natural fit for containerized services
- **Applications requiring high availability**: Self-healing and multi-AZ deployments
- **Variable workloads**: Automatic scaling based on metrics
- **Modern cloud-native apps**: Built with 12-factor principles

## When Not to Use

Consider alternatives for:
- **Simple single-container apps**: May be over-engineering (consider AWS App Runner, Cloud Run)
- **Legacy monoliths**: Containerize and refactor first
- **Small teams without ops experience**: Requires learning curve (consider managed platforms)
- **Batch jobs with no HA requirements**: Simpler solutions may suffice

## Trade-offs & Considerations

**Benefits:**
- Industry-standard platform with huge ecosystem
- Portable across cloud providers (AWS, GCP, Azure)
- Rich tooling and community support
- Built-in observability primitives

**Challenges:**
- Steep learning curve for developers and operators
- Increased complexity compared to serverless options
- Requires dedicated platform/SRE team
- YAML configuration can become unwieldy (mitigate with Helm, Kustomize)

## Getting Started

### For Developers

1. **Take the internal training**: 2-day K8s Fundamentals workshop
2. **Clone the starter template**: `kubectl create -f https://wiki.internal/k8s-starter`
3. **Deploy to staging**: Follow the [deployment guide](https://wiki.internal/k8s-deploy)
4. **Request production access**: Open ticket with Platform team

### Key Concepts to Learn

- **Pods**: Smallest deployable units
- **Deployments**: Declarative updates for Pods
- **Services**: Stable networking for Pods
- **Ingress**: HTTP/HTTPS routing
- **ConfigMaps & Secrets**: Configuration management

### Recommended Tools

- `kubectl`: CLI for K8s
- `k9s`: Terminal UI for cluster management
- `kubectx`: Switch between clusters easily
- `Lens`: Desktop IDE for K8s

## Architecture

We run Kubernetes on:
- **Production**: EKS clusters (AWS) in `us-east-1` and `eu-west-1`
- **Staging**: EKS cluster in `us-east-1`
- **Development**: Minikube or kind locally

### Standards

- **Namespaces**: One per service
- **Resource limits**: Required for all containers
- **Health checks**: Liveness and readiness probes mandatory
- **Monitoring**: Prometheus metrics endpoint required
- **Logging**: Structured JSON to stdout

## Related Technologies

- Docker (containerization)
- Helm (package management)
- ArgoCD (GitOps deployment)
- Prometheus (monitoring)
- Istio (service mesh - in assessment)
