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
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { motion } from "framer-motion";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function PaymentHistoryDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [plans, setPlans] = useState([]);

  const fetchUserHistory = () =>
    axios.get(`${API}/api/payments/user/${userId}`, {
      headers: {
        "x-admin-role":
          sessionStorage.getItem("is_super_admin") === "1"
            ? "superadmin"
            : "admin",
      },
    });

  useEffect(() => {
    fetchUserHistory().then((res) => {
      setUserName(res.data.user?.name ?? "User");
      setPlans(res.data.plans);
    });
  }, []);

  return (
    <Box
      sx={{
        height: "100vh",
        background: "linear-gradient(135deg, #26004d, #6a0080, #b30059)",
        color: "white",
        p: 3,
      }}
    >
      {/* HEADER */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: "gold" }}>
          <ArrowBackIosNewIcon />
        </IconButton>

        <Typography variant="h5" sx={{ color: "gold", fontWeight: "bold" }}>
          {userName}'s Plans
        </Typography>
      </Box>

      <Card
        sx={{
          p: 3,
          background: "rgba(255,255,255,0.12)",
          borderRadius: "20px",
          backdropFilter: "blur(8px)",
          height: "85vh",
          overflowY: "auto",
        }}
      >
        {plans.map((p, index) => (
          <Card
            key={index}
            component={motion.div}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            sx={{
              p: 3,
              mb: 3,
              background: "rgba(0,0,0,0.3)",
              borderRadius: "18px",
              border: "1px solid rgba(255,215,0,0.25)",
              color: "white",
            }}
          >
            <Typography variant="h6" sx={{ color: "gold" }}>
              Member No: {p.member_no}
            </Typography>

            <Typography>Group ID: {p.group_id}</Typography>
            <Typography>Status: {p.status}</Typography>
            <Typography>Joined: {p.join_date}</Typography>

            <Divider sx={{ my: 1 }} />

            <Typography>
              Installments Paid:{" "}
              <b style={{ color: "#4CAF50" }}>{p.installments.paid}</b> /{" "}
              {p.installments.total_inst}
            </Typography>

            <Typography>
              Pending:{" "}
              <b style={{ color: "#FF5252" }}>{p.installments.pending}</b>
            </Typography>

            <Chip
              label={p.installments.pending === 0 ? "Completed" : "Active Plan"}
              color={p.installments.pending === 0 ? "success" : "warning"}
              sx={{ mt: 2 }}
            />
          </Card>
        ))}
      </Card>
    </Box>
  );
}
