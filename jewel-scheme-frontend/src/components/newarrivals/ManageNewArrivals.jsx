import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ManageNewArrivals() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [offer, setOffer] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [arrivals, setArrivals] = useState([]);
  const navigate = useNavigate();

  const fetchArrivals = () => {
    axios
      .get("http://localhost:5000/newarrivals")
      .then((res) => setArrivals(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchArrivals();
  }, []);

  const handleSubmit = () => {
    axios
      .post("http://localhost:5000/newarrivals", { title, price, offer, imageUrl })
      .then(() => {
        fetchArrivals();
        setTitle("");
        setPrice("");
        setOffer("");
        setImageUrl("");
      })
      .catch((err) => console.error(err));
  };

  // Variants for animations
  const formVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 15 } },
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0, rotate: -45, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotate: 0, 
      y: 0, 
      transition: { type: "spring", stiffness: 300, damping: 20 } 
    },
  };

  return (
    <Box p={3}>
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          color="primary"
          component={motion.button}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowBack />
        </IconButton>
      </motion.div>

      {/* Add New Arrival Form */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={formVariants}
      >
        <Typography variant="h5" mb={3}>
          Add New Arrival
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap" mb={4}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <TextField
              label="Price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <TextField
              label="Offer"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <TextField
              label="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Add
            </Button>
          </motion.div>
        </Box>
      </motion.div>

      {/* All Arrivals */}
      <Typography variant="h5" mb={3}>
        All Arrivals
      </Typography>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Box display="flex" flexWrap="wrap" gap={3}>
          {arrivals.map((item, index) => (
            <motion.div
              key={item.id || item._id}
              variants={cardVariants}
              whileHover={{
                scale: 1.1,
                rotate: 5,
                boxShadow: "0 0 20px #ff6",
                transition: { type: "spring", stiffness: 300, damping: 10 },
              }}
              whileTap={{ scale: 0.95, rotate: -5 }}
              style={{ display: "inline-block" }}
            >
              <Card sx={{ width: 200, boxShadow: 6, cursor: "pointer" }}>
                <CardMedia
                  component="img"
                  height="150"
                  image={item.imageUrl}
                  alt={item.title}
                />
                <CardContent>
                  <Typography fontWeight="bold">{item.title}</Typography>
                  <Typography>₹ {item.price}</Typography>
                  {item.offer && (
                    <Typography color="error" variant="body2">
                      {item.offer}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      </motion.div>
    </Box>
  );
}
