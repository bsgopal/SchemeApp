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
  const [userData, setUserData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

  // 🧠 Fetch logged-in user details from sessionStorage
  useEffect(() => {
    const name = sessionStorage.getItem("name");
    const mobile = sessionStorage.getItem("mobile");
    const email = sessionStorage.getItem("email");
    setUserData({ name, mobile, email });
    setFormData((prev) => ({ ...prev, fullName: name }));
  }, []);

  // 📦 Fetch selected plan details
 useEffect(() => {
  const fetchPlanDetails = async () => {
    if (!planId) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/scheme-groups/${planId}`);
      // console.log(res.data.data);
      setSelectedPlan(res.data.data);
    } catch (err) {
      console.error("❌ Error fetching plan details:", err);
    }
  };
  fetchPlanDetails();
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

  // ✅ Updated to use your new backend route `/api/payments/join-plan`
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userId = sessionStorage.getItem("userId");
      const payload = {
        plan_id: planId,
        group_id: selectedPlan?.id 
              || selectedPlan?.group_code 
              || planId,
        customer_user_id: userId,
        branch_id: selectedPlan?.branch_id || 1,
        amount: selectedPlan?.inst_amount || selectedPlan?.amount_per_inst || 500,
        notes: `PAN: ${formData.panCard}, Address: ${formData.address}, Area: ${formData.area}, City: ${formData.city}, State: ${formData.state}, Pincode: ${formData.pincode}, Country: ${formData.country}`,
      };

      const res = await axios.post(`${API_BASE_URL}/api/scheme-payments/join-plan`, payload);


      if (res.data.success) {
        setSnackbar({
          open: true,
          message: `✅ Joined successfully! TXN ID: ${res.data.transaction_id}`,
          severity: "success",
        });

        // Navigate to payment confirmation page
        navigate(`/plans/payment/${res.data.membership_id}`, {
            state: {
              type: "join",
              plan: selectedPlan,
              group_id: selectedPlan?.id || selectedPlan?.group_code || planId,
              membership_id: res.data.membership_id,   // backend should return it
            },
          });

      } else {
        setSnackbar({
          open: true,
          message: "❌ Failed to join plan. Please try again.",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("❌ Server error while joining plan:", err);
      setSnackbar({
        open: true,
        message: "❌ Server error while joining plan",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

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
          <IconButton edge="start" color="inherit" aria-label="back" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
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
          <Typography variant="body2">{userData?.mobile}</Typography>
          <Typography variant="body2">{userData?.email}</Typography>
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
                onChange={(e, newValue) => setFormData({ ...formData, state: newValue })}
                renderInput={(params) => <TextField {...params} label="State" required />}
                fullWidth
              />
            </Box>

            <TextField fullWidth label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="PAN Card" name="panCard" value={formData.panCard} onChange={handleChange} sx={{ mb: 2 }} />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading || !isFormValid()}
              sx={{ bgcolor: "rgb(127 29 29)" }}
            >
              {isLoading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Join Now"}
            </Button>
          </Box>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default JoinNewPlan;
