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
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

const ProgressCircle = ({ number, text, isActive }) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 1.2,
    }}
  >
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "600",
        fontSize: "0.75rem",
        backgroundColor: isActive ? "rgb(127 29 29)" : "rgb(229 231 235)",
        color: isActive ? "white" : "rgb(156 163 175)",
      }}
    >
      {number}
    </Box>

    <Typography
      variant="body2"
      sx={{
        fontWeight: isActive ? "600" : "400",
        color: isActive ? "rgb(127 29 29)" : "rgb(156 163 175)",
        textTransform: "uppercase",
        fontSize: "0.8rem",
      }}
    >
      {text}
    </Typography>
  </Box>
);

const JoinNewPlan = () => {
  const { id: planId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState(1);
  const [membershipId, setMembershipId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    panCard: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // New state for Bank Transfer dialog
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUserDetails = () => {
      const name = sessionStorage.getItem("name");
      const mobile = sessionStorage.getItem("mobile");
      const email = sessionStorage.getItem("email");
      setUserData({ name, mobile, email });
      setFormData((prev) => ({
        ...prev,
        fullName: name,
      }));
    };
    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (!planId) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/schemes/${planId}`);
        setSelectedPlan(res.data);
      } catch (err) {
        console.error("❌ Error fetching plan details:", err);
      }
    };
    fetchPlanDetails();
  }, [planId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userId = sessionStorage.getItem("userId");
      const payload = {
        group_id: planId,
        customer_user_id: userId,
        inst_amount: selectedPlan?.installmentAmount || 500,
        notes: `PAN: ${formData.panCard}, Address: ${formData.address}, Area: ${formData.area}, City: ${formData.city}, State: ${formData.state}, Pincode: ${formData.pincode}, Country: ${formData.country}`,
      };
      const res = await axios.post("http://localhost:5000/api/scheme-memberships", payload);
      setMembershipId(res.data.id);
      setStep(2);
    } catch (err) {
      console.error("❌ Error creating membership:", err);
      showMessage("Failed to create membership. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.area.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.state.trim() !== "" &&
      formData.pincode.trim() !== ""
    );
  };

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  const handleOnlinePayment = async () => {
    if (!selectedPlan?.installmentAmount) {
      showMessage("Plan details are not available. Please try again later.");
      return;
    }
    try {
      const { data: order } = await axios.post("http://localhost:5000/api/payment/order", {
        amount: selectedPlan.installmentAmount,
        membership_id: membershipId,
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
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

          await axios.post("http://localhost:5000/api/payments", {
            receipt_no: `RZP-${Date.now()}`,
            receipt_date: new Date(),
            membership_id: membershipId,
            receipt_type: "installment",
            amount: order.amount / 100,
            mode_primary: "razorpay",
            mode1_amount: order.amount / 100,
            status: "success",
          });
          showMessage("✅ Online Payment Successful!");
        },
        prefill: {
          name: userData?.name,
          email: userData?.email,
          contact: userData?.mobile,
        },
        theme: { color: "#7f1d1d" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("❌ Online Payment Error:", err);
      showMessage("Online payment failed. Please try again.");
    }
  };

  const handleCashPayment = async () => {
    if (!selectedPlan?.installmentAmount) {
      showMessage("Plan details are not available. Please try again later.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/payments", {
        receipt_no: `CASH-${Date.now()}`,
        receipt_date: new Date(),
        membership_id: membershipId,
        receipt_type: "installment",
        amount: selectedPlan.installmentAmount,
        mode_primary: "cash",
        mode1_amount: selectedPlan.installmentAmount,
        status: "success",
      });
      showMessage("✅ Cash Payment Recorded!");
    } catch (err) {
      console.error("❌ Cash Payment Error:", err);
      showMessage("Cash payment recording failed. Please try again.");
    }
  };

  const handleBankTransferPayment = () => {
    setIsBankDialogOpen(true);
  };

  const confirmBankPayment = async () => {
    if (!selectedPlan?.installmentAmount) {
      showMessage("Plan details are not available. Please try again later.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/payments", {
        receipt_no: `BANK-${Date.now()}`,
        receipt_date: new Date(),
        membership_id: membershipId,
        receipt_type: "installment",
        amount: selectedPlan.installmentAmount,
        mode_primary: "bank_transfer",
        mode1_amount: selectedPlan.installmentAmount,
        status: "pending",
      });
      showMessage("✅ Bank Transfer Payment Recorded! Please wait for confirmation.");
      setIsBankDialogOpen(false);
    } catch (err) {
      console.error("❌ Bank Transfer Payment Error:", err);
      showMessage("Bank transfer payment recording failed. Please try again.");
    }
  };

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

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 4,
          py: 2,
          bgcolor: "rgb(254 242 242)",
        }}
      >
        <ProgressCircle number={1} text="SELECT PLAN" isActive={true} />
        <ProgressCircle number={2} text="CONTACT" isActive={true} />
        <ProgressCircle number={3} text="PAYMENT" isActive={false} />
      </Box>

      <Container maxWidth="sm" sx={{ flexGrow: 1, my: 4 }}>
        {step === 1 ? (
          <>
            <Box sx={{ position: "relative", mb: 3 }}>
              <Box
                className="bg-red-900 rounded-full w-16 h-16 flex items-center justify-center text-white"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 1,
                }}
              >
                <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />
              </Box>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  pt: 6,
                  bgcolor: "rgb(254 242 242)",
                  color: "rgb(127 29 29)",
                  borderRadius: "0.5rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 2 }}>
                  Contact Details
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold", mt: 2 }}>
                  Namaste {userData?.name || ""}
                </Typography>
                <Typography variant="body2">{userData?.mobile || ""}</Typography>
                <Typography variant="body2">{userData?.email || ""}</Typography>
              </Paper>
            </Box>

            <Paper elevation={2} sx={{ p: 3, borderRadius: "0.5rem" }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 2 }}>
                Please share your details.
              </Typography>
              <Box component="form" onSubmit={handleSubmit}>
                <Box mb={2}>
                  <TextField
                    fullWidth
                    label="Please enter your full name."
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Box>
                <Box mb={2}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Box>
                <Box mb={2}>
                  <TextField
                    fullWidth
                    label="Area *"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Box>
                <Box display="flex" gap={3} mb={2}>
                  <TextField
                    fullWidth
                    label="City *"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                  <Autocomplete
                    options={indianStates}
                    value={formData.state || null}
                    onChange={(e, newValue) => setFormData({ ...formData, state: newValue })}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="State *"
                        variant="outlined"
                        required
                      />
                    )}
                    fullWidth
                  />
                </Box>
                <Box mb={2}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Box>
                <Box mb={2}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", my: 2 }}>
                    Please enter your PAN Card number
                  </Typography>
                  <TextField
                    fullWidth
                    label="PAN Card Number"
                    name="panCard"
                    value={formData.panCard}
                    onChange={(e) => {
                      let value = e.target.value.toUpperCase();
                      if (value.length <= 5) {
                        value = value.replace(/[^A-Z]/g, "");
                      } else if (value.length <= 9) {
                        const first5 = value.slice(0, 5).replace(/[^A-Z]/g, "");
                        const nextDigits = value.slice(5).replace(/[^0-9]/g, "");
                        value = first5 + nextDigits;
                      } else {
                        const first5 = value.slice(0, 5).replace(/[^A-Z]/g, "");
                        const digits = value.slice(5, 9).replace(/[^0-9]/g, "");
                        const last = value.slice(9, 10).replace(/[^A-Z]/g, "");
                        value = first5 + digits + last;
                      }
                      setFormData({ ...formData, panCard: value });
                    }}
                    error={formData.panCard.length > 0 && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panCard)}
                    helperText={
                      formData.panCard.length > 0 && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panCard)
                        ? "Format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)"
                        : ""
                    }
                    inputProps={{
                      maxLength: 10,
                      inputMode:
                        formData.panCard.length < 5
                          ? "text"
                          : formData.panCard.length < 9
                          ? "numeric"
                          : "text",
                    }}
                    variant="outlined"
                  />
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading || !isFormValid()}
                  sx={{ py: 1.5, bgcolor: "rgb(127 29 29)", "&:hover": { bgcolor: "rgb(153 27 27)" } }}
                >
                  {isLoading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Join Now"}
                </Button>
              </Box>
            </Paper>
          </>
        ) : (
          <Paper elevation={2} sx={{ p: 3, borderRadius: "0.5rem", textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Payment Options
            </Typography>

            <Button
              fullWidth
              variant="contained"
              sx={{ mb: 2, bgcolor: "rgb(127 29 29)", "&:hover": { bgcolor: "rgb(153 27 27)" } }}
              onClick={handleOnlinePayment}
            >
              Pay Online (Razorpay - UPI/Bank/Card)
            </Button>

            <Button
              fullWidth
              variant="outlined"
              sx={{ mb: 2, borderColor: "rgb(127 29 29)", color: "rgb(127 29 29)" }}
              onClick={handleBankTransferPayment}
            >
              Pay via Bank Transfer
            </Button>

            <Button
              fullWidth
              variant="outlined"
              sx={{ borderColor: "rgb(127 29 29)", color: "rgb(127 29 29)" }}
              onClick={handleCashPayment}
            >
              Pay with Cash
            </Button>
          </Paper>
        )}
      </Container>

      {/* Message Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogContent>
          <Typography>{message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} sx={{ bgcolor: "rgb(127 29 29)", color: "white" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bank Transfer Dialog */}
      <Dialog open={isBankDialogOpen} onClose={() => setIsBankDialogOpen(false)}>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Bank Transfer Details
          </Typography>
          <Typography>
            Please transfer the installment amount to the following bank account:
          </Typography>
          <Typography sx={{ mt: 1 }}>
            <strong>Account Name:</strong> Jewels Scheme Pvt Ltd<br />
            <strong>Account Number:</strong> 1234567890<br />
            <strong>IFSC Code:</strong> ABCD0123456<br />
            <strong>Bank Name:</strong> Example Bank<br />
            <strong>Branch:</strong> City Branch
          </Typography>
          <Typography sx={{ mt: 2 }}>
            After completing the transfer, click "Confirm Payment" below.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBankDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmBankPayment}
            sx={{ bgcolor: "rgb(127 29 29)", color: "white" }}
          >
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JoinNewPlan;