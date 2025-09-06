  import { useState } from "react";
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
  import img from "./images/images1.jpg";
  import logo from "./logo.png";
  import { useNavigate } from "react-router-dom";
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  function Login() {
    const navigate = useNavigate();
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleCreateAccount = () => {
      navigate("/CreateAccount"); 
    };

    const handleLogin = async () => {
      setErrorMessage("");
      console.log("Calling API:", process.env.REACT_APP_API_URL);
      try {
       const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        mobile,
        password,
      });
      console.log("Login response:", res.data);        

        if (res.data.success) {
           const userId = res.data.user.id;
          sessionStorage.setItem("userId", userId);
          sessionStorage.setItem("mobile", res.data.user.mobile);
          sessionStorage.setItem("name", res.data.user.name);
          sessionStorage.setItem("title", res.data.user.title);
          sessionStorage.setItem("role", res.data.user.role);
          sessionStorage.setItem("email", res.data.user.email);
          sessionStorage.setItem(
                    "is_super_admin",
                    res.data.user.role === "SuperAdmin" ? "1" : "0"
                  );
          navigate("/Home"); // redirect to home page
        }
          console.log("📦 Current sessionStorage:", { ...sessionStorage });
          // console.log("Logged in user id:", userId);
      } catch (err) {
        if (err.response && err.response.status === 401) {
      // Invalid credentials
      setErrorMessage("Invalid credentials. Please enter valid mobile number and password.");
    } else {
      // Other network/server errors
      setErrorMessage("Something went wrong. Please try again.");
    }
      }
    };

    return (
      <Box
        sx={{
    backgroundImage: `url(${img})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",     // ✅ fills screen properly
    width: "100%",          // better than 100vw (prevents scrollbars)
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
    color: "white",
    overflow: "hidden",     // stop drag white space
  }}
>
        {/* Skip login text */}
        <Typography
          variant="body2"
          onClick={() => navigate("/home")}
          sx={{
            position: "absolute",
            top: 16,
            left: 5,
            color: "#fff",
            fontWeight: "bold",
            // textDecoration: "underline",
            // backgroundColor: "rgba(255,255,255,0.7)",
            px: 3,
            borderRadius: "4px",
          }}
        >
          Skip login
        </Typography>

        {/* ✅ Logo top-right */}
        <Box sx={{ position: "absolute", top: -120, right: -60 }}>
          <img src={logo} alt="Renic Tech Logo" style={{ height: 300 }} />
        </Box>

        {/* Input fields */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 360,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mb: 2,
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
                  <PhoneIphoneIcon />
                </InputAdornment>
              ),
              sx: {
                borderRadius: "30px",
                backgroundColor: "rgba(255,255,255,0.9)",
              },
            }}
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
                backgroundColor: "rgba(255,255,255,0.9)",
              },
            }}
          />

          {/* Links */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              px: 1,
            }}
          >
            <Link underline="hover" sx={{ color: "white", fontSize: 14 }}>
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
              backgroundColor: "#f4c20d",
              color: "white",
              fontWeight: "bold",
              borderRadius: "30px",
              py: 1.2,
              "&:hover": { backgroundColor: "#e0ac08" },
            }}
          >
            LOGIN
          </Button>
          {/* ✅ Show error message below login button */}
        {errorMessage && (
          <Alert severity="error" sx={{ borderRadius: "20px", mt: 1 }}>
            {errorMessage}
          </Alert>
        )}
        </Box>

        {/* Version text */}
        <Typography variant="caption" sx={{ color: "white", mt: 1 }}>
          V-1.0.0
        </Typography>
      </Box>
    );
  }

  export default Login;
