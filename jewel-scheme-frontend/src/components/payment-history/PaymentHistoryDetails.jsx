import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  Typography,
  Divider,
  Chip,
  IconButton,
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { motion } from "framer-motion";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function PaymentHistoryDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 0 = Active, 1 = Closed (default Active)
  const selectedTab = location.state?.tab ?? 0;

  const [userName, setUserName] = useState("");
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/api/payments/user/${userId}`, {
        headers: {
          "x-admin-role":
            localStorage.getItem("is_super_admin") === "1"
              ? "superadmin"
              : "admin",
        },
      })
      .then((res) => {
        setUserName(res.data.user?.name ?? "User");
        setPlans(res.data.plans || []);
      })
      .catch(console.error);
  }, [userId]);

  // 🔹 Filter plans based on incoming tab
  const filteredPlans =
    selectedTab === 0
      ? plans.filter((p) => Number(p.is_closed) === 0)
      : plans.filter((p) => Number(p.is_closed) === 1);

  return (
    <Box
      sx={{
        height: "100vh",
        background: "linear-gradient(135deg,#26004d,#6a0080,#b30059)",
        color: "white",
        p: 2,
      }}
    >
      {/* HEADER */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: "gold" }}>
          <ArrowBackIosNewIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{ color: "gold", fontWeight: "bold" }}
        >
          {userName}'s{" "}
          {selectedTab === 0 ? "Active Plans" : "Closed Plans"}
        </Typography>
      </Box>

      {/* PLAN LIST */}
      <Box sx={{ height: "80vh", overflowY: "auto" }}>
        {filteredPlans.map((p, index) => (
          <Card
            key={index}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              p: 2,
              mb: 2,
              background: "rgba(0,0,0,0.3)",
              borderRadius: "16px",
              border: "1px solid rgba(255,215,0,0.3)",
            }}
          >
            <Typography sx={{ color: "gold", fontWeight: "bold" }}>
              Member No: {p.member_no}
            </Typography>

            <Typography variant="body2">
              Joined: {p.join_date}
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Typography>
              Paid:{" "}
              <b style={{ color: "#4CAF50" }}>
                {p.installments?.paid ?? 0}
              </b>
            </Typography>

            <Typography>
              Pending:{" "}
              <b style={{ color: "#FF5252" }}>
                {p.installments?.pending ?? 0}
              </b>
            </Typography>

            <Chip
              label={selectedTab === 0 ? "ACTIVE" : "CLOSED"}
              color={selectedTab === 0 ? "warning" : "success"}
              sx={{ mt: 1 }}
            />
          </Card>
        ))}

        {filteredPlans.length === 0 && (
          <Typography align="center" sx={{ mt: 5, opacity: 0.7 }}>
            No plans found
          </Typography>
        )}
      </Box>
    </Box>
  );
}
