//src/pages/StudentCourses.jsx

import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { UserContext } from "../context/UserContext";
import StatusChip from "../components/StatusChip";

export default function StudentCourses() {
  const { apiFetch } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);

  async function loadCourses(query = "") {
    try {
      const data = await apiFetch(`/api/course?search=${encodeURIComponent(query)}`);
      setCourses(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    loadCourses(search);
  }

  function handleClear() {
    setSearch("");
    loadCourses("");
  }

  async function handleEnroll(course) {
    setEnrollingId(course._id);
    try {
      await apiFetch(`/api/course/${course._id}/enroll`, { method: "POST" });
      setMessage({ type: "success", text: `Enrolled in "${course.name}"` });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setEnrollingId(null);
      loadCourses(search);
    }
  }

  function enrollButton(c) {
    if (c.isEnrolled) return <Chip label="Enrolled" color="primary" size="small" />;
    if (c.status !== "Open") return <Chip label="Closed" size="small" />;
    if (c.seatsLeft <= 0) return <Chip label="Full" color="error" size="small" />;
    return (
      <Button size="small" variant="contained" disabled={enrollingId === c._id} onClick={() => handleEnroll(c)}>
        {enrollingId === c._id ? "Enrolling..." : "Enroll"}
      </Button>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Browse Courses
      </Typography>

      <Stack component="form" onSubmit={handleSearch} direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          size="small"
          fullWidth
          label="Search by course name or teacher name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit" variant="contained">
          Search
        </Button>
        <Button onClick={handleClear}>Clear</Button>
      </Stack>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Course Name</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Topics</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Seats Left</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8}>Loading...</TableCell>
              </TableRow>
            )}
            {!loading && courses.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>No courses found.</TableCell>
              </TableRow>
            )}
            {courses.map((c) => (
              <TableRow key={c._id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.teacherName}</TableCell>
                <TableCell>
                  {c.topics.map((t) => (
                    <Chip key={t} label={t} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>{c.duration} days</TableCell>
                <TableCell>{c.price.toLocaleString()}</TableCell>
                <TableCell>
                  {c.seatsLeft} / {c.maxStudent}
                </TableCell>
                <TableCell>
                  <StatusChip status={c.status} />
                </TableCell>
                <TableCell align="right">{enrollButton(c)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}