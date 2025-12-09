import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import { ArrowBack, Delete } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ManageNewArrivals() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [offer, setOffer] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [arrivals, setArrivals] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL;

  // ----------------------- FETCH ALL ARRIVALS -----------------------
  const fetchArrivals = () => {
    axios
      .get(`${API}/api/newarrivals`)
      .then((res) => setArrivals(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchArrivals();
  }, []);

  // ----------------------- FILE UPLOAD HANDLER -----------------------
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(`${API}/api/newarrivals/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImageUrl(res.data.url); // returned from backend
    } catch (err) {
      console.error("Image upload failed", err);
    }
  };

  // ----------------------- SUBMIT ARRIVAL -----------------------
  const handleSubmit = () => {
    if (!title || !price || !imageUrl) return;

    setIsSubmitting(true);

    axios
      .post(`${API}/api/newarrivals`, {
        title,
        price,
        offer,
        image_url: imageUrl,
      })
      .then(() => {
        fetchArrivals();
        setTitle("");
        setPrice("");
        setOffer("");
        setImageUrl("");
        setIsSubmitting(false);
      })
      .catch(() => setIsSubmitting(false));
  };

  // ----------------------- DELETE ARRIVAL -----------------------
  const handleDelete = (id) => {
    axios.delete(`${API}/api/newarrivals/${id}`).then(() => fetchArrivals());
  };

  // ----------------------- ANIMATIONS -----------------------
  const shimmerVariants = {
    animate: {
      x: [0, 20, 0],
      y: [0, 10, 0],
      rotate: [0, 1, 0],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 60 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 220, damping: 20 },
    },
    hover: {
      scale: 1.05,
      rotateY: 3,
      rotateX: 2,
      y: -5,
      boxShadow: "0 15px 35px rgba(255, 215, 0, 0.4)",
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 0 20px #FFD700, 0 0 40px #FFD700",
      transition: { yoyo: Infinity, duration: 0.8 },
    },
  };

  return (
    <motion.div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background: "linear-gradient(135deg, #2c003e, #4b0066)",
      }}
    >
      {/* Gold floating particles */}
      <motion.div
        variants={shimmerVariants}
        animate="animate"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 80%)",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      />
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 50 - 25, 0],
            scale: [0, 1, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: 3 + Math.random() * 6,
            height: 3 + Math.random() * 6,
            background: "#f9f6e6ff",
            borderRadius: "50%",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            zIndex: 0,
          }}
        />
      ))}

      <Box sx={{ position: "relative", zIndex: 1, padding: 4 }}>
        {/* Back Button */}
        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ color: "#FFD700", mb: 3 }}
          >
            <ArrowBack />
          </IconButton>
        </motion.div>

        {/* Form Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <Card
            sx={{
              maxWidth: 600,
              mx: "auto",
              mb: 6,
              background: "linear-gradient(135deg, #2c003e, #4b0066)",
              borderRadius: 3,
              color: "white",
              p: 3,
              boxShadow: "0 15px 35px rgba(0,0,0,0.5)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography
              variant="h4"
              textAlign="center"
              fontWeight="bold"
              sx={{ color: "#FFD700", mb: 3 }}
            >
              Add New Arrival
            </Typography>

            {/* Form Fields */}
            <Box display="flex" flexWrap="wrap" gap={2}>
              <TextField
                fullWidth
                label="name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                variant="filled"
                sx={{
                  input: { color: "white" },
                  label: { color: "#f4f3ebff" },
                }}
              />

              <TextField
                fullWidth
                type="number"
                label="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                variant="filled"
                sx={{
                  input: { color: "white" },
                  label: { color: "#f4f3ebff" },
                }}
              />

              <TextField
                fullWidth
                label="Offer"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                variant="filled"
                sx={{
                  input: { color: "white" },
                  label: { color: "#f4f3ebff" },
                }}
              />

              {/* File Upload */}
              <Button
                variant="contained"
                component="label"
                sx={{ background: "#FFD700", color: "#000", fontWeight: "bold" }}
              >
                Upload Image
                <input type="file" hidden onChange={handleFileUpload} />
              </Button>

              {/* Show Image Preview */}
              {imageUrl && (
                <img
                  src={`${API}${imageUrl}`}
                  alt="preview"
                  style={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 12,
                    marginTop: 10,
                  }}
                />
              )}
            </Box>

            <Box display="flex" justifyContent="center" mt={3}>
              <motion.div variants={buttonVariants} whileHover="hover">
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !title || !price || !imageUrl}
                  sx={{
                    background: "linear-gradient(45deg, #e7e30dff)",
                    color: "#000",
                    fontWeight: "bold",
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  {isSubmitting ? "⏳" : "ADD"}
                </Button>
              </motion.div>
            </Box>
          </Card>
        </motion.div>

        {/* Arrivals List */}
        <Typography
          variant="h4"
          textAlign="center"
          fontWeight="bold"
          sx={{ color: "#FFD700", mb: 4 }}
        >
          All Arrivals
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={4} justifyContent="center">
          <AnimatePresence>
            {arrivals.map((item) => (
              <motion.div
                key={item.id}
                layout
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.5 }}
                whileHover="hover"
              >
                <Card
                  sx={{
                    width: 220,
                    minHeight: 280,
                    background:"linear-gradient(135deg, #2c003e, #4b0066)",
                    borderRadius: 3,
                    color: "white",
                    boxShadow: "0 15px 30px rgba(0,0,0,0.4)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="img"
                    src={`${API}${item.imageUrl}`}
                    sx={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                    }}
                  />

                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ color: "#FFD700", mb: 1 }}
                    >
                      {item.title}
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 1 }}>
                      ₹ {item.price}
                    </Typography>

                    {item.offer && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#ff4d4d",
                          fontWeight: "bold",
                          background: "rgba(255,77,77,0.1)",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: "inline-block",
                        }}
                      >
                        {item.offer}
                      </Typography>
                    )}

                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                      <IconButton
                        size="small"
                        sx={{ color: "#ff4d4d" }}
                        onClick={() => handleDelete(item.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      </Box>
    </motion.div>
  );
}
