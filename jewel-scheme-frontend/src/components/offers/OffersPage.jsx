import { Box, Typography, Fab, IconButton, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import OfferCard from "./OfferCard";
import { motion } from "framer-motion";

import GoldShimmer from "../common/GoldShimmer";

export default function OffersPage() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/offers`);
                setOffers(res.data);
            } catch (err) {
                console.error("Failed to load offers", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    return (
        <Box
            sx={{
                height: "100vh",
                background: "linear-gradient(135deg,#1a001f,#43005b)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* ✨ Gold Shimmer Background */}
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
                        OFFERS
                    </Typography>
                </Box>
            </motion.div>


            {/* 📜 Offers list */}
            <Box sx={{ position: "relative", zIndex: 2, mt: 15 , px: 2, pb: 10 }}>
                {loading ? (
                    <Box textAlign="center" mt={10}>
                        <CircularProgress sx={{ color: "gold" }} />
                    </Box>
                ) : (
                    offers.map((o) => <OfferCard key={o.id} offer={o} />)
                )}
            </Box>

            {/* ➕ Add Offer (Admin) */}
            {(role === "Admin" || role === "SuperAdmin") && (
                <Fab
                    color="warning"
                    sx={{ position: "fixed", bottom: 90, right: 20, zIndex: 3 }}
                    onClick={() => navigate("/offers/new")}
                >
                    <AddIcon />
                </Fab>
            )}
        </Box>
    );
}
