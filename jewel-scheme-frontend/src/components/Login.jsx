import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Link,
  Alert,
} from "@mui/material";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CloseIcon from "@mui/icons-material/Close";
import logo from "./logo.png";
import bgImg from "./images/image2.png"; // Premium background image
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// 🌟 Gold shimmer particles
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
        ctx.fillStyle = `rgba(255, 215, 0, ${p.alpha})`;
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
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
      }}
    />
  );
}

function Login() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateAccount = () => navigate("/CreateAccount");
  
  const handleSkipLogin = () => {
    // You can set guest user data in sessionStorage if needed
    sessionStorage.setItem("isGuest", "true");
    navigate("/Home");
  };

  const handleLogin = async () => {
    setErrorMessage("");
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        mobile,
        password,
      });
      if (res.data.success) {
        const user = res.data.user;
        sessionStorage.setItem("userId", user.id);
        sessionStorage.setItem("mobile", user.mobile);
        sessionStorage.setItem("name", user.name);
        sessionStorage.setItem("title", user.title);
        sessionStorage.setItem("role", user.role);
        sessionStorage.setItem("email", user.email);
        sessionStorage.setItem("is_super_admin", user.role === "SuperAdmin" ? "1" : "0");
        sessionStorage.setItem("isGuest", "false");
        navigate("/Home");
      }
    } catch (err) {
      if (err.response) setErrorMessage(err.response.data.message || "Login failed.");
      else if (err.request) setErrorMessage("No response from server.");
      else setErrorMessage("Something went wrong.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        backgroundImage: `url(${bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* ✨ Gold shimmer background */}
      <GoldShimmer />

      {/* Logo in top right corner */}
      <motion.img
        src={logo}
        alt="Logo"
        style={{
          position: "absolute",
          top: -150,
          right: -80,
          height: 380,
          zIndex: 3,
          cursor: "pointer"
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
        onClick={handleSkipLogin} // Optional: make logo clickable to skip login
      />

      {/* Skip Login Button */}
      <Button
        variant="outlined"
        onClick={handleSkipLogin}
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 3,
          color: "white",
          borderColor: "white",
          borderRadius: "20px",
          textTransform: "none",
          "&:hover": {
            borderColor: "#FFD700",
            backgroundColor: "rgba(255, 215, 0, 0.1)",
          }
        }}
        startIcon={<CloseIcon />}
      >
        Skip Login
      </Button>

      {/* Floating Login Card - Moved down */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          width: "90%",
          maxWidth: 400,
          backgroundColor: "rgba(34, 0, 60, 0.15)", // semi-transparent
          padding: "50px 30px",
          borderRadius: "25px",
          boxShadow: "0 0 50px rgba(239, 205, 15, 0.8)",
          zIndex: 2,
          textAlign: "center",
          backdropFilter: "blur(6px)", // premium glass effect
          marginTop: "480px", // Pushes the card down
        }}
      >
        {/* Mobile input */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="10 Digit Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="start">
                <PhoneIphoneIcon sx={{ color: "#FFD700" }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: "30px",
              backgroundColor: "rgba(255,255,255,0.95)",
              height: 60,
              fontSize: "1rem",
              "&:hover": { boxShadow: "0 0 15px rgba(255, 215, 0,0.5)" },
            },
          }}
          sx={{ mb: 2 }}
        />

        {/* Password input */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              borderRadius: "30px",
              backgroundColor: "rgba(255,255,255,0.95)",
              height: 60,
              fontSize: "1rem",
              "&:hover": { boxShadow: "0 0 15px rgba(255, 215, 0,0.5)" },
            },
          }}
          sx={{ mb: 2 }}
        />

        {/* Links */}
        <Box sx={{ display: "flex", justifyContent: "space-between", px: 1, mt: 1 }}>
          <Link underline="hover" sx={{ color: "white", fontSize: 14, cursor: "pointer" }}>
            Forgot Password?
          </Link>
          <Link
            underline="hover"
            sx={{ color: "white", fontSize: 14, cursor: "pointer" }}
            onClick={handleCreateAccount}
          >
            Create a New Account
          </Link>
        </Box>

        {/* Login button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          sx={{
            mt: 3,
            backgroundColor: "#FFD700",
            color: "#1a003c",
            fontWeight: "bold",
            borderRadius: "30px",
            py: 1.5,
            fontSize: "1rem",
            "&:hover": { backgroundColor: "#e0ac08" },
          }}
        >
          LOGIN
        </Button>

        {/* Error message */}
        {errorMessage && (
          <Alert severity="error" sx={{ borderRadius: "20px", mt: 2 }}>
            {errorMessage}
          </Alert>
        )}
      </motion.div>

      {/* Version */}
      <Typography 
        variant="caption" 
        sx={{ 
          color: "white", 
          position: "absolute",
          bottom: 20,
          zIndex: 2 
        }}
      >
        V-1.0.0
      </Typography>
    </Box>
  );
}

export default Login;