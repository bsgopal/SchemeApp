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
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const shimmerKeyframes = `
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;

const NewPlan = ({ onBack }) => {
  const [plans, setPlans] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const userRole = (sessionStorage.getItem("role") || "").toLowerCase();

 

  // 🔹 join handler
  const handleJoinNow = (planId) => {
    navigate(`/plans/joinnewplan/${planId}`);
  };

  // 🔹 fetch plans
  const fetchPlans = async ({ page = 1, limit = 20, branch_id = 1, group_code } = {}) => {
    try {
      let res;
      if (id) {
        res = await axios.get(`${API_BASE_URL}/api/scheme-groups/${id}`, {
          params: { page, limit, branch_id, group_code },
        });
        setPlans(Array.isArray(res.data.data) ? res.data.data : [res.data.data]);
      } else {
        res = await axios.get(`${API_BASE_URL}/api/scheme-groups`, {
          params: { page, limit, branch_id, group_code },
        });
        setPlans(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 🔹 toggle selection
  const togglePlanSelection = (planId) => {
    setSelectedPlans((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId]
    );
  };

  // 🔹 delete selected
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

  // 🔹 edit handler
  const handleEdit = () => {
    if (selectedPlans.length === 1) {
      const planId = selectedPlans[0];
      navigate(`/createnewplan/${planId}`);
    } else {
      alert("Select exactly 1 plan to edit.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #3a004d, #1a1a1a)",
        color: "#fff",
        overflowX: "hidden",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      {/* Inject shimmer keyframes */}
      <style>{shimmerKeyframes}</style>

      {/* Header */}
      <AppBar
        position="static"
        sx={{
          background: "linear-gradient(90deg, #000, #2c2c2c)",
          borderBottom: "2px solid #d4af37",
        }}
        elevation={2}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              textAlign: "center",
              fontWeight: 700,
              letterSpacing: 1,
              color: "#d4af37",
              textShadow: "0px 0px 6px rgba(212,175,55,0.6)",
            }}
          >
            New Purchase Plan
          </Typography>
          {userRole === "superadmin" && (
            <Button
              sx={{ border: "1px solid #d4af37", color: "#d4af37" }}
              onClick={() => setSelectionMode((prev) => !prev)}
            >
              {selectionMode ? "Cancel" : "Select"}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {userRole === "superadmin" &&
          selectionMode &&
          selectedPlans.length > 0 && (
            <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                sx={{
                  background: "linear-gradient(90deg, #d4af37, #b8860b)",
                  color: "#000",
                  fontWeight: "bold",
                }}
                onClick={handleEdit}
              >
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

        {plans.length > 0 ? (
          <Grid container spacing={4}>
            {plans.map((plan, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={plan.id}>
                <motion.div
                  initial={{ opacity: 0, y: 60, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: index * 0.2,
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                >
                  <Card
                    sx={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(212,175,55,0.6)",
                      borderRadius: 3,
                      overflow: "hidden",
                      backdropFilter: "blur(8px)",
                      color: "#fff",
                      transition: "all 0.4s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-8px) scale(1.03)",
                        boxShadow: "0px 12px 30px rgba(212, 175, 55, 0.5)",
                      },
                    }}
                  >
                    {selectionMode && (
                      <Checkbox
                        checked={selectedPlans.includes(plan.id)}
                        onChange={() => togglePlanSelection(plan.id)}
                        sx={{ color: "#d4af37" }}
                      />
                    )}
                    <CardContent sx={{ textAlign: "center" }}>
                      {/* Shimmer wrapper */}
                      <Box
                        sx={{
                          mb: 2,
                          borderRadius: 2,
                          overflow: "hidden",
                          border: "2px solid #d4af37",
                          position: "relative",
                        }}
                      >
                        <motion.img
                          src={`${process.env.REACT_APP_API_URL}${plan.banner}`}
                          alt={`${plan.plan_name} Banner`}
                          style={{
                            width: "100%",
                            maxHeight: 220,
                            objectFit: "cover",
                          }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.4 }}
                        />
                        {/* shimmer overlay */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: "-100%",
                            width: "200%",
                            height: "100%",
                            background:
                              "linear-gradient(120deg, transparent 20%, rgba(255,215,0,0.4) 50%, transparent 80%)",
                            animation: "shimmer 3s infinite",
                          }}
                        />
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{
                          color: "#ffd700",
                          fontWeight: "bold",
                          textShadow: "0 0 8px rgba(255,215,0,0.6)",
                        }}
                      >
                        {plan.plan_name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#ddd", fontStyle: "italic", mt: 1 }}
                        gutterBottom
                      >
                        {plan.note ||
                          "A Gold Jewellery Saving scheme with good returns"}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ color: "#aaa" }}
                      >
                        Plan Type: {plan.plan_type}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ color: "#aaa" }}
                      >
                        Amount per installment: ₹{plan.amount_per_inst}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ color: "#aaa" }}
                      >
                        Jewellery Type: {plan.jewellery_type}
                      </Typography>

                      {!selectionMode && (
                        <motion.div whileHover={{ scale: 1.08 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            size="medium"
                            sx={{
                              mt: 2,
                              background:
                                "linear-gradient(90deg, #ffd700, #d4af37)",
                              color: "#000",
                              fontWeight: "bold",
                              borderRadius: 2,
                              boxShadow: "0px 4px 12px rgba(212,175,55,0.6)",
                            }}
                            onClick={() => handleJoinNow(plan.id)}
                          >
                            Join This Plan
                          </Button>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: "center",
              mb: 2,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid #d4af37",
              color: "#d4af37",
            }}
          >
            <Typography>No plans available.</Typography>
          </Paper>
        )}

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
