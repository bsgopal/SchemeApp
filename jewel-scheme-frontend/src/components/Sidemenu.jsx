import React from "react";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import HistoryIcon from "@mui/icons-material/History";
import SecurityIcon from "@mui/icons-material/Security";
import InfoIcon from "@mui/icons-material/Info";
import PolicyIcon from "@mui/icons-material/Policy";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import StoreIcon from "@mui/icons-material/Store";
import CallIcon from "@mui/icons-material/Call";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "./logo.png";

function Sidemenu({ open, onClose }) {
  const navigate = useNavigate();
  const role = sessionStorage.getItem("role");
  const isLoggedIn = !!role;

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
    onClose();
  };

  const menuItems = [
    { text: "Home", icon: <HomeIcon />, action: () => navigate("/") },

    ...(role === "SuperAdmin" || role === "Admin"
      ? [
          {
            text: "Rate Entry",
            icon: <NewReleasesIcon />,
            action: () => navigate("/rateentry"),
          },
          {
            text: "New Arrivals",
            icon: <StoreIcon />,
            action: () => navigate("/manage-newarrivals"),
          },
          {
            text: "Payment History",
            icon: <HistoryIcon />,
            action: () => navigate("/paymenthistory"),
          },
        ]
      : [
          {
            text: "New Arrivals",
            icon: <NewReleasesIcon />,
            action: () => navigate("/newarrivals"),
          },
        ]),

    { text: "My Security Settings", icon: <SecurityIcon /> },
    { text: "About Us", icon: <InfoIcon /> },
    { text: "Our Policies", icon: <PolicyIcon /> },
    { text: "Invite", icon: <GroupAddIcon /> },
    { text: "Our Stores", icon: <StoreIcon /> },
    { text: "Contact Us", icon: <CallIcon /> },
  ];

  const handleItemClick = (action) => {
    if (action) action();
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280,
          border: "none",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        },
      }}
    >
      {/* Gradient Background Layers */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "40%",
            background: "linear-gradient(135deg, #1a001f, #43005b)",
            top: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "30%",
            background: "linear-gradient(135deg, #2c003e, #4b0066)",
            top: "40%",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "30%",
            background: "linear-gradient(135deg, #3b004f, #6a0080)",
            top: "70%",
          }}
        />
      </Box>

      {/* Drawer Content */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -80, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1, // keeps content above background
        }}
      >
        {/* Logo Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 140,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,240,200,0.1))",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid rgba(212,160,23,0.3)",
          }}
        >
          <motion.img
            src={logo}
            alt="Logo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              height: 300,
              width: "auto",
              objectFit: "contain",
            }}
          />
        </Box>

        {/* Menu Items */}
        <List
          sx={{
            flexGrow: 1,
            pt: 0,
            "& .MuiListItem-root": {
              py: 1.2,
              px: 2,
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              transition: "all 0.3s ease",
            },
            "& .MuiListItem-root:hover": {
              background:
                "linear-gradient(135deg, rgba(212,160,23,0.2), rgba(255,220,150,0.25))",
              transform: "scale(1.02)",
              boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
              borderRadius: "8px",
            },
            "& .MuiListItemIcon-root": {
              minWidth: 36,
              color: "#f5d76e", // golden icons
            },
            "& .MuiListItemText-root": {
              color: "#fff",
            },
          }}
        >
          {menuItems.map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
            >
              <ListItem button onClick={() => handleItemClick(item.action)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                  }}
                />
              </ListItem>
            </motion.div>
          ))}
        </List>

        {/* Sign in / Logout */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Box
            sx={{
              borderTop: "1px solid rgba(255,255,255,0.2)",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              py: 2,
              textAlign: "center",
              cursor: "pointer",
              color: "#f5d76e",
              fontWeight: "bold",
              fontSize: "1.1rem",
              transition: "0.3s",
              "&:hover": {
                color: "#ffd700",
                transform: "scale(1.05)",
              },
            }}
            onClick={!isLoggedIn ? () => navigate("/login") : handleLogout}
          >
            {!isLoggedIn ? "Sign in / Sign up" : "Logout"}
          </Box>
        </motion.div>

        {/* Footer */}
        <Box
          sx={{
            p: 1.5,
            backgroundColor: "rgba(0,0,0,0.4)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            textAlign: "center",
          }}
        >
          <Typography variant="caption" sx={{ color: "#ddd" }}>
            © {new Date().getFullYear()} Renic Tech. All rights reserved.
          </Typography>
        </Box>
      </motion.div>
    </Drawer>
  );
}

export default Sidemenu;
