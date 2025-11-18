import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PaymentIcon from "@mui/icons-material/Payment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const PlanDetails = () => {
  const { membership_id,id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan || {};

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

  // 🔹 Fetch payment history
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/scheme-payments/${membership_id}`);
        console.log(res.data);
        
        setPayments(res.data || []);
      } catch (err) {
        console.error("Error fetching payment history:", err);
        setSnackbar({
          open: true,
          message: "Failed to load payment history",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [API_BASE_URL, id]);

  // 🔹 Snackbar close handler
  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  // 🔹 Handle payment logic
  const handlePayNow = () => {
    if (!plan) {
      setSnackbar({
        open: true,
        message: "Plan details not found!",
        severity: "error",
      });
      return;
    }
    console.log(plan.membership_id);
    
    if (plan.membership_id) {
      // 👉 Existing member → Pay next installment
      navigate(`/plans/payment/${plan.membership_id}`, {
        state: {
          plan,
          type: "installment", // Just to know purpose
          membership_id: plan.membership_id,
        },
      });
    } else {
      // 👉 New user joining plan
      navigate(`/plans/payment/${plan.id}`, {
        state: {
          plan,
          type: "join", // joining a new plan
          group_id: plan.group_id,
        },
      });
    }
  };

  const upcomingPayment = () => plan.inst_amount || plan.amount_per_inst;
  const upcomingDate = () => {
    if (!payments.length) return plan.start_date;
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    return next.toLocaleDateString();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #12001a, #2c0040)",
        color: "#EDE7F6",
        p: 2,
      }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" mb={2}>
        <Button
          onClick={() => navigate(-1)}
          color="warning"
          startIcon={<ArrowBackIcon />}
        >
          Back
        </Button>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            textAlign: "center",
            color: "#FFD700",
            fontWeight: 700,
            textShadow: "0 0 8px rgba(255,215,0,0.5)",
          }}
        >
          Plan Details
        </Typography>
      </Box>

      {/* Plan Information */}
      <Paper
        sx={{
          background: "linear-gradient(145deg, #260035, #3d0060)",
          borderRadius: 3,
          p: 3,
          mb: 3,
          border: "1px solid rgba(255,215,0,0.3)",
        }}
        elevation={6}
      >
        <Typography
          variant="h6"
          sx={{
            color: "#FFD700",
            mb: 1,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          {plan.plan_name || plan.scheme_name}
        </Typography>
        <Divider sx={{ borderColor: "rgba(255,215,0,0.4)", mb: 2 }} />

        <Box display="flex" alignItems="center" mb={1}>
          <CurrencyRupeeIcon sx={{ color: "#FFD700", mr: 1 }} />
          <Typography sx={{ color: "#EDE7F6" }}>
            <b>Installment Amount:</b> ₹{" "}
            {plan.inst_amount || plan.amount_per_inst}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={1}>
          <CalendarMonthIcon sx={{ color: "#FFD700", mr: 1 }} />
          <Typography sx={{ color: "#EDE7F6" }}>
            <b>Duration:</b> {plan.no_of_inst || plan.duration} months
          </Typography>
        </Box>

        <Box display="flex" alignItems="center">
          <PaymentIcon sx={{ color: "#FFD700", mr: 1 }} />
          <Typography sx={{ color: "#B39DDB" }}>
            <b>Status:</b> {plan.status || "Active"}
          </Typography>
        </Box>
      </Paper>

      {/* 🔶 Upcoming Payment */}
      <Typography
        variant="h6"
        sx={{
          color: "#FFD700",
          mb: 1,
          fontWeight: 600,
          textShadow: "0 0 6px rgba(255,215,0,0.4)",
        }}
      >
        Upcoming Payment
      </Typography>

      <Paper
        sx={{
          p: 2,
          mb: 3,
          background: "linear-gradient(145deg, #4b0066, #1a001f)",
          borderRadius: 3,
          border: "1px solid rgba(255,215,0,0.3)",
          color: "#EDE7F6",
        }}
        elevation={4}
      >
        <Typography variant="body2" sx={{ mb: 1 }}>
          <b>Amount:</b> ₹ {upcomingPayment()}
        </Typography>
        <Typography variant="body2">
          <b>Due Date:</b> {upcomingDate()}
        </Typography>

        <Button
          type="installment"
          fullWidth
          variant="contained"
          sx={{
            mt: 2,
            background: "linear-gradient(90deg, #FFD700, #c0a000)",
            color: "#3a004d",
            fontWeight: 700,
            "&:hover": {
              background: "linear-gradient(90deg, #ffe066, #e6c300)",
            },
          }}
          onClick={handlePayNow}
        >
          Pay Now
        </Button>
      </Paper>

      {/* 🧾 Payment History */}
      <Typography
        variant="h6"
        sx={{
          color: "#FFD700",
          mb: 1,
          fontWeight: 600,
          textShadow: "0 0 6px rgba(255,215,0,0.4)",
        }}
      >
        Payment History
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress color="warning" />
        </Box>
      ) : payments.length === 0 ? (
        <Typography variant="body2" sx={{ color: "#C1B5E0", mb: 3 }}>
          No payments done yet.
        </Typography>
      ) : (
        <Box sx={{ mb: 3 }}>
          {payments.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,215,0,0.3)",
                  borderRadius: 2,
                  color: "#F5F5F5",
                }}
              >
                <Typography variant="body2">
                  <b>Amount:</b> ₹ {p.amount}
                </Typography>
                <Typography variant="body2">
                  <b>Date:</b> {new Date(p.date).toLocaleDateString()}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: p.status === "Paid" ? "#81C784" : "#EF5350",
                    fontWeight: 600,
                  }}
                >
                  <b>Status:</b> {p.status}
                </Typography>
              </Card>
            </motion.div>
          ))}
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PlanDetails;
