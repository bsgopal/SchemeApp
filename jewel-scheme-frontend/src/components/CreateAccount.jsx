import React, { useRef, useEffect } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Checkbox,
  FormHelperText,
  Snackbar,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";

// 🌟 Gold shimmer particles background
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
        pointerEvents: "none",
      }}
    />
  );
}

function CreateAccount() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const isSuperAdmin = sessionStorage.getItem("is_super_admin") === "1";

  const [formData, setFormData] = React.useState({
    firstname: "",
    title: "",
    email: "",
    mobile: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
    password: "",
    confirmPassword: "",
    nominee_name: "",
    nominee_mobile: "",
    nominee_relation: "",
    role: "",
  });

  const [errors, setErrors] = React.useState({});
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value || "" }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.title) newErrors.title = "Please select a title";
    if (!formData.firstname) newErrors.firstname = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!isSuperAdmin) {
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.pincode) newErrors.pincode = "Pincode is required";
      if (!formData.nominee_name) newErrors.nominee_name = "Nominee name is required";
      if (!formData.nominee_mobile) newErrors.nominee_mobile = "Nominee mobile is required";
      if (!formData.nominee_relation) newErrors.nominee_relation = "Nominee relation is required";
    }

    if (isSuperAdmin && !formData.role) newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const payload = { ...formData, isSuperAdminCreate: isSuperAdmin };
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        payload
      );

      if (res.data.success) {
        const userId = res.data.userId;
        sessionStorage.setItem("tempUserId", userId);

        setSnackbar({
          open: true,
          message: isSuperAdmin
            ? "User created successfully ✅"
            : "Registered successfully ✅",
          severity: "success",
        });

        setFormData({
          firstname: "",
          title: "",
          email: "",
          mobile: "",
          address: "",
          state: "",
          city: "",
          pincode: "",
          password: "",
          confirmPassword: "",
          nominee_name: "",
          nominee_mobile: "",
          nominee_relation: "",
          role: "",
        });

        navigate("/otp", {
          state: { email: formData.email, userId, isSuperAdminCreate: isSuperAdmin },
        });
      } else {
        setSnackbar({
          open: true,
          message: res.data.message || "Registration failed ❌",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Registration failed ❌",
        severity: "error",
      });
      console.error(err);
    }
  };

  const handleBack = () => {
    const isLoggedIn = sessionStorage.getItem("role");
    if (isLoggedIn) navigate("/Home");
    else navigate("/");
  };

  // ✅ Updated input style for better visibility
  const inputStyle = {
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(212,175,55,0.5)",
    "& .MuiInputBase-input": { color: "#fff" },           // typed text
    "& input::placeholder": { color: "rgba(255,255,255,0.7)" }, // placeholder
    "& .MuiFormHelperText-root": { color: "#ffdddd" },   // error text
  };

  return (
    <Box sx={{
      position: "relative", minHeight: "100vh", backgroundColor: "#1a0a3c", paddingTop: "env(safe-area-inset-top)",
      paddingBottom: "env(safe-area-inset-bottom)",
      paddingLeft: "env(safe-area-inset-left)",
      paddingRight: "env(safe-area-inset-right)",
    }}>
      <GoldShimmer />

      <IconButton
        onClick={handleBack}
        sx={{
          position: "fixed",
          top: 16,
          left: 16,
          backgroundColor: "rgba(255,255,255,0.9)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          "&:hover": { backgroundColor: "#f0f0f0" },
          zIndex: 10,
        }}
      >
        <ArrowBackIcon sx={{ color: "black" }} />
      </IconButton>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          width: "90%",
          maxWidth: 520,
          margin: " auto",
          backgroundColor: "rgba(25, 0, 50, 0.7)",
          borderRadius: "15px",
          padding: "30px 20px",
          boxShadow: "0 0 60px rgba(212, 175, 55, 0.4)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(212,175,55,0.5)",
          zIndex: 10,
          color: "#fff",
        }}
      >
        <Typography
          variant="h4"
          sx={{ textAlign: "center", color: "#D4AF37", fontWeight: 700, mb: 2 }}
        >
          Create Account
        </Typography>

        {/* Title */}
        <Select
          placeholder="Title *"
          name="title"
          value={formData.title}
          onChange={(_, value) => setFormData((prev) => ({ ...prev, title: value }))}
          sx={{
            mt: 2,
            borderRadius: 3,
            backgroundColor: "rgba(11,1,1,0.15)",
            px: 0.5,
            py: 0.5,
            border: "1px solid rgba(212,175,55,0.5)",
            color: "#fff",
          }}
        >
          <Option value="Mr">Mr</Option>
          <Option value="Mrs">Mrs</Option>
          <Option value="Ms">Ms</Option>
          <Option value="Dr">Dr</Option>
          <Option value="Prof">Prof</Option>
        </Select>
        {errors.title && <FormHelperText error>{errors.title}</FormHelperText>}

        {/* Full Name */}
        <TextField
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          fullWidth
          label="Fullname *"
          variant="filled"
          error={!!errors.firstname}
          helperText={errors.firstname}
          sx={{ mt: 2 }}
          InputProps={{ disableUnderline: true, sx: inputStyle }}
        />

        {/* Email */}
        <TextField
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          label="Email *"
          type="email"
          variant="filled"
          error={!!errors.email}
          helperText={errors.email}
          sx={{ mt: 2 }}
          InputProps={{ disableUnderline: true, sx: inputStyle }}
        />

        {/* Mobile */}
        <TextField
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          fullWidth
          label="Mobile Number *"
          type="tel"
          variant="filled"
          error={!!errors.mobile}
          helperText={errors.mobile}
          sx={{ mt: 2 }}
          InputProps={{ disableUnderline: true, sx: inputStyle }}
        />

        {/* Non-SuperAdmin Fields */}
        {!isSuperAdmin && (
          <>
            <TextField
              name="address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              label="Address *"
              variant="filled"
              error={!!errors.address}
              helperText={errors.address}
              sx={{ mt: 2 }}
              InputProps={{ disableUnderline: true, sx: inputStyle }}
            />

            <TextField
              select
              name="state"
              value={formData.state}
              onChange={handleChange}
              fullWidth
              label="State *"
              variant="filled"
              error={!!errors.state}
              helperText={errors.state}
              sx={{ mt: 2 }}
              InputProps={{ disableUnderline: true, sx: inputStyle }}
            >
              <MenuItem value="Tamilnadu">Tamilnadu</MenuItem>
              <MenuItem value="Kerala">Kerala</MenuItem>
            </TextField>

            <TextField
              name="city"
              value={formData.city}
              onChange={handleChange}
              fullWidth
              label="City *"
              variant="filled"
              error={!!errors.city}
              helperText={errors.city}
              sx={{ mt: 2 }}
              InputProps={{ disableUnderline: true, sx: inputStyle }}
            />

            <TextField
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              fullWidth
              label="Pincode *"
              variant="filled"
              error={!!errors.pincode}
              helperText={errors.pincode}
              sx={{ mt: 2 }}
              InputProps={{ disableUnderline: true, sx: inputStyle }}
            />

            <Typography variant="h6" sx={{ mt: 3, color: "#D4AF37" }}>
              Nominee Details
            </Typography>

            <TextField
              name="nominee_name"
              value={formData.nominee_name}
              onChange={handleChange}
              fullWidth
              label="Nominee Name *"
              variant="filled"
              error={!!errors.nominee_name}
              helperText={errors.nominee_name}
              sx={{ mt: 2 }}
              InputProps={{ disableUnderline: true, sx: inputStyle }}
            />

            <TextField
              name="nominee_mobile"
              value={formData.nominee_mobile}
              onChange={handleChange}
              fullWidth
              label="Nominee Mobile *"
              type="tel"
              variant="filled"
              error={!!errors.nominee_mobile}
              helperText={errors.nominee_mobile}
              sx={{ mt: 2 }}
              InputProps={{ disableUnderline: true, sx: inputStyle }}
            />

            <TextField
              name="nominee_relation"
              value={formData.nominee_relation}
              onChange={handleChange}
              fullWidth
              label="Nominee Relation *"
              variant="filled"
              error={!!errors.nominee_relation}
              helperText={errors.nominee_relation}
              sx={{ mt: 2 }}
              InputProps={{ disableUnderline: true, sx: inputStyle }}
            />
          </>
        )}

        {/* Password */}
        <TextField
          name="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          label="Password *"
          type={showPassword ? "text" : "password"}
          variant="filled"
          error={!!errors.password}
          helperText={errors.password}
          sx={{ mt: 2 }}
          InputProps={{
            disableUnderline: true,
            sx: inputStyle,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          fullWidth
          label="Confirm Password *"
          type={showConfirmPassword ? "text" : "password"}
          variant="filled"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          sx={{ mt: 2 }}
          InputProps={{
            disableUnderline: true,
            sx: inputStyle,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* SuperAdmin Role */}
        {isSuperAdmin && (
          <TextField
            select
            fullWidth
            label="Select Role *"
            name="role"
            value={formData.role}
            onChange={handleChange}
            variant="filled"
            error={!!errors.role}
            helperText={errors.role}
            sx={{ mt: 2 }}
            InputProps={{ disableUnderline: true, sx: inputStyle }}
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Agent">Agent</MenuItem>
            <MenuItem value="User">User</MenuItem>
          </TextField>
        )}

        {/* Terms */}
        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
          <Checkbox sx={{ color: "#D4AF37", "&.Mui-checked": { color: "#FFD700" } }} />
          <Typography variant="body2" sx={{ color: "#fff" }}>
            By Registering, You agree to our{" "}
            <span style={{ textDecoration: "underline", fontWeight: "bold" }}>
              Terms and Conditions
            </span>
          </Typography>
        </Box>

        {/* Register Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleRegister}
          sx={{
            mt: 3,
            borderRadius: 3,
            background: "linear-gradient(90deg, #D4AF37, #FFD700)",
            color: "#1a0a3c",
            fontWeight: "bold",
            py: 1.5,
            fontSize: 16,
            boxShadow: "0 4px 15px rgba(212,175,55,0.5)",
            "&:hover": { background: "linear-gradient(90deg, #FFD700, #D4AF37)" },
          }}
        >
          Register
        </Button>
      </motion.div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default CreateAccount;
