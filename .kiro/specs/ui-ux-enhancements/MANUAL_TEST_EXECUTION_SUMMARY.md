# Manual Test Execution Summary: Task 16.1

**Test Date:** 2024
**Task:** 16.1 Test end-to-end participant flow
**Status:** ✅ READY FOR MANUAL EXECUTION

## Test Environment Setup

### Servers Running
- ✅ **Backend Server:** http://localhost:3000 (Express + TypeScript)
- ✅ **Frontend Server:** http://localhost:5173 (Vite + React)
- ✅ **Database:** PostgreSQL with 226 student records loaded
- ✅ **Assets:** ROOT logo and easter egg video present

### Database Status
```
Total Students: 226
Sample Student IDs:
  - 1004209: CHEN YIRONG
  - 1005780: Bek Jun Bervin
  - 1006062: Cephas Yeo
  - 1006564: Salman Munthaseer Rahmathulla
  - 1006638: Isaac Lim Jun Jie
  - 1009104: Kaviya Babu (EASTER EGG ID) ⭐
```

### API Verification
✅ Validated `/api/validate` endpoint works correctly
✅ Confirmed student ID 1009104 exists in database
✅ Verified `/api/students/all` returns all records

## Quick Test Guide

### Access the Application
1. Open browser: **http://localhost:5173**
2. You should see the student check-in form with:
   - ROOT logo (white)
   - Maroon background (#53001b)
   - White text
   - Student ID input field

### Test Scenarios to Execute

#### ✅ Scenario 1: Standard Flow (Non-Easter Egg)
**Test with:** Student ID `1004209` or `1005780`

**Steps:**
1. Enter student ID
2. Click Submit
3. ✓ Verify consent screen appears
4. ✓ Verify consent text: "I consent to my information being used properly and it will be properly disposed after the event"
5. Check the consent checkbox
6. ✓ Verify QR code displays automatically
7. ✓ Verify collection status shows (Shirt/Meal)
8. ✓ Verify "Start Over" button is visible
9. Click "Start Over"
10. ✓ Verify return to student ID form

**Expected:** No easter egg (unless random 1/75 chance)

---

#### ⭐ Scenario 2: Easter Egg Flow (ALWAYS TRIGGERS)
**Test with:** Student ID `1009104` (Kaviya Babu)

**Steps:**
1. Enter student ID: **1009104**
2. Click Submit
3. ✓ Verify easter egg video plays immediately
4. ✓ Verify full-screen black overlay
5. ✓ Verify confetti animation appears (~1.8 seconds)
6. ✓ Wait for video to complete
7. ✓ Wait for 3-second delay after video
8. ✓ Verify consent screen appears
9. Check consent checkbox
10. ✓ Verify QR code displays
11. ✓ Verify collection status shows
12. Click "Start Over"

**Expected:** Easter egg ALWAYS appears for this ID

---

#### 🎲 Scenario 3: Random Easter Egg (1/75 Probability)
**Test with:** Various IDs (NOT 1009104)

**Steps:**
1. Try multiple student IDs: 1004209, 1005780, 1006062, etc.
2. Submit each one
3. ✓ Observe if easter egg appears randomly
4. ✓ If it appears, verify same behavior as Scenario 2

**Expected:** ~1.33% chance per submission

---

#### 🔒 Scenario 4: Consent Prevents QR Display
**Test with:** Any valid student ID

**Steps:**
1. Enter student ID and submit
2. Wait for consent screen
3. ✓ DO NOT check the consent checkbox
4. ✓ Verify QR code does NOT display
5. ✓ Verify only consent screen is visible
6. Now check the consent checkbox
7. ✓ Verify QR code appears immediately

**Expected:** QR code only shows after consent

---

#### 📊 Scenario 5: Collection Status Display
**Test with:** Any valid student ID

**Steps:**
1. Complete flow to QR display
2. ✓ Verify "Collection Status" section exists
3. ✓ Verify "Shirt Collected: Yes/No" displays
4. ✓ Verify "Meal Collected: Yes/No" displays
5. ✓ Verify status is clearly labeled
6. ✓ Verify layout is clean

**Expected:** Collection status visible and accurate

---

#### 🔄 Scenario 6: Start Over Button
**Test with:** Any valid student ID

**Steps:**
1. Complete full flow to QR display
2. ✓ Locate "Start Over" button
3. ✓ Verify button text is "Start Over" (not "Generate New QR Code")
4. Click "Start Over"
5. ✓ Verify navigation to student ID form
6. ✓ Verify form is empty/reset
7. Enter different student ID
8. ✓ Verify new flow works independently

**Expected:** Complete state reset

---

#### ❌ Scenario 7: Error Handling
**Test with:** Invalid ID `9999999`

**Steps:**
1. Enter invalid student ID: 9999999
2. Click Submit
3. ✓ Verify error message displays
4. ✓ Verify error is user-friendly
5. Enter valid student ID
6. ✓ Verify recovery works

**Expected:** Graceful error handling

---

## Visual Verification Checklist

### Global Styling
- [ ] Background color is #53001b (maroon) on all screens
- [ ] Text on background is white
- [ ] ROOT logo displays (not SUTD logo)
- [ ] Logo is properly sized and visible

### Student ID Form
- [ ] Input field is clearly visible
- [ ] Submit button is prominent
- [ ] Loading state shows during validation
- [ ] Error messages are readable

### Consent Screen
- [ ] Consent text is complete and readable
- [ ] Checkbox is large enough to click
- [ ] Checkbox state is visually clear
- [ ] Layout is clean and professional

### QR Display Screen
- [ ] QR code is large and scannable
- [ ] Student information displays correctly
- [ ] Collection status section is visible
- [ ] "Start Over" button is prominent
- [ ] Layout is organized and clean

### Easter Egg
- [ ] Video plays full screen
- [ ] Confetti animation is visible
- [ ] Transition is smooth
- [ ] Cannot be skipped with Escape key

---

## Requirements Validation Matrix

| Requirement | Description | Test Scenario | Status |
|-------------|-------------|---------------|--------|
| 2.1 | Shirt collection status displayed | Scenario 5 | ⏳ Pending |
| 2.2 | Meal collection status displayed | Scenario 5 | ⏳ Pending |
| 2.3 | Clean layout alongside QR code | Scenario 5 | ⏳ Pending |
| 3.1 | "Start Over" button displayed | Scenario 6 | ⏳ Pending |
| 3.2 | Button navigates to form | Scenario 6 | ⏳ Pending |
| 3.3 | Button clears form state | Scenario 6 | ⏳ Pending |
| 4.1 | Consent screen after ID submission | Scenarios 1, 2 | ⏳ Pending |
| 4.2 | Consent checkbox displays text | Scenario 4 | ⏳ Pending |
| 4.3 | QR prevented without consent | Scenario 4 | ⏳ Pending |
| 4.4 | QR displays with consent | Scenario 4 | ⏳ Pending |
| 4.5 | Consent stored in database | Scenario 4 | ⏳ Pending |
| 4.6 | Consent persists | Scenario 4 | ⏳ Pending |
| 5.1 | ID 1009104 always shows easter egg | Scenario 2 | ⏳ Pending |
| 5.2 | Other IDs show 1/75 probability | Scenario 3 | ⏳ Pending |
| 5.3 | Random per session | Scenario 3 | ⏳ Pending |

---

## Test Data Reference

### Valid Student IDs for Testing
```
Standard Testing:
- 1004209: CHEN YIRONG
- 1005780: Bek Jun Bervin
- 1006062: Cephas Yeo
- 1006564: Salman Munthaseer Rahmathulla
- 1006638: Isaac Lim Jun Jie

Easter Egg Testing:
- 1009104: Kaviya Babu ⭐ (ALWAYS triggers easter egg)

Error Testing:
- 9999999: Invalid ID (not in database)
```

### API Endpoints
```
POST /api/validate
  Body: { "studentId": "1009104" }
  Response: { success, student, qrCode, token, collectionStatus }

POST /api/consent
  Body: { "studentId": "1009104", "consented": true }
  Response: { success, message }

GET /api/students/all
  Response: { students[], total }
```

---

## Browser DevTools Verification

### Network Tab Checks
1. Open DevTools (F12) → Network tab
2. Submit student ID
3. ✓ Verify POST to `/api/validate`
4. Check consent checkbox
5. ✓ Verify POST to `/api/consent`
6. ✓ Verify request payload: `{ studentId, consented: true }`
7. ✓ Verify successful responses

### Console Tab Checks
1. Open DevTools (F12) → Console tab
2. ✓ Verify no errors during normal flow
3. ✓ Verify no warnings (except expected ones)
4. ✓ Check for any failed network requests

---

## Component Flow Verification

### Participant Journey Map
```
┌─────────────────┐
│  Student ID     │
│  Input Form     │
└────────┬────────┘
         │ Submit
         ↓
    ┌────────┐
    │ Easter │ (1009104: Always)
    │  Egg?  │ (Others: 1/75)
    └───┬────┘
        │
        ↓
┌─────────────────┐
│  PDPA Consent   │
│  Screen         │
└────────┬────────┘
         │ Check Consent
         ↓
┌─────────────────┐
│  QR Code        │
│  Display        │
│  + Collection   │
│    Status       │
└────────┬────────┘
         │ Start Over
         ↓
    (Back to Start)
```

---

## Known Issues / Notes

### Assets Required
- ✅ `/ROOT_logo_white-03.png` - Present in public directory
- ✅ `/Cenafy John Cena.mp4` - Present in public directory

### Database State
- ✅ 226 student records loaded from CSV
- ✅ Student ID 1009104 exists (Kaviya Babu)
- ✅ All students have default collection status (false)
- ✅ Consent states can be updated via API

### Easter Egg Behavior
- Easter egg video requires user interaction in some browsers (autoplay policy)
- Confetti animation appears at ~1.8 seconds into video
- 3-second delay after video before showing consent screen
- Escape key is disabled during easter egg

### Consent Recording
- Consent is recorded immediately when checkbox is checked
- API call happens automatically (no separate submit button)
- If API fails, checkbox is unchecked automatically
- Consent state persists in database

---

## Test Execution Instructions

### For Manual Tester

1. **Start Testing:**
   - Open http://localhost:5173 in browser
   - Open DevTools (F12) for network inspection
   - Have this document open for reference

2. **Execute Each Scenario:**
   - Work through scenarios 1-7 in order
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

## Success Criteria

All of the following must be verified:

✅ **Participant Flow:**
- [ ] Student can enter ID and submit
- [ ] Easter egg appears for ID 1009104
- [ ] Consent screen appears after validation
- [ ] QR code displays after consent
- [ ] Collection status is shown correctly
- [ ] "Start Over" button works

✅ **Visual Branding:**
- [ ] Background color is #53001b
- [ ] Text on background is white
- [ ] ROOT logo displays correctly

✅ **Functionality:**
- [ ] Consent prevents QR display when unchecked
- [ ] Consent enables QR display when checked
- [ ] Consent is recorded in database
- [ ] Collection status displays accurately
- [ ] Navigation works correctly
- [ ] State resets properly

✅ **Error Handling:**
- [ ] Invalid IDs show error messages
- [ ] Recovery from errors works
- [ ] No application crashes

---

## Completion Checklist

- [ ] All 7 test scenarios executed
- [ ] Visual verification checklist completed
- [ ] Requirements validation matrix updated
- [ ] Browser DevTools checks performed
- [ ] Screenshots captured (optional)
- [ ] Issues documented (if any)
- [ ] Test report updated with results

---

## Next Steps

After completing manual testing:

1. Update this document with test results
2. Mark requirements as Pass/Fail in validation matrix
3. Document any issues found
4. Report completion to project team
5. Proceed to Task 16.2 (Admin flow testing)

---

**Report Status:** ✅ READY FOR EXECUTION
**Test Environment:** ✅ VERIFIED AND RUNNING
**Test Data:** ✅ LOADED AND VALIDATED
**Documentation:** ✅ COMPLETE

**Tester:** Please execute the test scenarios above and update the checkboxes and status fields as you complete each verification.
