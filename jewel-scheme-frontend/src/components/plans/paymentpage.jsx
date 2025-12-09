import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const navigate = useNavigate();


  // Destructure data passed from previous page
  const { type, plan, membership_id, group_id } = location.state || {};

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("googlepay");
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // ---------------------------------------------
  // 🔹 Fetch User Role
  // ---------------------------------------------
  useEffect(() => {
    const role = sessionStorage.getItem("role") || "user";

    setUserRole(role);
  }, []);

  // ---------------------------------------------
  // 🔹 Snackbar Helpers
  // ---------------------------------------------
  const showSnackbar = (message, severity = "info") =>
    setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  // ---------------------------------------------
  // 🔹 Core Payment Handler (Your Updated Logic)
  // ---------------------------------------------
  const handlePayment = async (mode_primary) => {
    setIsLoading(true);
    try {
      const user_id = sessionStorage.getItem("userId");

      if (!plan || !type) throw new Error("Missing plan or payment type!");


      if (type === "join") {
        await axios.post(`${API_BASE_URL}/api/scheme-payments/payment`, {
          customer_user_id: user_id,
          group_id,
          branch_id: plan.branch_id,
          amount: plan.amount_per_inst,
          mode_primary,
        });

        showSnackbar("✅ Plan joined and first payment successful!", "success");
      } else if (type === "installment") {

        await axios.post(`${API_BASE_URL}/api/scheme-payments/pay-installment`, {
          membership_id,
          branch_id: plan.branch_id,
          amount: plan.amount_per_inst,
          mode_primary,
        });

        showSnackbar("✅ Installment paid successfully!", "success");
      }

      // Redirect after short delay
      setTimeout(() => navigate("/my-plans"), 2000);
    } catch (err) {
      console.error("❌ Payment Error:", err);
      showSnackbar(
        err.response?.data?.message || "Payment failed! Please try again.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------
  // 🔹 Bank Transfer Confirmation
  // ---------------------------------------------
  const confirmBankTransfer = async () => {
    setIsBankDialogOpen(false);
    await handlePayment("bank");
  };

  // ---------------------------------------------
  // 🔹 Cash Payment (Admin only)
  // ---------------------------------------------
  const handleCashPayment = async () => {
    await handlePayment("cash");
  };

  // ---------------------------------------------
  // 🔹 Online Payment Button Click
  // ---------------------------------------------
  const handleProceedPayment = () => {
    if (selectedPaymentMethod === "banktransfer") {
      setIsBankDialogOpen(true);
    } else {
      handlePayment(selectedPaymentMethod);
    }
  };

  // ---------------------------------------------
  // 🔹 JSX
  // ---------------------------------------------
  return (
    <Box className="min-h-screen flex flex-col bg-gray-100">
      {/* 🔹 Header */}
      <AppBar position="static" sx={{ bgcolor: "white", color: "rgb(127 29 29)" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton edge="start" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Payment
          </Typography>
          <Box sx={{ width: 48 }} />
        </Toolbar>
      </AppBar>

      {/* 🔹 Payment Options */}
      <Container maxWidth="sm" sx={{ flexGrow: 1, my: 4 }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: "0.5rem", textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Select Payment Method
          </Typography>

          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            >
              {paymentOptions.map(({ value, label, icon }) => (
                <FormControlLabel
                  key={value}
                  value={value}
                  control={<Radio />}
                  label={
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        component="img"
                        src={icon}
                        alt={label}
                        sx={{ width: 32, height: 32, objectFit: "contain" }}
                      />
                      <Typography>{label}</Typography>
                    </Stack>
                  }
                  sx={{
                    mb: 1,
                    border: 1,
                    borderColor:
                      selectedPaymentMethod === value
                        ? "rgb(127 29 29)"
                        : "transparent",
                    borderRadius: "0.5rem",
                    p: 1,
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {/* 🔹 Proceed Button */}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, bgcolor: "rgb(127 29 29)" }}
            onClick={handleProceedPayment}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Proceed to Pay"
            )}
          </Button>

          {/* 🔹 Admin Cash Payment */}
          {["admin", "superadmin"].includes(userRole) && (
            <Button
              fullWidth
              variant="outlined"
              sx={{
                mt: 2,
                borderColor: "rgb(127 29 29)",
                color: "rgb(127 29 29)",
              }}
              onClick={handleCashPayment}
              disabled={isLoading}
            >
              Pay with Cash (Admin Only)
            </Button>
          )}
        </Paper>
      </Container>

      {/* 🔹 Bank Details Dialog */}
      <Dialog open={isBankDialogOpen} onClose={() => setIsBankDialogOpen(false)}>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            Bank Transfer Details
          </Typography>
          <Typography variant="body1">
            Account Name: Jewel Scheme Pvt Ltd <br />
            Account Number: <b>1234567890</b> <br />
            IFSC Code: <b>ABCD0123456</b> <br />
            Bank: Example Bank, City Branch
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBankDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmBankTransfer}
            sx={{ bgcolor: "rgb(127 29 29)", color: "white" }}
          >
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔹 Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentPage;
