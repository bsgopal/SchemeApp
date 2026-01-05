import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import bgImg from "./images/image2.png";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ✨ GOLD SHIMMER BACKGROUND */
function GoldShimmer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        s: Math.random() * 0.3 + 0.05,
        a: Math.random(),
      }));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,215,0,${p.a})`;
        ctx.fill();
        p.y -= p.s;
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }
      });
      requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, zIndex: 1 }}
    />
  );
}

export default function OTP() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;
  const userId = location.state?.userId;
  const isSuperAdminCreate = location.state?.isSuperAdminCreate || false;

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [message, setMessage] = useState(`OTP sent to ${email}`);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef([]);

  /* ⏳ RESEND TIMER */
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(
      () => setResendCooldown((c) => c - 1),
      1000
    );
    return () => clearTimeout(t);
  }, [resendCooldown]);

  /* 🔢 INPUT HANDLING */
  const handleChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const copy = [...otp];
    copy[i] = v;
    setOtp(copy);

    if (v && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      inputRefs.current[i - 1]?.focus();
  };

  /* ✅ VERIFY OTP */
  const handleVerifyOTP = async () => {
    const otpValue = otp.join("");
    if (!/^\d{6}$/.test(otpValue)) {
      setMessage("Enter valid 6-digit OTP");
      setIsError(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/verify-otp`,
        { userId, otp: otpValue, isSuperAdminCreate }
      );

      if (res.data.success) {
        setMessage("Email verified successfully!");
        setIsError(false);
        setTimeout(
          () => navigate(isSuperAdminCreate ? "/Home" : "/login"),
          2000
        );
      } else {
        setMessage(res.data.message || "Invalid OTP");
        setIsError(true);
      }
    } catch {
      setMessage("Server error during verification");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  /* 🔁 RESEND OTP */
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/resend-otp`,
        { userId, email }
      );
      setMessage("New OTP sent!");
      setIsError(false);
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
      setResendCooldown(30);
    } catch {
      setMessage("Failed to resend OTP");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        background: `url(${bgImg}) center/cover`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GoldShimmer />

      {/* 🔙 BACK */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 3,
          color: "gold",
          background: "rgba(0,0,0,0.3)",
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>

      {/* 🔥 CARD */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        style={{
          width: 380,
          padding: 30,
          background: "rgba(34,0,60,0.25)",
          borderRadius: 25,
          backdropFilter: "blur(6px)",
          boxShadow: "0 0 45px rgba(255,215,0,0.8)",
          zIndex: 2,
          textAlign: "center",
          marginTop: 300,
        }}
      >
        <Typography variant="h5" sx={{ color: "gold", mb: 1 }}>
          Verify Your Email
        </Typography>

        <Typography sx={{ color: "white", mb: 3, fontSize: 14 }}>
          Code sent to <strong>{email}</strong>
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 2 }}>
          {otp.map((d, i) => (
            <input
              key={i}
              value={d}
              maxLength={1}
              inputMode="numeric"
              pattern="[0-9]*"
              ref={(el) => (inputRefs.current[i] = el)}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={isLoading}
              style={{
                width: 52,
                height: 56,
                fontSize: 22,
                fontWeight: 700,
                textAlign: "center",
                borderRadius: 14,
                border: d
                  ? "2px solid gold"
                  : "1px solid rgba(255,215,0,0.6)",
                background: "linear-gradient(145deg,#fff,#f7f2e8)",
                boxShadow: d
                  ? "0 0 15px rgba(255,215,0,0.6)"
                  : "inset 0 0 6px rgba(0,0,0,0.15)",
                transition: "all 0.25s ease",
              }}
            />

          ))}
        </Box>

        {message && (
          <Alert severity={isError ? "error" : "success"} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Button
          fullWidth
          onClick={handleVerifyOTP}
          disabled={isLoading || otp.join("").length !== 6}
          sx={{
            mt: 2,
            py: 1.3,
            fontWeight: 700,
            letterSpacing: 1,
            borderRadius: 4,
            background:
              "linear-gradient(90deg,#FFD700,#E6B800,#FFD700)",
            color: "#2b003d",
            boxShadow: "0 6px 20px rgba(255,215,0,0.6)",
            "&:hover": {
              background: "linear-gradient(90deg,#FFE066,#FFD700)",
              transform: "translateY(-1px)",
            },
            "&:disabled": {
              background: "gray",
              color: "white",
            },
          }}
        >
          {isLoading ? <CircularProgress size={22} /> : "Verify OTP"}
        </Button>


        <Button
          fullWidth
          onClick={handleResendOTP}
          disabled={resendCooldown > 0}
          sx={{
            mt: 1,
            background: resendCooldown ? "gray" : "gold",
            color: resendCooldown ? "white" : "#330044",
            borderRadius: 3,
          }}
        >
          {resendCooldown > 0
            ? `Resend in ${resendCooldown}s`
            : "Resend OTP"}
        </Button>
      </motion.div>
    </Box>
  );
}
