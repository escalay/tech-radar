---
name: AWS Lambda (Serverless)
quadrant: Platforms
ring: Trial
status: Moved In
summary: Event-driven serverless compute platform for running code without managing servers, ideal for specific workloads.
tags:
  - serverless
  - aws
  - functions
  - event-driven
owners:
  - '@team/platform'
  - '@team/backend'
since: '2024-04-01'
last_reviewed: '2024-09-20'
links:
  - title: AWS Lambda Docs
    url: https://docs.aws.amazon.com/lambda/
  - title: Internal Lambda Patterns
    url: https://wiki.internal/lambda-patterns
history:
  - date: '2024-04-01'
    ring: Assess
    note: Initial evaluation for event-driven workloads and API backends
    pr: '#245'
  - date: '2024-09-20'
    ring: Trial
    note: Pilot successful for 3 use cases. Moving to broader trial with more teams
    pr: '#398'
---

## Overview

AWS Lambda is proving successful for specific workloads: event processing, scheduled jobs, and low-traffic APIs. After 6 months of assessment, we're expanding usage to more teams while gathering data on operational patterns and cost efficiency.

## Why This Matters

Lambda provides:
- **Zero server management**: AWS handles infrastructure
- **Auto-scaling**: Scales from 0 to thousands of requests
- **Pay-per-use**: Only charged for actual execution time
- **Event-driven**: Native integration with S3, DynamoDB, SQS, etc.

Successful use cases so far:
- Image processing: Trigger on S3 upload (70% cost reduction vs. EC2)
- Scheduled reports: Nightly aggregation jobs
- Webhook handlers: Process third-party callbacks

## When to Use

Lambda is excellent for:
- **Event processing**: S3 uploads, DynamoDB streams, SNS/SQS messages
- **Scheduled jobs**: Cron-style tasks, batch processing
- **Bursty workloads**: Unpredictable or sporadic traffic
- **Low-traffic APIs**: < 10 req/sec

## When Not to Use

Avoid Lambda for:
- **High-traffic APIs**: Use Kubernetes (connection pooling, better for consistent load)
- **Long-running processes**: 15-minute timeout limit
- **Stateful applications**: Functions are ephemeral
- **Predictable, constant load**: EC2/containers more cost-effective

## Trade-offs & Considerations

**Benefits:**
- Massive scalability with zero config
- Reduced operational burden
- Cost-efficient for variable load
- Fast iteration (deploy in seconds)

**Challenges:**
- **Cold starts**: 1-3 sec latency for first request
- **Execution limits**: 15 min max, 10GB memory max
- **Debugging**: Harder than traditional apps
- **Vendor lock-in**: AWS-specific
- **Connection limits**: Database connection pooling tricky

## Current Learnings

### What's Working

1. **Image Processing Pipeline**
   - Trigger: S3 upload
   - Process: Resize, optimize, generate thumbnails
   - Result: 70% cost reduction, 3x faster processing

2. **Scheduled Aggregations**
   - Trigger: CloudWatch Events (cron)
   - Process: Aggregate analytics, send reports
   - Result: Simple, reliable, no maintenance

3. **Webhook Handlers**
   - Trigger: API Gateway
   - Process: Stripe/GitHub webhooks
   - Result: Auto-scales for spikes, zero management

### What's Challenging

- **Database connections**: RDS Proxy helps, but adds complexity
- **Monitoring**: CloudWatch Logs less intuitive than K8s logs
- **Local development**: SAM/LocalStack improve this
- **Cold starts**: Provisioned concurrency works but adds cost

## Architecture Patterns

### Event Processing

```
S3 Upload → Lambda → Process → Store in DynamoDB
```

### API Backend (Low Traffic)

```
API Gateway → Lambda → RDS Proxy → PostgreSQL
```

### Scheduled Jobs

```
EventBridge (Cron) → Lambda → Aggregate → S3/Email
```

## Best Practices (Emerging)

1. **Keep functions small**: Single responsibility, < 500 LOC
2. **Use layers**: Share dependencies across functions
3. **Environment variables**: Configuration, not hardcoded
4. **Dead-letter queues**: Catch failed invocations
5. **VPC sparingly**: Adds cold start time
6. **Monitoring**: X-Ray for tracing, CloudWatch for metrics

## Cost Analysis

Sample workload: Image processing

**Lambda:**
- 100,000 invocations/month
- 1GB memory, 3 sec avg duration
- Cost: ~$18/month

**EC2 equivalent:**
- t3.medium (2 vCPU, 4GB RAM)
- 24/7 uptime
- Cost: ~$30/month

**Winner**: Lambda (40% cheaper, better scalability)

## Next Steps

1. **Expand use cases**: API backends for new microservices
2. **Develop patterns**: Database connection pooling, observability
3. **Training**: Lambda workshop for 3 more teams
4. **Cost tracking**: Monitor at scale
5. **Decision point**: Q1 2025 - Move to Adopt or back to Assess

## Related Technologies

- Kubernetes (for high-traffic, stateful apps)
- Step Functions (orchestrate multi-step workflows)
- RDS Proxy (connection pooling for databases)
- SAM/Serverless Framework (deployment tooling)
