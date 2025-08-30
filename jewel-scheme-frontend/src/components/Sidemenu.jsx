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
import logo from "./logo.png";
import { useNavigate } from "react-router-dom";

function Sidemenu({ open, onClose }) {
  const navigate = useNavigate();
  const role = sessionStorage.getItem("role");
  const isLoggedIn = !!role;

  const handleLogout = () => {
    sessionStorage.clear(); // clear all stored values
    navigate("/login"); // redirect to login page
    onClose(); // close drawer
  };

  const menuItems = [
    { text: "Home", icon: <HomeIcon /> },
    { text: "Payment History", icon: <HistoryIcon /> },
    { text: "My Security Settings", icon: <SecurityIcon /> },
    { text: "About Us", icon: <InfoIcon /> },
    { text: "Our Policies", icon: <PolicyIcon /> },
    { text: "Invite", icon: <GroupAddIcon /> },
    { text: "Our Stores", icon: <StoreIcon /> },
    { text: "Contact Us", icon: <CallIcon /> },
    { text: "New arrivals", icon: <NewReleasesIcon /> },
    ...(role === "SuperAdmin" || role === "Admin"
      ? [
          {
            text: "Rate Entry",
            icon: <NewReleasesIcon />,
            action: () => navigate("/rateentry"),
          },
        ]
      : []),
  ];

  const handleItemClick = (action) => {
    if (action) action();
    onClose(); // Close the drawer after navigation
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 260,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#f8f4e9",
          padding: 0,
        }}
      >
        {/* Compact Logo Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 100,
            backgroundColor: "white",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              height: 280,
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
              py: 1,
              px: 2,
              minHeight: 48,
              borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
              "&:hover": {
                backgroundColor: "rgba(212, 160, 23, 0.08)",
              },
            },
            "& .MuiListItemIcon-root": {
              minWidth: 36,
              color: "#d4a017",
            },
          }}
        >
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleItemClick(item.action)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: "0.9rem",
                  fontWeight: 500,
                }}
              />
            </ListItem>
          ))}
        </List>

        {/* Sign in / Logout option ABOVE Footer */}
        <Box
          sx={{
            borderTop: "1px solid #e0e0e0",
            borderBottom: "1px solid #e0e0e0",
            py: 2,
            textAlign: "center",
            cursor: "pointer",
            color: "#d4a017",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
          onClick={!isLoggedIn ? () => navigate("/login") : handleLogout}
        >
          {!isLoggedIn ? "Sign in / Sign up" : "Logout"}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 1.5,
            backgroundColor: "white",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="caption" color="textSecondary">
            © {new Date().getFullYear()} Renic Tech. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}

export default Sidemenu;
