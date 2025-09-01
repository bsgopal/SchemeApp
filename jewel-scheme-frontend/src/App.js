import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import CreateAccount from "./components/CreateAccount";
import Home from "./components/Home";
import Sidemenu from "./components/Sidemenu";
import OTP from "./components/OTP";
import CreateNewPlan from "./components/CreateNewPlan";
import NewPlan from "./components/NewPlan";
import JoinNewPlan from "./components/JoinNewPlan";

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
    console.log("Join now for plan:", planId);
  };

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/CreateAccount" element={<CreateAccount />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/Sidemenu" element={<Sidemenu />} />
      <Route path="/otp" element={<OTP />} />
      
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

      {/* View Plans */}
      <Route
        path="/newplan"
        element={
          <NewPlan
            plans={plans}
            onBack={handleBack}
            onJoinNow={handleJoinNow}
            banners={BANNERS}
          />
        }
      />

      {/* Join New Plan */}
      <Route path="/joinnewplan/:id" element={<JoinNewPlan />} />
    </Routes>
  );
}

export default App;
