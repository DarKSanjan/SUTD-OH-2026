# SUTD Branding Update

## Changes Made

Updated the frontend theme to match SUTD's brand identity for Open House 2026.

### Color Scheme
Changed from generic purple gradient to SUTD's signature red tones:
- **Primary Red**: `#E63946` (bright red)
- **Dark Red**: `#C1121F` (crimson)
- **Deep Red**: `#780000` (maroon)

### Visual Updates

#### 1. **SUTD Logo Integration**
- Added SUTD logo to both student and admin interfaces
- Logo location: `frontend/public/SUTD Logo Dark.webp`
- Logo is inverted to white for visibility on red background
- Responsive sizing for mobile devices

#### 2. **Student App** (`StudentApp.tsx`)
- Updated header to show "SUTD Open House 2026"
- Red gradient background matching SUTD colors
- SUTD logo prominently displayed at top
- Subtitle: "Event Check-In System"

#### 3. **Admin App** (`AdminApp.tsx`)
- Updated header to show "SUTD Open House 2026"
- Subtitle: "Event Check-In Station"
- Red gradient background
- SUTD logo at top of interface
- Updated button colors to match red theme

#### 4. **Component Accents**
- **StudentInfoCard**: Red gradient header
- **InvolvementDisplay**: Red accent borders
- All cards and UI elements updated with SUTD red theme

### Responsive Design
Logo and text sizes adjust for different screen sizes:
- **Desktop**: Full-size logo (200px/180px)
- **Tablet** (768px): Medium logo (160px/150px)
- **Mobile** (480px): Compact logo (140px/130px)

### Files Modified
1. `frontend/src/components/student/StudentApp.tsx`
2. `frontend/src/components/admin/AdminApp.tsx`
3. `frontend/src/components/admin/StudentInfoCard.tsx`
4. `frontend/src/components/shared/InvolvementDisplay.tsx`

### Logo File
- **Location**: `frontend/public/SUTD Logo Dark.webp`
- **Format**: WebP (optimized for web)
- **Usage**: Inverted to white using CSS filter

## Design Philosophy

The new design reflects SUTD's identity as a modern, technology-focused university:
- **Bold red colors**: Energy, innovation, and passion
- **Clean typography**: Modern and professional
- **Gradient backgrounds**: Dynamic and forward-thinking
- **White accents**: Clean and accessible

## Preview

### Student Interface
- SUTD logo at top
- "SUTD Open House 2026" title
- Red gradient background
- Clean white cards for content

### Admin Interface
- SUTD logo at top
- "SUTD Open House 2026" title
- "Event Check-In Station" subtitle
- Scan counter with SUTD branding
- Red-themed buttons and accents

## Deployment Ready
All changes are complete and ready for deployment. The theme will automatically apply when the app is deployed to Vercel.
