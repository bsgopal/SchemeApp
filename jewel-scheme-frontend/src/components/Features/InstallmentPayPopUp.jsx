import React, { useEffect, useState } from "react";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

export default function InstallmentPayPopup({ plan, userId, onClose, refresh }) {
  const API = process.env.REACT_APP_API_URL;

  const [snack, setSnack] = useState({ open: false, msg: "", type: "success" });
  const [wallet, setWallet] = useState(0);
  const [goldRate, setGoldRate] = useState(0);

  const nextInstNo = plan.installments.paid + 1;
  const amount =
    plan.payments.length > 0
      ? plan.payments[plan.payments.length - 1].amount
      : plan.default_amount;

  useEffect(() => {
    async function init() {
      await loadRate();
      await loadWallet();
    }
    init();
  }, []); // No warnings now

  async function loadWallet() {
    const res = await axios.get(`${API}/api/wallet/${userId}`);
    setWallet(res.data.balance);
  }

  async function loadRate() {
    const res = await axios.get(`${API}/api/rates`);
    setGoldRate(res.data.goldRate);
  }

  async function payInstallment() {
    try {
      await axios.post(`${API}/api/wallet/pay-installment`, {
        userId,
        membership_id: plan.membership_id,
      });

      setSnack({ open: true, msg: "Installment Paid Successfully!", type: "success" });
      refresh();
      onClose();
    } catch (err) {
      setSnack({
        open: true,
        msg: err?.response?.data?.message || "Payment Failed",
        type: "error",
      });
    }
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2000,
        }}
      >
        <div
          style={{
            width: "90%",
            padding: "20px",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(18px)",
            color: "white",
          }}
        >
          <h2 style={{ color: "#FFD700" }}>Pay Installment</h2>

          <p>Installment #: <b>{nextInstNo}</b></p>
          <p>Amount: <b>₹ {amount}</b></p>
          <p>Wallet Balance: <b>₹ {wallet}</b></p>

          <p style={{ marginTop: "10px", color: "#00ff88" }}>
            Gold Credit ≈ {(amount / goldRate).toFixed(4)} g
          </p>

          <button
            onClick={payInstallment}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "15px",
              borderRadius: "10px",
              background: "#FFD700",
              color: "#4B0082",
              fontWeight: "bold",
              border: "none",
            }}
          >
            Pay Now
          </button>

          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              borderRadius: "10px",
              background: "transparent",
              border: "1px solid #FFD700",
              color: "#FFD700",
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <MuiAlert severity={snack.type}>{snack.msg}</MuiAlert>
      </Snackbar>
    </>
  );
}
