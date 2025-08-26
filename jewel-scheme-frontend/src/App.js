import React from "react";
import {  Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import CreateAccount from "./components/CreateAccount";
import Home from "./components/Home";
import Sidemenu from "./components/Sidemenu";
import OTP from "./components/OTP";


function App() {
  return (
    <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/CreateAccount" element={<CreateAccount />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Sidemenu" element={<Sidemenu />} />
        <Route path="/otp" element={<OTP />} />
      </Routes>
    
  );
}

export default App;
