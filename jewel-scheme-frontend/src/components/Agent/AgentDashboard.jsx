import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

/* 🔢 KPI CARD COMPONENT */
const StatCard = ({ title, value }) => (
  <motion.div whileHover={{ scale: 1.05 }}>
    <Card
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: "#3a004d",
        color: "#FFD700",
        boxShadow: "0 0 20px rgba(255,215,0,0.45)",
        height: "100%",
      }}
    >
      <Typography variant="caption" sx={{ opacity: 0.9 }}>
        {title}
      </Typography>
      <Typography variant="h6" fontWeight="bold" mt={0.5}>
        {value}
      </Typography>
    </Card>
  </motion.div>
);

/* 📋 PENDING ITEM */
const PendingItem = ({ item, onPay }) => (
  <motion.div whileHover={{ scale: 1.02 }}>
    <Card
      sx={{
        p: 1.5,
        mb: 1.5,
        borderRadius: 2,
        bgcolor: "#2b003d",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 0 10px rgba(255,215,0,0.25)",
      }}
    >
      <Box>
        <Typography fontWeight="bold">{item.customerName}</Typography>
        <Typography variant="caption" sx={{ color: "#d1b8ff" }}>
          {item.planName} • ₹{item.amount}
        </Typography>
      </Box>

      <Button
        size="small"
        onClick={() => onPay(item)}
        sx={{
          background: "linear-gradient(90deg,#FFD700,#E6B800)",
          color: "#2b003d",
          fontWeight: 600,
          borderRadius: 2,
          px: 2,
          "&:hover": { background: "#FFD700" },
        }}
      >
        PAY
      </Button>
    </Card>
  </motion.div>
);

export default function AgentDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* 📡 FETCH DATA */
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const [statsRes, pendingRes] = await Promise.all([
          axios.get(`${API}/api/agent/dashboard`, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
          }),
          axios.get(`${API}/api/agent/pending-installments?date=today`, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
          }),
        ]);

        setStats(statsRes.data.data);
        setPending(pendingRes.data.data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load agent dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  /* 🟡 PAY HANDLER */
  const handlePay = (item) => {
    navigate("/collect-installment", {
      state: {
        customerId: item.customerId,
        planName: item.planName,
        amount: item.amount,
      },
    });
  };

  /* ⏳ LOADING */
  if (loading) {
    return (
      <Box
        minHeight="70vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress sx={{ color: "#FFD700" }} />
      </Box>
    );
  }

  /* ❌ ERROR */
  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={2}>
      {/* 🏷 TITLE */}
      <Typography
        variant="h6"
        sx={{ color: "#FFD700", mb: 2, fontWeight: 700 }}
      >
        Agent Overview
      </Typography>

      {/* 📊 KPI GRID */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <StatCard title="Total Customers" value={stats.totalCustomers} />
        </Grid>
        <Grid item xs={6}>
          <StatCard
            title="Pending Dues"
            value={stats.pendingInstallmentsCount}
          />
        </Grid>
        <Grid item xs={6}>
          <StatCard
            title="Today Collection"
            value={`₹${stats.todayCollectionAmount}`}
          />
        </Grid>
        <Grid item xs={6}>
          <StatCard
            title="Total Commission"
            value={`₹${stats.totalCommission}`}
          />
        </Grid>
      </Grid>

      {/* 🔔 TODAY'S PENDING */}
      <Box mt={4}>
        <Typography
          sx={{ color: "#FFD700", mb: 1.5, fontWeight: 600 }}
        >
          Today’s Pending Collections
        </Typography>

        {pending.length === 0 ? (
          <Typography variant="caption" sx={{ color: "#ccc" }}>
            No pending installments for today 🎉
          </Typography>
        ) : (
          pending.map((item) => (
            <PendingItem
              key={item.customerId}
              item={item}
              onPay={handlePay}
            />
          ))
        )}
      </Box>
    </Box>
  );
}
