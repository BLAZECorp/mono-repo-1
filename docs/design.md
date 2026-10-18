# Enterprise Frontend Design System & UI Specifications

**Document ID:** VGC-HR-DESIGN-001  
**Status:** Approved Standard  
**Applies To:** `client` (Employee Web Portal) and `admin` (HR Administration Console)  
**Target Framework:** React 19 + Tailwind CSS v4 (`@tailwindcss/vite`) + Framer Motion + Lucide Icons  

---

## 1. Design Philosophy

The HR Management user interfaces must convey **authority, high precision, and calm clarity**.  
Our design principles:
1. **Content First**: Visual elements must never compete with data. Use whitespace generously to enhance readability.
2. **Predictable Layouts**: Form controls, buttons, and navigation patterns must behave consistently across both Employee and Admin portals.
3. **Utility-First Acceleration**: Use **Tailwind CSS v4** utility classes to build consistent, responsive, and token-compliant interfaces.
4. **Hardware-Accelerated Fluidity**: Micro-animations using Framer Motion should feel tactile and instantaneous (150ms–250ms), never sluggish.
5. **Accessible by Default**: Maintain strict WCAG 2.1 AA contrast ratios (minimum 4.5:1 for normal text).

---

## 2. Typography System & Tailwind Mapping

The interface uses **`Plus Jakarta Sans`** / **`Inter`** for modern enterprise legibility.

### 2.1 Font Size Scale & Tailwind Utility Classes
| Token | Pixel Size | Tailwind Class | Line Height | Weight | Typical Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `font-2xs` | **10px** | `text-[10px]` | `leading-tight` | `font-semibold` | Badge counters, uppercase section labels |
| `font-xs` | **12px** | `text-xs` | `leading-4` | `font-normal` / `font-medium` | Helper text, timestamps, table metadata |
| `font-sm` | **14px** | `text-sm` | `leading-5` | `font-normal` / `font-medium` | **Default Body Text**, form labels, buttons, table cells |
| `font-base` | **16px** | `text-base` | `leading-6` | `font-normal` / `font-semibold` | Primary card content, prominent inputs |
| `font-lg` | **18px** | `text-lg` | `leading-7` | `font-semibold` | Card titles, modal headers, subsection titles |
| `font-xl` | **20px** | `text-xl` | `leading-7` | `font-semibold` | Page subheaders, stat card figures |
| `font-2xl` | **24px** | `text-2xl` | `leading-8` | `font-bold` | Primary section headings, modal titles |
| `font-3xl` | **32px** | `text-3xl` | `leading-9` | `font-bold` | Top-level dashboard page titles |

---

## 3. Spacing & Grid System

All layouts conform strictly to Tailwind's 4px base unit grid:

| Tailwind Spacing | Pixel Value | Typical Application |
| :--- | :--- | :--- |
| `gap-1` / `p-1` | **4px** | Micro spacing between icon and text label |
| `gap-2` / `p-2` | **8px** | Padding inside badges, icon buttons, compact menus |
| `gap-3` / `py-3` | **12px** | Standard button vertical padding, form input spacing |
| `gap-4` / `p-4` | **16px** | Default card inner padding, input field horizontal padding |
| `gap-5` / `p-5` | **20px** | Separation between form field groups |
| `gap-6` / `p-6` | **24px** | Dashboard card margins, multi-column grid gutters |
| `gap-8` / `py-8` | **32px** | Major section separation |
| `py-12` | **48px** | Page-level vertical gutters |
| `py-16` | **64px** | Hero sections and landing overviews |

---

## 4. Color Palette & Semantic Tokens

### 4.1 Primary Brand Tones
- **Primary Action**: `bg-blue-600 hover:bg-blue-700 text-white` (`#2563EB`)
- **Primary Subtle Highlight**: `bg-blue-50 text-blue-700 border-blue-200` (`#EFF6FF`)
- **Focus Rings**: `focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none`

### 4.2 Semantic State Badges
- **Success (Active, Approved, Online)**:
  `bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800`
- **Warning (Pending, Review Required)**:
  `bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800`
- **Destructive / Error (Rejected, Suspended)**:
  `bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800`
- **Neutral / Informational**:
  `bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700`

### 4.3 Neutral Grayscale Surfaces
- **Page Background**: `bg-slate-50 dark:bg-[#0B0F19]`
- **Card / Surface**: `bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800`
- **Table Headers**: `bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400`
- **Primary Text**: `text-slate-900 dark:text-slate-50`
- **Secondary Text**: `text-slate-600 dark:text-slate-400`
- **Muted Text**: `text-slate-400 dark:text-slate-500`

---

## 5. Tailwind Component Specifications

### 5.1 Buttons
```tsx
// Primary Button
<button className="h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors duration-150 flex items-center justify-center gap-2 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-50 disabled:cursor-not-allowed">
  <Plus className="w-4 h-4" />
  <span>New Request</span>
</button>

// Secondary Button
<button className="h-10 px-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-800 dark:text-slate-200 text-sm font-medium transition-colors duration-150">
  <span>Cancel</span>
</button>

// Destructive Button
<button className="h-10 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors duration-150">
  <span>Delete Account</span>
</button>
```

### 5.2 Form Inputs & Controls
```tsx
<div className="flex flex-col gap-1.5">
  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
    Work Email Address
  </label>
  <input
    type="email"
    placeholder="employee@company.com"
    className="h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
  />
  <span className="text-xs text-slate-500">Must be your registered enterprise email.</span>
</div>
```

### 5.3 Data Tables
```tsx
<div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
  <table className="w-full text-left border-collapse">
    <thead>
      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <th className="py-3 px-4">Employee</th>
        <th className="py-3 px-4">Department</th>
        <th className="py-3 px-4">Role</th>
        <th className="py-3 px-4">Status</th>
        <th className="py-3 px-4 text-right">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm text-slate-800 dark:text-slate-200">
      <tr className="hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors">
        <td className="py-3.5 px-4 font-medium">Jane Doe</td>
        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">Engineering</td>
        <td className="py-3.5 px-4">Software Engineer</td>
        <td className="py-3.5 px-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        </td>
        <td className="py-3.5 px-4 text-right">...</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 6. Motion Standards (Framer Motion)

Combine Tailwind layout utilities with Framer Motion transitions:

```tsx
import { motion } from 'framer-motion';

// Page entrance transition
export const PageContainer = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.18, ease: 'easeOut' }}
    className="p-6 max-w-7xl mx-auto space-y-6"
  >
    {children}
  </motion.div>
);
```

---

## 7. Responsive Breakpoint Standards

- **`sm` (640px)**: Stacked cards convert to dual columns (`grid grid-cols-1 sm:grid-cols-2`).
- **`md` (768px)**: Table and form multi-columns expand (`md:grid-cols-3`).
- **`lg` (1024px)**: Persistent desktop navigation sidebar (`lg:w-60 lg:fixed`).
- **`xl` (1280px)**: Maximum content container constraint (`max-w-7xl mx-auto`).
