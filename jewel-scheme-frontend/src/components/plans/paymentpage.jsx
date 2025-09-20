import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Box,
  Paper,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";


import GooglePayLogo from "../images/gpay.jpeg";
import PhonePeLogo from "../images/phonepe.jpeg";
import UpiLogo from "../images/paytm.jpeg";
import BankLogo from "../images/bank.png";

const paymentOptions = [
  { value: "googlepay", label: "Google Pay", icon: GooglePayLogo },
  { value: "phonepe", label: "PhonePe", icon: PhonePeLogo },
  { value: "upi", label: "UPI (Paytm)", icon: UpiLogo },
  { value: "banktransfer", label: "Bank Transfer", icon: BankLogo },
];

const PaymentPage = () => {
  const { membershipId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const { plan } = location.state || {}; // Get plan details from JoinNewPlan page

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("googlepay");
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    const role = sessionStorage.getItem("role") || "user";
    setUserRole(role);
  }, []);

  const showSnackbar = (msg, severity = "info") => setSnackbar({ open: true, message: msg, severity });
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  // ---------------- Payment Handlers ----------------

  const handleOnlinePayment = async () => {
    setIsLoading(true);
    try {
      // 1️⃣ Save Payment
      await axios.post(`${API_BASE_URL}/api/scheme-payments`, {
        receipt_no: `ONLINE-${Date.now()}`,
        receipt_date: new Date(),
        membership_id: membershipId,
        receipt_type: "installment",
        amount: plan?.amount_per_inst || 500,
        mode_primary: "razorpay",
        status: "completed",
      });

      // 2️⃣ Join Plan
      await axios.post(`${API_BASE_URL}/api/plans/join`, {
        plan_id: plan?.id,
        user_id: sessionStorage.getItem("user_id") || 1,
      });

      showSnackbar("✅ Payment Successful & Plan Joined!", "success");
      navigate("/my-plans");
    } catch (err) {
      console.error("❌ Online Payment Error:", err);
      showSnackbar("Online payment failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmBankTransfer = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/scheme-payments`, {
        receipt_no: `BANK-${Date.now()}`,
        receipt_date: new Date(),
        membership_id: membershipId,
        receipt_type: "installment",
        amount: plan?.amount_per_inst || 500,
        mode_primary: "bank",
        status: "completed",
      });

      await axios.post(`${API_BASE_URL}/api/plans/join`, {
        plan_id: plan?.id,
        user_id: sessionStorage.getItem("user_id") || 1,
      });

      showSnackbar("✅ Bank Transfer Recorded! Awaiting verification.", "success");
      setIsBankDialogOpen(false);
    } catch (err) {
      console.error("❌ Bank Transfer Error:", err);
      showSnackbar("Bank transfer failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCashPayment = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/scheme-payments`, {
        receipt_no: `CASH-${Date.now()}`,
        receipt_date: new Date(),
        membership_id: membershipId,
        receipt_type: "installment",
        amount: plan?.amount_per_inst || 500,
        mode_primary: "cash",
        status: "completed",
      });

      await axios.post(`${API_BASE_URL}/api/plans/join`, {
        plan_id: plan?.id,
        user_id: sessionStorage.getItem("user_id") || 1,
      });

      showSnackbar("✅ Cash Payment Recorded!", "success");
    } catch (err) {
      console.error("❌ Cash Payment Error:", err);
      showSnackbar("Cash payment failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- JSX ----------------
  return (
    <Box className="min-h-screen flex flex-col bg-gray-100">
      <AppBar position="static" sx={{ bgcolor: "white", color: "rgb(127 29 29)" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton edge="start" onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>Payment</Typography>
          <Box sx={{ width: 48 }} />
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ flexGrow: 1, my: 4 }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: "0.5rem", textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>Select Payment Method</Typography>

          <FormControl component="fieldset" fullWidth>
            <RadioGroup value={selectedPaymentMethod} onChange={(e) => setSelectedPaymentMethod(e.target.value)}>
              {paymentOptions.map(({ value, label, icon }) => (
                <FormControlLabel
                  key={value}
                  value={value}
                  control={<Radio />}
                  label={
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box component="img" src={icon} alt={label} sx={{ width: 32, height: 32, objectFit: "contain" }} />
                      <Typography>{label}</Typography>
                    </Stack>
                  }
                  sx={{
                    mb: 1,
                    border: 1,
                    borderColor: selectedPaymentMethod === value ? "rgb(127 29 29)" : "transparent",
                    borderRadius: "0.5rem",
                    p: 1,
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, bgcolor: "rgb(127 29 29)" }}
            onClick={selectedPaymentMethod === "banktransfer" ? () => setIsBankDialogOpen(true) : handleOnlinePayment}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Proceed to Pay"}
          </Button>

          {["admin", "superadmin"].includes(userRole) && (
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 2, borderColor: "rgb(127 29 29)", color: "rgb(127 29 29)" }}
              onClick={handleCashPayment}
              disabled={isLoading}
            >
              Pay with Cash (Admin Only)
            </Button>
          )}
        </Paper>
      </Container>

      {/* Bank Dialog */}
      <Dialog open={isBankDialogOpen} onClose={() => setIsBankDialogOpen(false)}>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>Bank Transfer Details</Typography>
          <Typography variant="body1">
            Account Name: Jewel Scheme Pvt Ltd <br />
            Account Number: <b>1234567890</b> <br />
            IFSC Code: <b>ABCD0123456</b> <br />
            Bank: Example Bank, City Branch
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBankDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmBankTransfer} sx={{ bgcolor: "rgb(127 29 29)", color: "white" }}>Confirm Payment</Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default PaymentPage;
