import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, Button, Alert, CircularProgress } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function OTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const userId = location.state?.userId;

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const inputRefs = useRef([]);

  // Generate OTP on mount
  useEffect(() => {
    const generateOTP = async () => {
      if (!userId) {
        setMessage("User ID not found. Please register again.");
        setIsError(true);
        setIsGenerating(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await axios.post("http://localhost:5000/generate-otp", { userId });
        if (res.data.success) {
          setMessage("OTP sent to your email! ✅");
          setIsError(false);
        } else {
          setMessage(res.data.message || "Failed to generate OTP");
          setIsError(true);
        }
      } catch (error) {
        setMessage("Network or server error while generating OTP");
        setIsError(true);
      } finally {
        setIsLoading(false);
        setIsGenerating(false);
      }
    };
    generateOTP();
  }, [userId]);

  // Handle input change
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      requestAnimationFrame(() => inputRefs.current[index + 1]?.focus());
    }

    if (newOtp.every(d => d !== "") && index === otp.length - 1) {
      handleVerifyOTP();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        requestAnimationFrame(() => inputRefs.current[index - 1]?.focus());
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      requestAnimationFrame(() => inputRefs.current[index - 1]?.focus());
    } else if (e.key === "ArrowRight" && index < otp.length - 1) {
      requestAnimationFrame(() => inputRefs.current[index + 1]?.focus());
    } else if (e.key === "Enter" && otp.join("").length === 6) {
      handleVerifyOTP();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      const fullOtp = [...newOtp, ...Array(6 - newOtp.length).fill("")];
      setOtp(fullOtp);
      const focusIndex = Math.min(newOtp.length, 5);
      requestAnimationFrame(() => inputRefs.current[focusIndex]?.focus());
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (!/^\d{6}$/.test(otpValue)) {
      setMessage("Please enter a valid 6-digit OTP");
      setIsError(true);
      return;
    }

    if (!userId) {
      setMessage("User ID not found. Please register again.");
      setIsError(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/verify-otp", { userId, otp: otpValue });
      if (res.data.success) {
        setMessage("Email verified successfully! ✅");
        setIsError(false);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(res.data.message || "Invalid OTP");
        setIsError(true);
      }
    } catch (error) {
    console.error("OTP verification error:", error.response || error);
    setMessage(error.response?.data?.message || "Network/server error during verification");
    setIsError(true);
  }finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/generate-otp", { userId });
      if (res.data.success) {
        setMessage("New OTP sent to your email! ✅");
        setIsError(false);
        setOtp(Array(6).fill(""));
        requestAnimationFrame(() => inputRefs.current[0]?.focus());
      } else {
        setMessage(res.data.message || "Failed to resend OTP");
        setIsError(true);
      }
    } catch (error) {
      setMessage("Network or server error while resending OTP");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Box sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}>Verify Your Email</Typography>
        <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
          We sent a code to <strong>{email}</strong>
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}>
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              ref={(el) => (inputRefs.current[index] = el)}
              maxLength={1}
              style={{ width: 40, height: 40, textAlign: "center", fontSize: 18 }}
              autoFocus={index === 0}
              disabled={isLoading}
            />
          ))}
        </Box>

        {message && <Alert severity={isError ? "error" : "success"} sx={{ mb: 2 }}>{message}</Alert>}

        <Button fullWidth variant="contained" onClick={handleVerifyOTP} disabled={isLoading || otp.join("").length !== 6} sx={{ mb: 2 }}>
          {isLoading ? <CircularProgress size={24} /> : "Verify OTP"}
        </Button>

        <Button fullWidth variant="outlined" onClick={handleResendOTP} disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : "Resend Code"}
        </Button>
      </Box>
    </Box>
  );
}

export default OTP;
