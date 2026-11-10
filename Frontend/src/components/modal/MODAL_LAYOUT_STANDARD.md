# FinTrack Modern Modal Design System & Layout Standard

All modals across FinTrack follow this cohesive, modern design system.

---

## 1. Core Architecture

### Backdrop & Container
```jsx
<div
  className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in"
  onClick={onClose}
>
  <div
    className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
    onClick={(e) => e.stopPropagation()}
  >
```

### Header Bar (Sticky Top)
```jsx
<div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
  <div className="flex items-center gap-3">
    {/* Themed Icon Badge */}
    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shadow-2xs">
      <FiArrowUpRight className="text-xl" />
    </div>
    <div>
      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold text-slate-900 leading-tight">Modal Title</h2>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Tag
        </span>
      </div>
      <p className="text-xs text-slate-500">Subtitle description explaining action</p>
    </div>
  </div>
  <button
    onClick={onClose}
    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
  >
    <FiX className="text-lg" />
  </button>
</div>
```

---

## 2. Color Themes by Transaction Type

| Modal | Theme | Icon Badge | Submit Button |
|---|---|---|---|
| **Cash In** | Emerald | `bg-emerald-50 text-emerald-600 border-emerald-200/60` | `bg-emerald-600 hover:bg-emerald-700` |
| **Cash Out** | Rose | `bg-rose-50 text-rose-600 border-rose-200/60` | `bg-rose-600 hover:bg-rose-700` |
| **Credit** | Blue | `bg-blue-50 text-blue-600 border-blue-200/60` | `bg-blue-600 hover:bg-blue-700` |
| **Debit** | Amber | `bg-amber-50 text-amber-600 border-amber-200/60` | `bg-amber-600 hover:bg-amber-700` |
| **Loan** | Indigo | `bg-indigo-50 text-indigo-600 border-indigo-200/60` | `bg-indigo-600 hover:bg-indigo-700` |
| **Loan Repayment** | Purple | `bg-purple-50 text-purple-600 border-purple-200/60` | `bg-purple-600 hover:bg-purple-700` |
| **Invoice / Billing** | Slate / Blue | `bg-blue-600 text-white shadow-xs` | `bg-blue-600 hover:bg-blue-700` |

---

## 3. Form Input Standards

### Labels & Fields
- Label: `block text-xs font-semibold text-slate-700 mb-1.5`
- Required: `<span className="text-rose-500">*</span>`
- Inputs & Selects:
  ```jsx
  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
  ```
- Evaluated Amount Badge:
  ```jsx
  <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
    = ₹{Number(calculatedValue).toLocaleString("en-IN")}
  </span>
  ```

---

## 4. Footer Actions
```jsx
<div className="pt-4 border-t border-slate-100 flex items-center justify-between">
  <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
  >
    Cancel
  </button>
  <button
    type="submit"
    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
  >
    <FiCheck className="text-sm" />
    <span>Save Entry</span>
  </button>
</div>
```
