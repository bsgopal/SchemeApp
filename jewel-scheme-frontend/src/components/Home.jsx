import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Grid,
  Card,
  IconButton,
  Container,
  AppBar,
} from "@mui/material";
import NewArrivals from "./newarrivals/NewArrivals.jsx";
import MenuIcon from "@mui/icons-material/Menu";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";
import logo from "./renic_logo.png";
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
// import { FavoriteBorder } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Sidemenu from "./Sidemenu";
import { motion } from "framer-motion";

const bannerImages = ["/images/newBanner1.jpeg", "/images/newBanner2.jpeg", "/images/banner3.png"];

const allFeatures = [
  { label: "New Plan", icon: <TouchAppIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin", "User"], route: "/newplan" },
  { label: "My Plans", icon: <AssignmentIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin", "User"], route: "/my-plans" },
  // { label: "Pay EMA", icon: <PaymentIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin", "Agent", "User"], route: "/payema" },
  { label: "My Wallet", icon: <AccountBalanceWalletIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin", "User"], route: "/wallet" },
  { label: "Offers", icon: <LocalOfferIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin", "User"], route: "/offers" },
  { label: "Create User", icon: <AccountBalanceWalletIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin"], route: "/createaccount" },
  { label: "Create New Plans", icon: <TouchAppIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["SuperAdmin", "Admin"], route: "/createnewplan" },
  { label: "Collections", icon: <CollectionsIcon sx={{ fontSize: 36, color: "white" }} />, roles: ["Agent"], route: "/collections" },
  // 🔥 AGENT-ONLY FEATURES (ADD BELOW YOUR EXISTING FEATURES)

  {
    label: "Agent Dashboard",
    icon: <AccountBalanceWalletIcon sx={{ fontSize: 36, color: "white" }} />,
    roles: ["Agent"],
    route: "/agent-dashboard"
  },
  {
    label: "My Customers",
    icon: <AssignmentIcon sx={{ fontSize: 36, color: "white" }} />,
    roles: ["Agent"],
    route: "/agent-customers"
  },
  {
    label: "Collect Installment",
    icon: <PaymentIcon sx={{ fontSize: 36, color: "white" }} />,
    roles: ["Agent"],
    route: "/collect-installment"
  },
  {
    label: "Agent Wallet",
    icon: <AccountBalanceWalletIcon sx={{ fontSize: 36, color: "white" }} />,
    roles: ["Agent"],
    route: "/agent-wallet"
  },
  {
    label: "Commission Report",
    icon: <CollectionsIcon sx={{ fontSize: 36, color: "white" }} />,
    roles: ["Agent"],
    route: "/agent-commission"
  },
  {
    label: "Pending Dues",
    icon: <LocalOfferIcon sx={{ fontSize: 36, color: "white" }} />,
    roles: ["Agent"],
    route: "/pending-dues"
  },
  {
    label: "Performance",
    icon: <CollectionsIcon sx={{ fontSize: 36, color: "white" }} />,
    roles: ["Agent"],
    route: "/agent-performance"
  },

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
  const [guest, setGuest] = useState(localStorage.getItem("isGuest") === "true");
  const navigate = useNavigate();



  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedMobile = localStorage.getItem("mobile");
    const savedName = localStorage.getItem("name");
    const savedTitle = localStorage.getItem("title");
    const savedRole = localStorage.getItem("role");
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
        setGoldRate(Math.trunc(res.data.goldRate));
        setSilverRate(Math.trunc(res.data.silverRate));
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
    if (guest) {
      setOpenDialog(true);
    } else if (feature.route) {
      navigate(feature.route);
    }
  };


  return (
    <Box sx={{
      minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", paddingTop: "env(safe-area-inset-top)",
      paddingBottom: "env(safe-area-inset-bottom)",
      paddingLeft: "env(safe-area-inset-left)",
      paddingRight: "env(safe-area-inset-right)",
    }}>
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
            bgcolor: "transparent",
            background: "linear-gradient(90deg, #1A0033 0%, #4B0082 100%)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2
          }}
        >
          {/* Menu Button */}
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

          {/* Center Logo */}

          {/* Center Logo (FIXED) */}
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              height: "100%",          // 🔥 important
              pointerEvents: "none",   // avoids blocking clicks
            }}
          >
            <motion.img
              src={logo}
              alt="RENIC"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                height: 36,            // ✅ PERFECT header size
                width: "auto",
                objectFit: "contain",
              }}
            />
          </Box>




          {/* Profile Avatar Button */}
          <Box sx={{ mr: 1 }}>
            <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
              <Box
                onClick={() => navigate("/profile")}
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  backgroundColor: "#FFD700",
                  border: "2px solid white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 0 10px rgba(255,215,0,0.7)",
                  overflow: "hidden",
                  marginRight: "20px"
                }}
              >
                {/* If you add profile image later, replace this with <img /> */}
                <Typography
                  sx={{
                    color: "#4B0082",
                    fontWeight: "bold",
                    fontSize: "18px"
                  }}
                >
                  {name ? name.charAt(0).toUpperCase() : "U"}
                </Typography>
              </Box>
            </motion.div>
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
        <Box textAlign="center" p={5} sx={{ position: "relative", zIndex: 2 }}>
          <Typography variant="h6" sx={{ color: "#FFD700" }}>
            TODAY'S RATE
          </Typography>
          <Grid container spacing={2} justifyContent="center" m={3}>
            <Grid size={6} >
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
            <Grid size={6}>
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
          <Typography variant="caption" color="#eb350dff" display="block" mt={1}>
            {dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString()}
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold" color="#FFD700" mt={1}>
            {guest
              ? "Please Login and use"
              : mobile
                ? `${title}.${name}-${mobile}`
                : ""}
          </Typography>

        </Box>

        {/* New Arrivals */}
        <NewArrivals />

        {/* Features */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Grid container spacing={2} p={2} justifyContent="center">
            {features.map((f, idx) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={idx}>
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
      {/* Fixed Footer */}
      <AppBar
        position="fixed"
        sx={{
          top: 'auto',
          bottom: 0,
          backgroundColor: 'rgba(26,0,51,0.9)',
          borderTop: '1px solid #FFD700',
          zIndex: 1000,
          py: 0.5
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>

            {/* Social Icons */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton sx={{ color: '#25D366', p: 0.5 }} component="a" href="https://wa.me/yourphonenumber" target="_blank">
                <FaWhatsapp />
              </IconButton>
              <IconButton sx={{ color: '#E4405F', p: 0.5 }} component="a" href="https://instagram.com/yourusername" target="_blank">
                <InstagramIcon />
              </IconButton>
              <IconButton sx={{ color: '#1877F2', p: 0.5 }} component="a" href="https://facebook.com/yourusername" target="_blank">
                <FacebookIcon />
              </IconButton>
              <IconButton sx={{ color: '#FF0000', p: 0.5 }} component="a" href="https://youtube.com/yourchannel" target="_blank">
                <YouTubeIcon />
              </IconButton>
            </Box>

            {/* Copyright */}
            <Typography variant="caption" sx={{ color: '#FFD700', textAlign: "center" }}>
              © {new Date().getFullYear()} Renic Tech. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </AppBar>


    </Box>
  );
};

export default Home;