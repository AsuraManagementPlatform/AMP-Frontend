# Naming Conventions - Main Branch Analysis

**Date:** October 17, 2025  
**Purpose:** Document the current naming conventions for merge conflict resolution

---

## 🎯 Key Findings

### **Projects**
- **Primary field:** `name` (NOT `title`)
- **Type:** `string`
- **Location:** `Project.name`

### **Activities**  
- **Primary field:** `title` (NOT `name`)
- **Type:** `string`
- **Location:** `Activity.title`

### **Users**
- **Display name:** Use utility function `getUserDisplayName(user)`
- **Returns:** `user.full_name || user.email`
- **Location:** `src/utils/dashboardUtils.ts`

---

## 📋 Type Definitions

### Project Type (`src/types/project.types.ts`)
```typescript
export interface Project extends BaseEntity {
    name: string;              // ✅ PRIMARY IDENTIFIER
    description?: string;
    category: string;
    startingDate: string;
    endingDate: string;
    status: ProjectStatus;
    priority?: ProjectPriority;
    organization: string;
    location: string;
    budget: number;
    currency: string;
    budgetPlanningDate: string;
    budgetResponsible: string;
    budgetResponsibleName?: string;
    budgetNotes?: string;
    teamSize?: number;
    activitiesCount?: number;
}
```

### Activity Type (`src/types/activity.types.ts`)
```typescript
export interface Activity extends BaseEntity {
    project: string;
    projectObjective?: string;
    title: string;             // ✅ PRIMARY IDENTIFIER
    description?: string;
    startingDate: string;
    estimatedEndingDate: string;
    endingDate?: string;
    status: ActivityStatus;
    type: ActivityType;
    location?: string;
    observation?: string;
    results?: string;
    indicators?: string;
    totalActivityExpensesAmount?: number;
}
```

---

## 🔍 Usage Patterns

### Projects - Correct Usage
```typescript
// ✅ CORRECT
<td>{project.name}</td>
<h1>{project.name}</h1>
title={`Gestionarea echipei - ${project.name}`}

// ❌ WRONG
<td>{project.title}</td>  // Does NOT exist
```

### Activities - Correct Usage
```typescript
// ✅ CORRECT
<td>{activity.title}</td>
<h4>{activity.title}</h4>
message={`Sigur doriți să ștergeți activitatea "${activity.title}"?`}

// ❌ WRONG
<td>{activity.name}</td>  // Does NOT exist
```

---

## 📍 Key Files Using These Conventions

### Components
1. **MemberDashboard.tsx**
   - `{project.name}` - Line 51
   - `{activity.title}` - Line 99

2. **OrgAdminDashboard.tsx**
   - `{project.name}` - Line 208
   - `{activity.title}` - Line 267

3. **ProjectList.tsx**
   - `{project.name}` - Line 57

4. **ActivityList.tsx**
   - `{activity.title}` - Line 39

### Modals
1. **UpdateProjectModal.tsx**
   - `name: project.name` - Line 80

2. **UpdateActivityModal.tsx**
   - `title: activity.title` - Line 46

3. **ViewActivitiesModal.tsx**
   - `title={Activități proiect - ${project.name}}` - Line 166
   - `{activity.name}` - Line 223 ⚠️ **POTENTIAL BUG?** (should be `activity.title`)

### Config Files
1. **budget.form.config.ts**
   - `label: project.name` - Line 17

2. **project-expense.form.config.ts**
   - `label: activity.title` - Line 55

---

## 🎨 Status Display Utilities

Located in `src/utils/dashboardUtils.ts`:

### Project Status
```typescript
export const getProjectStatusColor = (status: string): string => {
    switch (status) {
        case 'ACTIVE': return 'green';
        case 'PLANNING': return 'blue';
        case 'ON_HOLD': return 'yellow';
        case 'COMPLETED': return 'green';
        case 'CANCELLED': return 'red';
        default: return 'gray';
    }
};

export const getProjectStatusText = (status: string): string => {
    switch (status) {
        case 'ACTIVE': return 'Activ';
        case 'PLANNING': return 'Planificare';
        case 'ON_HOLD': return 'Suspendat';
        case 'COMPLETED': return 'Finalizat';
        case 'CANCELLED': return 'Anulat';
        default: return status;
    }
};
```

### Activity Status
```typescript
export const getActivityStatusColor = (status: string): string => {
    switch (status) {
        case 'COMPLETED': return 'green';
        case 'IN_PROGRESS': return 'blue';
        case 'PLANNED': return 'yellow';
        case 'CANCELLED': return 'red';
        default: return 'gray';
    }
};

export const getActivityStatusText = (status: string): string => {
    switch (status) {
        case 'COMPLETED': return 'Finalizat';
        case 'IN_PROGRESS': return 'În progres';
        case 'PLANNED': return 'Planificat';
        case 'CANCELLED': return 'Anulat';
        default: return status;
    }
};
```

---

## ⚠️ Merge Conflict Resolution Rules

### When merging test-crm → main

1. **If you see `project.title`:**
   - ❌ REJECT - Change to `project.name`

2. **If you see `activity.name`:**
   - ❌ REJECT - Change to `activity.title`

3. **If you see inline status checks:**
   - ✅ ACCEPT if using utility functions (`getProjectStatusColor`, etc.)
   - ❌ REJECT if hardcoded status checks
   - Replace with utility function calls from `dashboardUtils.ts`

4. **If you see user name display:**
   - ✅ ACCEPT if using `getUserDisplayName(user)`
   - ❌ REJECT if using `user.full_name` directly
   - Replace with utility function

---

## 🔧 Common Patterns

### Displaying Project in Table
```typescript
<td className="px-4 py-3 font-medium">{project.name}</td>
<td className="px-4 py-3">
    <span className={`px-2 py-1 text-xs rounded-full ${
        getProjectStatusColor(project.status) === 'green' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
    }`}>
        {getProjectStatusText(project.status)}
    </span>
</td>
```

### Displaying Activity in Table
```typescript
<td className="px-4 py-3 font-medium">{activity.title}</td>
<td className="px-4 py-3">
    <span className={`px-2 py-1 text-xs rounded-full ${
        getActivityStatusColor(activity.status) === 'green' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
    }`}>
        {getActivityStatusText(activity.status)}
    </span>
</td>
```

### Modal Titles
```typescript
// Project modals
title={`Gestionarea echipei - ${project.name}`}
title={`Gestionarea bugetului - ${project.name}`}
title={`Generare rapoarte - ${project.name}`}

// Activity modals
title={`Activități proiect - ${project.name}`}
// Inside activity list: {activity.title}
```

---

## 📊 Status Enums

### ProjectStatus
- `DRAFT`
- `ACTIVE`
- `COMPLETED`
- `CANCELLED`
- `ON_HOLD`

### ActivityStatus
- `PLANNED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`
- `POSTPONED`

---

## 🚨 Known Issues to Watch For

1. **ViewActivitiesModal.tsx Line 223**
   - Currently uses `{activity.name}`
   - Should be `{activity.title}`
   - ⚠️ Will cause runtime error if activities don't have `name` field

2. **Inconsistent status color mapping**
   - Some files use inline ternary checks
   - Should all use utility functions for consistency

---

## ✅ Checklist for Test-CRM Merge

Before merging test-crm branch:

- [ ] Search for `project.title` - replace with `project.name`
- [ ] Search for `activity.name` - replace with `activity.title`  
- [ ] Search for hardcoded status colors - replace with utility functions
- [ ] Search for `user.full_name` - replace with `getUserDisplayName(user)`
- [ ] Verify all type definitions match main branch
- [ ] Test dashboard rendering with real data
- [ ] Check modal titles use correct field names
- [ ] Validate form configs use correct field names

---

## 📝 Summary

**Golden Rules:**
1. Projects have `name`, NOT `title`
2. Activities have `title`, NOT `name`
3. Always use utility functions for status display
4. Always use `getUserDisplayName()` for user names
5. Keep type definitions as single source of truth

**When in doubt:** Check `src/types/project.types.ts` and `src/types/activity.types.ts`
