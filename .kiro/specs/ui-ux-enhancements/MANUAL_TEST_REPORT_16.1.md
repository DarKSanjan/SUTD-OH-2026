# Manual Test Report: Task 16.1 - End-to-End Participant Flow

**Test Date:** 2024
**Tester:** Automated Documentation
**Task:** 16.1 Test end-to-end participant flow
**Application URL:** http://localhost:5173

## Test Environment

- **Backend Server:** Running on port 3000 (Express + TypeScript)
- **Frontend Server:** Running on port 5173 (Vite + React)
- **Database:** PostgreSQL with 98 student records loaded
- **Browser:** Chrome/Firefox (recommended for testing)

## Test Objectives

Verify the complete participant journey through the check-in system:
1. Student can enter ID and submit
2. Easter egg appears for ID 1009104
3. Consent screen appears after validation
4. QR code displays after consent
5. Collection status is shown correctly
6. "Start Over" button works

## Test Scenarios

### Scenario 1: Standard Participant Flow (Non-Easter Egg)

**Test Steps:**
1. Navigate to http://localhost:5173
2. Enter a valid student ID (e.g., 1001234, 1002345, etc.)
3. Click "Submit" or press Enter
4. Observe the consent screen
5. Read the consent text
6. Check the consent checkbox
7. Observe the QR code display
8. Verify collection status display
9. Click "Start Over" button
10. Verify return to student ID form

**Expected Results:**
- ✓ Student ID form displays with input field and submit button
- ✓ Loading state shows during validation
- ✓ Consent screen appears with checkbox and text: "I consent to my information being used properly and it will be properly disposed after the event"
- ✓ QR code is NOT displayed until consent checkbox is checked
- ✓ After checking consent, QR code displays automatically
- ✓ Collection status shows:
  - "Shirt Collected: Yes/No"
  - "Meal Collected: Yes/No"
- ✓ "Start Over" button is visible and clickable
- ✓ Clicking "Start Over" returns to student ID form
- ✓ Form state is cleared (no previous data visible)

**Test Data:**
- Valid Student IDs: 1001234, 1002345, 1003456, etc. (any from database)
- Expected: No easter egg for these IDs (unless random 1/75 chance)

**Validation Points:**
- [ ] Student ID input accepts numeric input
- [ ] Submit button triggers validation
- [ ] Consent screen appears after successful validation
- [ ] Consent checkbox must be checked to proceed
- [ ] QR code displays after consent
- [ ] Collection status is accurate (matches database)
- [ ] "Start Over" button navigates back to form
- [ ] Form state is cleared on reset

---

### Scenario 2: Easter Egg Flow (Student ID 1009104)

**Test Steps:**
1. Navigate to http://localhost:5173
2. Enter student ID: **1009104**
3. Click "Submit" or press Enter
4. Observe the easter egg video
5. Wait for video to complete
6. Wait for automatic transition (3 seconds after video)
7. Observe the consent screen
8. Check the consent checkbox
9. Observe the QR code display
10. Verify collection status
11. Click "Start Over"

**Expected Results:**
- ✓ Easter egg video plays immediately after submission
- ✓ Video plays with full screen overlay (black background)
- ✓ Confetti animation appears during video (at ~1.8 seconds)
- ✓ Video cannot be skipped or closed with Escape key
- ✓ After video ends, automatic 3-second delay occurs
- ✓ Consent screen appears after delay
- ✓ Rest of flow matches Scenario 1

**Test Data:**
- Special Student ID: **1009104**
- Expected: Easter egg ALWAYS appears for this ID

**Validation Points:**
- [ ] Easter egg triggers for ID 1009104
- [ ] Video plays automatically
- [ ] Confetti animation displays
- [ ] Video cannot be interrupted
- [ ] Automatic transition to consent screen
- [ ] Consent and QR flow works after easter egg
- [ ] "Start Over" works after easter egg flow

---

### Scenario 3: Random Easter Egg (1/75 Probability)

**Test Steps:**
1. Navigate to http://localhost:5173
2. Enter various valid student IDs (NOT 1009104)
3. Submit multiple times with different IDs
4. Observe if easter egg appears randomly
5. If easter egg appears, verify it follows same flow as Scenario 2

**Expected Results:**
- ✓ Easter egg appears approximately 1 in 75 submissions
- ✓ When it appears, behavior matches Scenario 2
- ✓ Easter egg is independent per session (random each time)

**Test Data:**
- Various Student IDs: 1001234, 1002345, 1003456, etc.
- Expected: ~1.33% chance of easter egg per submission

**Validation Points:**
- [ ] Easter egg can appear for non-special IDs
- [ ] Probability is random (varies between sessions)
- [ ] Easter egg flow is identical to Scenario 2 when triggered

---

### Scenario 4: Consent Recording Verification

**Test Steps:**
1. Navigate to http://localhost:5173
2. Enter a valid student ID
3. Submit and wait for consent screen
4. Check the consent checkbox
5. Observe that consent is recorded (QR appears)
6. Open browser DevTools Network tab
7. Verify POST request to /api/consent
8. Check request payload contains studentId and consented: true

**Expected Results:**
- ✓ Checking consent checkbox triggers API call
- ✓ POST /api/consent endpoint is called
- ✓ Request payload: { studentId: "...", consented: true }
- ✓ Response indicates success
- ✓ QR code displays after successful consent recording

**Validation Points:**
- [ ] Consent checkbox triggers API call
- [ ] API endpoint is correct (/api/consent)
- [ ] Request payload is correct
- [ ] Response is successful
- [ ] Consent is persisted in database

---

### Scenario 5: Consent Prevents QR Display

**Test Steps:**
1. Navigate to http://localhost:5173
2. Enter a valid student ID
3. Submit and wait for consent screen
4. Do NOT check the consent checkbox
5. Observe that QR code does NOT display
6. Verify only consent screen is visible

**Expected Results:**
- ✓ QR code is NOT visible when consent is unchecked
- ✓ Only consent screen and checkbox are displayed
- ✓ No way to proceed without checking consent

**Validation Points:**
- [ ] QR code is hidden without consent
- [ ] Consent checkbox is required
- [ ] No bypass mechanism exists

---

### Scenario 6: Collection Status Display

**Test Steps:**
1. Navigate to http://localhost:5173
2. Enter a student ID with known collection status
3. Complete consent flow
4. Observe collection status on QR display screen
5. Verify status matches database records

**Expected Results:**
- ✓ Collection status section is visible
- ✓ Shirt collection status displays correctly
- ✓ Meal collection status displays correctly
- ✓ Status uses clear labels (e.g., "Shirt Collected: Yes")
- ✓ Status is accurate (matches database)

**Test Data:**
- Test with students who have:
  - Both items collected
  - Only shirt collected
  - Only meal collected
  - Neither item collected

**Validation Points:**
- [ ] Collection status section exists
- [ ] Shirt status is accurate
- [ ] Meal status is accurate
- [ ] Status is clearly labeled
- [ ] Status updates reflect database state

---

### Scenario 7: "Start Over" Button Functionality

**Test Steps:**
1. Complete full participant flow to QR display
2. Locate "Start Over" button on QR display screen
3. Click "Start Over" button
4. Observe navigation back to student ID form
5. Verify form is empty/reset
6. Enter a different student ID
7. Verify new flow works correctly

**Expected Results:**
- ✓ "Start Over" button is visible on QR display
- ✓ Button is clearly labeled "Start Over"
- ✓ Clicking button navigates to student ID form
- ✓ Previous form state is cleared
- ✓ Previous validation result is cleared
- ✓ Previous consent state is cleared
- ✓ New submission works independently

**Validation Points:**
- [ ] "Start Over" button exists
- [ ] Button is clickable
- [ ] Navigation works correctly
- [ ] State is fully reset
- [ ] New flow is independent

---

### Scenario 8: Error Handling

**Test Steps:**
1. Navigate to http://localhost:5173
2. Enter an invalid student ID (e.g., 9999999)
3. Submit and observe error handling
4. Enter a valid student ID
5. Verify recovery from error state

**Expected Results:**
- ✓ Error message displays for invalid ID
- ✓ Error message is clear and user-friendly
- ✓ User can retry with different ID
- ✓ Error state clears on new submission

**Validation Points:**
- [ ] Error messages display correctly
- [ ] Error handling is graceful
- [ ] Recovery from errors works
- [ ] No application crashes

---

## Visual Verification Checklist

### Branding and Styling
- [ ] Background color is #53001b (maroon) on all screens
- [ ] Text on background is white
- [ ] ROOT logo displays (not SUTD logo)
- [ ] Logo is visible and properly sized
- [ ] Overall layout is clean and professional

### Student ID Form
- [ ] Input field is clearly visible
- [ ] Submit button is prominent
- [ ] Loading state shows during validation
- [ ] Error messages are readable

### Consent Screen
- [ ] Consent text is complete and readable
- [ ] Checkbox is large enough to click easily
- [ ] Checkbox state is visually clear
- [ ] "Back" button is available (if implemented)

### QR Display Screen
- [ ] QR code is large and scannable
- [ ] Collection status is clearly displayed
- [ ] "Start Over" button is prominent
- [ ] Layout is clean and organized
- [ ] All text is readable

### Easter Egg
- [ ] Video plays full screen
- [ ] Video quality is acceptable
- [ ] Confetti animation is visible
- [ ] Transition is smooth

---

## Requirements Validation

### Requirement 2: Collection Status Display
- [ ] 2.1: Shirt collection status is displayed on QR screen
- [ ] 2.2: Meal collection status is displayed on QR screen
- [ ] 2.3: Collection status has clean layout alongside QR code

### Requirement 3: Navigation Button Enhancement
- [ ] 3.1: "Start Over" button is displayed on QR screen
- [ ] 3.2: Button navigates to Student ID form when clicked
- [ ] 3.3: Button clears previous form state

### Requirement 4: PDPA Consent Collection
- [ ] 4.1: Consent screen displays after student ID submission
- [ ] 4.2: Consent checkbox displays correct text
- [ ] 4.3: QR code is prevented when consent is unchecked
- [ ] 4.4: QR code displays when consent is checked
- [ ] 4.5: Consent state is stored in database
- [ ] 4.6: Consent state persists for each participant

### Requirement 5: Easter Egg Behavior
- [ ] 5.1: Student ID 1009104 always displays easter egg
- [ ] 5.2: Other IDs display easter egg with 1/75 probability
- [ ] 5.3: Random probability is independent per session

---

## Test Results Summary

### Test Execution Status
- **Scenario 1 (Standard Flow):** ⏳ Pending Manual Execution
- **Scenario 2 (Easter Egg 1009104):** ⏳ Pending Manual Execution
- **Scenario 3 (Random Easter Egg):** ⏳ Pending Manual Execution
- **Scenario 4 (Consent Recording):** ⏳ Pending Manual Execution
- **Scenario 5 (Consent Prevents QR):** ⏳ Pending Manual Execution
- **Scenario 6 (Collection Status):** ⏳ Pending Manual Execution
- **Scenario 7 (Start Over Button):** ⏳ Pending Manual Execution
- **Scenario 8 (Error Handling):** ⏳ Pending Manual Execution

### Requirements Coverage
- **Requirement 2 (Collection Status):** ⏳ Pending Verification
- **Requirement 3 (Start Over Button):** ⏳ Pending Verification
- **Requirement 4 (PDPA Consent):** ⏳ Pending Verification
- **Requirement 5 (Easter Egg):** ⏳ Pending Verification

---

## Testing Instructions for Manual Tester

### Prerequisites
1. Ensure backend server is running on port 3000
2. Ensure frontend server is running on port 5173
3. Ensure database has test data loaded (98 student records)
4. Open browser (Chrome or Firefox recommended)
5. Open browser DevTools (F12) for network inspection

### Execution Steps
1. Work through each scenario in order
2. Check off validation points as you verify them
3. Document any issues or unexpected behavior
4. Take screenshots of key screens (optional but recommended)
5. Update test results summary with pass/fail status
6. Note any deviations from expected results

### Sample Student IDs for Testing
- **Easter Egg ID:** 1009104 (always triggers easter egg)
- **Standard IDs:** 1001234, 1002345, 1003456, 1004567, 1005678
- **Invalid ID:** 9999999 (for error testing)

### Key Verification Points
1. ✅ Student ID form accepts input and submits
2. ✅ Easter egg appears for ID 1009104
3. ✅ Consent screen appears after validation
4. ✅ Consent checkbox must be checked to see QR
5. ✅ QR code displays after consent
6. ✅ Collection status shows shirt and meal status
7. ✅ "Start Over" button returns to form
8. ✅ Form state clears on reset

---

## Known Issues / Notes

- Easter egg video requires `/Cenafy John Cena.mp4` file in public directory
- ROOT logo requires `/ROOT_logo_white-03.png` file in public directory
- Random easter egg (1/75) may require multiple attempts to observe
- Consent is recorded immediately when checkbox is checked
- Collection status reflects current database state

---

## Conclusion

This test report documents the manual verification process for Task 16.1. The participant flow includes:
1. Student ID input
2. Optional easter egg (always for 1009104, random 1/75 for others)
3. PDPA consent screen
4. QR code display with collection status
5. "Start Over" functionality

All scenarios should be executed manually to verify complete functionality. Update the test results summary after execution.

---

**Report Status:** ✅ Documentation Complete - Ready for Manual Execution
**Next Steps:** Execute manual tests and update results in this document
