import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Grid,
  Card,
  IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Button
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import logo from "./logo.png"; 
import TouchAppIcon from "@mui/icons-material/TouchApp";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CollectionsIcon from "@mui/icons-material/Collections";

import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Sidemenu from "./Sidemenu";

const bannerImages = [
  "/images/banner1.jpg",
  "/images/banner2.jpg",
  "/images/banner3.jpg",
];  

// Unified features list with role-based access
const allFeatures = [
  { label: "New Plan", icon: <TouchAppIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin", "Agent", "User"], route: "/newplan" },
  { label: "My Plans", icon: <AssignmentIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin", "Agent", "User"], route: "/myplans" },
  { label: "Pay EMA", icon: <PaymentIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin", "Agent", "User"], route: "/payema" },
  { label: "My Wallet", icon: <AccountBalanceWalletIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin", "Agent", "User"], route: "/wallet" },
  { label: "Offers", icon: <LocalOfferIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin", "Agent", "User"], route: "/offers" },

  // SuperAdmin Only
  { label: "Create User", icon: <AccountBalanceWalletIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin"], route: "/createaccount" },
  { label: "Create New Plans", icon: <TouchAppIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin"], route: "/createnewplan" },

  // Agent Only
  { label: "Collections", icon: <CollectionsIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["Agent"], route: "/collections" },
];


const Home = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState(""); 
  const [role, setRole] = useState(""); 
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedMobile = sessionStorage.getItem("mobile");
    const savedName = sessionStorage.getItem("name");
    const savedTitle = sessionStorage.getItem("title");
    const savedRole = sessionStorage.getItem("role");

    if (savedMobile) setMobile(savedMobile);
    if (savedName) setName(savedName);
    if (savedTitle) setTitle(savedTitle);
    if (savedRole) setRole(savedRole);
  }, []);

  // Filter features based on role
  const features = allFeatures.filter(f => role ? f.roles.includes(role) : f.roles.includes("User"));

  const sliderSettings = { dots: true, infinite: true, autoplay: true, speed: 500, autoplaySpeed: 3000, slidesToShow: 1, slidesToScroll: 1 };
  const goldRate = 9275;
  const silverRate = 127.0;

  const handleFeatureClick = (feature) => {
    if (!mobile) {
      setOpenDialog(true);
    } else if (feature.route) {
      navigate(feature.route);
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* Header */}
      <Box sx={{
        flexShrink: 0,
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "60px",
        bgcolor: "white",
        zIndex: 1000,
        borderBottom: "1px solid #ddd",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <IconButton color="inherit" onClick={() => setMenuOpen(true)}>
          <MenuIcon />
        </IconButton>
        <Sidemenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        <Box sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          <img src={logo} alt="Logo" style={{ height: 280, width: "auto", objectFit: "contain" }} />
        </Box>
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ flex: 1, overflowY: "auto", backgroundColor: "#EDEDED" }}>
        {/* Banner */}
        <Slider {...sliderSettings}>
          {bannerImages.map((src, idx) => (
            <Box key={idx} sx={{ borderRadius: 2, overflow: "hidden", height: "300px" }}>
              <img src={src} alt={`banner${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
          ))}
        </Slider>

        {/* Rate Section */}
        <Box textAlign="center" p={2}>
          <Typography variant="h6">TODAY'S RATE</Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={6}>
              <Card sx={{ bgcolor: "#FFC107", borderRadius: 2, textAlign: "center", height: 60, width: 100, display: "flex", flexDirection: "column", justifyContent: "center", color: "black", boxShadow: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold">GOLD</Typography>
                <Typography variant="h6" fontWeight="bold">₹ {goldRate}</Typography>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ bgcolor: "#d6dbdeff", borderRadius: 2, textAlign: "center", height: 60, width: 100, display: "flex", flexDirection: "column", justifyContent: "center", color: "black", boxShadow: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold">SILVER</Typography>
                <Typography variant="h6" fontWeight="bold">₹ {silverRate}</Typography>
              </Card>
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            {dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString()}
          </Typography>
          {mobile && (
            <Typography variant="subtitle1" fontWeight="bold" color="primary" mt={1}>
              {title || ""}.{name || ""}-{mobile}
            </Typography>
          )}
        </Box>

        {/* Features */}
        <Grid container spacing={2} p={2} justifyContent="center">
          {features.map((f, idx) => (
            <Grid item xs={6} key={idx}>
              <Box sx={{ textAlign: "center", borderRadius: 2, boxShadow: 3, p: 2, cursor: "pointer" }}
                   onClick={() => handleFeatureClick(f)}>
                <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: "#f57c00", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", boxShadow: 3 }}>
                  {f.icon}
                </Box>
                <Typography variant="body2" fontWeight="bold" mt={1} sx={{ color: "#5d4037" }}>
                  {f.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Login Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <Typography>You need to login first to access this feature.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">Cancel</Button>
          <Button onClick={() => { setOpenDialog(false); navigate("/Login"); }} variant="contained" color="primary">
            Login
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", mt: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <IconButton href="https://wa.me/9345578103" target="_blank" sx={{ color: "#25D366" }}>
            <FaWhatsapp style={{ fontSize: 28 }} />
          </IconButton>
          <IconButton href="https://www.instagram.com" target="_blank" sx={{ color: "#E1306C" }}>
            <InstagramIcon sx={{ fontSize: 28 }} />
          </IconButton>
          <IconButton href="https://www.facebook.com" target="_blank" sx={{ color: "#1877F2" }}>
            <FacebookIcon sx={{ fontSize: 28 }} />
          </IconButton>
          <IconButton href="https://www.youtube.com" target="_blank" sx={{ color: "#FF0000" }}>
            <YouTubeIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
           © {new Date().getFullYear()} Renic Tech. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
