import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Login from "./components/Login";
import CreateAccount from "./components/CreateAccount";
import Home from "./components/Home";
import Sidemenu from "./components/Sidemenu";
import OTP from "./components/OTP";
import CreateNewPlan from "./components/CreateNewPlan";
import NewPlan from "./components/NewPlan";
import JoinNewPlan from "./components/plans/JoinNewPlan";
import PaymentPage from "./components/plans/paymentpage";
import RateEntry from "./components/RateEntry";
import NewArrivals from "./components/newarrivals/NewArrivals";
import ManageNewArrivals from "./components/newarrivals/ManageNewArrivals";
import MyPlans from "./components/MyPlans";
import PlanDetails from "./components/PlanDetails";
import PaymentHistory from "./components/payment-history/paymentHistoryList";
import PaymentHistoryDetails from "./components/payment-history/PaymentHistoryDetails";
import ForgotPassword from "./components/forgot-password/ForgotPassword";
import VerifyForgotOtp from "./components/forgot-password/VerifyForgotOtp";
import ResetPassword from "./components/forgot-password/ResetPassword";
import Wallet from "./components/Features/Wallet";
import Profile from "./components/Features/Profile";
import AgentDashboard from "./components/Agent/AgentDashboard";
import ProtectedRoute from "./components/Features/ProtectedRoute";
import OffersPage from "./components/offers/OffersPage";

import OfferDetails from "./components/offers/OfferDetails";
import AddEditOffer from "./components/offers/AddEditOffer";

const BANNERS = {
  default: "/images/banner1.jpg",
  gold: "/images/gold-banner.jpg",
  premium: "/images/premium-banner.jpg",
};

function App() {
  const [plans, setPlans] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const addNewPlan = (newPlanData) => {
    const banner = newPlanData.banner
      ? newPlanData.banner
      : newPlanData.planType === "Premium"
        ? BANNERS.premium
        : newPlanData.jewelleryType === "All"
          ? BANNERS.gold
          : BANNERS.default;

    setPlans((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...newPlanData,
        banner,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const updatePlan = (id, updatedData) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === Number(id) ? { ...p, ...updatedData } : p))
    );
  };

  const handleBack = () => navigate(-1);

  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={isLoggedIn ? <Navigate to="/Home" /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
      <Route path="/CreateAccount" element={<CreateAccount />} />
      <Route path="/otp" element={<OTP />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/verifyForgotOtp" element={<VerifyForgotOtp />} />
      <Route path="/resetPassword" element={<ResetPassword />} />

      {/* PROTECTED */}
      {/* OFFERS */}
      <Route path="/offers" element={<ProtectedRoute><OffersPage /></ProtectedRoute>} />  
      <Route path="/offers/new" element={<ProtectedRoute><AddEditOffer /></ProtectedRoute>} />
      <Route path="/offers/:id" element={<ProtectedRoute><OfferDetails /></ProtectedRoute>} />
      <Route path="/Home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/Sidemenu" element={<ProtectedRoute><Sidemenu Logout={setIsLoggedIn} /></ProtectedRoute>} />
      <Route path="/rateentry" element={<ProtectedRoute><RateEntry /></ProtectedRoute>} />
      <Route path="/my-plans" element={<ProtectedRoute><MyPlans /></ProtectedRoute>} />
      <Route path="/plan-details/:id" element={<ProtectedRoute><PlanDetails /></ProtectedRoute>} />
      <Route path="/payment-history" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
      <Route path="/payment-history/:userId" element={<ProtectedRoute><PaymentHistoryDetails /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/agent-dashboard" element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>} />

      <Route path="/createnewplan" element={<ProtectedRoute><CreateNewPlan onCreatePlan={addNewPlan} /></ProtectedRoute>} />
      <Route path="/createnewplan/:id" element={<ProtectedRoute><CreateNewPlan onUpdatePlan={updatePlan} plans={plans} /></ProtectedRoute>} />
      <Route path="/newplan" element={<ProtectedRoute><NewPlan onBack={handleBack} /></ProtectedRoute>} />
      <Route path="/newplan/:id" element={<ProtectedRoute><NewPlan onBack={handleBack} /></ProtectedRoute>} />
      <Route path="/plans/joinnewplan/:planId" element={<ProtectedRoute><JoinNewPlan /></ProtectedRoute>} />
      <Route path="/plans/payment/:planId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
      <Route path="/newarrivals" element={<ProtectedRoute><NewArrivals /></ProtectedRoute>} />
      <Route path="/manage-newarrivals" element={<ProtectedRoute><ManageNewArrivals /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
