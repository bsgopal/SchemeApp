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
import axios from "axios";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";

function CreateAccount() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [formData, setFormData] = React.useState({
    firstname: "",
    titles: "",
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
  });

  const [errors, setErrors] = React.useState({});

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

    if (!formData.titles) newErrors.titles = "Please select a title";
    if (!formData.firstname) newErrors.firstname = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.pincode) newErrors.pincode = "Pincode is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // nominee validations
    if (!formData.nominee_name) newErrors.nominee_name = "Nominee name is required";
    if (!formData.nominee_mobile) newErrors.nominee_mobile = "Nominee mobile is required";
    if (!formData.nominee_relation) newErrors.nominee_relation = "Nominee relation is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const res = await axios.post("http://localhost:5000/register", formData);
      console.log("Backend response:", res.data);

      if (res.data.success) {
        const userId = res.data.userId;
        sessionStorage.setItem("tempUserId", userId);

        const otpRes = await axios.post("http://localhost:5000/generate-otp", {
          userId,
          email: formData.email,
        });

        console.log("OTP sent:", otpRes.data.otp);

        navigate("/otp", {
          state: {
            email: formData.email,
            userId: userId,
          },
        });
      } else {
        alert(res.data.message || "Registration failed ❌");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Registration failed ❌");
      }
      console.error(err);
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
        onClick={() => navigate("/")}
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
          defaultValue="Mr"
          labelId="titles-label"
          name="titles"
          value={formData.titles}
          onChange={(_, value) =>
            setFormData((prev) => ({ ...prev, titles: value }))
          }
          sx={{
            borderRadius: 3,
            backgroundColor: "rgba(255,255,255,0.8)",
            px: 0.5,
            py: 0.5,
          }}
          error={!!errors.titles}
        >
          <Option value="Mr">Mr</Option>
          <Option value="Mrs">Mrs</Option>
          <Option value="Ms">Ms</Option>
          <Option value="Dr">Dr</Option>
          <Option value="Prof">Prof</Option>
        </Select>
        {errors.titles && <FormHelperText error>{errors.titles}</FormHelperText>}

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

        {/* Address */}
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
            sx: { borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" },
          }}
        />

        {/* State */}
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
            sx: { borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" },
          }}
        >
          <MenuItem value="Tamilnadu">Tamilnadu</MenuItem>
          <MenuItem value="Kerala">Kerala</MenuItem>
        </TextField>

        {/* City */}
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
            sx: { borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" },
          }}
        />

        {/* Pincode */}
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
            sx: { borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" },
          }}
        />

        {/* Nominee Section */}
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
            sx: { borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" },
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
            sx: { borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" },
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
            sx: { borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" },
          }}
        />

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
    </Box>
  );
}

export default CreateAccount;
