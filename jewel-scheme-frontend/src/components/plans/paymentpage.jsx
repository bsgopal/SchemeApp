import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  IconButton,
  Typography,
  Box,
  Button,
  Radio,
  RadioGroup,
  Snackbar,
  Alert,
  CircularProgress,

} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { motion } from "framer-motion";

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
function GoldShimmer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          speed: Math.random() * 0.3 + 0.05,
          alpha: Math.random(),
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,215,0,${p.alpha})`;
        ctx.fill();
        p.y -= p.speed;
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }
      });
      requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, zIndex: 1 }}
    />
  );
}


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
    const role = localStorage.getItem("role") || "user";

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
      const user_id = localStorage.getItem("userId");

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
    <Box
      sx={{
        height: "100vh",
        background: "linear-gradient(135deg,#1a001f,#43005b)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GoldShimmer />

      {/* 🔙 Back Button */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", top: 20, left: 20, color: "gold", zIndex: 3 }}
      >
        <ArrowBackIcon />
      </IconButton>

      {/* 💳 Payment Header */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        style={{
          position: "absolute",
          top: 20,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          zIndex: 3
        }}
      >
        <Box
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: "30px",
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,215,0,0.6)",
            boxShadow: "0 0 25px rgba(255,215,0,0.7)",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "gold",
              fontWeight: "bold",
              letterSpacing: 1.5
            }}
          >
            PAYMENT
          </Typography>
        </Box>
      </motion.div>

      {/* 💳 Payment Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: 360,
          padding: 30,
          background: "rgba(34,0,60,0.25)",
          borderRadius: 25,
          boxShadow: "0 0 30px rgba(255,215,0,0.8)",
          backdropFilter: "blur(10px)",
          zIndex: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{ color: "gold", mb: 2, textAlign: "center", fontWeight: "bold" }}
        >
          Select Payment Method
        </Typography>

        <RadioGroup
          value={selectedPaymentMethod}
          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
        >
          {paymentOptions.map(({ value, label, icon }) => (
            <Box
              key={value}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 1.5,
                mb: 1,
                borderRadius: 2,
                border:
                  selectedPaymentMethod === value
                    ? "2px solid gold"
                    : "1px solid rgba(255,255,255,0.3)",
                background:
                  selectedPaymentMethod === value
                    ? "rgba(255,215,0,0.15)"
                    : "rgba(255,255,255,0.08)",
              }}
              onClick={() => setSelectedPaymentMethod(value)}
            >
              <Radio checked={selectedPaymentMethod === value} />
              <img src={icon} alt={label} style={{ width: 32 }} />
              <Typography sx={{ color: "white" }}>{label}</Typography>
            </Box>
          ))}
        </RadioGroup>

        <Button
          fullWidth
          onClick={handleProceedPayment}
          disabled={isLoading}
          sx={{
            mt: 3,
            background: "gold",
            color: "#330044",
            fontWeight: "bold",
            borderRadius: 3,
            "&:hover": { background: "#e0ac08" },
          }}
        >
          {isLoading ? <CircularProgress size={24} /> : "Proceed to Pay"}
        </Button>

        {["admin", "superadmin"].includes(userRole) && (
          <Button
            fullWidth
            sx={{
              mt: 2,
              border: "2px solid gold",
              color: "gold",
              borderRadius: 3,
            }}
            onClick={handleCashPayment}
          >
            Pay with Cash
          </Button>
        )}
      </motion.div>

      {/* Snackbar remains same */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      {/* Bank dialog stays same */}
    </Box>
  );

};

export default PaymentPage;
