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
import { Select } from "@mui/material";

function CreateAccount() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [formData, setFormData] = React.useState({
    firstname: "",
    titles: "",
    email: "",
    mobile: "",
    address1: "",
    state: "",
    city: "",
    pincode: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = React.useState({}); // ✅ new error state

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }));

    // clear error once user starts typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.titles) newErrors.titles = "Please select a title";
    if (!formData.firstname) newErrors.firstname = "Full name is required";
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    if (!formData.address1) newErrors.address1 = "Address is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.pincode) newErrors.pincode = "Pincode is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return; // stop if validation fails

    try {
      const res = await axios.post("http://localhost:5000/register", formData);
      alert(res.data.message);
      navigate("/"); // redirect after success
    } catch (err) {
      if (err.response && err.response.data?.message) {
        alert(err.response.data.message); // server error message
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
          labelId="titles-label"
          name="titles"
          value={formData.titles}
          onChange={handleChange}
          sx={{
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.8)",
            px: 1,
            py: 0.5,
          }}
          MenuProps={{
            PaperProps: {
              sx: { borderRadius: 2 },
            },
          }}
          error={!!errors.titles}
        >
          <MenuItem value="Mr">Mr</MenuItem>
          <MenuItem value="Mrs">Mrs</MenuItem>
          <MenuItem value="Ms">Ms</MenuItem>
          <MenuItem value="Dr">Dr</MenuItem>
          <MenuItem value="Prof">Prof</MenuItem>
        </Select>
        {errors.titles && (
          <FormHelperText error>{errors.titles}</FormHelperText>
        )}

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

        <TextField
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          label="Email"
          type="email"
          variant="filled"
          InputProps={{
            disableUnderline: true,
            sx: { borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" },
          }}
        />

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

        <TextField
          name="address1"
          value={formData.address1}
          onChange={handleChange}
          fullWidth
          label="Address1 *"
          variant="filled"
          error={!!errors.address1}
          helperText={errors.address1}
          InputProps={{
            disableUnderline: true,
            sx: { borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" },
          }}
        />

        {/* State Dropdown */}
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
        <Box sx={{ display: "flex", gap: 1 }}>
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
        </Box>

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
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
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
