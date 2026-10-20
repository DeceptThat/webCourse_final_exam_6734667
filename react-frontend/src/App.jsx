//src/App.jsx

import { useContext } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { UserContext } from "./context/UserContext";
import RequireAuth from "./components/RequireAuth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import TeacherCourses from "./pages/TeacherCourses";
import StudentCourses from "./pages/StudentCourses";
import MyEnrollments from "./pages/MyEnrollments";

function HomeRedirect() {
  const { user } = useContext(UserContext);
  return <Navigate to={user.role === "Teacher" ? "/teacher" : "/student"} replace />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<HomeRedirect />} />
          <Route
            path="/teacher"
            element={
              <RequireAuth role="Teacher">
                <TeacherCourses />
              </RequireAuth>
            }
          />
          <Route
            path="/student"
            element={
              <RequireAuth role="Student">
                <StudentCourses />
              </RequireAuth>
            }
          />
          <Route
            path="/my-enrollments"
            element={
              <RequireAuth role="Student">
                <MyEnrollments />
              </RequireAuth>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}