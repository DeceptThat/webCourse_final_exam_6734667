//src/pages/TeacherCourses.jsx

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
  Tooltip,
  Typography,
} from "@mui/material";
import { UserContext } from "../context/UserContext";
import StatusChip from "../components/StatusChip";
import CourseFormDialog from "../components/CourseFormDialog";
import CourseDetailsDialog from "../components/CourseDetailsDialog";

export default function TeacherCourses() {
  const { apiFetch } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailsId, setDetailsId] = useState(null);

  async function loadCourses() {
    try {
      const data = await apiFetch("/api/course");
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

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(course) {
    setEditing(course);
    setFormOpen(true);
  }

  async function handleSave(data) {
    if (editing) {
      await apiFetch(`/api/course/${editing._id}`, { method: "PUT", body: JSON.stringify(data) });
    } else {
      await apiFetch("/api/course", { method: "POST", body: JSON.stringify(data) });
    }
    setFormOpen(false);
    setMessage({ type: "success", text: editing ? "Course updated" : "Course created" });
    loadCourses();
  }

  async function handleDelete(course) {
    if (!window.confirm(`Delete "${course.name}"?`)) return;
    try {
      await apiFetch(`/api/course/${course._id}`, { method: "DELETE" });
      setMessage({ type: "success", text: "Course deleted" });
      loadCourses();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">My Courses</Typography>
        <Button variant="contained" onClick={openCreate}>
          + Create Course
        </Button>
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
              <TableCell>Topics</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Enrolled</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7}>Loading...</TableCell>
              </TableRow>
            )}
            {!loading && courses.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>No courses yet. Click "Create Course".</TableCell>
              </TableRow>
            )}
            {courses.map((c) => (
              <TableRow key={c._id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>
                  {c.topics.map((t) => (
                    <Chip key={t} label={t} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>{c.duration} days</TableCell>
                <TableCell>{c.price.toLocaleString()}</TableCell>
                <TableCell>
                  {c.enrolledCount} / {c.maxStudent}
                </TableCell>
                <TableCell>
                  <StatusChip status={c.status} />
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <Button size="small" onClick={() => setDetailsId(c._id)}>
                    Details
                  </Button>
                  <Button size="small" onClick={() => openEdit(c)}>
                    Edit
                  </Button>
                  <Tooltip title={c.enrolledCount > 0 ? "Cannot delete: students enrolled" : ""}>
                    <span>
                      <Button size="small" color="error" disabled={c.enrolledCount > 0} onClick={() => handleDelete(c)}>
                        Delete
                      </Button>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {formOpen && <CourseFormDialog course={editing} onClose={() => setFormOpen(false)} onSave={handleSave} />}

      {detailsId && <CourseDetailsDialog courseId={detailsId} onClose={() => setDetailsId(null)} />}
    </Box>
  );
}