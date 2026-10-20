# How to Test the App

## Student Information

- **Student Name:** Khon Min Wai Than
- **Student ID:** 6734667

## Deployed URLs

- **Frontend:** https://web-course-final-exam-6734667-front.vercel.app
- **Backend:** https://web-course-final-exam-6734667-backe.vercel.app

## Test Credentials

All users share the same password: **`password123`**
(Login accepts either the username or the email.)

| Role    | Username | Email             | Password    |
| ------- | -------- | ----------------- | ----------- |
| Teacher | teacher1 | teacher1@test.com | password123 |
| Teacher | teacher2 | teacher2@test.com | password123 |
| Teacher | teacher3 | teacher3@test.com | password123 |
| Student | student1 | student1@test.com | password123 |
| Student | student2 | student2@test.com | password123 |
| Student | student3 | student3@test.com | password123 |

## Prerequisites

- Node.js 20+ and npm
- A MongoDB database (MongoDB Atlas)

## How to Run & Test

### 1. Backend Setup (`next-backend/`)

1. `cd next-backend`
2. `npm install`
3. Create `.env.local`:
```
   MONGODB_URI=<your MongoDB connection string>
   JWT_SECRET=<any long random string>
   FRONTEND_URL=<deployed frontend URL, production only>
```
4. Seed the 3 teachers and 3 students: `node --env-file=.env.local scripts/seed.mjs`
5. `npm run dev` (runs on http://localhost:3000)

### 2. Frontend Setup (`react-frontend/`)

1. `cd react-frontend`
2. `npm install`
3. Create `.env`:
```
   VITE_API_URL=http://localhost:3000
```
4. `npm run dev` and open http://localhost:5173 (use `localhost`, not the network IP)

On Vercel, `react-frontend/vercel.json` forwards `/api/*` to the backend so the login cookie is first-party.

### 3. Testing Walkthrough

**Authentication**

1. Open the frontend. Without logging in, you are sent to the Login page.
2. Opening `<backend>/api/course` directly without logging in returns `401 Unauthorized Request`.

**Teacher (log in as `teacher1`)**

1. **My Courses** shows only teacher1's own courses.
2. **+ Create Course**: name, duration (days), topics (comma separated), price, max student, status (Open / Close / Cancel).
3. **Details** shows all course fields and the list of **enrolled students**.
4. **Edit** updates the course (Max Student cannot be set below the current enrolled count).
5. **Delete** works only when no student is enrolled (the backend returns 409 otherwise).
6. Log in as `teacher2`: teacher1's courses are not visible and cannot be edited (403).

**Student (log in as `student1`)**

1. **Browse Courses** shows all courses except **Cancel** ones.
2. **Search** filters by part of the course name or the teacher name.
3. **Details** shows the course information (no student list).
4. **Enroll** works only when the course is **Open** and seats remain:
   - A Close course shows "Closed", and a full course shows "Full".
   - Enrolling twice in the same course is rejected ("already enrolled").
5. **My Enrollments** lists the courses the student has enrolled in.

**Backend rules (enforced by the API, not just the UI)**

| Rule | API response |
| --- | --- |
| Not logged in | 401 |
| Student creates/edits/deletes a course | 403 |
| Teacher edits/deletes another teacher's course | 403 |
| Delete a course with enrolled students | 409 |
| Enroll in a Close course | 400 |
| Enroll in a full course | 409 |
| Enroll twice | 409 |
| Cancel course hidden from students / enroll attempt | 404 |
| Teacher tries to enroll | 403 |

## API Endpoints

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Public |
| GET | `/api/user` | Logged-in user (current user) |
| GET | `/api/user/:user_id` | Self only (profile + enrolled courses) |
| GET | `/api/course?search=` | Teacher: own courses / Student: all except Cancel |
| POST | `/api/course` | Teacher |
| GET | `/api/course/:course_id` | Teacher (own, with students) / Student (not Cancel) |
| PUT | `/api/course/:course_id` | Teacher (own) |
| DELETE | `/api/course/:course_id` | Teacher (own, no enrollments) |
| POST | `/api/course/:course_id/enroll` | Student |