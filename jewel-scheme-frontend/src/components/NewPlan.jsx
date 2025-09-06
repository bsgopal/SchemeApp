import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const NewPlan = ({ onBack }) => {
  const [plans, setPlans] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false); // toggle checkboxes
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const navigate = useNavigate();

  // Role check from sessionStorage
  const userRole = (sessionStorage.getItem("role") || "").toLowerCase(); 
  


  // Fetch plans
  useEffect(() => {
    fetchPlans();
  }, []);

  const handleJoinNow = (planId) => {

    navigate(`/plans/joinnewplan/${planId}`);
  };

  const fetchPlans = async ({ page = 1, limit = 20, branch_id = 1, group_code } = {}) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/scheme-groups`, {
        params: { page, limit, branch_id, group_code },
      });
      setPlans(res.data.data);
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  // Handle checkbox toggle
  const togglePlanSelection = (planId) => {
    setSelectedPlans((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]
    );
  };

  // Delete selected
  const handleDelete = async () => {
    try {
      await Promise.all(
        selectedPlans.map((id) =>
          axios.delete(`${API_BASE_URL}/api/scheme-groups/${id}`)
        )
      );
      setPlans(plans.filter((p) => !selectedPlans.includes(p.id)));
      setSelectedPlans([]);
      setConfirmDelete(false);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleEdit = () => {
  if (selectedPlans.length === 1) {
    const planId = selectedPlans[0];
    navigate(`/createnewplan/${planId}`);  
  } else {
    alert("Select exactly 1 plan to edit.");
  }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff", overflowX: "hidden" }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack}>
            <ArrowBackIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{ flexGrow: 1, textAlign: "center", fontWeight: 600 }}
          >
            New Purchase Plan
          </Typography>

          {/* Enable selection mode */}
          {userRole === "superadmin" && (
            <Button
              color="primary"
              variant="outlined"
              onClick={() => setSelectionMode((prev) => !prev)}
            >
              {selectionMode ? "Cancel" : "Select"}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        {/* Action buttons when superadmin & selection active */}
        {userRole === "superadmin" && selectionMode && selectedPlans.length > 0 && (
          <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
            <Button variant="contained" color="warning" onClick={handleEdit}>
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          </Box>
        )}

        {/* Plans Grid */}
        {plans.length > 0 ? (
          <Grid container spacing={2}>
            {plans.map((plan) => (
              <Grid item xs={12} key={plan.id}>
                <Card sx={{ textAlign: "center", display: "flex", alignItems: "center" }}>
                  {/* Checkbox only in selection mode */}
                  {selectionMode && (
                    <Checkbox
                      checked={selectedPlans.includes(plan.id)}
                      onChange={() => togglePlanSelection(plan.id)}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ mb: 2 }}>
                      <img
                        src={plan.banner}
                        alt={`${plan.plan_name} Banner`}
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          maxHeight: 200,
                          objectFit: "cover",
                        }}
                      />
                    </Box>

                    <Typography variant="h6" gutterBottom>
                      {plan.plan_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {plan.note || "A Gold Jewellery Saving scheme with good returns"}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Plan Type: {plan.plan_type}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Amount per installment: ₹{plan.amount_per_inst}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Jewellery Type: {plan.jewellery_type}
                    </Typography>

                    {!selectionMode && (
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="medium"
                        sx={{ mt: 2 }}
                        onClick={() => handleJoinNow(plan.id)}
                      >
                        Join This Plan
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={3} sx={{ p: 3, textAlign: "center", mb: 2 }}>
            <Typography>No plans available.</Typography>
          </Paper>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete selected plan(s)?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button color="error" onClick={handleDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default NewPlan;
