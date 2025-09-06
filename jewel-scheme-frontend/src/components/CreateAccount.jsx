import React from "react";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";

function CreateAccount() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // ✅ check role from session
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
    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }));

    // Clear error
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
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

    // ✅ Only validate these if NOT SuperAdmin
    if (!isSuperAdmin) {
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.pincode) newErrors.pincode = "Pincode is required";

      if (!formData.nominee_name)
        newErrors.nominee_name = "Nominee name is required";
      if (!formData.nominee_mobile)
        newErrors.nominee_mobile = "Nominee mobile is required";
      if (!formData.nominee_relation)
        newErrors.nominee_relation = "Nominee relation is required";
    }

    // ✅ Validate role only if SuperAdmin
    if (isSuperAdmin && !formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        isSuperAdminCreate: isSuperAdmin // Add this flag
      };
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        payload
      );

      console.log("Backend response:", res.data);

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

        // ✅ Stay on same page (do not navigate)
        // Optionally reset form
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

        sessionStorage.setItem("tempUserId", userId);
        navigate("/otp", {
          state: {
            email: formData.email,
            userId: userId,
            isSuperAdminCreate: isSuperAdmin
          },
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
    const isLoggedIn = sessionStorage.getItem("role"); // if role exists, user is logged in
    if (isLoggedIn) {
      navigate("/Home");   // ✅ SuperAdmin/Admin/Agent/User → go back to Home
    } else {
      navigate("/");       // ✅ Not logged in → go back to Login
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#EDEDED",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        color: "white",
      }}
    >
      {/* Back Arrow */}
      <IconButton
        onClick={handleBack}
        sx={{
          position: "fixed",
          top: 16,
          left: 16,
          backgroundColor: "white",
          boxShadow: 3,
          "&:hover": { backgroundColor: "#f0f0f0" },
          zIndex: 10,
        }}
      >
        <ArrowBackIcon sx={{ color: "black" }} />
      </IconButton>

      {/* Scrollable Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2,
          pt: 10,
          pb: 6,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Title Dropdown */}
        <Select
          placeholder="Title *"
          name="title"
          value={formData.title}
          onChange={(_, value) =>
            setFormData((prev) => ({ ...prev, title: value }))
          }
          sx={{
            borderRadius: 3,
            backgroundColor: "rgba(255,255,255,0.8)",
            px: 0.5,
            py: 0.5,
          }}
          error={!!errors.title}
        >
          <Option value="Mr">Mr</Option>
          <Option value="Mrs">Mrs</Option>
          <Option value="Ms">Ms</Option>
          <Option value="Dr">Dr</Option>
          <Option value="Prof">Prof</Option>
        </Select>
        {errors.title && <FormHelperText error>{errors.title}</FormHelperText>}

        {/* Fullname */}
        <TextField
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          fullWidth
          label="Fullname *"
          variant="filled"
          error={!!errors.firstname}
          helperText={errors.firstname}
          InputProps={{
            disableUnderline: true,
            sx: { borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" },
          }}
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
          InputProps={{
            disableUnderline: true,
            sx: { borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" },
          }}
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
          InputProps={{
            disableUnderline: true,
            sx: { borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" },
          }}
        />

        {/* ✅ Show only if NOT SuperAdmin */}
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
              InputProps={{
                disableUnderline: true,
                sx: {
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.8)",
                },
              }}
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
              InputProps={{
                disableUnderline: true,
                sx: {
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.8)",
                },
              }}
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
              InputProps={{
                disableUnderline: true,
                sx: {
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.8)",
                },
              }}
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
              InputProps={{
                disableUnderline: true,
                sx: {
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.8)",
                },
              }}
            />

            <Typography variant="h6" sx={{ mt: 2, color: "black" }}>
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
              InputProps={{
                disableUnderline: true,
                sx: {
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.8)",
                },
              }}
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
              InputProps={{
                disableUnderline: true,
                sx: {
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.8)",
                },
              }}
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
              InputProps={{
                disableUnderline: true,
                sx: {
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.8)",
                },
              }}
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
          InputProps={{
            disableUnderline: true,
            sx: { borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Confirm Password */}
        <TextField
          fullWidth
          label="Confirm Password *"
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          variant="filled"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          InputProps={{
            disableUnderline: true,
            sx: { borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* ✅ Show Role selection only if SuperAdmin */}
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
            InputProps={{
              disableUnderline: true,
              sx: { borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" },
            }}
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Agent">Agent</MenuItem>
            <MenuItem value="User">User</MenuItem>
          </TextField>
        )}

        {/* Terms */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Checkbox />
          <Typography variant="body2" sx={{ color: "black" }}>
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
            mt: 1,
            borderRadius: 2,
            backgroundColor: "#D4AF37",
            "&:hover": { backgroundColor: "#C9A132" },
          }}
        >
          Register
        </Button>
      </Box>

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