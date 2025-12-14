import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
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
import NewArrivals from "./components/newarrivals/NewArrivals"; // 👈 customer view
import ManageNewArrivals from "./components/newarrivals/ManageNewArrivals"; // 👈 admin upload/manage
import MyPlans from "./components/MyPlans";
import PlanDetails from "./components/PlanDetails";
import PaymentHistory from "./components/payment-history/paymentHistoryList";
import PaymentHistoryDetails from "./components/payment-history/PaymentHistoryDetails";
import ForgotPassword from "./components/forgot-password/ForgotPassword";
import VerifyForgotOtp from "./components/forgot-password/VerifyForgotOtp";
import ResetPassword from "./components/forgot-password/ResetPassword";
import Wallet from "./components/Features/Wallet";
import Profile from "./components/Features/Profile";


// Mock banner images for demonstration
const BANNERS = {
  default: "/images/banner1.jpg",
  gold: "/images/gold-banner.jpg",
  premium: "/images/premium-banner.jpg",
};

function App() {
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();

  const addNewPlan = (newPlanData) => {
    const banner = newPlanData.banner
      ? newPlanData.banner
      : newPlanData.planType === "Premium"
        ? BANNERS.premium
        : newPlanData.jewelleryType === "All"
          ? BANNERS.gold
          : BANNERS.default;

    const newPlan = {
      id: Date.now(), // unique ID
      ...newPlanData,
      banner,
      createdAt: new Date().toISOString(),
    };

    setPlans((prevPlans) => [...prevPlans, newPlan]);
  };

  const updatePlan = (id, updatedData) => {
    setPlans((prevPlans) =>
      prevPlans.map((p) => (p.id === Number(id) ? { ...p, ...updatedData } : p))
    );
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleJoinNow = (planId) => {
    // console.log("Join now for plan:", planId);
  };

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/CreateAccount" element={<CreateAccount />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/Sidemenu" element={<Sidemenu />} />
      <Route path="/rateentry" element={<RateEntry />} />
      <Route path="/otp" element={<OTP />} />
      <Route path="/my-plans" element={<MyPlans />} />
      <Route path="/plan-details/:id" element={<PlanDetails />} />
      <Route path='/paymenthistory' element={<PaymentHistory />} />
      <Route path='/payment-history/:userId' element={<PaymentHistoryDetails />} />

      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/verifyForgotOtp" element={<VerifyForgotOtp />} />
      <Route path="/resetPassword" element={<ResetPassword />} />
      <Route path="/wallet" element = {<Wallet />} />
      <Route path="/profile" element = {<Profile />} />


      {/* Create Plan */}
      <Route
        path="/createnewplan"
        element={<CreateNewPlan onCreatePlan={addNewPlan} />}
      />

      {/* Edit Plan */}
      <Route
        path="/createnewplan/:id"
        element={<CreateNewPlan onUpdatePlan={updatePlan} plans={plans} />}
      />

      <Route path="/newplan" element={<NewPlan onBack={handleBack} />} />
      <Route path="/newplan/:id" element={<NewPlan onBack={handleBack} />} />

      {/* Join New Plan */}
      <Route path="/plans/joinnewplan/:planId" element={<JoinNewPlan />} />
      <Route path="/plans/payment/:planId" element={<PaymentPage />} />

      {/* 🟢 New Arrivals */}
      <Route path="/newarrivals" element={<NewArrivals />} /> {/* customer view */}
      <Route path="/manage-newarrivals" element={<ManageNewArrivals />} /> {/* admin upload */}
    </Routes>
  );
}

export default App;
