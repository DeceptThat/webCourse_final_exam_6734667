//src/components/CourseDetailsDialog.jsx

import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { UserContext } from "../context/UserContext";
import StatusChip from "./StatusChip";

// Loads one course from GET /api/course/:id
// Teacher gets the enrolled student list, Student does not
export default function CourseDetailsDialog({ courseId, onClose }) {
  const { apiFetch } = useContext(UserContext);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`/api/course/${courseId}`)
      .then(setCourse)
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const rows = course
    ? [
        ["Teacher", course.teacherName],
        ["Duration", `${course.duration} days`],
        [
          "Topics",
          course.topics.map((t) => <Chip key={t} label={t} size="small" sx={{ mr: 0.5, mb: 0.5 }} />),
        ],
        ["Price", course.price.toLocaleString()],
        ["Max Student", course.maxStudent],
        ["Enrolled", `${course.enrolledCount} (seats left: ${course.seatsLeft})`],
        ["Status", <StatusChip key="s" status={course.status} />],
      ]
    : [];

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{course ? course.name : "Course Details"}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        {!course && !error && <Typography>Loading...</Typography>}

        {course && (
          <>
            <Table size="small" sx={{ mb: 2 }}>
              <TableBody>
                {rows.map(([label, value]) => (
                  <TableRow key={label}>
                    <TableCell sx={{ fontWeight: 600, width: 140 }}>{label}</TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {course.students && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Enrolled Students ({course.students.length})
                </Typography>
                {course.students.length === 0 ? (
                  <Typography color="text.secondary">No students enrolled yet.</Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Username</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Enrolled At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {course.students.map((s, i) => (
                        <TableRow key={s._id}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{s.username}</TableCell>
                          <TableCell>{s.email}</TableCell>
                          <TableCell>{new Date(s.enrolledAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}

            {course.isEnrolled && (
              <Alert severity="success" sx={{ mt: 1 }}>
                You are enrolled in this course.
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}