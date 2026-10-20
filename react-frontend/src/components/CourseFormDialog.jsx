//src/components/CourseFormDialog.jsx

import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";

// Rendered only while open, so the form resets each time
export default function CourseFormDialog({ course, onClose, onSave }) {
  const [form, setForm] = useState(
    course
      ? {
          name: course.name,
          duration: course.duration,
          topics: course.topics.join(", "),
          price: course.price,
          maxStudent: course.maxStudent,
          status: course.status,
        }
      : { name: "", duration: "", topics: "", price: "", maxStudent: "", status: "Open" },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        duration: Number(form.duration),
        topics: form.topics
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        price: Number(form.price),
        maxStudent: Number(form.maxStudent),
        status: form.status,
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{course ? "Edit Course" : "Create Course"}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          )}
          <TextField label="Course Name" fullWidth margin="dense" required value={form.name} onChange={set("name")} />
          <TextField label="Duration (days)" type="number" fullWidth margin="dense" required slotProps={{ htmlInput: { min: 1, step: 1 } }} value={form.duration} onChange={set("duration")} />
          <TextField label="Topics (comma separated)" fullWidth margin="dense" required placeholder="HTML, CSS, JavaScript" value={form.topics} onChange={set("topics")} />
          <TextField label="Price" type="number" fullWidth margin="dense" required slotProps={{ htmlInput: { min: 0, step: "any" } }} value={form.price} onChange={set("price")} />
          <TextField label="Max Student" type="number" fullWidth margin="dense" required slotProps={{ htmlInput: { min: 1, step: 1 } }} value={form.maxStudent} onChange={set("maxStudent")} />
          <TextField label="Status" select fullWidth margin="dense" value={form.status} onChange={set("status")}>
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="Close">Close</MenuItem>
            <MenuItem value="Cancel">Cancel</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}