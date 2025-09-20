import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardMedia, CardContent, IconButton, Badge } from "@mui/material";
import { FavoriteBorder } from "@mui/icons-material";
import axios from "axios";

export default function NewArrivals() {
  const [arrivals, setArrivals] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/newarrivals") // ✅ Your backend API
      .then(res => setArrivals(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <Box mb={4}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        New Arrivals
      </Typography>
      <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1 }}>
        {arrivals.map((item) => (
          <Card key={item.id} sx={{ minWidth: 160, borderRadius: 2, boxShadow: 3, position: "relative" }}>
            {/* Badge */}
            <Badge
              badgeContent="New"
              color="error"
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
                "& .MuiBadge-badge": {
                  fontSize: "0.7rem",
                  fontWeight: "bold",
                  px: 1,
                  borderRadius: "4px",
                },
              }}
            />
            {/* Wishlist */}
            <IconButton
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "rgba(0,0,0,0.5)",
                color: "white",
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
              }}
              size="small"
            >
              <FavoriteBorder />
            </IconButton>

            <CardMedia component="img" height="140" image={item.imageUrl} alt={item.title} />
            <CardContent>
              <Typography variant="body2" fontWeight="bold" color="text.secondary">
                {item.title}
              </Typography>
              <Typography fontWeight="bold">₹ {item.price}</Typography>
              {item.offer && <Typography color="error">{item.offer}</Typography>}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
