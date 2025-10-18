# ADR-007: Sentry for Error Tracking

**Status**: Accepted

**Date**: 2024-10-18

**Deciders**: Tech Lead, Development Team

## Context

The FuturaTickets Admin API is a critical production system handling event ticketing, payments, and user data. We need:

1. **Real-time error monitoring** - Immediate alerts when production errors occur
2. **Error context** - Full stack traces, user context, request details
3. **Performance monitoring** - APM to identify slow endpoints
4. **Release tracking** - Correlation between deployments and errors
5. **Integration with existing stack** - Works with NestJS, MongoDB, Stripe

Without proper error tracking, we:
- Discover production errors from user reports (too late)
- Lack context to debug issues quickly
- Cannot proactively identify performance bottlenecks
- Miss patterns in errors across deployments

## Decision

We will use **Sentry** for error tracking and performance monitoring.

### Implementation Details

1. **Sentry SDK Integration**
   - `@sentry/node` for Node.js error tracking
   - `@sentry/profiling-node` for CPU profiling
   - Initialize early in `main.ts` (before app creation)

2. **Global Exception Filter**
   - Custom `SentryExceptionFilter` to capture unhandled exceptions
   - Automatic user context from JWT tokens
   - Request breadcrumbs (method, URL, headers, body)
   - Filter 4xx client errors (only capture 5xx server errors)

3. **Performance Monitoring**
   - Sample 100% of transactions in development
   - Sample 10% in production (adjustable)
   - Ignore health check endpoints
   - Track database queries, external API calls, Redis operations

4. **Configuration**
   ```typescript
   SENTRY_DSN=https://xxx@sentry.io/xxx
   SENTRY_ENVIRONMENT=production
   SENTRY_TRACES_SAMPLE_RATE=0.1  // 10% in prod
   SENTRY_PROFILES_SAMPLE_RATE=0.1
   ```

5. **Release Tracking**
   - Automatic release creation via GitHub Actions
   - Version from `package.json` + git SHA
   - Deployment notifications to Sentry

## Consequences

### Positive

- ✅ **Immediate error alerts** - Slack/email notifications on production errors
- ✅ **Rich context** - Full stack traces, user info, request details
- ✅ **Performance insights** - Identify slow endpoints and bottlenecks
- ✅ **Release correlation** - See which deployment introduced errors
- ✅ **Error deduplication** - Sentry groups similar errors intelligently
- ✅ **Search and filtering** - Query errors by user, endpoint, time, etc.
- ✅ **Integration ecosystem** - Works with Slack, Jira, GitHub, PagerDuty
- ✅ **Free tier** - 5k errors/month free (sufficient for MVP)

### Negative

- ⚠️ **Cost at scale** - Paid tier at $26/month after 5k errors
- ⚠️ **Performance overhead** - ~1-2ms per request (minimal)
- ⚠️ **Data sent to 3rd party** - Must sanitize sensitive data (passwords, tokens)
- ⚠️ **Learning curve** - Team needs to learn Sentry dashboard
- ⚠️ **Alert fatigue** - Must configure alerts carefully to avoid noise

### Mitigations

- Sanitize sensitive headers (Authorization, Cookie, stripe-signature)
- Use EU region for GDPR compliance
- Configure alert thresholds to avoid noise
- Review and tune sampling rates based on volume
- Budget for paid tier ($26/mo) if we exceed 5k errors

## Alternatives Considered

### Alternative 1: New Relic APM

- **Pros**:
  - More comprehensive APM features
  - Better database query insights
  - Infrastructure monitoring included
  - Enterprise-grade support

- **Cons**:
  - More expensive ($99+/month)
  - Heavier SDK (more overhead)
  - Overkill for current scale
  - Steeper learning curve

- **Rejected because**: Too expensive for MVP stage, Sentry sufficient for now

### Alternative 2: LogRocket

- **Pros**:
  - Session replay (see user's screen)
  - Frontend + backend correlation
  - Network request replay

- **Cons**:
  - Expensive ($99+/month)
  - Focused on frontend (less relevant for API)
  - Requires frontend integration

- **Rejected because**: Primarily frontend-focused, API errors don't benefit from session replay

### Alternative 3: Self-hosted ELK Stack

- **Pros**:
  - Full control over data
  - No recurring SaaS costs
  - Unlimited events

- **Cons**:
  - Requires infrastructure setup
  - Team must maintain Elasticsearch/Kibana/Logstash
  - No built-in alerting
  - Missing error grouping intelligence
  - Significant operational overhead

- **Rejected because**: Too much operational overhead, team should focus on product

### Alternative 4: Custom Logging Only (Winston)

- **Pros**:
  - Already implemented
  - Zero cost
  - Full control

- **Cons**:
  - No structured error tracking
  - No alerting
  - No performance monitoring
  - Manual log searching
  - No error grouping

- **Rejected because**: Insufficient for production monitoring needs

## References

- [Sentry Node.js Documentation](https://docs.sentry.io/platforms/node/)
- [Sentry NestJS Integration](https://docs.sentry.io/platforms/node/guides/nestjs/)
- [Sentry Pricing](https://sentry.io/pricing/)
- [ADR-006: Winston for Structured Logging](./006-winston-logging.md)

## Future Considerations

- **If we exceed 5k errors/month**: Upgrade to Sentry Developer tier ($26/mo)
- **If we grow to 50k+ requests/month**: Consider New Relic for more comprehensive APM
- **If GDPR compliance is critical**: Use Sentry EU region or self-hosted option
- **If we add frontend apps**: Integrate Sentry browser SDK for full-stack tracking
