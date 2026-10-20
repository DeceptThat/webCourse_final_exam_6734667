//src/pages/MyEnrollments.jsx

import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { UserContext } from "../context/UserContext";
import StatusChip from "../components/StatusChip";
import CourseDetailsDialog from "../components/CourseDetailsDialog";

export default function MyEnrollments() {
  const { user, apiFetch } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailsId, setDetailsId] = useState(null);

  useEffect(() => {
    apiFetch(`/api/user/${user._id}`)
      .then((data) => setCourses(data.enrolledCourses || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user._id]);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        My Enrollments
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
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
                <TableCell colSpan={7}>You have not enrolled in any course yet.</TableCell>
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
                  <StatusChip status={c.status} />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => setDetailsId(c._id)}>
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {detailsId && <CourseDetailsDialog courseId={detailsId} onClose={() => setDetailsId(null)} />}
    </Box>
  );
}