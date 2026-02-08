# Multiple Involvements Fix

## Problem
Students with multiple involvements (performances/booths) were only showing one involvement instead of all of them. This was because the CSV parser was rejecting rows where `Shirt Size` and `Food` fields were empty.

## Root Cause
In the CSV file, students with multiple involvements have multiple rows:
- First row: Has all fields including Shirt Size and Food
- Subsequent rows: Only have Student ID, Name, Club, and Involvement (Shirt Size and Food are empty)

The CSV parser was treating these subsequent rows as validation errors and skipping them, so only the first involvement was being imported.

## Solution

### 1. Updated CSV Parser (`backend/src/services/CSVParser.ts`)
- Changed required fields from `['Student ID', 'Name', 'Shirt Size', 'Food']` to just `['Student ID', 'Name']`
- Allow empty Shirt Size and Food fields (they'll be filled during consolidation)
- All rows with Student ID and Name are now parsed successfully

### 2. Improved Consolidation Logic (`backend/src/dao/StudentDAO.ts`)
- Refactored `consolidateDuplicates()` to better handle empty fields
- Collects ALL organization details from all rows
- Finds the largest t-shirt size among non-empty values
- Uses the first non-empty meal preference
- Joins all involvements with semicolons

### 3. Updated Tests
- Modified CSV import tests to reflect new validation rules
- Tests now pass with the relaxed validation

## Result
Now when students with multiple involvements scan their QR code or enter their student ID:
- ✅ ALL their involvements are displayed
- ✅ The largest t-shirt size is shown (e.g., if they have XL and L, XL is shown)
- ✅ The meal preference from the first entry is used

## Examples from CSV

**Student 1010516 - Daniel Teo Yi Wei** (3 involvements):
- FUNKtion Club Booth
- FUNKtion Performance  
- DDZ Performance
- T-shirt: XXL (largest size)

**Student 1009369 - Nerissa Kho Wei Na** (2 involvements):
- FUNKtion Performance
- Winds Performance
- T-shirt: M

**Student 1009104 - Kaviya Babu** (your friend! 😄):
- DDZ Performance
- T-shirt: L
- Gets the John Cena easter egg! 🎺

## Deployment
To apply this fix:
1. The code changes are already in place
2. Re-import the CSV data to update the database:
   ```bash
   # Backend will auto-import on startup, or manually trigger re-import
   ```
3. Deploy to Vercel - the changes will take effect immediately

## Technical Details
The organization details are stored as a semicolon-separated string:
```
"Club: FUNKtion, Involvement: Performance; Club: DDZ, Involvement: Performance"
```

This is parsed by `parseOrganizationDetails()` in `backend/src/models/Student.ts` into an array:
```javascript
[
  { club: "FUNKtion", role: "Performance" },
  { club: "DDZ", role: "Performance" }
]
```

The frontend `InvolvementDisplay` component then renders each involvement as a separate card.
