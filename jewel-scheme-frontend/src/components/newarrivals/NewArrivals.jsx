import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Badge,
  Modal,
  Button,
} from "@mui/material";
import { FavoriteBorder, Favorite, Close } from "@mui/icons-material";
import axios from "axios";
import { motion } from "framer-motion";
import { useSwipeable } from "react-swipeable";

export default function NewArrivals() {
  const [arrivals, setArrivals] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [favorites, setFavorites] = useState([]);

  const API = process.env.REACT_APP_API_URL;

  // Load favorites
  useEffect(() => {
    const fav = localStorage.getItem("favorites");
    if (fav) setFavorites(JSON.parse(fav));
  }, []);

  const toggleFavorite = (id) => {
    let updated = favorites.includes(id)
      ? favorites.filter((x) => x !== id)
      : [...favorites, id];

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  // Load arrivals
  useEffect(() => {
    axios
      .get(`${API}/api/newarrivals`)
      .then((res) => setArrivals(res.data))
      .catch(console.error);
  }, [API]);

  // Swipe handlers for modal
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (selectedIndex < arrivals.length - 1) setSelectedIndex(selectedIndex + 1);
      setZoom(1);
    },
    onSwipedRight: () => {
      if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
      setZoom(1);
    },
    trackMouse: true,
  });

  // Double tap zoom
  let lastTap = 0;
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) setZoom(zoom === 1 ? 2 : 1);
    lastTap = now;
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 180, damping: 18 },
    },
    hover: {
      scale: 1.05,
      rotateY: 4,
      rotateX: 2,
      boxShadow: "0 10px 25px rgba(255,215,0,0.5)",
    },
  };

  const item = selectedIndex !== null ? arrivals[selectedIndex] : null;

  return (
    <Box mb={4}>
      <Typography
        variant="h5"
        fontWeight="bold"
        mb={2}
        sx={{ color: "#FFD700", textShadow: "0 0 8px rgba(255,215,0,0.6)" }}
      >
        ✨ New Arrivals
      </Typography>

      {/* HOME PAGE SCROLLING CARDS */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          overflowY: "hidden",    // ❗ prevents vertical scroll affecting page
          pb: 1,
          scrollbarWidth: "none", // hide scrollbar for Firefox
          "&::-webkit-scrollbar": { display: "none" }, // hide scrollbar for Chrome
          maxHeight: 270,         // ❗ fixed height for NewArrivals row
        }}
      >

        {arrivals.map((a, i) => (
          <motion.div
            key={a.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <Card
              sx={{
                minWidth: 180,
                maxWidth: 180,
                height: 250, // 🔥 fixed card height
                borderRadius: 2,
                boxShadow: 3,
                bgcolor: "#1a1a2e",
                color: "white",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Badge
                badgeContent="New"
                color="error"
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  zIndex: 2,
                }}
              />

              {/* Favorite Button */}
              <IconButton
                onClick={() => toggleFavorite(a.id)}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  bgcolor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                  zIndex: 2,
                }}
                size="small"
              >
                {favorites.includes(a.id) ? (
                  <Favorite sx={{ color: "red" }} />
                ) : (
                  <FavoriteBorder />
                )}
              </IconButton>

              {/* CARD IMAGE – SAME SIZE FOR ALL */}
              <CardMedia
                component="img"
                image={`${API}${a.imageUrl}`}
                sx={{
                  height: 120,        // 🔥 fixed image height
                  width: "100%",
                  objectFit: "cover", // keeps aspect ratio, crops but same size
                  cursor: "pointer",
                  transition: "0.4s ease",
                  "&:hover": { transform: "scale(1.08)" },
                }}
                onClick={() => {
                  setSelectedIndex(i);
                  setZoom(1);
                }}
              />

              {/* HOME PAGE DETAILS */}
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  pt: 1.5,
                  pb: 1.5,
                }}
              >
                <Typography sx={{ color: "#FFD700", fontWeight: "bold", fontSize: 13 }}>
                  Name : {a.title}
                </Typography>

                <Typography fontWeight="bold" sx={{ fontSize: 13 }}>
                  Price : ₹ {a.price}
                </Typography>

                {a.offer && (
                  <Typography
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      mt: 1,
                      p: "2px 6px",
                      background: "rgba(255,0,0,0.6)",
                      borderRadius: 1,
                      display: "inline-block",
                      fontSize: 12,
                    }}
                  >
                    Offer : {a.offer}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* FULLSCREEN MODAL */}
      <Modal
        open={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        sx={{ backdropFilter: "blur(6px)" }}
      >
        <Box
          {...handlers}
          onClick={handleDoubleTap}
          component={motion.div}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          sx={{
            position: "absolute",
            top: { xs: "10%", md: "50%" },                                    // 👈 needed for centering
            transform: {
              xs: "translateX(-50%)",
              md: "translate(-50%, -50%)",
            },
            width: { xs: "96%", sm: "90%", md: 450 },
            maxHeight: "80vh",
            bgcolor: "#1a1a2e",
            borderRadius: 3,
            boxShadow: 24,
            p: 2,
            outline: "none",
            color: "white",
            overflowY: "auto",
          }}
        >
          {/* CLOSE ICON */}
          <IconButton
            onClick={() => setSelectedIndex(null)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#FFD700",
            }}
          >
            <Close />
          </IconButton>

          {/* FULLSCREEN IMAGE (ZOOMABLE) */}
          <Box
            component="img"
            src={`${API}${item?.imageUrl}`}
            sx={{
              display: "block",
              margin: "0 auto",
              width: "100%",
              maxHeight: "60vh",
              objectFit: "contain",
              transform: `scale(${zoom})`,
              transition: "0.3s ease",
              borderRadius: 2,
            }}
          />

          {/* DETAILS */}
          <Box mt={2} p={1}>
            <Typography sx={{ color: "#FFD700", fontWeight: "bold" }}>
              Name : {item?.title}
            </Typography>

            <Typography sx={{ fontWeight: "bold", mt: 1 }}>
              Price : ₹ {item?.price}
            </Typography>

            {item?.offer && (
              <Typography
                sx={{
                  mt: 1,
                  p: 1,
                  background: "rgba(255,0,0,0.2)",
                  borderRadius: 1,
                  fontWeight: "bold",
                }}
              >
                Offer : {item.offer}
              </Typography>
            )}
          </Box>

          {/* EXTRA CLOSE BUTTON (for zoom view) */}
          <Box textAlign="center" mt={1}>
            <Button
              variant="contained"
              onClick={() => setSelectedIndex(null)}
              sx={{
                mt: 1,
                background: "linear-gradient(45deg, #FFD700, #FFEC8B)",
                color: "#000",
                fontWeight: "bold",
                borderRadius: 2,
                textTransform: "none",
                px: 4,
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
