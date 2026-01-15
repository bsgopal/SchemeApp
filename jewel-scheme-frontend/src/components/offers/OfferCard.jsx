import { Box, Typography, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function OfferCard({ offer }) {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(`/offers/${offer.id}`)}
      sx={{
        mb: 3,
        borderRadius: "22px",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: "0 0 30px rgba(255,215,0,0.7)",
        border: "2px solid rgba(255,215,0,0.4)",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(10px)"
      }}
    >
      {/* 🔥 Banner only */}
      <Box
        sx={{
          height: 180,
          background: `url(${process.env.REACT_APP_API_URL}${offer.image_url}) center/cover`,
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.6))",
          }}
        />

        {/* Bonus badge */}
        <Box
          sx={{
            position: "absolute",
            right: 12,
            bottom: 12,
            bgcolor: "#ffd700",
            color: "#330044",
            px: 2.5,
            py: 0.8,
            borderRadius: "999px",
            fontWeight: "bold",
            fontSize: "0.85rem",
            boxShadow: "0 0 15px rgba(255,215,0,0.9)",
          }}
        >
          {offer.bonus_value}% BONUS
        </Box>
      </Box>

      {/* 📝 Text area below */}
      <Box sx={{ p: 2 }}>
        <Typography
          sx={{
            color: "#FFD700",
            fontWeight: "bold",
            fontSize: "1.05rem",
          }}
        >
          {offer.title}
        </Typography>

        <Typography
          sx={{
            color: "#ffdca8",
            fontSize: "0.9rem",
            mt: 0.5,
          }}
        >
          {offer.subtitle}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography
            sx={{
              color: "#ffcc66",
              fontSize: "0.8rem",
            }}
          >
            Valid till {new Date(offer.valid_to).toLocaleDateString()}
          </Typography>

          <Chip
            label="Auto Applied"
            size="small"
            sx={{
              bgcolor: "rgba(255,215,0,0.15)",
              color: "#ffd700",
              border: "1px solid rgba(255,215,0,0.4)",
              fontSize: "0.7rem",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
