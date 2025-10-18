# Codecov Activation Guide - Step by Step

**Objective:** Activate Codecov integration to complete Phase 4 Testing to 100%

**Time Required:** 30 minutes

**Prerequisites:**
- GitHub repository access with admin permissions
- Test infrastructure configured (✅ Already done)
- GitHub Actions workflows created (✅ Already done)

---

## Step 1: Create Codecov Account (5 minutes)

### 1.1 Visit Codecov Website
```bash
# Open in browser
https://about.codecov.io/
```

### 1.2 Sign Up with GitHub
1. Click "Sign Up" button
2. Select "Sign up with GitHub"
3. Authorize Codecov to access your GitHub account
4. Grant permissions to read repositories

### 1.3 Select Organization
- If you have multiple GitHub organizations, select the one containing `monorepo-futuratickets`
- Click "Activate" on the organization

---

## Step 2: Add Repository to Codecov (5 minutes)

### 2.1 Enable Repository
1. Once logged in, go to: https://app.codecov.io/gh
2. Find your username/organization in the list
3. Click on "Not yet setup" tab
4. Find `monorepo-futuratickets` in the list
5. Click "Setup repo" button

### 2.2 Get Upload Token
After adding the repository, you'll see:

```
Repository Token: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Copy this token** - you'll need it in the next step.

### Alternative: Get token later
If you already added the repo:
1. Go to: https://app.codecov.io/gh/[YOUR_USERNAME]/monorepo-futuratickets
2. Click "Settings" tab
3. Copy the "Repository Upload Token"

---

## Step 3: Add Token to GitHub Secrets (3 minutes)

### 3.1 Navigate to GitHub Settings
```bash
# Open in browser
https://github.com/[YOUR_USERNAME]/monorepo-futuratickets/settings/secrets/actions
```

Or manually:
1. Go to your repository on GitHub
2. Click "Settings" tab
3. Click "Secrets and variables" → "Actions" in left sidebar

### 3.2 Create New Secret
1. Click "New repository secret" button
2. Fill in:
   - **Name:** `CODECOV_TOKEN`
   - **Value:** [Paste the token from Step 2.2]
3. Click "Add secret"

### 3.3 Verify Secret Created
You should see `CODECOV_TOKEN` in the list of secrets.

---

## Step 4: Update README Badges (5 minutes)

### 4.1 Get Your GitHub Username/Organization
```bash
# Run this command to get remote URL
git remote -v

# Output example:
# origin  https://github.com/YOUR_USERNAME/monorepo-futuratickets.git
```

Extract `YOUR_USERNAME` from the URL.

### 4.2 Update Badge URLs
Open `README.md` and replace placeholders:

**Find:**
```markdown
[![Test & Coverage](https://github.com/OWNER/REPO/actions/workflows/test-coverage.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/test-coverage.yml)
[![codecov](https://codecov.io/gh/OWNER/REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/OWNER/REPO)
```

**Replace with:**
```markdown
[![Test & Coverage](https://github.com/YOUR_USERNAME/monorepo-futuratickets/actions/workflows/test-coverage.yml/badge.svg)](https://github.com/YOUR_USERNAME/monorepo-futuratickets/actions/workflows/test-coverage.yml)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/monorepo-futuratickets/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/monorepo-futuratickets)
```

Also update the table badges:
```markdown
| **Admin API** | 58 | ~25% | [![codecov](https://codecov.io/gh/YOUR_USERNAME/monorepo-futuratickets/branch/main/graph/badge.svg?flag=admin-api)](https://codecov.io/gh/YOUR_USERNAME/monorepo-futuratickets/flags/admin-api) |
| **Marketplace API** | 100 | ~55% | [![codecov](https://codecov.io/gh/YOUR_USERNAME/monorepo-futuratickets/branch/main/graph/badge.svg?flag=marketplace-api)](https://codecov.io/gh/YOUR_USERNAME/monorepo-futuratickets/flags/marketplace-api) |
| **Access API** | 24 | ~40% | [![codecov](https://codecov.io/gh/YOUR_USERNAME/monorepo-futuratickets/branch/main/graph/badge.svg?flag=access-api)](https://codecov.io/gh/YOUR_USERNAME/monorepo-futuratickets/flags/access-api) |
```

---

## Step 5: Trigger First Coverage Upload (5 minutes)

### 5.1 Commit and Push
```bash
# Stage README changes
git add README.md

# Commit
git commit -m "chore: configure Codecov integration

- Add CODECOV_TOKEN to GitHub secrets
- Update README badges with correct repository info

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to trigger workflow
git push origin dev
```

### 5.2 Monitor GitHub Actions
1. Go to: https://github.com/YOUR_USERNAME/monorepo-futuratickets/actions
2. Find the "Test & Coverage" workflow run
3. Watch the progress of all 3 API test jobs
4. Wait for all jobs to complete (~3-5 minutes)

### 5.3 Verify Coverage Upload
Look for this in the job logs:

```
[info] Uploading reports via Codecov
[info] {"status":"success","resultURL":"https://codecov.io/..."}
✅ Successfully uploaded coverage to Codecov
```

---

## Step 6: Verify Codecov Dashboard (5 minutes)

### 6.1 Check Coverage Report
1. Go to: https://app.codecov.io/gh/YOUR_USERNAME/monorepo-futuratickets
2. You should see:
   - Overall coverage percentage (~40%)
   - Graph of coverage over time
   - Latest commit with coverage data

### 6.2 Verify Flags
Click on "Flags" tab to see:
- `admin-api` - ~25% coverage
- `marketplace-api` - ~55% coverage
- `access-api` - ~40% coverage

### 6.3 Explore Features
- **Files:** See coverage per file
- **Commits:** Coverage change per commit
- **Pulls:** Automatic PR comments with coverage diff
- **Settings:** Configure coverage targets and notifications

---

## Step 7: Test PR Integration (Optional - 5 minutes)

### 7.1 Create Test Branch
```bash
git checkout -b test-codecov-integration

# Make a small change to a test file
echo "// Test codecov integration" >> futura-tickets-admin-api/src/app.service.spec.ts

git add .
git commit -m "test: verify Codecov PR integration"
git push origin test-codecov-integration
```

### 7.2 Create Pull Request
1. Go to GitHub repository
2. Create PR from `test-codecov-integration` to `dev`
3. Wait for CI to complete

### 7.3 Verify PR Comment
Codecov bot should comment with:
```
## Codecov Report
Coverage: 40.12% (Δ +0.05%)
Files changed: 1

| File | Coverage Δ | Complexity Δ |
|------|-----------|-------------|
| src/app.service.spec.ts | 100% | 0 |
```

### 7.4 Cleanup
```bash
# Merge or close the PR
# Delete test branch
git checkout dev
git branch -D test-codecov-integration
git push origin --delete test-codecov-integration
```

---

## Verification Checklist

Run through this checklist to ensure everything is working:

- [ ] Codecov account created and repository added
- [ ] `CODECOV_TOKEN` secret added to GitHub repository
- [ ] README.md badges updated with correct repository info
- [ ] GitHub Actions workflow completed successfully
- [ ] Coverage data visible on Codecov dashboard
- [ ] All 3 flags (admin-api, marketplace-api, access-api) visible
- [ ] Badges in README.md displaying correctly
- [ ] PR comments enabled (optional)

---

## Quick Reference Commands

```bash
# Get repository info
git remote -v

# Check current branch
git branch

# Run tests locally with coverage
cd futura-tickets-admin-api && npm run test:cov
cd futura-market-place-api && npm run test:cov
cd futura-access-api && npm run test:cov

# View coverage reports locally
open futura-tickets-admin-api/coverage/lcov-report/index.html
open futura-market-place-api/coverage/lcov-report/index.html
open futura-access-api/coverage/lcov-report/index.html
```

---

## Troubleshooting

### Problem: Codecov upload fails
**Error:** `Error: Unable to locate build via GitHub Actions API`

**Solution:**
1. Verify `CODECOV_TOKEN` is correctly set in GitHub Secrets
2. Check workflow file uses `codecov/codecov-action@v4`
3. Ensure token parameter is passed: `token: ${{ secrets.CODECOV_TOKEN }}`

### Problem: No coverage data showing
**Error:** `Coverage data not found`

**Solution:**
1. Verify tests generate `coverage/lcov.info` file
2. Check `files` parameter points to correct path
3. Run tests locally: `npm run test:cov` and verify coverage folder exists

### Problem: Flags not showing
**Error:** `Flags not visible in Codecov`

**Solution:**
1. Verify `flags` parameter in workflow matches `codecov.yml`
2. Ensure each upload uses different flag name
3. Wait 1-2 minutes for Codecov to process flags

### Problem: Badges not displaying
**Error:** Badge shows "unknown" or error

**Solution:**
1. Verify repository URL in badge markdown
2. Check coverage data uploaded successfully
3. Badge updates may take 5-10 minutes after first upload

---

## Next Steps After Activation

Once Codecov is activated and working:

1. **Monitor Coverage Trends**
   - Set weekly reviews of coverage dashboard
   - Track coverage changes per PR

2. **Enforce Coverage Requirements**
   - Consider adding branch protection rules
   - Require coverage not to decrease on PRs

3. **Improve Coverage**
   - Target 70% overall coverage
   - Focus on critical business logic first

4. **Setup Notifications**
   - Configure Slack/email notifications for coverage drops
   - Get alerts when coverage falls below threshold

---

## Success Criteria

You'll know the activation is complete when:

✅ **All workflows passing** - Green checks on GitHub Actions
✅ **Coverage visible** - Dashboard shows ~40% coverage
✅ **Badges working** - README shows coverage badges
✅ **Flags configured** - 3 separate flags for each API
✅ **PR integration** - Codecov comments on pull requests

**Congratulations! Phase 4 Testing is now 100% complete! 🎉**
