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
  FormLabel,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  Avatar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// This is a single-file component for the entire application as per the design requirements.
// All components, hooks, and logic are contained within this file.

// Mock data for payment options
const paymentOptions = [
  {
    value: "googlepay",
    label: "Google Pay",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png",
  },
  {
    value: "phonepe",
    label: "PhonePe",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/3a/PhonePe_Logo.png",
  },
  {
    value: "upi",
    label: "UPI (Paytm)",
    icon: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Paytm_logo.png",
  },
  {
    value: "banktransfer",
    label: "Bank Transfer",
    icon: "https://cdn-icons-png.flaticon.com/512/263/263115.png",
  },
];

const PaymentPage = () => {
  const { membershipId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State to manage UI and payment logic
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("googlepay");
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // State to simulate user role for admin-only features
  const [userRole, setUserRole] = useState("user");

  // Simulating fetching user role
  useEffect(() => {
    // In a real application, you would fetch the user's role from a backend or authentication context.
    // For this example, we'll use a simple mock role. Change this value to 'admin' or 'superadmin' to see the cash payment option.
    const mockRole = "user"; // Change this to 'admin' to test
    setUserRole(mockRole);
  }, []);

  const showSnackbar = (msg, severity = "info") => {
    setSnackbar({ open: true, message: msg, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Function to handle online payments (Razorpay)
  const handleOnlinePayment = async () => {
    if (selectedPaymentMethod === 'banktransfer') {
      setIsBankDialogOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const { data: order } = await axios.post("http://localhost:5000/api/payment/order", {
        amount: 500,
        membership_id: membershipId,
      });

      const options = {
        key: "YOUR_RAZORPAY_KEY_ID", // Replace with your actual key
        amount: order.amount,
        currency: order.currency,
        name: "Jewels Scheme",
        description: "Membership Payment",
        order_id: order.id,
        handler: async (response) => {
          await axios.post("http://localhost:5000/api/payment/verify", {
            ...response,
            membership_id: membershipId,
          });
          showSnackbar("✅ Online Payment Successful!", "success");
        },
        theme: { color: "#7f1d1d" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("❌ Online Payment Error:", err);
      showSnackbar("Online payment failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle cash payments (admin-only)
  const handleCashPayment = async () => {
    setIsLoading(true);
    try {
      await axios.post("http://localhost:5000/api/payments", {
        receipt_no: `CASH-${Date.now()}`,
        receipt_date: new Date(),
        membership_id: membershipId,
        receipt_type: "installment",
        amount: 500,
        mode_primary: "cash",
        mode1_amount: 500,
        status: "success",
      });
      showSnackbar("✅ Cash Payment Recorded!", "success");
    } catch (err) {
      console.error("❌ Cash Payment Error:", err);
      showSnackbar("Cash payment failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to confirm a bank transfer
  const confirmBankPayment = async () => {
    setIsLoading(true);
    try {
      await axios.post("http://localhost:5000/api/payments", {
        receipt_no: `BANK-${Date.now()}`,
        receipt_date: new Date(),
        membership_id: membershipId,
        receipt_type: "installment",
        amount: 500,
        mode_primary: "bank_transfer",
        mode1_amount: 500,
        status: "pending",
      });
      showSnackbar("✅ Bank Transfer Recorded! Awaiting confirmation.", "success");
      setIsBankDialogOpen(false);
    } catch (err) {
      console.error("❌ Bank Transfer Error:", err);
      showSnackbar("Bank transfer failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex flex-col bg-gray-100">
      {/* App Bar */}
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

      {/* Main Content Container */}
      <Container maxWidth="sm" sx={{ flexGrow: 1, my: 4 }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: "0.5rem", textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Select Payment Method
          </Typography>

          <FormControl component="fieldset" fullWidth>
            <RadioGroup value={selectedPaymentMethod} onChange={(e) => setSelectedPaymentMethod(e.target.value)}>
              {paymentOptions.map(({ value, label, icon }) => (
                <FormControlLabel
                  key={value}
                  value={value}
                  control={<Radio />}
                  label={
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={icon}
                        alt={label}
                        sx={{ width: 32, height: 32, bgcolor: "transparent" }}
                        variant="square"
                      />
                      <Typography>{label}</Typography>
                    </Stack>
                  }
                  sx={{ mb: 1, border: 1, borderColor: selectedPaymentMethod === value ? "rgb(127 29 29)" : "transparent", borderRadius: "0.5rem", p: 1 }}
                />
              ))}
            </RadioGroup>
          </FormControl>
          
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, bgcolor: "rgb(127 29 29)", "&:hover": { bgcolor: "rgb(100 20 20)" } }}
            onClick={selectedPaymentMethod === "banktransfer" ? () => setIsBankDialogOpen(true) : handleOnlinePayment}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Proceed to Pay"}
          </Button>

          {/* Conditional rendering for cash payment button */}
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

      {/* Bank Transfer Dialog */}
      <Dialog open={isBankDialogOpen} onClose={() => setIsBankDialogOpen(false)}>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            Bank Transfer Details
          </Typography>
          <Typography variant="body1">
            Account Name: Jewels Scheme Pvt Ltd <br />
            Account Number: 1234567890 <br />
            IFSC Code: ABCD0123456 <br />
            Bank: Example Bank, City Branch
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBankDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmBankPayment} sx={{ bgcolor: "rgb(127 29 29)", color: "white", "&:hover": { bgcolor: "rgb(100 20 20)" } }}>
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for error/success messages */}
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
