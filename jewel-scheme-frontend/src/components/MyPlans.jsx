import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  IconButton,
  Typography,
  Box,
  Container,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Snackbar,
  Alert,
  CardActionArea,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MyPlans = () => {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const userId = sessionStorage.getItem("userId");
        const res = await axios.get(`${API_BASE_URL}/api/my-plans/${userId}`);
        const fetched = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.plans)
            ? res.data.plans
            : [];
        setPlans(fetched);
      } catch (err) {
        console.error("Error fetching plans:", err?.response?.data || err?.message);
        setSnackbar({
          open: true,
          message: "Failed to load plans. Please try again later.",
          severity: "error",
        });
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [API_BASE_URL]);

  const getPlanImage = (plan) =>
    plan?.image || plan?.image_url || `${process.env.PUBLIC_URL}/plan-placeholder.jpg`;

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 150, damping: 20 },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      {/* Background layers */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "36%",
          background: "linear-gradient(135deg, #1a001f, #43005b)",
          top: 0,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "32%",
          background: "linear-gradient(135deg, #2c003e, #4b0066)",
          top: "36%",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "32%",
          background: "linear-gradient(135deg, #3b004f, #6a0080)",
          top: "68%",
          zIndex: 0,
        }}
      />

      {/* Floating sparkles */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -10, 0], x: [0, 6, -6, 0], opacity: [0.15, 0.8, 0.15] }}
          transition={{
            repeat: Infinity,
            duration: 5 + Math.random() * 4,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
          style={{
            position: "absolute",
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            borderRadius: "50%",
            background: `hsl(${Math.random() * 50 + 40},100%,65%)`,
            top: Math.random() * 900,
            left: Math.random() * 980,
            zIndex: 1,
            pointerEvents: "none",
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
            background: "linear-gradient(90deg, #1A0033 0%, #4B0082 100%)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
          }}
        >
          <IconButton
            edge="start"
            onClick={() => navigate(-1)}
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowBackIcon sx={{ color: "#FFD700" }} />
          </IconButton>

          <Typography
            variant="h6"
            sx={{
              color: "#FFD700",
              fontWeight: 700,
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            My Plans
          </Typography>

          <Box sx={{ width: 48 }} />
        </Box>
      </motion.div>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: "auto", pt: "60px", zIndex: 2, pb: "72px" }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
              <CircularProgress color="error" />
            </Box>
          ) : plans.length === 0 ? (
            <Paper elevation={2} sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                You haven’t joined any plans yet.
              </Typography>
              <Button
                variant="contained"
                sx={{ bgcolor: "#FFD700", color: "#3a004d" }}
                onClick={() => navigate("/newplan")}
              >
                Join a Plan
              </Button>
            </Paper>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="stretch">
                {plans.map((plan) => {
                  const id = plan.id || plan._id;
                  const imageSrc = getPlanImage(plan);
                  const dateValue = plan.start_date || plan.join_date || null;
                  const startDateText = dateValue
                    ? new Date(dateValue).toLocaleDateString()
                    : "Not Available";

                  return (
                    <Grid key={id} size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: "flex" }}>
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -4 }}
                        transition={{ type: "spring", stiffness: 140 }}
                        style={{ flexGrow: 1, display: "flex" }}
                      >
                        <Card
                          sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: 3,
                            overflow: "hidden",
                            position: "relative",
                            background: "linear-gradient(145deg, #1a001f 0%, #2c003e 50%, #3a004d 100%)",
                            border: "1px solid rgba(255, 215, 0, 0.3)",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-6px)",
                              boxShadow: "0 12px 30px rgba(255, 215, 0, 0.35)",
                              borderColor: "rgba(255, 215, 0, 0.6)",
                            },
                          }}
                        >
                          <CardActionArea

                            onClick={() =>
                              navigate(`/plan-details/${id}`, {
                                state: {
                                  plan,
                                  membership_id: plan.id, // 👈 add this
                                  group_id: plan.group_id,           // 👈 and this
                                },

                              })
                            }
                            sx={{ flexShrink: 0 }}
                          >

                            <CardMedia
                              component="img"
                              height="180"
                              image={imageSrc}
                              alt={plan.plan_name || plan.scheme_name || "Plan Image"}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `${process.env.PUBLIC_URL}/plan-placeholder.jpg`;
                              }}
                              sx={{
                                objectFit: "cover",
                                width: "100%",
                                borderBottom: "1px solid rgba(255, 215, 0, 0.3)",
                              }}
                            />
                            <Box
                              sx={{
                                background: "linear-gradient(90deg, #4b0066 0%, #1a001f 100%)",
                                px: 2,
                                py: 1.2,
                                borderTop: "1px solid rgba(255, 215, 0, 0.2)",
                              }}
                            >
                              <Typography
                                align="center"
                                variant="h6"
                                sx={{
                                  color: "#FFD700",
                                  fontWeight: 700,
                                  letterSpacing: 0.7,
                                  textTransform: "uppercase",
                                  textShadow: "0 0 6px rgba(255, 215, 0, 0.4)",
                                  fontFamily: "'Cinzel', serif",
                                }}
                              >
                                {plan.plan_name || plan.scheme_name || "Plan Name"}
                              </Typography>
                            </Box>
                          </CardActionArea>

                          <CardContent
                            sx={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              background: "linear-gradient(180deg, rgba(74,0,115,0.1), rgba(0,0,0,0.4))",
                              backdropFilter: "blur(6px)",
                              color: "#f2e9ff",
                              p: 2,
                            }}
                          >
                            <Box>
                              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <CurrencyRupeeIcon sx={{ color: "#FFD700", mr: 1 }} />
                                <Typography variant="body2" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                                  Amount:{" "}
                                  <b style={{ color: "#FFD700" }}>
                                    {plan.amount_per_inst || plan.inst_amount || 0}
                                  </b>
                                </Typography>
                              </Box>

                              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <CalendarMonthIcon sx={{ color: "#FFD700", mr: 1 }} />
                                <Typography variant="body2">
                                  Duration:{" "}
                                  <b style={{ color: "#FFD700" }}>
                                    {plan.duration || plan.no_of_inst || "12 months"}
                                  </b>
                                </Typography>
                              </Box>

                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <EventAvailableIcon sx={{ color: "#FFD700", mr: 1 }} />
                                <Typography variant="body2">
                                  Start Date: <b style={{ color: "#FFD700" }}>{startDateText}</b>
                                </Typography>
                              </Box>
                            </Box>

                            <Button
                              fullWidth
                              variant="contained"
                              sx={{
                                mt: 2,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                background: "linear-gradient(90deg, #FFD700, #c0a000)",
                                color: "#3a004d",
                                boxShadow: "0 0 10px rgba(255, 215, 0, 0.5)",
                                "&:hover": {
                                  background: "linear-gradient(90deg, #ffe066, #e6c300)",
                                  boxShadow: "0 0 16px rgba(255, 215, 0, 0.7)",
                                },
                              }}
                              onClick={() =>
                                navigate(`/plan-details/${id}`, {
                                  state: {
                                    plan,
                                    membership_id: plan.membership_id,
                                    group_id: plan.group_id,
                                  },
                                })
                              }

                            >
                              View Details
                            </Button>
                          </CardContent>
                        </Card>

                      </motion.div>
                    </Grid>
                  );
                })}
              </Grid>
            </motion.div>
          )}
        </Container>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyPlans;
