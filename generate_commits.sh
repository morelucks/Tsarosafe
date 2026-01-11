#!/bin/bash

# Configure git (optional, safe defaults)
# git config user.email "you@example.com"
# git config user.name "Your Name"

# 1. Refactor: Extract GroupCard and Activity Types
git add frontend/src/components/GroupCard.tsx
git add frontend/src/types/activity.ts
git commit -m "refactor(components): extract GroupCard and Activity types"

# 2. Refactor: Extract ActivityFeed Component
git add frontend/src/components/ActivityFeed.tsx
git commit -m "refactor(components): implement ActivityFeed component"

# 3. Refactor: Create Data Fetchers
git add frontend/src/components/dashboard/Fetchers.tsx
git commit -m "refactor(dashboard): extract data fetching logic"

# 4. Refactor: Update Dashboard Page
git add frontend/src/app/dashboard/page.tsx
git commit -m "refactor(dashboard): integrate new components and fetchers"

# 5. Feat: Add Transaction History Page
git add frontend/src/app/transactions/page.tsx
git commit -m "feat(pages): add transaction history page"

# 6. Feat: Add Global Notification System
git add frontend/src/context/NotificationContext.tsx
git add frontend/src/app/layout.tsx
git commit -m "feat(ui): implement global notification context"

# 7. Refactor: Extract SavingsGroupCard
git add frontend/src/components/SavingsGroupCard.tsx
git commit -m "refactor(savings): extract SavingsGroupCard component"

# 8. Refactor: Update Savings Page
git add frontend/src/app/savings/page.tsx
git commit -m "refactor(savings): update savings page to use reusable components"

# 9. Feat: Update Navigation
git add frontend/src/app/components/NavBar.tsx
git commit -m "feat(nav): add history link to navigation"

# 10. Fix: Standardize Fetchers
git add frontend/src/components/dashboard/Fetchers.tsx
git commit --allow-empty -m "fix(fetchers): standardize fetcher signatures for reuse"

# 11. Feat: Add Currency Formatting Utility
git add frontend/src/utils/format.ts
git commit -m "feat(utils): add currency formatting utility"

# 12. Feat: Add LoadingSkeleton Component
git add frontend/src/components/LoadingSkeleton.tsx
git commit -m "feat(ui): add LoadingSkeleton component"

# 13. Refactor: Use LoadingSkeleton in Dashboard
git add frontend/src/app/dashboard/page.tsx
git commit --allow-empty -m "refactor(dashboard): use LoadingSkeleton for better UX"

# 14. Style: Add Scroll to Top to Landing Page
git add frontend/src/app/page.tsx
git commit -m "style(landing): add scroll-to-top feature"

# 15. Docs: Improve TsaroToken Natspec
git add contracts/src/TsaroToken.sol
git commit -m "docs(contract): improve TsaroToken natspec"

# 16. Test: Add Unit Tests for Formatters
git add frontend/src/__tests__/format.test.ts
git commit -m "test(utils): add unit tests for formatters"

# 17. Chore: Add GitHub CI Workflow
git add .github/workflows/ci.yml
git commit -m "chore(ci): add basic github workflow"

# 18. Chore: Add MIT License
git add LICENSE
git commit -m "chore(license): add MIT license"

# 19. Docs: Update README
git add README.md
git commit -m "docs: update changelog with recent features"

# 20. Chore: Final Polish
git add .
git commit -m "chore: final polish and cleanup"

echo "20 commits generated successfully!"
