import React, { useState, useRef, useEffect } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import axios from 'axios'
import api from './api/axios'
import LandingScreen from './components/LandingScreen'
import StudentDashboard from './components/StudentDashboard'
import DriverDashboard from './components/DriverDashboard'
import ParentDashboard from './components/ParentDashboard'
import Login from './components/Login'

import Register from './components/Register'

export default function App() {
  const [authCode, setAuthCode] = useState('')
  const [userData, setUserData] = useState(null)
  const [serverToken, setServerToken] = useState('')
  const [loading, setLoading] = useState(false)

  const authCodeRef = useRef('');
  const tokenRef = useRef('');

  // ... (existing disabled functions) ...

  const scanDirect = () => {
    // DISABLED
    if (typeof my !== 'undefined' && my.alert) {
      my.alert({ content: "QR Scan function is disabled" });
    } else {
      console.log("QR Scan function is disabled");
    }
  }

  const pay = () => {
    // DISABLED
    if (typeof my !== 'undefined' && my.alert) {
      my.alert({ content: "Payment function is disabled" });
    } else {
      console.log("Payment function is disabled");
    }
  }

  const handleScan = scanDirect;
  const handlePay = pay;

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/student-dashboard" element={
          <StudentDashboard
            authCode={authCode}
            onScan={handleScan}
            onPay={handlePay}
          />
        } />

        <Route path="/driver-dashboard" element={
          <DriverDashboard
            onScan={handleScan}
          />
        } />

        <Route path="/parent-dashboard" element={
          <ParentDashboard
            onPay={handlePay}
          />
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <div className="fixed bottom-4 left-4 text-[10px] text-slate-300 bg-slate-900/50 px-2 py-1 rounded backdrop-blur-sm pointer-events-none z-50 ltr" dir="ltr">
        Build: Dev | Auth: {authCode ? 'OK' : 'No'} | Routes Active
      </div>
    </>
  )
}
