# Codecov Dashboard Guide

**Purpose:** Comprehensive guide to using the Codecov dashboard to monitor and improve test coverage

**Prerequisites:** Codecov activated and receiving coverage uploads (see [CODECOV_ACTIVATION_GUIDE.md](./CODECOV_ACTIVATION_GUIDE.md))

---

## Table of Contents

1. [Dashboard Overview](#dashboard-overview)
2. [Navigation](#navigation)
3. [Key Metrics](#key-metrics)
4. [Commits View](#commits-view)
5. [Pull Requests](#pull-requests)
6. [Files and Folders](#files-and-folders)
7. [Flags (Multi-Project Setup)](#flags-multi-project-setup)
8. [Settings and Configuration](#settings-and-configuration)
9. [Best Practices](#best-practices)
10. [Common Workflows](#common-workflows)

---

## Dashboard Overview

### Accessing the Dashboard

```
https://app.codecov.io/gh/Futura-Tickets/monorepo-futuratickets
```

### Main Dashboard Sections

```
┌─────────────────────────────────────────────────────────────┐
│  [Overview] [Commits] [Pulls] [Branches] [Flags] [Settings] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Overall Coverage: 40.12%                    ↗ +2.5%   │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │  Coverage Graph │  │  Recent Commits │                 │
│  │  (7 days)       │  │                 │                 │
│  └─────────────────┘  └─────────────────┘                 │
│                                                             │
│  📁 Files with Lowest Coverage:                            │
│     orders.service.ts         25.3%                        │
│     stripe.service.ts         55.7%                        │
│     event.service.ts          45.1%                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Navigation

### Top Navigation Bar

| Tab | Purpose | What You'll See |
|-----|---------|-----------------|
| **Overview** | Main dashboard | Overall coverage, graph, recent activity |
| **Commits** | Commit-by-commit coverage | Coverage change per commit |
| **Pulls** | Pull request coverage | PR coverage diffs and comments |
| **Branches** | Coverage by branch | Compare coverage across branches |
| **Flags** | Multi-project breakdown | Coverage per flag (admin-api, marketplace-api, access-api) |
| **Settings** | Configuration | Tokens, notifications, integrations |

### Quick Filters

Located at the top right:
- **Branch selector**: Switch between main, dev, staging
- **Date range**: Last 7 days, 30 days, 3 months, All time
- **Search**: Find specific files or commits

---

## Key Metrics

### Coverage Percentage

**Location:** Top of dashboard

**Interpretation:**
- **< 40%**: 🔴 Critical - Needs immediate attention
- **40-60%**: 🟡 Moderate - Room for improvement
- **60-80%**: 🟢 Good - Acceptable for most projects
- **> 80%**: 🌟 Excellent - High confidence

**Our Current Status:**
```
Total: ~40%
├── Admin API: ~25%      🔴 Needs work
├── Marketplace API: ~55% 🟡 Moderate
└── Access API: ~40%     🟡 Moderate
```

### Coverage Trend

**The graph shows:**
- ↗ **Green line up**: Coverage improving
- ↘ **Red line down**: Coverage declining
- ━ **Flat line**: Coverage stable

**Target:** Consistent upward trend towards 70%

### Patch Coverage

**Definition:** Percentage of new/changed code covered by tests

**Example:**
```
Commit: Add new payment feature
Total Coverage: 40% → 42% (+2%)
Patch Coverage: 85%  ✅ Good! New code well-tested
```

**Best Practice:** Aim for patch coverage > 80%

---

## Commits View

### Understanding Commit Coverage

Navigate to: **Commits** tab

Each commit shows:
```
┌──────────────────────────────────────────────────────────┐
│ feat: add Stripe payment integration                     │
│ by @developer • 2 hours ago • ca7c2e5                   │
├──────────────────────────────────────────────────────────┤
│ Coverage: 40.12% (+2.50%)        Complexity: 45 (+5)    │
│ Files Changed: 3                 Lines: +120 / -30      │
├──────────────────────────────────────────────────────────┤
│ 📄 stripe.service.ts             85.2% (+15.2%)         │
│ 📄 orders.service.ts             40.5% (+2.0%)          │
│ 📄 payment.interface.ts          100% (new)             │
└──────────────────────────────────────────────────────────┘
```

### Coverage Diff Colors

- 🟢 **Green (+%)**: Coverage increased
- 🔴 **Red (-%)**: Coverage decreased
- ⚪ **Gray (0%)**: Coverage unchanged

### Clicking a Commit

Shows detailed file-by-file breakdown:
```
stripe.service.ts
├── Lines: 150/200 (75%)
├── Branches: 45/60 (75%)
└── Functions: 20/25 (80%)

Uncovered Lines: 45-52, 78-82, 120-125
```

**Pro Tip:** Click line numbers to see which tests cover that line

---

## Pull Requests

### Codecov PR Comments

When you open a PR, Codecov automatically comments:

```markdown
## Codecov Report

Coverage: 40.12% (Δ +2.50%)
Files changed: 3

| File | Coverage Δ | Complexity Δ |
|------|-----------|-------------|
| stripe.service.ts | 85.2% (+15.2%) | 12 (+3) |
| orders.service.ts | 40.5% (+2.0%) | 8 (+1) |
| payment.interface.ts | 100% (new) | 0 (0) |

Flags with carried forward coverage won't be shown. [Click here](https://docs.codecov.io/docs/carryforward-flags) to find out more.
```

### Interpreting PR Coverage

**Good PR:**
```
Overall: +2.5%  ✅
Patch: 85%      ✅
No uncovered critical files
```

**Needs Work:**
```
Overall: -5%    ❌ Coverage decreased
Patch: 30%      ❌ New code poorly tested
Critical files with <50% coverage
```

### PR Checks

Codecov can block PRs if:
- Coverage drops below threshold (configured in codecov.yml)
- Patch coverage too low
- Critical files uncovered

**Configure in Settings → Pull Request Comments**

---

## Files and Folders

### File Tree View

Navigate to: **Overview → Files**

Shows coverage for each file:
```
src/
├── Orders/
│   ├── orders.controller.ts    45%  🟡
│   ├── orders.service.ts       25%  🔴
│   └── orders.schema.ts        100% 🟢
├── Stripe/
│   ├── stripe.controller.ts    60%  🟡
│   └── stripe.service.ts       55%  🟡
└── Sales/
    └── sales.service.ts        40%  🟡
```

### Viewing File Details

Click any file to see:

1. **Coverage Summary**
   ```
   Lines: 120/200 (60%)
   Branches: 45/80 (56.25%)
   Functions: 15/20 (75%)
   ```

2. **Line-by-Line View**
   ```typescript
   1  ✅ import { Injectable } from '@nestjs/common';
   2  ✅
   3  ✅ export class OrdersService {
   4  ✅   constructor(private stripe: StripeService) {}
   5  ✅
   6  ✅   async createOrder(data: CreateOrderDto) {
   7  ✅     const payment = await this.stripe.createPayment();
   8  ❌     if (!payment) throw new Error('Payment failed');
   9  ❌     return this.saveOrder(payment);
   10 ❌   }
   ```

   **Legend:**
   - ✅ Green highlight: Line covered by tests
   - ❌ Red highlight: Line NOT covered
   - ⚪ White: Not executable (comments, declarations)

3. **Hit Count**
   Hover over line number to see how many times the line was executed:
   ```
   Line 7: 24 hits
   Line 8: 0 hits  ← Never tested!
   ```

---

## Flags (Multi-Project Setup)

### What Are Flags?

Flags let you track coverage for different parts of a monorepo separately.

**Our Setup:**
```yaml
# .github/workflows/test-coverage.yml
- uses: codecov/codecov-action@v4
  with:
    flags: admin-api        # Flag for admin API
    files: ./futura-tickets-admin-api/coverage/lcov.info

- uses: codecov/codecov-action@v4
  with:
    flags: marketplace-api  # Flag for marketplace API
    files: ./futura-market-place-api/coverage/lcov.info

- uses: codecov/codecov-action@v4
  with:
    flags: access-api       # Flag for access API
    files: ./futura-access-api/coverage/lcov.info
```

### Viewing Flag Coverage

Navigate to: **Flags** tab

```
┌─────────────────────────────────────────────────────┐
│ Flag              │ Coverage │ Files │ Lines       │
├───────────────────┼──────────┼───────┼─────────────┤
│ admin-api         │ 25.3%    │ 12    │ 1,234/4,876 │
│ marketplace-api   │ 55.7%    │ 18    │ 2,345/4,210 │
│ access-api        │ 40.1%    │ 8     │ 987/2,461   │
├───────────────────┼──────────┼───────┼─────────────┤
│ Total             │ 40.12%   │ 38    │ 4,566/11,547│
└─────────────────────────────────────────────────────┘
```

### Filtering by Flag

Click a flag to see only that API's coverage:
- View specific files
- Track progress per API
- Set individual targets

**Use Case:** Focus on improving marketplace-api from 55% → 70%

---

## Settings and Configuration

### Repository Settings

Navigate to: **Settings** tab

#### 1. General

- **Repository Token**: Copy for GitHub secrets
- **Default Branch**: Set to `main`
- **Badge**: Copy markdown for README

#### 2. YAML Configuration

View effective configuration:
```yaml
# Shows merged config from:
# 1. codecov.yml in repo
# 2. Codecov defaults

coverage:
  status:
    project:
      default:
        target: 40%
        threshold: 5%
```

**Edit:** Modify `codecov.yml` in repository

#### 3. Badges and Graphs

**Generate Badges:**
```markdown
# Overall coverage
[![codecov](https://codecov.io/gh/OWNER/REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/OWNER/REPO)

# Specific flag
[![codecov](https://codecov.io/gh/OWNER/REPO/branch/main/graph/badge.svg?flag=admin-api)](https://codecov.io/gh/OWNER/REPO?flags[]=admin-api)

# Custom graph
![Coverage Graph](https://codecov.io/gh/OWNER/REPO/branch/main/graphs/sunburst.svg)
```

#### 4. Notifications

Configure alerts for:
- Coverage drops > 5%
- Successful uploads
- Failed uploads
- Weekly summary

**Channels:**
- Email
- Slack
- GitHub status checks

#### 5. Pull Request Comments

**Configure:**
- Enable/disable automatic comments
- Set coverage drop threshold
- Choose layout (compact/detailed)
- Hide/show specific metrics

**Example Configuration:**
```yaml
# codecov.yml
comment:
  layout: "diff, flags, files"
  behavior: default
  require_changes: false
  require_base: false
  require_head: true
```

---

## Best Practices

### 1. Monitor Coverage Trends

**Do:**
- ✅ Check dashboard weekly
- ✅ Review coverage on every PR
- ✅ Track long-term trends
- ✅ Celebrate improvements

**Don't:**
- ❌ Only check when CI fails
- ❌ Ignore declining coverage
- ❌ Merge PRs that drop coverage significantly

### 2. Prioritize High-Impact Files

**Focus on:**
1. **Business Logic**
   - Payment processing (stripe.service.ts)
   - Order management (orders.service.ts)
   - Access control

2. **Critical Paths**
   - User registration
   - Payment flows
   - Ticket validation

3. **Bug-Prone Areas**
   - Complex algorithms
   - Edge cases
   - Error handling

### 3. Set Realistic Targets

**Phase 1: Foundation (3 months)**
- Target: 40% → 55%
- Focus: Critical services

**Phase 2: Expansion (3 months)**
- Target: 55% → 70%
- Focus: All services

**Phase 3: Excellence (6 months)**
- Target: 70% → 85%
- Focus: Edge cases, integration

### 4. Use Flags Effectively

**Strategy:**
```
1. Track each API separately
2. Set individual targets per flag
3. Focus on one API at a time
4. Prevent regression on others
```

**Example:**
```
Week 1-4: Marketplace API 55% → 70%
Week 5-8: Admin API 25% → 50%
Week 9-12: Access API 40% → 60%
```

### 5. Leverage PR Comments

**Review Checklist:**
- [ ] Overall coverage not decreased
- [ ] Patch coverage > 80%
- [ ] No critical files uncovered
- [ ] Complexity not increased significantly

---

## Common Workflows

### Workflow 1: Improving Coverage for a File

**Goal:** Increase `orders.service.ts` from 25% → 70%

**Steps:**
1. Navigate to **Files → orders.service.ts**
2. Identify uncovered lines (red highlights)
3. Write tests for uncovered code:
   ```typescript
   // orders.service.spec.ts
   describe('OrdersService', () => {
     it('should handle payment failures', async () => {
       // Test line 8-9 that were uncovered
       mockStripe.createPayment.mockResolvedValue(null);
       await expect(service.createOrder(data)).rejects.toThrow();
     });
   });
   ```
4. Run tests: `npm run test:cov`
5. Commit and push
6. Check Codecov dashboard for improvement

### Workflow 2: Preventing Coverage Regression

**Goal:** Ensure PRs don't decrease coverage

**Setup:**
1. Configure `codecov.yml`:
   ```yaml
   coverage:
     status:
       project:
         default:
           target: auto
           threshold: 5%  # Allow max 5% decrease
       patch:
         default:
           target: 80%    # New code must be 80% covered
   ```

2. Enable GitHub status checks in Settings → Branches

3. Result: PRs that drop coverage > 5% will fail CI

### Workflow 3: Weekly Coverage Review

**Every Monday:**
1. Open **Commits** tab
2. Review last 7 days of coverage changes
3. Identify:
   - ✅ Wins: Coverage increases
   - ❌ Issues: Coverage decreases
   - 🎯 Opportunities: Low-coverage files
4. Plan coverage improvements for the week
5. Assign tasks to team

### Workflow 4: Release Coverage Report

**Before each release:**
1. Check **Branches → main** coverage
2. Generate coverage report:
   ```bash
   npm run test:cov
   open coverage/lcov-report/index.html
   ```
3. Document in release notes:
   ```markdown
   ## v1.2.0 Release

   ### Test Coverage
   - Overall: 45% (+5% from v1.1.0)
   - Admin API: 30% (+5%)
   - Marketplace API: 60% (+10%)
   - Access API: 42% (+2%)
   ```

---

## Troubleshooting

### Issue: Coverage Not Updating

**Symptoms:** Dashboard shows old coverage

**Solutions:**
1. Check GitHub Actions passed
2. Verify upload logs:
   ```
   [info] {"status":"success","resultURL":"..."}
   ```
3. Check `CODECOV_TOKEN` is set
4. Wait 5-10 minutes for processing

### Issue: Wrong Coverage Percentage

**Symptoms:** Coverage seems incorrect

**Solutions:**
1. Verify coverage files generated:
   ```bash
   ls futura-tickets-admin-api/coverage/lcov.info
   ```
2. Check file paths in workflow:
   ```yaml
   files: ./futura-tickets-admin-api/coverage/lcov.info  # Correct
   files: ./coverage/lcov.info  # Wrong!
   ```
3. Re-run tests locally to verify

### Issue: Flags Not Showing

**Symptoms:** Flags tab empty

**Solutions:**
1. Check workflow has `flags:` parameter
2. Verify flag names in `codecov.yml`
3. Wait for next upload with flags

---

## Quick Reference

### Key URLs

```
Dashboard:    https://app.codecov.io/gh/Futura-Tickets/monorepo-futuratickets
Settings:     https://app.codecov.io/gh/Futura-Tickets/monorepo-futuratickets/settings
Flags:        https://app.codecov.io/gh/Futura-Tickets/monorepo-futuratickets/flags
PRs:          https://app.codecov.io/gh/Futura-Tickets/monorepo-futuratickets/pulls
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `?` | Show help |
| `t` | Toggle tree view |
| `f` | Focus search |
| `←` `→` | Navigate commits |
| `Esc` | Close modal |

### Coverage Targets

| Level | Percentage | Status |
|-------|-----------|--------|
| Critical | < 40% | 🔴 Needs immediate work |
| Low | 40-60% | 🟡 Needs improvement |
| Good | 60-80% | 🟢 Acceptable |
| Excellent | > 80% | 🌟 Great! |

---

## Next Steps

After mastering the dashboard:

1. **Set up team notifications**
   - Configure Slack integration
   - Set up email alerts

2. **Establish coverage goals**
   - Define target percentages
   - Create improvement roadmap

3. **Integrate into workflow**
   - Review coverage in stand-ups
   - Track metrics in sprints
   - Celebrate improvements

4. **Advanced features**
   - Carryforward flags
   - Impact analysis
   - Custom graphs

---

**Need Help?**
- 📚 [Codecov Documentation](https://docs.codecov.io/)
- 💬 [Codecov Support](https://codecov.io/support)
- 📧 Internal: Check with DevOps team

**Last Updated:** 2025-10-18
