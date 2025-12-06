# Admin Dashboard with Full CRUD for Data Management

## 🎯 Overview

This PR adds a comprehensive admin dashboard to the Mizuki blog template, enabling visual management of Projects, Skills, and Timeline data through a React-based interface with full CRUD (Create, Read, Update, Delete) capabilities.

## ✨ New Features

### 🎛️ Admin Dashboard
- **Visual Data Management**: React-powered admin panel for Projects, Skills, and Timeline
- **Real-time Editing**: Edit data directly in the browser without touching code files
- **Auto Backup**: Automatic `.backup.json` creation on every save
- **Data Sync**: One-click sync from JSON to TypeScript files
- **Git Integration**: Built-in version control support
- **Search & Filter**: Powerful search and multi-dimensional filtering

### 📊 Data Management Pages

1. **Projects Management**
   - Create/Edit/Delete projects
   - Filter by category and status
   - Statistics dashboard
   - Tech stack and tags management
   - Link management (demo/source)

2. **Skills Management**
   - Create/Edit/Delete skills
   - Category grouping display
   - Skill level badges
   - Experience tracking (years + months)
   - Related projects and certifications

3. **Timeline Management**
   - Create/Edit/Delete timeline events
   - Type filtering (education/work/project/achievement)
   - Chronological sorting
   - Duration calculation
   - Links and achievements management

## 🏗️ Technical Implementation

### Backend Infrastructure

#### New JSON-based Data Storage
```
src/data/
├── json/               # ← New: JSON data source (editable)
│   ├── projects.json
│   ├── skills.json
│   └── timeline.json
├── projects.ts        # ← Generated from JSON
├── skills.ts          # ← Generated from JSON
└── timeline.ts        # ← Generated from JSON
```

#### CRUD Utilities (`admin/utils/`)
- `migrateToJson.js` - Migrate TypeScript data to JSON
- `dataCrud.js` - CRUD operations with backup support
- `generateTs.js` - Generate TypeScript from JSON

#### API Endpoints (`admin/server.js`)
```javascript
GET    /api/data/:type        → Read all items
POST   /api/data/:type        → Create new item
PUT    /api/data/:type/:id    → Update item
DELETE /api/data/:type/:id    → Delete item
POST   /api/data/:type/sync   → Generate TS from JSON
```

### Frontend Components

#### New Reusable Components (`admin/src/components/`)
- `EditModal.jsx` - Generic modal wrapper
- `ConfirmDialog.jsx` - Confirmation dialog for destructive actions
- `ProjectForm.jsx` - Project edit/create form
- `SkillForm.jsx` - Skill edit/create form
- `TimelineForm.jsx` - Timeline event form

#### Updated Pages (`admin/src/pages/`)
- `Dashboard.jsx` - Fixed blog link
- `DataProjects.jsx` - Added full CRUD UI
- `DataSkills.jsx` - Added full CRUD UI
- `DataTimeline.jsx` - Added full CRUD UI

### Data Flow

```
User Edit Form
    ↓
POST/PUT/DELETE API
    ↓
dataCrud.js (creates .backup.json)
    ↓
Save to src/data/json/*.json
    ↓
[User clicks "Sync to TS"]
    ↓
generateTs.js
    ↓
Generate src/data/*.ts
    ↓
Astro site reads updated data
```

## 🚀 Usage

### Starting the Admin Dashboard

```bash
pnpm run admin
```

Admin dashboard will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

### Editing Data

1. Navigate to Projects/Skills/Timeline page
2. Click "Add" button or hover over a card and click "Edit"
3. Fill in the form and click "Save"
4. Click "Sync to TS" to update TypeScript files
5. Refresh the Astro dev server to see changes

### Safety Features

- ✅ Automatic backups before every save
- ✅ Confirmation dialogs for delete operations
- ✅ ID validation to prevent duplicates
- ✅ Form validation for required fields
- ✅ Git-tracked JSON and TypeScript files

## 📁 New Files Added

### Utilities
- `admin/utils/migrateToJson.js`
- `admin/utils/dataCrud.js`
- `admin/utils/generateTs.js`

### Components
- `admin/src/components/EditModal.jsx`
- `admin/src/components/ConfirmDialog.jsx`
- `admin/src/components/ProjectForm.jsx`
- `admin/src/components/SkillForm.jsx`
- `admin/src/components/TimelineForm.jsx`

### Data
- `src/data/json/` (directory)
- Initial migration creates:
  - `src/data/json/projects.json`
  - `src/data/json/skills.json`
  - `src/data/json/timeline.json`

### Documentation
- `docs/ADMIN_GUIDE.md` - Complete user guide

## 📝 Modified Files

### Admin Dashboard
- `admin/server.js` - Added CRUD API endpoints
- `admin/src/pages/Dashboard.jsx` - Fixed blog link
- `admin/src/pages/DataProjects.jsx` - Added CRUD UI
- `admin/src/pages/DataSkills.jsx` - Added CRUD UI
- `admin/src/pages/DataTimeline.jsx` - Added CRUD UI
- `admin/src/layouts/Sidebar.jsx` - Already correct

### Documentation
- `README.zh.md` - Added admin dashboard section and command
- (Optional: `README.md` if you want to update English version too)

## 🧪 Testing

### Automated Tests
- ✅ Backend API endpoints tested
- ✅ CRUD operations verified
- ✅ Backup mechanism validated
- ✅ TypeScript generation tested

### Manual Testing Performed
1. ✅ Create new items in all three data types
2. ✅ Edit existing items
3. ✅ Delete items with confirmation
4. ✅ Sync to TypeScript
5. ✅ Verify Astro site displays updated data
6. ✅ Restore from backup files
7. ✅ Search and filter functionality
8. ✅ Form validation

## 📸 Screenshots

<!-- Add screenshots here -->
**Dashboard**:
- Admin dashboard overview

**Projects CRUD**:
- Projects list with edit/delete buttons
- Project form modal
- Delete confirmation dialog

**Skills CRUD**:
- Skills grouped by category
- Skill form with experience tracking

**Timeline CRUD**:
- Timeline chronological view
- Timeline event form

## 🔄 Migration Guide

For existing Mizuki installations:

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies
pnpm install

# 3. Run migration to create JSON files
node admin/utils/migrateToJson.js

# 4. Start admin dashboard
pnpm run admin
```

## 💡 Design Decisions

### Why JSON + TypeScript Generation?

1. **Safety**: JSON is easier to parse and manipulate programmatically
2. **Backup**: Automatic backup mechanism for every change
3. **Separation**: Clear separation between editable source (JSON) and generated output (TS)
4. **Git-friendly**: Both JSON and TS files are tracked for full history
5. **Flexibility**: Users can choose to edit JSON directly or use the UI

### Why Manual Sync?

- Gives users control over when changes propagate
- Prevents accidental TypeScript regeneration
- Allows batch editing before sync

## 🚧 Known Limitations

- **Local Development**: Currently uses `localhost:4321` for blog links (works for dev)
- **Production**: Users need to update links for production deployments
- **No Image Upload**: Project covers still need manual file placement
- **No Markdown Editor**: Descriptions are plain text input

## 🔮 Future Enhancements

Potential improvements for future PRs:
- [ ] Image upload for project covers
- [ ] Markdown editor for descriptions
- [ ] Bulk import/export (CSV/JSON)
- [ ] Draft mode for unpublished items
- [ ] Undo/Redo functionality
- [ ] Real-time collaboration
- [ ] Production-ready blog URL detection

## 📚 Documentation

- **User Guide**: `docs/ADMIN_GUIDE.md`
- **Technical Details**: See inline code comments
- **Data Structure**: Preserved from original TypeScript files

## ✅ Checklist

- [x] Code follows project style guidelines
- [x] All new code has been tested
- [x] Documentation has been updated
- [x] No breaking changes to existing functionality
- [x] Backward compatible (existing TS files still work)
- [x] Bilingual support (English/Chinese)

## 🙏 Acknowledgments

This feature was developed to enhance the Mizuki blog template with modern data management capabilities while maintaining its elegant design and ease of use.

---

**Type of Change**: ✨ Feature Addition

**Breaking Changes**: None

**Requires Migration**: Yes (optional, run `migrateToJson.js` to enable admin features)
