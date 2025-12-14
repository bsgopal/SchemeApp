import React, { useEffect, useState } from "react";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";
import { motion } from "framer-motion";

// ICONS
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HistoryIcon from "@mui/icons-material/History";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import ShowChartIcon from "@mui/icons-material/ShowChart";

// SUB PAGES
import WalletHistory from "./WalletHistory";
import GoldChart from "./GoldChart";
import PlanTab from "./PlanTab";
import PassbookCard from "./PassbookCard";

export default function Wallet() {
  const userId = localStorage.getItem("userId");
  const API = process.env.REACT_APP_API_URL;

  // Main Wallet states
  const [walletBalance, setWalletBalance] = useState(0);
  const [goldBalance, setGoldBalance] = useState(0);
  const [goldRate, setGoldRate] = useState(0);

  // UI states
  const [activeTab, setActiveTab] = useState("summary");
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [amount, setAmount] = useState("");

  // Passbook states
  const [planData, setPlanData] = useState([]);
  const [expandedPlan, setExpandedPlan] = useState(null);

  // Snackbar
  const [snack, setSnack] = useState({ open: false, msg: "", type: "success" });

  useEffect(() => {
    async function init() {
      await fetchWallet();
      await fetchGoldRate();
      await fetchPlanHistory();
    }
    init();
  }, []); // No dependency warnings

  // ===================================
  // Fetch Gold Rate
  // ===================================
  async function fetchGoldRate() {
    try {
      const res = await axios.get(`${API}/api/rates`);
      setGoldRate(res.data.goldRate || 0);
    } catch {
      console.log("Gold rate fetch error");
    }
  }

  // ===================================
  // Fetch Wallet Balances
  // ===================================
  async function fetchWallet() {
    try {
      const res = await axios.get(`${API}/api/wallet/${userId}`);
      setWalletBalance(res.data.balance || 0);
      setGoldBalance(res.data.gold || 0);
    } catch {
      console.log("Wallet fetch error");
    }
  }

  // ===================================
  // Fetch Plan-wise Payment History
  // ===================================
  async function fetchPlanHistory() {
    try {
      const res = await axios.get(`${API}/api/payments/user/self`, {
        headers: { "x-user-id": userId },
      });

      if (res.data.success) {
        const grouped = res.data.plans.map((plan) => ({
          plan_name: plan.plan_name,
          membership_id: plan.membership_id,
          installments: plan.installments,
          payments: [...plan.payments].sort(
            (a, b) => new Date(b.receipt_date) - new Date(a.receipt_date)
          ),
        }));

        setPlanData(grouped);
      }
    } catch (err) {
      console.log(err);
    }
  }

  // ===================================
  // Add Money (Dummy)
  // ===================================
  async function handleAddMoney() {
    if (!amount || Number(amount) <= 0) {
      return setSnack({ open: true, msg: "Enter valid amount", type: "error" });
    }

    await axios.post(`${API}/api/wallet/add`, {
      userId,
      amount: Number(amount),
    });

    setSnack({ open: true, msg: "Money Added!", type: "success" });
    setShowAddMoney(false);
    setAmount("");
    fetchWallet();
  }

  // ===================================
  // Convert Cash → Gold
  // ===================================
  async function handleConvert() {
    if (!amount || Number(amount) <= 0) {
      return setSnack({ open: true, msg: "Enter amount", type: "error" });
    }

    try {
      await axios.post(`${API}/api/wallet/convert`, {
        userId,
        amount: Number(amount),
      });

      setSnack({ open: true, msg: "Converted to Gold!", type: "success" });
      setShowConvert(false);
      setAmount("");
      fetchWallet();
    } catch (err) {
      setSnack({
        open: true,
        msg: err?.response?.data?.message || "Error",
        type: "error",
      });
    }
  }

  // ===================================
  // Glass Style
  // ===================================
  const glass = {
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.15)",
    padding: "20px",
    marginTop: "20px",
    boxShadow: "0 4px 40px rgba(255,215,0,0.2)",
  };

  // ===================================
  // RENDER
  // ===================================
  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        background: "linear-gradient(135deg,#1A0033,#43005B,#6A0080)",
        color: "white",
      }}
    >

      {/* HEADER */}
      {/** place header here */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "15px",
          padding: "12px 15px",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 4px 20px rgba(255,215,0,0.15)",
        }}
      >
        <div
          onClick={() => window.history.back()}
          style={{
            fontSize: "22px",
            cursor: "pointer",
            marginRight: "15px",
            color: "#FFD700",
            fontWeight: "bold",
          }}
        >
          ←
        </div>

        <h2
          style={{
            flexGrow: 1,
            margin: 0,
            textAlign: "center",
            color: "#FFD700",
            fontWeight: "700",
            letterSpacing: "1px",
          }}
        >
          My Wallet
        </h2>

        <div style={{ width: "22px" }}></div>
      </div>

      {/* SUMMARY TAB */}
      {activeTab === "summary" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* WALLET CARD */}
          <div style={glass}>
            <h2 style={{ color: "#FFD700" }}>Wallet Balance</h2>
            <h1 style={{ color: "#00ff88" }}>₹ {walletBalance}</h1>
            <p style={{ color: "#FFD700", fontSize: "18px" }}>
              Gold Balance: {goldBalance} g
            </p>

            <button
              onClick={() => setShowAddMoney(true)}
              style={{
                width: "100%",
                marginTop: "15px",
                padding: "12px",
                background: "#FFD700",
                color: "#4B0082",
                fontSize: "18px",
                fontWeight: "bold",
                borderRadius: "10px",
                border: "none",
              }}
            >
              Add Money
            </button>

            <button
              onClick={() => setShowConvert(true)}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "12px",
                background: "#4B0082",
                color: "#FFD700",
                fontSize: "18px",
                fontWeight: "bold",
                borderRadius: "10px",
                border: "none",
              }}
            >
              Convert Cash → Gold
            </button>
          </div>

          {/* PASSBOOK (Plan-Wise) */}
          <h3 style={{ marginTop: "25px", color: "#FFD700" }}>Passbook</h3>

          {planData.map((plan, idx) => (
            <div
              key={idx}
              style={{
                ...glass,
                padding: "15px",
                marginTop: "12px",
              }}
            >
              <div
                onClick={() =>
                  setExpandedPlan(expandedPlan === idx ? null : idx)
                }
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: "#FFD86B",
                }}
              >
                {plan.plan_name}
                <span>{expandedPlan === idx ? "▲" : "▼"}</span>
              </div>

              {expandedPlan === idx && (
                <div style={{ marginTop: "12px" }}>
                  {plan.payments.map((txn, i) => (
                    <PassbookCard key={i} txn={{ ...txn, plan_name: plan.plan_name }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {/* HISTORY */}
      {activeTab === "history" && <WalletHistory />}

      {/* GOLD CHART */}
      {activeTab === "chart" && <GoldChart />}

      {/* PLANS TAB */}
      {activeTab === "plans" && <PlanTab userId={userId} />}

      {/* POPUPS */}
      {showAddMoney && (
        <div className="popup">
          <div className="popup-card">
            <h3>Add Money</h3>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <button onClick={handleAddMoney}>Confirm</button>
            <button className="cancel" onClick={() => setShowAddMoney(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {showConvert && (
        <div className="popup">
          <div className="popup-card">
            <h3>Cash → Gold</h3>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <p>Gold: {(amount / goldRate).toFixed(4)} g</p>
            <button onClick={handleConvert}>Convert</button>
            <button className="cancel" onClick={() => setShowConvert(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.type}>{snack.msg}</Alert>
      </Snackbar>

      {/* BOTTOM TABS */}
      <BottomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

/* ---------------- BOTTOM TAB COMPONENT ---------------- */
function BottomTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "summary", icon: <AccountBalanceWalletIcon />, text: "Wallet" },
    { id: "history", icon: <HistoryIcon />, text: "History" },
    { id: "plans", icon: <CurrencyBitcoinIcon />, text: "Plans" },
    { id: "chart", icon: <ShowChartIcon />, text: "Chart" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "70px",
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(15px)",
        borderTop: "1px solid rgba(255,255,255,0.2)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      {tabs.map((t) => (
        <div
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          style={{
            textAlign: "center",
            color: activeTab === t.id ? "#FFD700" : "#ccc",
            cursor: "pointer",
          }}
        >
          {t.icon}
          <p style={{ fontSize: "12px" }}>{t.text}</p>
        </div>
      ))}
    </div>
  );
}
