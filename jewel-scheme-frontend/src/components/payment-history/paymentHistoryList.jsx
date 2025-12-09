import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function PaymentHistoryList() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const navigate = useNavigate();

  const fetchUsers = () =>
    axios.get(`${API}/api/payments/users`, {
      headers: {
        "x-admin-role":
          sessionStorage.getItem("is_super_admin") === "1"
            ? "superadmin"
            : "admin",
      },
    });

  const fetchStat = (userId) =>
    axios.get(`${API}/api/payments/user/${userId}`, {
      headers: {
        "x-admin-role":
          sessionStorage.getItem("is_super_admin") === "1"
            ? "superadmin"
            : "admin",
      },
    });

  // Load users
  useEffect(() => {
    fetchUsers().then(async (res) => {
      const temp = [];

      for (let u of res.data.users) {
        const stats = await fetchStat(u.id);
        const plans = stats.data.plans;

        let pending = 0;
        plans.forEach((p) => (pending += p.installments.pending));

        temp.push({
          ...u,
          total_plans: plans.length,
          total_pending: pending,
        });
      }

      setUsers(temp);
      setFiltered(temp);
    });
  }, []);

  // Filtering
  useEffect(() => {
    let list = [...users];

    if (search !== "") {
      list = list.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter === "pending") list = list.filter((u) => u.total_pending > 0);
    if (filter === "completed") list = list.filter((u) => u.total_pending === 0);

    setFiltered(list);
  }, [search, filter, users]);

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
        <IconButton onClick={() => window.history.back()} sx={{ color: "gold" }}>
          <ArrowBackIosNewIcon />
        </IconButton>

        <Typography variant="h5" sx={{ color: "gold", fontWeight: "bold" }}>
          Payment History
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
        {/* SEARCH */}
        <TextField
          placeholder="Search user..."
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mb: 2,
            input: { color: "white" },
            "& fieldset": { borderColor: "gold" },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "gold" }} />
              </InputAdornment>
            ),
          }}
        />

        {/* FILTER */}
        <TextField
          select
          label="Filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          fullWidth
          sx={{
            mb: 2,
            "& .MuiInputLabel-root": { color: "gold" },
            "& fieldset": { borderColor: "gold" },
          }}
        >
          <MenuItem value="all">All Users</MenuItem>
          <MenuItem value="pending">Pending Users</MenuItem>
          <MenuItem value="completed">Completed Users</MenuItem>
        </TextField>

        <Chip
          label="Reset"
          onClick={() => {
            setSearch("");
            setFilter("all");
            setFiltered(users);
          }}
          sx={{
            mb: 2,
            background: "rgba(255,215,0,0.2)",
            color: "gold",
            cursor: "pointer",
          }}
        />

        <Divider sx={{ borderColor: "rgba(255,215,0,0.4)", mb: 2 }} />

        {/* USER LIST */}
        <List>
          {filtered.map((u, index) => (
            <ListItem key={u.id} disablePadding>
              <ListItemButton
                onClick={() => navigate(`/payment-history/${u.id}`)}
                sx={{
                  borderRadius: "12px",
                  mb: 1,
                  background: "rgba(255,255,255,0.1)",
                  "&:hover": {
                    background: "rgba(255,215,0,0.2)",
                  },
                }}
              >
                <ListItemText
                  primary={`${index + 1}. ${u.name}`}
                  secondary={
                    <span style={{ color: "gold" }}>
                      Plans: {u.total_plans} | Pending: {u.total_pending}
                    </span>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Card>
    </Box>
  );
}
