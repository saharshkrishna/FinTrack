# Modal Layout Standard for FinTrack

## Reference: CashinModal.jsx

All modals (CashinModal, CashoutModal, DebitModal, CreditModal) should follow this standardized layout structure:

## Structure Overview

### 1. Modal Container
```jsx
<div
  className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-40"
  onClick={onClose}
>
```

### 2. Modal Content Container
```jsx
<div
  className="bg-white p-6 rounded-lg w-1/2"
  onClick={(e) => e.stopPropagation()}
>
```

### 3. Sticky Header Section
```jsx
<div className="sticky top-0 bg-white z-10 p-6 border-b">
  <div className="flex justify-between items-center">
    <h2 className="text-xl font-semibold">
      {/* Modal Title */}
    </h2>
    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
      <FiX className="w-6 h-6" />
    </button>
  </div>
</div>
```

### 4. Scrollable Content Area
```jsx
<div className="overflow-y-auto h-[calc(100vh-80px)] p-6">
  <form onSubmit={handleSubmit} className="space-y-4">
```

## Field Layout Standards

### Date Field (Top)
```jsx
<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-small text-gray-700">
      Date <span className="text-red-500">*</span>
    </label>
    <input
      type="date"
      value={formData.date}
      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
      className="w-3/4 p-2 border rounded-lg"
      required
    />
  </div>
</div>
```

### Amount Field
```jsx
<div>
  <label className="block text-sm font-small text-gray-700">
    Amount <span className="text-red-500">*</span>
  </label>
  <div className="flex gap-2">
    <input
      type="text"
      placeholder="eg. 890 or 100 + 200*3"
      value={inputValue}
      onChange={handleAmountChange}
      className="w-1/2 p-2 border rounded-lg"
      required
    />
  </div>
  {error && <div className="mt-1 text-sm text-red-500">{error}</div>}
  {calculatedValue && (
    <div className="mt-1 text-md text-black-500">Calculated Amount: {calculatedValue}</div>
  )}
</div>
```

### Three-Column Section (Party, Category, Payment Mode)
```jsx
<div className="grid grid-cols-3 gap-4">
  <div>
    <label className="block text-sm font-small text-gray-700">Party Name (Contact)</label>
    <div className="flex gap-2">
      <select
        value={formData.partyName}
        onChange={(e) => setFormData((prev) => ({ ...prev, partyName: e.target.value }))}
        className="w-full p-2 border rounded-lg"
      >
        <option value="">Select</option>
        {/* Options */}
      </select>
      <button
        type="button"
        onClick={() => setIsPartyModalOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        <FiPlus />
      </button>
    </div>
  </div>
  {/* Repeat for Category and Payment Mode */}
</div>
```

### Remarks Field
```jsx
<div>
  <label className="block text-sm font-small text-gray-700">Remarks</label>
  <textarea
    type="text"
    placeholder="e.g. Enter Details (Name, Bill No, Item Name, Quantity etc)"
    value={formData.remarks}
    onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
    className="w-3/4 h-[100px] p-2 border rounded-lg"
  />
</div>
```

### File Upload & Save Button Row
```jsx
<div className="flex justify-between items-center mt-4">
  {/* Attach Bills Section - Aligned Left */}
  <div className="flex items-center gap-3">
    <input
      type="file"
      id="fileInput"
      style={{ display: "none" }}
      onChange={handleFileChange}
      multiple
    />
    <button
      type="button"
      className="px-4 py-2 bg-blue-500 text-white rounded-lg shrink-0"
      onClick={() => document.getElementById("fileInput").click()}
    >
      📎 Attach Bills
    </button>
    {files.length > 0 && (
      <span className="text-sm text-gray-500 whitespace-nowrap">
        ({files.length} files selected)
      </span>
    )}
  </div>
  {/* Save Button - Aligned Right */}
  <div>
    <button
      type="submit"
      className="px-4 py-2 bg-green-600 text-white rounded-lg"
    >
      Save
    </button>
  </div>
</div>
```

### File List Display
```jsx
<div className="mt-2 min-h-[40px]">
  {files.length > 0 && (
    <div className="flex flex-wrap gap-2">
      {files.map((file, index) => (
        <div key={index} className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
          <span className="text-sm text-gray-700 truncate max-w-[150px]">{file.name}</span>
          <button
            onClick={() => handleRemoveFile(index)}
            className="text-sm text-red-500 hover:underline"
          >
            ❌
          </button>
        </div>
      ))}
    </div>
  )}
</div>
```

## Key Layout Principles

1. **Consistent Spacing**: Use `space-y-4` for form field spacing
2. **Grid Layouts**: 
   - `grid-cols-2` for Date field row
   - `grid-cols-3` for Party/Category/Payment row
3. **Input Widths**: 
   - Date input: `w-3/4`
   - Amount input: `w-1/2`
   - Remarks textarea: `w-3/4`
   - Dropdowns in grid: `w-full`
4. **Button Alignment**:
   - File upload button: Left
   - Save button: Right
   - Use `flex justify-between`
5. **Labels**: `text-sm font-small text-gray-700`
6. **Required Fields**: Add `<span className="text-red-500">*</span>`

## Modal-Specific Adjustments

### DebitModal & CreditModal
- Should have Party Name field (for loan tracking)
- May have additional fields like loan-specific information
- Keep same overall structure and field arrangement

### CashoutModal
- Identical to CashinModal structure
- Only difference is the modal title

## Implementation Checklist

- [ ] Modal container classes match
- [ ] Sticky header with proper padding and border
- [ ] Scrollable content area with correct height
- [ ] Date field in 2-column grid at top
- [ ] Amount field with calculator support
- [ ] Three-column grid for Party/Category/Payment
- [ ] Remarks textarea with correct width
- [ ] File upload and Save button in horizontal flex layout
- [ ] File list display with min-height
- [ ] All spacing and padding consistent
