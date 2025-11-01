import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Container,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useNavigate } from "react-router-dom";


const MyPlans = () => { 
  const navigate = useNavigate();
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const [plans, setPlans] = useState([]); // always initialize as array
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const userId = sessionStorage.getItem("userId");
        // console.log("User ID from sessionStorage:", userId);

        const response = await axios.get(`${API_BASE_URL}/api/my-plans/${userId}`);
        // console.log("API response",response.data);
        

        // Safely extract plans array
        const fetchedPlans = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.plans)
          ? response.data.plans
          : [];

        setPlans(fetchedPlans);
        console.log("✅ Fetched plans:", fetchedPlans);
      } catch (err) {
        console.error("❌ Error fetching plans:", err.response?.data || err.message);
        setSnackbar({
          open: true,
          message: "Failed to load plans. Please try again later.",
          severity: "error",
        });
        setPlans([]); // fallback to empty array
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [API_BASE_URL]);

  return (
    <Box className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <AppBar
        position="static"
        sx={{ bgcolor: "white", color: "rgb(127 29 29)" }}
        elevation={1}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton edge="start" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            My Plans
          </Typography>
          <Box sx={{ width: 48 }} />
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 5 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
            <CircularProgress color="error" />
          </Box>
        ) : plans.length === 0 ? (
          <Paper
            elevation={2}
            sx={{ p: 4, textAlign: "center", borderRadius: "1rem" }}
          >
            <Typography variant="h6" gutterBottom>
              You haven’t joined any plans yet.
            </Typography>
            <Button
              variant="contained"
              sx={{ bgcolor: "rgb(127 29 29)" }}
              onClick={() => navigate("/newplan")}
            >
              Join a Plan
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {plans.map((plan) => (
              <Grid item xs={15} sm={8} md={6} key={plan.id}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: "1rem",
                    "&:hover": { transform: "scale(1.02)" },
                    transition: "0.3s ease",
                    // marginLeft:"50px",
                    width:"150%",
                  }}
                >
                  <CardHeader
                    title={plan.plan_name || plan.scheme_name || "Plan Name"}
                    sx={{
                      bgcolor: "rgb(127 29 29)",
                      color: "white",
                      textAlign: "center",
                    }}
                  />
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CurrencyRupeeIcon sx={{ color: "rgb(127 29 29)", mr: 1 }} />
                      <Typography variant="body1">
                        Amount: <b>{plan.amount_per_inst || plan.inst_amount || 0}</b>
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CalendarMonthIcon sx={{ color: "rgb(127 29 29)", mr: 1 }} />
                      <Typography variant="body1">
                        Duration: <b>{plan.duration || plan.no_of_inst || "12 months"}</b>
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <EventAvailableIcon sx={{ color: "rgb(127 29 29)", mr: 1 }} />
                      <Typography variant="body1">
                        Start Date:{" "}
                        <b>
                          {plan.start_date
                            ? new Date(plan.join_date).toLocaleDateString()
                            : "Not Available"}
                        </b>
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        mt: 2,
                        borderColor: "rgb(127 29 29)",
                        color: "rgb(127 29 29)",
                      }}
                      onClick={() =>
                        navigate(`/plan-details/${plan.id}`, { state: { plan } })
                      }
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyPlans;
