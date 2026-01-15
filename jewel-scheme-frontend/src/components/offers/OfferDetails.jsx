import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useEffect, useState } from "react";
import axios from "axios";
import GoldShimmer from "../common/GoldShimmer";
import { motion } from "framer-motion";

export default function OfferDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [offer, setOffer] = useState(null);

  useEffect(() => {
    const fetchOffer = async () => {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/offers/${id}`
      );
      setOffer(res.data);
    };
    fetchOffer();
  }, [id]);

  if (!offer) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#1a001f,#43005b)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GoldShimmer />

      {/* 🔙 Back */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", top: 20, left: 20, color: "gold", zIndex: 9999 }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>

      {/* 🏆 Header */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          position: "absolute",
          top: 20,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          zIndex: 3,
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
            boxShadow: "0 0 20px rgba(255,215,0,0.8)",
          }}
        >
          <Typography sx={{ color: "gold", fontWeight: "bold", letterSpacing: 2 }}>
            OFFER DETAILS
          </Typography>
        </Box>
      </motion.div>

      {/* 🖼 Banner */}
      <Box
        sx={{
          mt: 15,
          mx: 2,
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 0 30px rgba(255,215,0,0.7)",
        }}
      >
        <img
          src={`${process.env.REACT_APP_API_URL}${offer.image_url}`}
          alt={offer.title}
          style={{ width: "100%", height: 240, objectFit: "cover" }}
        />
      </Box>

      {/* 📜 Content */}
      <Box
        sx={{
          mt: 3,
          mx: 2,
          p: 3,
          borderRadius: "20px",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 25px rgba(255,215,0,0.6)",
          color: "#FFD700",
        }}
      >
        <Typography fontSize="1.3rem" fontWeight="bold">
          {offer.title}
        </Typography>

        <Typography sx={{ color: "#ffdca8", mt: 1 }}>
          {offer.subtitle}
        </Typography>

        <Typography sx={{ mt: 2 }}>
          🎁 Bonus: <b>{offer.bonus_value}% Gold</b>
        </Typography>

        <Typography sx={{ mt: 1 }}>
          ⏳ Valid Till:{" "}
          <b>{new Date(offer.valid_to).toLocaleDateString(
            'en-GB',
            {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            } 
          )}</b>
        </Typography>

        {/* 🛠 Admin Actions */}
        {(role === "Admin" || role === "SuperAdmin") && (
          <Box mt={3} display="flex" gap={2}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                bgcolor: "gold",
                color: "#330044",
                fontWeight: "bold",
              }}
              onClick={() => navigate(`/offers/edit/${offer.id}`)}
            >
              Edit
            </Button>

            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={async () => {
                await axios.delete(
                  `${process.env.REACT_APP_API_URL}/api/offers/${offer.id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                );
                navigate("/offers");
              }}
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
