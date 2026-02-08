# Deployment Checklist

Use this checklist to ensure a smooth deployment of the Event Check-In System.

## Pre-Deployment

### Code Preparation
- [ ] All tests passing locally (`npm test` in both backend and frontend)
- [ ] Code committed to GitHub repository
- [ ] Latest changes pushed to main branch
- [ ] No sensitive data in code (passwords, API keys, etc.)
- [ ] `.env` files not committed to git

### Database Preparation
- [ ] CSV file with student data ready
- [ ] CSV file validated (all required fields present)
- [ ] Student IDs are unique in CSV
- [ ] T-shirt sizes are valid (XS, S, M, L, XL, XXL)
- [ ] Meal preferences are filled in

## Supabase Setup

### Create Project
- [ ] Supabase account created
- [ ] New project created
- [ ] Project name: `event-checkin-system`
- [ ] Region selected (closest to users)
- [ ] Database password saved securely

### Database Schema
- [ ] Opened SQL Editor in Supabase
- [ ] Copied `backend/src/db/schema.sql` contents
- [ ] Executed schema SQL successfully
- [ ] Verified tables created: `students`, `tokens`, `claims`
- [ ] Verified indexes created

### Import Data
- [ ] CSV data imported to `students` table
- [ ] Verified student count matches CSV
- [ ] Spot-checked a few student records
- [ ] Tested case-insensitive student ID lookup

### Connection String
- [ ] Copied connection string from Settings → Database
- [ ] Replaced `[YOUR-PASSWORD]` with actual password
- [ ] Tested connection locally (optional)
- [ ] Connection string saved for Vercel setup

## Vercel Setup

### Create Project
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Project imported to Vercel
- [ ] Build settings verified:
  - Framework: Vite
  - Build command: `cd frontend && npm install && npm run build`
  - Output directory: `frontend/dist`

### Environment Variables (First Deployment)
- [ ] `DATABASE_URL` set to Supabase connection string
- [ ] `NODE_ENV` set to `production`
- [ ] Environment variables applied to: Production, Preview, Development

### First Deployment
- [ ] Clicked "Deploy"
- [ ] Deployment completed successfully
- [ ] No build errors in logs
- [ ] Deployment URL copied (e.g., `https://your-app-xxx.vercel.app`)

### Environment Variables (Second Pass)
- [ ] `FRONTEND_URL` set to Vercel deployment URL
- [ ] `VITE_API_URL` set to Vercel deployment URL
- [ ] Redeployed after adding new variables

## Testing

### Health Check
- [ ] Visited `/api/health` endpoint
- [ ] Received `{"status": "ok"}` response
- [ ] No errors in browser console

### Student App
- [ ] Visited root URL (`/`)
- [ ] Entered valid student ID
- [ ] Student information displayed correctly
- [ ] QR code generated and displayed
- [ ] Organization involvements shown correctly
- [ ] Tested with multiple student IDs
- [ ] Tested with invalid student ID (should show error)
- [ ] Tested with empty input (should show validation error)

### Admin App
- [ ] Visited `/admin` URL
- [ ] Camera permission requested
- [ ] Camera permission granted
- [ ] QR scanner activated
- [ ] Scanned QR code from Student App
- [ ] Student information displayed correctly
- [ ] Claim checkboxes visible and enabled
- [ ] Organization involvements shown correctly

### Claim Flow
- [ ] Marked t-shirt as claimed
- [ ] Checkbox disabled after claim
- [ ] Status updated immediately
- [ ] Tried to claim again (should show error)
- [ ] Marked meal as claimed
- [ ] Both items shown as claimed
- [ ] Scanned same QR code again
- [ ] Both items still shown as claimed (persistent)

### Error Handling
- [ ] Tested with invalid QR code (should show error)
- [ ] Tested with network disconnected (should retry)
- [ ] Tested duplicate claim (should show 409 error)
- [ ] All errors display user-friendly messages

### Cross-Device Testing
- [ ] Tested on desktop browser
- [ ] Tested on mobile browser (iOS)
- [ ] Tested on mobile browser (Android)
- [ ] Tested on tablet
- [ ] Camera works on all mobile devices
- [ ] Layout responsive on all screen sizes

### Performance
- [ ] Student validation responds in < 2 seconds
- [ ] QR scan responds in < 2 seconds
- [ ] Claim update responds in < 2 seconds
- [ ] No console errors or warnings
- [ ] No memory leaks (check DevTools)

## Monitoring Setup

### Vercel Dashboard
- [ ] Bookmarked Vercel project dashboard
- [ ] Checked function logs (no errors)
- [ ] Noted function execution times
- [ ] Set up deployment notifications (optional)

### Supabase Dashboard
- [ ] Bookmarked Supabase project dashboard
- [ ] Checked database size
- [ ] Verified connection pooling working
- [ ] Set up database alerts (optional)

## Documentation

### Internal Documentation
- [ ] Deployment URL documented
- [ ] Admin credentials documented (if applicable)
- [ ] Emergency contacts listed
- [ ] Rollback procedure documented

### User Documentation
- [ ] Student app instructions prepared
- [ ] Admin app instructions prepared
- [ ] Troubleshooting guide prepared
- [ ] Training materials ready

## Event Preparation

### Staff Training
- [ ] Event staff trained on Admin App
- [ ] Backup staff identified and trained
- [ ] Troubleshooting procedures reviewed
- [ ] Contact information shared

### Equipment
- [ ] Tablets/phones for admins prepared
- [ ] Devices charged and tested
- [ ] Backup devices available
- [ ] Internet connectivity verified at venue

### Backup Plan
- [ ] Printed student list available
- [ ] Manual check-in process documented
- [ ] Paper claim forms ready (if needed)
- [ ] IT support contact available

## Go-Live

### Final Checks (Day Before Event)
- [ ] All systems tested end-to-end
- [ ] Database has latest student data
- [ ] No pending deployments
- [ ] All staff trained and ready
- [ ] Equipment charged and ready

### Launch (Event Day)
- [ ] Systems online and accessible
- [ ] Test check-in performed successfully
- [ ] Staff have access to Admin App
- [ ] Monitoring dashboards open
- [ ] IT support on standby

### During Event
- [ ] Monitor Vercel function logs
- [ ] Monitor Supabase database performance
- [ ] Track error rates
- [ ] Respond to staff questions
- [ ] Document any issues

## Post-Event

### Data Export
- [ ] Export final claim data from Supabase
- [ ] Generate reports (total claims, unclaimed items)
- [ ] Backup database
- [ ] Archive deployment

### Review
- [ ] Document what went well
- [ ] Document issues encountered
- [ ] Collect staff feedback
- [ ] Plan improvements for next event

### Cleanup (Optional)
- [ ] Pause Supabase project (to save costs)
- [ ] Archive Vercel deployment
- [ ] Remove sensitive data
- [ ] Update documentation

## Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| System Admin | __________ | __________ |
| Database Admin | __________ | __________ |
| IT Support | __________ | __________ |
| Event Coordinator | __________ | __________ |

## Rollback Procedure

If critical issues occur:

1. **Immediate**: Switch to manual check-in process
2. **Identify**: Check Vercel logs for errors
3. **Rollback**: 
   - Go to Vercel Dashboard → Deployments
   - Find last working deployment
   - Click "..." → "Promote to Production"
4. **Verify**: Test rolled-back version
5. **Communicate**: Notify staff of changes
6. **Fix**: Debug issue in separate environment
7. **Redeploy**: Once fixed, deploy again

## Notes

_Use this space for deployment-specific notes, custom configurations, or lessons learned._

---

**Deployment Date**: _______________

**Deployed By**: _______________

**Vercel URL**: _______________

**Supabase Project**: _______________

**Event Date**: _______________

**Checklist Completed**: ☐ Yes ☐ No
