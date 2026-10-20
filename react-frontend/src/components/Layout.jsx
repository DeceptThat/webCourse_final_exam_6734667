//src/components/Layout.jsx

import { useContext } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { UserContext } from "../context/UserContext";

const navStyle = ({ isActive }) => ({
  fontWeight: isActive ? 700 : 400,
  textDecoration: isActive ? "underline" : "none",
});

export default function Layout() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f6fa" }}>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1, flexWrap: "wrap" }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Online Course
          </Typography>
          {user.role === "Teacher" ? (
            <Button color="inherit" component={NavLink} to="/teacher" style={navStyle}>
              My Courses
            </Button>
          ) : (
            <>
              <Button color="inherit" component={NavLink} to="/student" style={navStyle}>
                Browse Courses
              </Button>
              <Button color="inherit" component={NavLink} to="/my-enrollments" style={navStyle}>
                My Enrollments
              </Button>
            </>
          )}
          <Typography sx={{ mx: 1 }}>
            {user.username} ({user.role})
          </Typography>
          <Button color="inherit" variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}