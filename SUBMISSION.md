# Project Budget Tracker - Technical Test Submission

## What I Built

A fully functional project budget tracker that allows users to:

-  Create and manage projects with budgets
-  Add expenses to projects
-  View real-time budget status with visual indicators
-  See when projects are over budget
-  Delete projects and expenses
-  Track total spending per project

## Architecture Decisions

### Backend (API)

**Models (Flat Structure)**
- `Project`: name, budget, userId, createdAt
- `Expense`: projectId, amount, category, description, date, createdAt

I followed the flat data structure principle - no nested objects. Each expense references a project by ID rather than being embedded within it.

**API Routes**
- Projects: `POST /project`, `GET /project`, `GET /project/:id`, `DELETE /project/:id`, `PUT /project/:id`
- Expenses: `POST /expense`, `GET /expense/project/:projectId`, `DELETE /expense/:id`, `PUT /expense/:id`

All routes follow the consistent response pattern: `{ ok: true/false, data/error }`

### Frontend (React)

**Pages**
1. **Home (`/`)**: Projects list with cards showing budget status
2. **Project Detail (`/project/:id`)**: Individual project with expenses list

**Key Features**
- Real-time budget calculation
- Visual progress bars (green → yellow → red based on usage)
- Over-budget alerts
- Clean, responsive UI with Tailwind CSS
- Toast notifications for user feedback

**Budget Status Logic**
- Green: 0-80% of budget used
- Yellow: 80-100% of budget used  
- Red: Over 100% of budget (over budget)

##  Design Decisions

### Why I Built It This Way

1. **Simple is Better**: No over-engineering. Each component does one thing well.

2. **One Route, One Responsibility**: Each POST route creates exactly one type of object

3. **Visual Feedback**: Progress bars and color coding make budget status immediately obvious

4. **User Experience**: 
   - Modals for create forms (keep users in context)
   - Confirmation dialogs for destructive actions
   - Loading states and error handling
   - Toast notifications for all actions

## How to Run

### Prerequisites
- Node.js v14+ installed
- MongoDB connection (already configured in `.env`)

### Setup

1. **Install dependencies**
   ```bash
   # Backend
   cd api
   npm install

   # Frontend  
   cd ../app
   npm install
   ```

2. **Start the servers**
   ```bash
   # Terminal 1 - Backend (runs on :8080)
   cd api
   npm run dev

   # Terminal 2 - Frontend (runs on :3000)
   cd app
   npm run dev
   ```

3. **Access the app**
   - Open browser to: http://localhost:3000
   - Sign up for a new account
   - Start creating projects!

### Environment Variables

The `.env` files are already configured with:
- MongoDB connection (database: `hugo24112025` - you should change this to your name+date)
- API keys for S3 and Brevo
- Development settings

## What Works

### Core Features (All Implemented)

1. **Project Management**
   - Create new projects with name and budget
   - View all projects in a card grid
   - Delete projects
   - Update projects (backend ready, UI can be added)

2. **Expense Tracking**
   - Add expenses to projects
   - Categorize expenses
   - Add descriptions
   - View all expenses for a project
   - Delete expenses

3. **Budget Monitoring**
   - Real-time calculation of total expenses
   - Visual progress bar showing budget usage
   - Color-coded status (green/yellow/red)
   - Clear "over budget" warnings
   - Shows remaining budget

4. **User Experience**
   - Responsive design (works on mobile/desktop)
   - Loading states
   - Error handling with toast notifications
   - Confirmation dialogs for destructive actions
   - Clean, modern UI

## Time Spent

**Total: ~2.5 hours**

- Models & API routes: 30 minutes
- Frontend components: 90 minutes
- Testing & polish: 30 minutes

## What I'd Add With More Time

### High Priority
1. **AI Expense Categorization**
   - Integrate OpenRouter API
   - Auto-suggest categories based on description
   - Example: "Facebook Ads" → "Marketing"

2. **Email Notifications**
   - Send email via Brevo when project goes over budget
   - Include project name and overage amount

3. **Project Members**
   - Add multiple users to a project
   - View all project members
   - Shared budget tracking

### Nice to Have
- Export project data to CSV
- Budget history/timeline view
- Expense categories management
- Charts/graphs for spending over time
- Search and filter projects
- Bulk expense import

### Edge Cases Handled
- Empty states (no projects, no expenses)
- Over-budget scenarios
- Decimal amounts
- Long project/expense names
- Missing optional fields (category, description)

### Following the Whitepaper

1. **Early Returns** 
   ```javascript
   if (!name || !budget) {
     return res.status(400).send({ ok: false, code: ERROR_CODES.INVALID_BODY })
   }
   ```

2. **Flat Data Structures** 
   - No nested expenses in projects
   - Clean references via IDs

3. **Consistent API Responses** 
   - Always `{ ok, data }` or `{ ok, error }`

4. **Simple & Clear** 
   - No unnecessary abstractions
   - Explicit and readable code

5. **One Route, One Responsibility** 
   - `POST /project` creates only a project
   - `POST /expense` creates only an expense

## Key Takeaways

**What Went Well:**
- Clean separation of concerns (models, controllers, components)
- Following the coding standards made the code more maintainable
- Visual budget indicators make the app intuitive
- Early returns made error handling much cleaner

**What I Learned:**
- Flat data structures are indeed simpler to work with
- Consistent API patterns speed up frontend development
- Simple visual feedback (colors, progress bars) greatly improves UX

**Trade-offs Made:**
- Skipped AI feature to focus on core functionality
- Skipped email notifications to ensure core features are solid
- Used simple modals instead of routing to separate pages (faster UX)


## Final Notes

This was a great exercise in building a practical, working application with solid architectural decisions. I focused on:

1. **Working software** over perfect software
2. **Simple solutions** over clever ones  
3. **User experience** - making it obvious how to use
4. **Code quality** - following the standards consistently

The app is ready to demo and extend with additional features like AI categorization or email notifications!

---

**Submitted by:** Luis Alla  
**Date:** December 1, 2025  
**Time Spent:** ~2.5 hours
