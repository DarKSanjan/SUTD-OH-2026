# Manual Test Execution Summary: Task 16.2 - Admin Flow

**Test Date:** 2024
**Task:** 16.2 Test end-to-end admin flow
**Status:** ✅ READY FOR MANUAL EXECUTION

## Test Environment Setup

### Servers Running
- ✅ **Backend Server:** http://localhost:3000 (Express + TypeScript)
- ✅ **Frontend Server:** http://localhost:5173 (Vite + React)
- ✅ **Database:** PostgreSQL with 226 student records loaded
- ✅ **Admin URL:** http://localhost:5173/admin

### Admin Credentials
```
Password: Linda47$2
```

### Database Status
```
Total Students: 226
Sample Student IDs for Testing:
  - 1004209: CHEN YIRONG
  - 1005780: Bek Jun Bervin
  - 1006062: Cephas Yeo
  - 1009104: Kaviya Babu (EASTER EGG ID) ⭐
```

## Quick Test Guide

### Access the Admin Panel
1. Open browser: **http://localhost:5173/admin**
2. You should see the admin login screen with:
   - ROOT logo (white)
   - Maroon background (#53001b)
   - White text
   - Password input field
   - "Admin Access" title

---

## Core Test Scenarios

### ✅ Scenario 1: Admin Login (Correct Password)
**Password:** `Linda47$2`

**Steps:**
1. Navigate to http://localhost:5173/admin
2. Enter password: **Linda47$2**
3. Click "Login" or press Enter
4. ✓ Verify successful login
5. ✓ Verify admin dashboard appears
6. ✓ Verify two tabs: "Scanner" and "Database View"

**Expected:** Immediate access to admin dashboard

---

### ❌ Scenario 2: Admin Login (Incorrect Password)
**Test Passwords:** `wrongpassword`, `Linda47`, `linda47$2`

**Steps:**
1. Navigate to http://localhost:5173/admin
2. Enter incorrect password
3. Click "Login"
4. ✓ Verify error message: "Incorrect password. Please try again."
5. ✓ Verify error is displayed in red
6. ✓ Verify user remains on login screen
7. Enter correct password: **Linda47$2**
8. ✓ Verify successful login

**Expected:** Error message for incorrect password, access denied

---

### 📱 Scenario 3: QR Scanner Tab
**Steps:**
1. Login with correct password
2. ✓ Verify "Scanner" tab is active by default
3. ✓ Verify QR scanner component displays
4. Grant camera permission if prompted
5. ✓ Verify camera feed displays
6. ✓ Verify scanning instructions: "Point camera at QR code"

**Expected:** QR scanner ready to scan codes

---

### 🗄️ Scenario 4: Database View Tab
**Steps:**
1. Login to admin dashboard
2. Click "Database View" tab
3. ✓ Verify tab switches to Database View
4. ✓ Verify loading indicator appears
5. ✓ Verify table displays after loading
6. ✓ Verify all 226 student records are shown
7. ✓ Verify 5 columns: Student ID, Name, Shirt, Meal, Consent
8. ✓ Verify status icons (✓/✗) display correctly
9. ✓ Verify table is scrollable
10. ✓ Verify table is read-only (no editing controls)

**Expected:** Complete database table with all records

---

### ✅ Scenario 5: Bidirectional Checkboxes - Checking
**Steps:**
1. Generate a QR code from participant flow (http://localhost:5173)
   - Enter student ID: 1009104
   - Complete consent
   - QR code displays
2. Return to admin panel (Scanner tab)
3. Scan the QR code
4. ✓ Verify student information displays
5. ✓ Verify claim checkboxes appear
6. ✓ Verify initial status (both unchecked for new students)
7. Click "T-Shirt" checkbox
8. ✓ Verify checkbox becomes checked
9. ✓ Verify success message: "✓ T-Shirt marked as collected successfully!"
10. Click "Meal Coupon" checkbox
11. ✓ Verify checkbox becomes checked
12. ✓ Verify success message: "✓ Meal Coupon marked as collected successfully!"

**Expected:** Both checkboxes can be checked, success messages display

---

### ↩️ Scenario 6: Bidirectional Checkboxes - Unchecking
**Steps:**
1. Continue from Scenario 5 (both checkboxes checked)
2. Click "T-Shirt" checkbox again
3. ✓ Verify checkbox becomes unchecked
4. ✓ Verify success message: "✓ T-Shirt unmarked successfully!"
5. Click "Meal Coupon" checkbox again
6. ✓ Verify checkbox becomes unchecked
7. ✓ Verify success message: "✓ Meal Coupon unmarked successfully!"
8. Switch to "Database View" tab
9. ✓ Verify student's status is updated in table

**Expected:** Checkboxes can be unchecked, database updates reflect in table

---

### 🔄 Scenario 7: Tab Navigation
**Steps:**
1. Login to admin dashboard
2. ✓ Verify "Scanner" tab is active (highlighted)
3. Click "Database View" tab
4. ✓ Verify tab switches
5. ✓ Verify "Database View" tab is now active (highlighted)
6. ✓ Verify database table displays
7. Click "Scanner" tab
8. ✓ Verify tab switches back
9. ✓ Verify "Scanner" tab is active
10. ✓ Verify scanner displays

**Expected:** Smooth tab navigation, active tab is highlighted

---

### 📊 Scenario 8: Data Consistency Verification
**Steps:**
1. Navigate to "Database View" tab
2. Find student ID 1009104 in the table
3. Note their current Shirt and Meal status
4. Switch to "Scanner" tab
5. Scan student ID 1009104's QR code
6. Change their Shirt status (check or uncheck)
7. Switch back to "Database View" tab
8. ✓ Verify student's Shirt status is updated in table
9. ✓ Verify data consistency between Scanner and Database View

**Expected:** Status changes in Scanner reflect in Database View

---

### 🔢 Scenario 9: Scan Counter
**Steps:**
1. Login to admin dashboard
2. ✓ Observe scan counter in header (initially 0 or hidden)
3. Scan a student QR code
4. ✓ Verify scan counter displays: "Scans today: 1"
5. Click "Scan Another Student"
6. Scan another QR code
7. ✓ Verify scan counter increments: "Scans today: 2"
8. ✓ Verify counter persists during session

**Expected:** Scan counter increments with each successful scan

---

### 🎨 Scenario 10: Visual Branding
**Steps:**
1. Login to admin dashboard
2. ✓ Verify background color is #53001b (maroon) on all screens
3. ✓ Verify text on background is white
4. ✓ Verify ROOT logo displays (not SUTD logo)
5. ✓ Verify logo is white/inverted for visibility
6. Switch between tabs
7. ✓ Verify consistent branding across all screens

**Expected:** Consistent maroon background, white text, ROOT logo

---

## Visual Verification Checklist

### Admin Login Screen
- [ ] Background color: #53001b (maroon)
- [ ] Text color: white
- [ ] ROOT logo: visible and white
- [ ] Password input: clearly visible
- [ ] Login button: prominent
- [ ] Error messages: red background, clear text

### Admin Dashboard
- [ ] Background color: #53001b
- [ ] ROOT logo in header
- [ ] Title: "SUTD Open House 2026"
- [ ] Subtitle: "Event Check-In Station"
- [ ] Two tabs: "Scanner" and "Database View"
- [ ] Active tab: highlighted (purple gradient)
- [ ] Scan counter: displays after first scan

### Scanner Tab
- [ ] QR scanner component: visible
- [ ] Camera feed: displays
- [ ] Scanning instructions: clear
- [ ] Student info card: displays after scan
- [ ] Claim checkboxes: visible and functional
- [ ] "Scan Another Student" button: prominent

### Database View Tab
- [ ] Table: displays all records
- [ ] Table header: purple gradient background
- [ ] Columns: Student ID, Name, Shirt, Meal, Consent
- [ ] Status icons: ✓ (green) and ✗ (red)
- [ ] Table rows: readable, hover effects
- [ ] Scrolling: works for long lists

### Claim Checkboxes
- [ ] Checkboxes: large and clickable
- [ ] Labels: "T-Shirt" and "Meal Coupon"
- [ ] Checked state: green background, checkmark
- [ ] Unchecked state: white background, empty
- [ ] Success messages: green background, clear text
- [ ] Loading spinners: display during updates

---

## Requirements Validation Matrix

| Requirement | Description | Test Scenario | Status |
|-------------|-------------|---------------|--------|
| 6.1 | Password login form displays | Scenario 1 | ⏳ Pending |
| 6.2 | Password "Linda47$2" grants access | Scenario 1 | ⏳ Pending |
| 6.3 | Incorrect password denies access | Scenario 2 | ⏳ Pending |
| 6.4 | Hardcoded password check | Scenarios 1-2 | ⏳ Pending |
| 7.1 | Admin can check checkboxes | Scenario 5 | ⏳ Pending |
| 7.2 | Admin can uncheck checkboxes | Scenario 6 | ⏳ Pending |
| 7.3 | Database updates immediately | Scenarios 5-6 | ⏳ Pending |
| 7.4 | UI reflects new state | Scenarios 5-6 | ⏳ Pending |
| 8.1 | Database View accessible | Scenario 4 | ⏳ Pending |
| 8.2 | Table displays all records | Scenario 4 | ⏳ Pending |
| 8.3 | Table shows all fields | Scenario 4 | ⏳ Pending |
| 8.4 | Table is read-only | Scenario 4 | ⏳ Pending |
| 8.5 | Database View as separate tab | Scenarios 4, 7 | ⏳ Pending |

---

## Test Data Reference

### Admin Credentials
```
Correct Password: Linda47$2

Incorrect Passwords (for testing):
- wrongpassword
- Linda47 (missing $2)
- linda47$2 (lowercase L)
- Linda47$ (missing 2)
- Linda47$2  (trailing space)
```

### Test Student IDs
```
Standard Testing:
- 1004209: CHEN YIRONG
- 1005780: Bek Jun Bervin
- 1006062: Cephas Yeo

Easter Egg Testing:
- 1009104: Kaviya Babu ⭐ (ALWAYS triggers easter egg)
```

### API Endpoints (for reference)
```
POST /api/scan
  Body: { "token": "..." }
  Response: { success, student, claims }

PATCH /api/distribution-status
  Body: { "studentId": "...", "itemType": "tshirt|meal", "collected": true|false }
  Response: { success, updatedStatus }

GET /api/students/all
  Response: { success, students[], total }
```

---

## Browser DevTools Verification

### Network Tab Checks
1. Open DevTools (F12) → Network tab
2. Login with password
3. ✓ Verify no API calls (hardcoded password check)
4. Scan QR code
5. ✓ Verify POST to `/api/scan`
6. Check/uncheck checkbox
7. ✓ Verify PATCH to `/api/distribution-status`
8. Switch to Database View
9. ✓ Verify GET to `/api/students/all`

### Console Tab Checks
1. Open DevTools (F12) → Console tab
2. ✓ Verify no errors during normal flow
3. ✓ Verify no warnings (except expected ones)
4. ✓ Check for any failed network requests

---

## Known Issues / Notes

### Admin Password
- Password is hardcoded: "Linda47$2"
- Case-sensitive (must match exactly)
- No password reset functionality
- No session timeout (remains logged in)

### QR Scanner
- Requires camera permission
- Works best with back camera on mobile
- May require good lighting
- Invalid QR codes show error messages

### Bidirectional Checkboxes
- Updates database immediately
- Success messages auto-dismiss after 3 seconds
- Loading spinners during API calls
- Optimistic UI updates (reverts on error)

### Database View
- Shows all 226 student records
- Table is scrollable
- Read-only (no editing)
- Refreshes when tab is activated

---

## Success Criteria

All of the following must be verified:

✅ **Admin Authentication:**
- [ ] Login screen appears first
- [ ] Password "Linda47$2" grants access
- [ ] Incorrect passwords are rejected
- [ ] Error messages display correctly

✅ **Tab Navigation:**
- [ ] Two tabs: "Scanner" and "Database View"
- [ ] Tab switching works
- [ ] Active tab is highlighted
- [ ] Content changes with tab

✅ **QR Scanner:**
- [ ] Camera access works
- [ ] QR codes can be scanned
- [ ] Student information displays
- [ ] Scan counter increments

✅ **Bidirectional Checkboxes:**
- [ ] Can check checkboxes
- [ ] Can uncheck checkboxes
- [ ] Database updates immediately
- [ ] UI reflects changes
- [ ] Success messages display

✅ **Database View:**
- [ ] All 226 records display
- [ ] All 5 columns present
- [ ] Data is accurate
- [ ] Table is read-only
- [ ] Status icons display

✅ **Visual Branding:**
- [ ] Background: #53001b
- [ ] Text: white
- [ ] ROOT logo displays

---

## Test Execution Instructions

### For Manual Tester

1. **Start Testing:**
   - Open http://localhost:5173/admin in browser
   - Open DevTools (F12) for network inspection
   - Have this document open for reference
   - Have admin password ready: **Linda47$2**

2. **Execute Each Scenario:**
   - Work through scenarios 1-10 in order
   - Check off items as you verify them
   - Document any issues or unexpected behavior
   - Take screenshots if needed

3. **Update Results:**
   - Mark each requirement as ✅ Pass or ❌ Fail
   - Note any deviations from expected behavior
   - Document any bugs or concerns

4. **Final Verification:**
   - Review visual checklist
   - Verify all requirements are tested
   - Complete requirements validation matrix

---

## How to Generate Test QR Codes

To test the QR scanner:

1. Open http://localhost:5173 (participant flow)
2. Enter student ID: **1009104**
3. Wait for easter egg (if it plays)
4. Check consent checkbox
5. QR code displays
6. Use this QR code to test admin scanner

---

## Recommended Testing Order

1. **Admin Login** (Scenarios 1-2)
   - Test correct password
   - Test incorrect passwords
   - Verify error handling

2. **Tab Navigation** (Scenario 7)
   - Test tab switching
   - Verify active tab highlighting
   - Check content changes

3. **QR Scanner** (Scenario 3)
   - Test camera access
   - Verify scanner displays
   - Check scanning instructions

4. **Bidirectional Checkboxes** (Scenarios 5-6)
   - Test checking items
   - Test unchecking items
   - Verify success messages
   - Check database updates

5. **Database View** (Scenarios 4, 8)
   - Test table display
   - Verify all records
   - Check data accuracy
   - Verify read-only

6. **Additional Features** (Scenarios 9-10)
   - Test scan counter
   - Verify visual branding

---

## Completion Checklist

- [ ] All 10 test scenarios executed
- [ ] Visual verification checklist completed
- [ ] Requirements validation matrix updated
- [ ] Browser DevTools checks performed
- [ ] Screenshots captured (optional)
- [ ] Issues documented (if any)
- [ ] Test report updated with results

---

## Next Steps

After completing manual testing:

1. Update MANUAL_TEST_REPORT_16.2.md with results
2. Mark requirements as Pass/Fail
3. Document any issues found
4. Report completion to project team
5. Proceed to Task 16.3 (Visual branding verification)

---

**Report Status:** ✅ READY FOR EXECUTION
**Test Environment:** ✅ VERIFIED AND RUNNING
**Admin Password:** ✅ Linda47$2
**Documentation:** ✅ COMPLETE

**Tester:** Please execute the test scenarios above and update the checkboxes and status fields as you complete each verification.

---

**Quick Start:**
1. Open http://localhost:5173/admin
2. Enter password: **Linda47$2**
3. Test Scanner tab
4. Test Database View tab
5. Test bidirectional checkboxes
6. Verify visual branding

**End of Execution Summary**
