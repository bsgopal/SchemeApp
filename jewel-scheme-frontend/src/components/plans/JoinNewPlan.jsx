import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Box,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

const JoinNewPlan = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const [userData, setUserData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    area: "",
    city: "",
    state: "Tamilnadu",
    pincode: "",
    country: "",
    panCard: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  // Fetch user session data
  useEffect(() => {
    const name = localStorage.getItem("name");
    const mobile = localStorage.getItem("mobile");
    const email = localStorage.getItem("email");

    setUserData({ name, mobile, email });
    setFormData((p) => ({ ...p, fullName: name }));
  }, []);

  // Fetch plan details
  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/scheme-groups/${planId}`);
        setSelectedPlan(res.data.data);
      } catch (err) {
        console.error("❌ Fetch plan error:", err);
      }
    };
    fetchPlan();
  }, [planId, API_BASE_URL]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormValid = () =>
    formData.fullName &&
    formData.address &&
    formData.area &&
    formData.city &&
    formData.state &&
    formData.pincode;

  // -----------------------------
  // 🚀 JOIN FLOW (Payment -> Join)
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userId = localStorage.getItem("userId");

      // Step 1: Create payment
      const payRes = await axios.post(
        
        `${API_BASE_URL}/api/scheme-payments/payment`,
        
        {
          customer_user_id: userId,
          group_id: selectedPlan?.id,
          amount: selectedPlan?.inst_amount || selectedPlan?.amount_per_inst || 500,
          branch_id: selectedPlan?.branch_id || 1,
        }
        
      );


      if (!payRes.data.success) {
        throw new Error("Payment failed");
      }

      const paymentId = payRes.data.payment_id;

      // Step 2: Join plan AFTER payment success
      const joinRes = await axios.post(
        `${API_BASE_URL}/api/scheme-payments/join-after-payment`,
        {
          payment_id: paymentId,
          customer_user_id: userId,
          group_id: selectedPlan?.id,
          branch_id: selectedPlan?.branch_id || 1,
        }
      );

      if (!joinRes.data.success) {
        throw new Error("Join failed");
      }

      // Success UI
      setSnackbar({
        open: true,
        message: `Joined successfully! Member No: ${joinRes.data.member_no}`,
        severity: "success",
      });

      navigate(`/plans/payment/${joinRes.data.membership_id}`, {
        state: {
          type: "join",
          plan: selectedPlan,
          membership_id: joinRes.data.membership_id,
          group_id: selectedPlan?.id,
        },
      });

    } catch (err) {
      console.error("❌ JOIN ERROR:", err);
      setSnackbar({
        open: true,
        message: "❌ Failed to join plan",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };



  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const indianStates = [
    "Andhra Pradesh",
    "Bihar",
    "Karnataka",
    "Kerala",
    "Maharashtra",
    "Tamilnadu",
    "Telangana",
    "Uttar Pradesh",
    "West Bengal",
  ];

  return (
    <Box className="min-h-screen flex flex-col bg-gray-100">
      <AppBar position="static" sx={{ bgcolor: "white", color: "rgb(127 29 29)", boxShadow: 1 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Contact
          </Typography>
          <Box sx={{ width: 48 }} />
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ flexGrow: 1, my: 4 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 50, color: "rgb(127 29 29)" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>
            Contact Details
          </Typography>
          <Typography>{userData?.mobile}</Typography>
          <Typography>{userData?.email}</Typography>
        </Box>

        <Paper elevation={2} sx={{ p: 3, borderRadius: "0.5rem" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Please share your details
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Area" name="area" value={formData.area} onChange={handleChange} required sx={{ mb: 2 }} />

            <Box display="flex" gap={2} mb={2}>
              <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleChange} required />
              <Autocomplete
                options={indianStates}
                value={formData.state || null}
                onChange={(e, v) => setFormData({ ...formData, state: v })}
                renderInput={(params) => <TextField {...params} label="State" required />}
                fullWidth
              />
            </Box>

            <TextField fullWidth label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="PAN Card" name="panCard" value={formData.panCard} onChange={handleChange} sx={{ mb: 2 }} />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading || !isFormValid()}
              sx={{ bgcolor: "rgb(127 29 29)" }}
            >
              {isLoading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Join Now"}
            </Button>
          </Box>
        </Paper>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default JoinNewPlan;
