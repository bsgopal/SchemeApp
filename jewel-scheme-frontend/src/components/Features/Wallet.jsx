import React, { useEffect, useState } from "react";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

// ICONS
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HistoryIcon from "@mui/icons-material/History";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import ShowChartIcon from "@mui/icons-material/ShowChart";

// SUB COMPONENTS
import WalletHistory from "./WalletHistory";
import GoldChart from "./GoldChart";
import PlanTab from "./PlanTab";
import PassbookCard from "./PassbookCard";

export default function Wallet() {
  const userId = localStorage.getItem("userId");
  const API = process.env.REACT_APP_API_URL;

  // ================= STATE =================
  const [walletBalance, setWalletBalance] = useState(0);
  const [goldBalance, setGoldBalance] = useState(0);
  const [goldRate, setGoldRate] = useState(0);

  const [activeTab, setActiveTab] = useState("summary");
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [amount, setAmount] = useState("");

  const [planData, setPlanData] = useState([]);
  const [expandedPlan, setExpandedPlan] = useState(null);

  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    type: "success",
  });

  // ================= EFFECTS =================
  useEffect(() => {
    setTimeout(() => {
      fetchWallet();
    }, 500);

    fetchGoldRate();
    fetchPlanHistory();
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      showAddMoney || showConvert ? "hidden" : "auto";
  }, [showAddMoney, showConvert]);

  // ================= API =================
  async function fetchGoldRate() {
    try {
      const res = await axios.get(`${API}/api/rates`);
      setGoldRate(res.data.goldRate || 0);
    } catch { }
  }

  async function fetchWallet() {
    try {
      const res = await axios.get(`${API}/api/wallet/${userId}`, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      setWalletBalance(res.data.balance || 0);
      setGoldBalance(res.data.gold || 0);
    } catch { }
  }

  async function fetchPlanHistory() {
    try {
      const res = await axios.get(`${API}/api/payments/user/self`, {
        headers: { "x-user-id": userId },
      });

      if (res.data.success) {
        setPlanData(res.data.plans || []);
      }
    } catch { }
  }

  async function handleAddMoney() {
    if (!amount || Number(amount) <= 0) {
      return setSnack({
        open: true,
        msg: "Enter valid amount",
        type: "error",
      });
    }

    await axios.post(`${API}/api/wallet/add`, {
      userId,
      amount: Number(amount),
    });

    // ✅ INSTANT UI UPDATE (fixes mobile issue)
    setWalletBalance((prev) => prev + Number(amount));

    setSnack({ open: true, msg: "Money Added", type: "success" });
    setShowAddMoney(false);
    setAmount("");

    // Sync with backend later
    setTimeout(fetchWallet, 1000);
  }


  async function handleConvert() {
    if (!amount || Number(amount) <= 0) {
      return setSnack({
        open: true,
        msg: "Enter amount",
        type: "error",
      });
    }

    await axios.post(`${API}/api/wallet/convert`, {
      userId,
      amount: Number(amount),
    });

    // Optimistic update
    setWalletBalance((prev) => prev - Number(amount));
    setGoldBalance((prev) => prev + Number(amount) / goldRate);

    setSnack({ open: true, msg: "Converted to Gold", type: "success" });
    setShowConvert(false);
    setAmount("");

    setTimeout(fetchWallet, 1000);
  }


  // ================= UI =================
  return (
    <div style={pageStyle}>
      {/* HEADER */}
      <div style={header}>
        <span style={backBtn} onClick={() => window.history.back()}>
          ←
        </span>
        <h2 style={title}>My Wallet</h2>
      </div>

      {/* SUMMARY */}
      {activeTab === "summary" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={glass}>
            <h3 style={{ color: "#FFD700" }}>Wallet Balance</h3>
            <h1 style={{ color: "#00ff88" }}>₹ {walletBalance}</h1>
            <p>Gold Balance: {goldBalance} g</p>

            <button style={goldBtn} onClick={() => setShowAddMoney(true)}>
              Add Money
            </button>
            <button style={purpleBtn} onClick={() => setShowConvert(true)}>
              Convert Cash → Gold
            </button>
          </div>

          <h3 style={{ marginTop: 25, color: "#FFD700" }}>Passbook</h3>

          {planData.map((plan, idx) => (
            <div key={idx} style={glass}>
              <div
                style={planHeader}
                onClick={() =>
                  setExpandedPlan(expandedPlan === idx ? null : idx)
                }
              >
                {plan.plan_name}
                <span>{expandedPlan === idx ? "▲" : "▼"}</span>
              </div>

              {expandedPlan === idx &&
                plan.payments.map((txn, i) => (
                  <PassbookCard key={i} txn={txn} />
                ))}
            </div>
          ))}
        </motion.div>
      )}

      {activeTab === "history" && <WalletHistory />}
      {activeTab === "plans" && <PlanTab userId={userId} />}
      {activeTab === "chart" && <GoldChart />}

      {/* ADD MONEY MODAL */}
      <Modal open={showAddMoney} onClose={() => setShowAddMoney(false)}>
        <h2 style={modalTitle}>Add Money</h2>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          style={input}
        />
        <button style={goldBtn} onClick={handleAddMoney}>
          Confirm
        </button>
        <button style={cancelBtn} onClick={() => setShowAddMoney(false)}>
          Cancel
        </button>
      </Modal>

      {/* CONVERT MODAL */}
      <Modal open={showConvert} onClose={() => setShowConvert(false)}>
        <h2 style={modalTitle}>Cash → Gold</h2>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          style={input}
        />
        <p style={{ textAlign: "center", marginTop: 10 }}>
          Gold: {goldRate ? (amount / goldRate).toFixed(4) : "0.0000"} g
        </p>
        <button style={goldBtn} onClick={handleConvert}>
          Convert
        </button>
        <button style={cancelBtn} onClick={() => setShowConvert(false)}>
          Cancel
        </button>
      </Modal>

      {/* SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.type}>{snack.msg}</Alert>
      </Snackbar>

      <BottomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

/* ================= MODAL ================= */
function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div style={overlay} onClick={onClose}>
      <motion.div
        style={modal}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ================= BOTTOM TABS ================= */
function BottomTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "summary", icon: <AccountBalanceWalletIcon />, text: "Wallet" },
    { id: "history", icon: <HistoryIcon />, text: "History" },
    { id: "plans", icon: <CurrencyBitcoinIcon />, text: "Plans" },
    { id: "chart", icon: <ShowChartIcon />, text: "Chart" },
  ];

  return (
    <div style={bottomTabs}>
      {tabs.map((t) => (
        <div
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          style={{
            textAlign: "center",
            color: activeTab === t.id ? "#FFD700" : "#ccc",
          }}
        >
          {t.icon}
          <p style={{ fontSize: 12 }}>{t.text}</p>
        </div>
      ))}
    </div>
  );
}

/* ================= STYLES ================= */
const pageStyle = {
  padding: "20px",
  minHeight: "100vh",
  background: "linear-gradient(135deg,#1A0033,#43005B,#6A0080)",
  color: "white",
  paddingBottom: "90px",
};

const header = {
  display: "flex",
  alignItems: "center",
  marginBottom: 15,
};

const backBtn = {
  fontSize: 22,
  cursor: "pointer",
  marginRight: 10,
  color: "#FFD700",
};

const title = {
  flex: 1,
  textAlign: "center",
  color: "#FFD700",
};

const glass = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(18px)",
  borderRadius: 16,
  padding: 20,
  marginTop: 15,
};

const planHeader = {
  display: "flex",
  justifyContent: "space-between",
  cursor: "pointer",
  fontSize: 18,
  color: "#FFD86B",
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

const modal = {
  width: "100%",
  maxWidth: 380,
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(18px)",
  borderRadius: 20,
  padding: 24,
};

const modalTitle = {
  textAlign: "center",
  color: "#FFD700",
};

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "none",
  marginTop: 15,
};

const goldBtn = {
  width: "100%",
  marginTop: 15,
  padding: 12,
  background: "#FFD700",
  color: "#4B0082",
  fontWeight: "bold",
  borderRadius: 12,
  border: "none",
};

const purpleBtn = {
  ...goldBtn,
  background: "#4B0082",
  color: "#FFD700",
};

const cancelBtn = {
  width: "100%",
  marginTop: 10,
  padding: 10,
  background: "transparent",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: 12,
};

const bottomTabs = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  height: 70,
  background: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(15px)",
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
};
