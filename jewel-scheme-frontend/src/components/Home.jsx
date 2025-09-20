import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Grid,
  Card,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CardContent,
  CardMedia,
  Badge,
  Container,
  AppBar,
  Toolbar
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";
import logo from "./logo.png";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CollectionsIcon from "@mui/icons-material/Collections";
import { FaWhatsapp } from "react-icons/fa";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { FavoriteBorder } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Sidemenu from "./Sidemenu";
import { motion } from "framer-motion";

const bannerImages = ["/images/banner1.jpg", "/images/banner2.jpg", "/images/banner3.jpg"];
const newArrivals = [
  { id: 1, title: "Diamond Stud Earrings", price: "₹ 75,000", img: "/images/earrings.jpg" },
  { id: 2, title: "Gold Chain Necklace", price: "₹ 1,20,000", img: "/images/necklace.jpg" },
  { id: 3, title: "22k Gold Bangles", price: "₹ 80,000", img: "/images/bangles.jpg" },
];
const allFeatures = [
  { label: "New Plan", icon: <TouchAppIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin", "Agent", "User"], route: "/newplan" },
  { label: "My Plans", icon: <AssignmentIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin", "Agent", "User"], route: "/myplans" },
  { label: "Pay EMA", icon: <PaymentIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin", "Agent", "User"], route: "/payema" },
  { label: "My Wallet", icon: <AccountBalanceWalletIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin", "Agent", "User"], route: "/wallet" },
  { label: "Offers", icon: <LocalOfferIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin", "Agent", "User"], route: "/offers" },
  { label: "Create User", icon: <AccountBalanceWalletIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin"], route: "/createaccount" },
  { label: "Create New Plans", icon: <TouchAppIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin"], route: "/createnewplan" },
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
  const [goldRate, setGoldRate] = useState(null);
  const [silverRate, setSilverRate] = useState(null);
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

  const features = allFeatures.filter(f => role ? f.roles.includes(role) : f.roles.includes("User"));

  const sliderSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 600,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/rates`);
        setGoldRate(res.data.goldRate);
        setSilverRate(res.data.silverRate);
      } catch (err) {
        console.error("Failed to fetch rates", err);
      }
    };
    fetchRates();
  }, []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 20
      }
    }
  };

  const handleFeatureClick = (feature) => {
    if (!mobile) setOpenDialog(true);
    else if (feature.route) navigate(feature.route);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {/* Dynamic Background Layers */}
      <Box sx={{ position: "absolute", width: "100%", height: "40%", background: "linear-gradient(135deg, #1a001f, #43005b)", top: 0, zIndex: 0 }} />
      <Box sx={{ position: "absolute", width: "100%", height: "30%", background: "linear-gradient(135deg, #2c003e, #4b0066)", top: "40%", zIndex: 0 }} />
      <Box sx={{ position: "absolute", width: "100%", height: "30%", background: "linear-gradient(135deg, #3b004f, #6a0080)", top: "70%", zIndex: 0 }} />

      {/* Floating Sparkles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -12, 0],
            x: [0, 6, -6, 0],
            opacity: [0.2, 0.8, 0.2]
          }}
          transition={{
            repeat: Infinity,
            duration: 5 + Math.random() * 3,
            ease: "easeInOut"
          }}
          style={{
            position: "absolute",
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            borderRadius: "50%",
            background: `hsl(${Math.random() * 50 + 40}, 100%, 65%)`,
            top: Math.random() * 900,
            left: Math.random() * 400,
            zIndex: 1
          }}
        />
      ))}

      {/* Header */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Box
          sx={{
            flexShrink: 0,
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "60px",
            bgcolor: "rgba(26,0,51,0.9)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2
          }}
        >
          <IconButton
            color="inherit"
            onClick={() => setMenuOpen(true)}
            component={motion.button}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <MenuIcon sx={{ color: "#FFD700" }} />
          </IconButton>
          <Sidemenu open={menuOpen} onClose={() => setMenuOpen(false)} />
          <Box sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            <motion.img
              src={logo}
              alt="Logo"
              style={{ height: 50, width: "auto", objectFit: "contain" }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            />
          </Box>
        </Box>
      </motion.div>

      {/* Scrollable Content */}
      <Box sx={{ flex: 1, overflowY: "auto", pt: "60px", zIndex: 2, pb: "70px" }}>
        {/* Banner */}
        <Slider {...sliderSettings}>
          {bannerImages.map((src, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.04 }} transition={{ duration: 0.6 }}>
              <Box sx={{ borderRadius: 3, overflow: "hidden", height: 280, mx: 2, boxShadow: "0 0 30px rgba(255,215,0,0.3)" }}>
                <img
                  src={src}
                  alt={`banner${idx}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(1.1)" }}
                />
              </Box>
            </motion.div>
          ))}
        </Slider>

        {/* Rates */}
        <Box textAlign="center" p={2}>
          <Typography variant="h6" sx={{ color: "#FFD700" }}>
            TODAY'S RATE
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={6}>
              <Card
                sx={{
                  bgcolor: "#3a004d",
                  borderRadius: 3,
                  textAlign: "center",
                  height: 60,
                  width: 130,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: "0 0 20px #FFD700"
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  GOLD
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  ₹ {goldRate}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card
                sx={{
                  bgcolor: "#4b0066",
                  borderRadius: 3,
                  textAlign: "center",
                  height: 60,
                  width: 130,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: "0 0 20px #C0C0C0"
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  SILVER
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  ₹ {silverRate}
                </Typography>
              </Card>
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            {dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString()}
          </Typography>
          {mobile && (
            <Typography variant="subtitle1" fontWeight="bold" color="#FFD700" mt={1}>
              {title}.{name}-{mobile}
            </Typography>
          )}
        </Box>

        {/* New Arrivals */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: "flex", gap: 16, overflowX: "auto", px: 2, pb: 2 }}
        >
          {newArrivals.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              whileHover={{ scale: 1.08, y: -5, boxShadow: "0 8px 30px rgba(255,215,0,0.6)" }}
              whileTap={{ scale: 0.97 }}
            >
              <Card
                sx={{
                  minWidth: 160,
                  borderRadius: 3,
                  boxShadow: 5,
                  position: "relative",
                  background: "#3a004d"
                }}
              >
                <Badge
                  badgeContent="New"
                  color="error"
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    "& .MuiBadge-badge": {
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      px: 1,
                      borderRadius: "4px"
                    }
                  }}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "rgba(0,0,0,0.5)",
                    color: "white",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" }
                  }}
                  size="small"
                >
                  <FavoriteBorder />
                </IconButton>
                <CardMedia component="img" height="140" image={item.img} alt={item.title} sx={{ borderRadius: 2 }} />
                <CardContent>
                  <Typography variant="body2" fontWeight="bold" color="#FFD700">
                    {item.title}
                  </Typography>
                  <Typography fontWeight="bold" color="white">
                    {item.price}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Grid container spacing={2} p={2} justifyContent="center">
            {features.map((f, idx) => (
              <Grid item xs={6} sm={4} md={3} key={idx}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.1, y: -3, boxShadow: "0 6px 20px rgba(255,215,0,0.5)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 120 }}
                >
                  <Box
                    sx={{
                      textAlign: "center",
                      borderRadius: 3,
                      boxShadow: 5,
                      p: 2,
                      cursor: "pointer",
                      background: "#3a004d"
                    }}
                    onClick={() => handleFeatureClick(f)}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        bgcolor: "#f57c00",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        boxShadow: 5
                      }}
                    >
                      {f.icon}
                    </Box>
                    <Typography variant="body2" fontWeight="bold" mt={1} sx={{ color: "#FFD700" }}>
                      {f.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>

      {/* Fixed Footer */}
      <AppBar 
        position="fixed" 
        sx={{ 
          top: 'auto', 
          bottom: 0, 
          backgroundColor: 'rgba(26,0,51,0.9)',
          borderTop: '1px solid #FFD700',
          zIndex: 1000
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: '60px !important' }}>
            <Typography variant="body2" sx={{ color: '#FFD700' }}>
              © {new Date().getFullYear()} Your Company Name. All rights reserved.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                sx={{ color: '#FFD700' }} 
                component="a" 
                href="https://wa.me/yourphonenumber" 
                target="_blank"
              >
                <FaWhatsapp />
              </IconButton>
              <IconButton 
                sx={{ color: '#FFD700' }} 
                component="a" 
                href="https://instagram.com/yourusername" 
                target="_blank"
              >
                <InstagramIcon />
              </IconButton>
              <IconButton 
                sx={{ color: '#FFD700' }} 
                component="a" 
                href="https://facebook.com/yourusername" 
                target="_blank"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton 
                sx={{ color: '#FFD700' }} 
                component="a" 
                href="https://youtube.com/yourchannel" 
                target="_blank"
              >
                <YouTubeIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
};

export default Home;