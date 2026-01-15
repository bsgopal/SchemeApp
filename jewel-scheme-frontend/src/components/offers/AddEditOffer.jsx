import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import GoldShimmer from "../common/GoldShimmer";

export default function AddEditOffer() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    title: "",
    subtitle: "",
    image: null,
    preview: "",
    validTill: "",
    bonus: ""
  });

  const handleImage = (file) => {
    setData({
      ...data,
      image: file,
      preview: URL.createObjectURL(file)
    });
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("subtitle", data.subtitle);
    formData.append("bonus", data.bonus);
    formData.append("validTill", data.validTill);
    formData.append("image", data.image);

    await fetch(`${process.env.REACT_APP_API_URL}/api/offers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: formData
    });

    navigate("/offers");
  };

  return (
    <Box
      sx={{
        height: "100vh",
        background: "linear-gradient(135deg,#1a001f,#43005b)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <GoldShimmer />

      {/* 🔙 Back */}
      <IconButton
        onClick={() => navigate("/offers")}
        sx={{ position: "absolute", top: 20, left: 20, color: "gold", zIndex: 3 }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>

      {/* 🏆 Header */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          zIndex: 3
        }}
      >
        <Box
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: "30px",
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,215,0,0.6)",
            boxShadow: "0 0 20px rgba(255,215,0,0.8)"
          }}
        >
          <Typography sx={{ color: "gold", fontWeight: "bold", letterSpacing: 2 }}>
            ADD OFFER
          </Typography>
        </Box>
      </Box>

      {/* 📝 Form */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: "relative",
          zIndex: 2,
          marginTop: 130,
          padding: 30,
          width: 360,
          marginInline: "auto",
          borderRadius: 25,
          background: "rgba(34,0,60,0.35)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 0 30px rgba(255,215,0,0.7)"
        }}
      >
        {/* Preview */}
        {data.preview && (
          <Box
            component="img"
            src={data.preview}
            sx={{
              width: "100%",
              height: 160,
              objectFit: "cover",
              borderRadius: 3,
              mb: 2,
              boxShadow: "0 0 15px rgba(255,215,0,0.7)"
            }}
          />
        )}

        <TextField
          label="Offer Title"
          variant="filled"
          fullWidth
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          sx={{ mb: 2, background: "#fff", borderRadius: 2 }}
        />

        <TextField
          label="Subtitle"
          variant="filled"
          fullWidth
          value={data.subtitle}
          onChange={(e) => setData({ ...data, subtitle: e.target.value })}
          sx={{ mb: 2, background: "#fff", borderRadius: 2 }}
        />

        <Button
          component="label"
          fullWidth
          sx={{
            mb: 2,
            background: "#fff",
            color: "#330044",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: "bold"
          }}
        >
          Upload Offer Banner
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => handleImage(e.target.files[0])}
          />
        </Button>

        <TextField
          label="Bonus (e.g. 15%)"
          variant="filled"
          fullWidth
          value={data.bonus}
          onChange={(e) => setData({ ...data, bonus: e.target.value })}
          sx={{ mb: 2, background: "#fff", borderRadius: 2 }}
        />

        <TextField
          label="Valid Till"
          type="date"
          variant="filled"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={data.validTill}
          onChange={(e) => setData({ ...data, validTill: e.target.value })}
          sx={{ mb: 2, background: "#fff", borderRadius: 2 }}
        />

        <Button
          fullWidth
          onClick={handleSave}
          sx={{
            mt: 2,
            background: "gold",
            color: "#330044",
            borderRadius: 3,
            fontWeight: "bold",
            "&:hover": { background: "#e0ac08" }
          }}
        >
          Save Offer
        </Button>
      </motion.div>
    </Box>
  );
}
