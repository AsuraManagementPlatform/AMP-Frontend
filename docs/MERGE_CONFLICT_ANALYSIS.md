# Test-CRM → Main Merge Conflict Analysis

**Date:** October 17, 2025  
**Branch:** test-crm → main  
**Purpose:** Predict and document potential merge conflicts

---

## 📊 Files Changed

**Total files modified in test-crm:** 115 files

### High-Risk Files (Likely Conflicts)
Files that exist in both branches and have been modified:

1. **Dashboard Components**
   - `src/components/dashboard/AdminDashboard.tsx` ⚠️
   - `src/components/dashboard/MemberDashboard.tsx` ⚠️
   - `src/components/dashboard/OrgAdminDashboard.tsx` ⚠️
   - `src/pages/Dashboard.page.tsx` ⚠️

2. **Layout & Auth**
   - `src/components/layout/Layout.tsx` ⚠️
   - `src/components/auth/ProtectedRoute.tsx` ⚠️
   - `src/App.tsx` ⚠️

3. **Services**
   - `src/services/organization.service.ts` ⚠️
   - `src/hooks/useDashboardHandlers.ts` ⚠️

4. **Organization Components**
   - `src/pages/OrganizationDetails.page.tsx` ⚠️
   - `src/components/organization/OrganizationCreationModal.tsx` (file name mismatch?)

---

## 🔍 Known Naming Issues

### ❌ Found in test-crm branch:

**1. ViewActivitiesModal.tsx - Line 223**
```typescript
<h4 className="font-semibold text-lg">{activity.name}</h4>
```
**Issue:** Activities use `title`, not `name`  
**Fix:** Change to `{activity.title}`

---

## 🎯 Merge Strategy

### Phase 1: Pre-Merge Cleanup (test-crm branch)

1. **Fix naming issue:**
   ```bash
   # In test-crm branch
   # Fix ViewActivitiesModal.tsx line 223
   # Change activity.name → activity.title
   ```

2. **Verify no other naming issues:**
   ```bash
   # Search for problematic patterns
   grep -r "project\.title" src/
   grep -r "activity\.name" src/
   ```

3. **Run tests and verify compilation:**
   ```bash
   npm run build
   ```

### Phase 2: Merge Preparation

1. **Update test-crm with latest main:**
   ```bash
   git checkout test-crm
   git fetch origin main
   git merge origin/main
   # Resolve conflicts if any
   ```

2. **Files to watch during merge:**

   **AdminDashboard.tsx**
   - Main: Has module toggle buttons for ERP/CRM
   - test-crm: May have different organization management
   - Strategy: Keep module toggle logic from main, integrate any new features from test-crm

   **Layout.tsx**
   - Main: Has module-based navigation (hasERP, hasCRM)
   - test-crm: May have different navigation structure
   - Strategy: Keep module logic, merge navigation improvements

   **organization.service.ts**
   - Main: Has `toggleModule` method
   - test-crm: May have additional organization methods
   - Strategy: Merge both, ensure `toggleModule` uses correct response parsing

### Phase 3: Conflict Resolution Rules

#### Rule 1: Naming Conventions (from main)
```typescript
// ✅ KEEP (from main)
{project.name}
{activity.title}
getUserDisplayName(user)
getProjectStatusColor(status)
getActivityStatusColor(status)

// ❌ REJECT (from test-crm if found)
{project.title}
{activity.name}
user.full_name
// inline status checks
```

#### Rule 2: Module Management (from main)
```typescript
// ✅ KEEP (from main - NEW FEATURE)
const { hasERP, hasCRM } = useOrganizationModules();
cacheInvalidation.invalidate(CACHE_KEYS.ORGANIZATION_MODULES);
organizationService.toggleModule(id, module, enabled);

// Response parsing fix
const response = await apiService.get<{organization: Organization}>(`/api/organization/${id}`);
return response.organization;
```

#### Rule 3: Cache Invalidation System (from main)
```typescript
// ✅ KEEP (from main - NEW FEATURE)
import { cacheInvalidation, CACHE_KEYS } from '@/utils/cacheInvalidation';
cacheInvalidation.subscribe(CACHE_KEYS.ORGANIZATION_MODULES, callback);
```

### Phase 4: Specific File Strategies

#### AdminDashboard.tsx
```typescript
// MERGE STRATEGY:
// 1. Keep organization list table from test-crm
// 2. Keep module toggle buttons from main
// 3. Keep handleToggleModule with cache invalidation from main
// 4. Ensure organization display uses org.name (not org.display_name)
```

#### Layout.tsx
```typescript
// MERGE STRATEGY:
// 1. Keep navigation structure from main
// 2. Keep module-based conditionals (hasERP, hasCRM) from main
// 3. Merge any new navigation items from test-crm
// 4. Keep getUserDisplayName() from main
```

#### organization.service.ts
```typescript
// MERGE STRATEGY:
// 1. Keep getById response parsing fix from main:
//    const response = await apiService.get<{organization: Organization}>(...);
//    return response.organization;
// 2. Keep toggleModule method from main
// 3. Merge any new methods from test-crm
```

#### useDashboardHandlers.ts
```typescript
// MERGE STRATEGY:
// 1. Keep handleToggleModule with cache invalidation from main
// 2. Merge any new handlers from test-crm
// 3. Ensure all handlers use cache invalidation pattern
```

---

## 🚨 Critical Checks After Merge

### 1. Type Safety
```bash
npm run type-check
# or
npx tsc --noEmit
```

### 2. Search for Naming Issues
```bash
# Should return 0 results
grep -r "project\.title" src/
grep -r "activity\.name" src/ | grep -v "activity.name}" # exclude comments

# Should return results (correct usage)
grep -r "project\.name" src/
grep -r "activity\.title" src/
```

### 3. Verify Module Management
```typescript
// Check these exist:
// - src/hooks/useOrganizationModules.ts
// - src/utils/cacheInvalidation.ts
// - organizationService.toggleModule method
// - Layout.tsx uses hasERP, hasCRM
```

### 4. Test Critical Flows
- [ ] Superadmin can toggle ERP/CRM modules
- [ ] Org admin sees only active modules in navigation
- [ ] Projects display correctly with `project.name`
- [ ] Activities display correctly with `activity.title`
- [ ] User names display correctly with `getUserDisplayName()`
- [ ] Status colors use utility functions

---

## 📝 Manual Conflict Resolution Template

When you encounter a conflict, use this decision tree:

```
CONFLICT DETECTED
│
├─ Is it related to naming (project.name vs project.title)?
│  └─ ✅ CHOOSE: main (project.name, activity.title)
│
├─ Is it related to module management (hasERP, hasCRM, toggleModule)?
│  └─ ✅ CHOOSE: main (keep module features)
│
├─ Is it related to cache invalidation?
│  └─ ✅ CHOOSE: main (keep cacheInvalidation system)
│
├─ Is it related to organization service response parsing?
│  └─ ✅ CHOOSE: main (return response.organization)
│
├─ Is it new functionality from test-crm?
│  └─ ✅ CHOOSE: test-crm (keep new features, adapt to main's patterns)
│
└─ Unsure?
   └─ Ask for review, test both versions
```

---

## 🔧 Quick Fix Commands

### Fix ViewActivitiesModal.tsx
```bash
# In test-crm branch before merge
sed -i 's/{activity\.name}/{activity.title}/g' src/components/modals/ViewActivitiesModal.tsx
```

### Search for potential issues
```bash
# Find all project.title references (should be 0)
grep -rn "project\.title" src/

# Find all activity.name references (should be 0, except in type definitions)
grep -rn "activity\.name" src/ | grep -v "name:"

# Find inline status checks (should use utility functions)
grep -rn "status === 'ACTIVE'" src/
```

---

## 📊 Estimated Conflict Resolution Time

- **Automatic merge:** 70% of files
- **Manual resolution needed:** 30% of files (~35 files)
- **Critical files requiring careful merge:** 10 files
- **Estimated time:** 2-3 hours

---

## ✅ Post-Merge Checklist

- [ ] All TypeScript compilation errors resolved
- [ ] No `project.title` references exist
- [ ] No `activity.name` references exist (except type defs)
- [ ] Module management works (toggle, navigation)
- [ ] Cache invalidation system functional
- [ ] Organization service response parsing correct
- [ ] All dashboards render without errors
- [ ] User display names use utility function
- [ ] Status displays use utility functions
- [ ] Run full test suite
- [ ] Manual testing of critical flows
- [ ] Documentation updated

---

## 🎯 Success Criteria

Merge is successful when:

1. ✅ No TypeScript errors
2. ✅ All naming conventions follow main branch standards
3. ✅ Module management feature works end-to-end
4. ✅ Cache invalidation system operational
5. ✅ All dashboards render correctly
6. ✅ No console errors during normal operation
7. ✅ New test-crm features integrated without breaking existing
8. ✅ Code follows consistent patterns throughout

---

**Next Step:** Fix ViewActivitiesModal.tsx in test-crm before attempting merge.
