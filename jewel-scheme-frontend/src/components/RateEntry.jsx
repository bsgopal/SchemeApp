import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RateEntry() {
  const [goldRate, setGoldRate] = useState("");
  const [silverRate, setSilverRate] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await axios.post(
      `${process.env.REACT_APP_API_URL}/api/rates/set`,
      {
        goldRate,
        silverRate,
      }
    );

    setOpenSnackbar({ open: true, message: "Rates submitted successfully!" });
    setGoldRate("");
    setSilverRate("");
  } catch (err) {
    setOpenSnackbar({ open: true, message: "Error saving rates!" });
  }
};
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        bgcolor: "#f8f4e9",
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 500,
          borderRadius: 3,
          position: "relative",
        }}
      >
        {/* 🔙 Back Button */}
        <IconButton
          onClick={() => navigate(-1)} // go back to previous page
          sx={{ position: "absolute", top: 8, left: 8, color: "#d4a017" }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography
          variant="h5"
          fontWeight="bold"
          color="primary"
          gutterBottom
          sx={{ textAlign: "center", mt: 2 }}
        >
          Enter Today’s Rates
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Gold Rate"
            type="number"
            value={goldRate}
            onChange={(e) => setGoldRate(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Silver Rate"
            type="number"
            value={silverRate}
            onChange={(e) => setSilverRate(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: "#d4a017",
              "&:hover": { backgroundColor: "#b58912" },
            }}
            fullWidth
          >
            Save Rates
          </Button>
        </form>
      </Paper>

      {/* ✅ Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Rates submitted successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default RateEntry;
