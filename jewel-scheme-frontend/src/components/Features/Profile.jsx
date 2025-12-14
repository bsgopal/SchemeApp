import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Avatar,
  Divider,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const Profile = () => {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/profile/${userId}`
        );
        setProfile(res.data.user);
      } catch (err) {
        console.error("Profile fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a0033, #4b0082)",
        }}
      >
        <CircularProgress sx={{ color: "#FFD700" }} />
      </Box>
    );
  }

  if (!profile) {
    return <Typography>Error loading profile</Typography>;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a0033, #4b0082)",
        color: "white",
        p: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ color: "#FFD700" }}
          component={motion.button}
          whileTap={{ scale: 0.8 }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h5" sx={{ flexGrow: 1, textAlign: "center" }}>
          My Profile
        </Typography>

        <Box sx={{ width: 40 }} />
      </Box>

      {/* Profile Card */}
      <Card
        sx={{
          bgcolor: "#2c0040",
          p: 3,
          borderRadius: 4,
          boxShadow: "0 0 20px rgba(255,215,0,0.4)",
          textAlign: "center",
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            width: 90,
            height: 90,
            margin: "auto",
            fontSize: "36px",
            bgcolor: "#FFD700",
            color: "#4B0082",
            fontWeight: "bold",
          }}
        >
          {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
        </Avatar>

        <Typography variant="h6" mt={2} sx={{ color: "#FFD700", textShadow: "0 0 8px rgba(255,215,0,0.6)" }}>
          {profile.title}.{profile.name}
        </Typography>

        <Typography variant="body1" sx={{ opacity: 0.8, color: "#FFD700", textShadow: "0 0 6px rgba(255,215,0,0.5)" }}>
          {profile.mobile}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 1,
            bgcolor: "#FFD700",
            color: "#4B0082",
            px: 2,
            py: 0.5,
            borderRadius: 2,
            display: "inline-block",
          }}
        >
          {profile.role}
        </Typography>

        <Divider sx={{ my: 2, backgroundColor: "#FFD700" }} />

        {/* DETAILS SECTION */}
        <Box textAlign="left" sx={{ color: "#FFD700", textShadow: "0 0 8px rgba(255,215,0,0.6)" }}>
          <Typography><b>Email:</b> {profile.email}</Typography>
          <Typography><b>Address:</b> {profile.address}</Typography>
          <Typography><b>City:</b> {profile.place}</Typography>
          <Typography><b>Pincode:</b> {profile.pincode}</Typography>
          <Typography><b>DOB:</b> {profile.dob}</Typography>
          <Typography><b>Anniversary:</b> {profile.anniversary}</Typography>

          <Divider sx={{ my: 2, backgroundColor: "#FFD700" }} />

          <Typography><b>Aadhaar:</b> {profile.aadhaar}</Typography>
          <Typography><b>PAN:</b> {profile.pan}</Typography>

          <Divider sx={{ my: 2, backgroundColor: "#FFD700" }} />

          <Typography><b>Nominee Name:</b> {profile.nominee_name}</Typography>
          <Typography><b>Nominee Mobile:</b> {profile.nominee_mobile}</Typography>
          <Typography><b>Relation:</b> {profile.nominee_relation}</Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 3,
            bgcolor: "#FFD700",
            color: "#4B0082",
            fontWeight: "bold",
          }}
          startIcon={<EditIcon />}
          onClick={() => navigate("/edit-profile")}
        >
          Edit Profile
        </Button>
      </Card>

      {/* Logout */}
      <Button
        variant="outlined"
        fullWidth
        sx={{
          mt: 3,
          borderColor: "#FFD700",
          color: "#FFD700",
          fontWeight: "bold",
        }}
        onClick={() => {
          sessionStorage.clear();
          navigate("/login");
        }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Profile;
