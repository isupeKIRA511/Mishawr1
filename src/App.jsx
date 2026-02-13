import React, { useState, useRef, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import axios from 'axios'
import api from './api/axios'
import LandingScreen from './components/LandingScreen'
import StudentDashboard from './components/StudentDashboard'
import DriverDashboard from './components/DriverDashboard'
import ParentDashboard from './components/ParentDashboard'

import Register from './components/Register'

export default function App() {
  const [authCode, setAuthCode] = useState('')
  const [userData, setUserData] = useState(null)
  const [serverToken, setServerToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('landing') // landing, register, student, driver, parent
  const [showLandingRoles, setShowLandingRoles] = useState(false)

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

  const handleLogin = async (role) => {
    // Legacy mock login - should be updated or removed if using full Auth flow
    setUserData({ name: role === 'student' ? 'Student User' : 'Driver User', role });
    setView(role);
  }

  const handleBackToLogin = () => {
    setView('landing')
    setShowLandingRoles(true)
  }

  const handleRegisterSuccess = (role) => {
    // Redirect to login or specific dashboard login view
    // For now, let's go back to landing so they can login with their new account
    setView('landing');
    setShowLandingRoles(true);
  }

  // Function to navigate to register page
  const handleGoToRegister = () => {
    setView('register');
  };

  return (
    <>
      {view === 'landing' && (
        <LandingScreen
          onSelectRole={handleLogin}
          loading={loading}
          showRoles={showLandingRoles}
          onShowRolesChange={setShowLandingRoles}
          onRegister={handleGoToRegister}
        />
      )}

      {view === 'register' && (
        <Register
          onBack={handleBackToLogin}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}

      {view === 'student' && (
        <StudentDashboard
          userData={userData}
          authCode={authCode}
          onBack={handleBackToLogin}
          onScan={handleScan}
          onPay={handlePay}
        />
      )}

      {view === 'driver' && (
        <DriverDashboard
          onBack={handleBackToLogin}
          onScan={handleScan}
        />
      )}

      {view === 'parent' && (
        <ParentDashboard
          onBack={handleBackToLogin}
          onPay={handlePay}
        />
      )}

      <div className="fixed bottom-4 left-4 text-[10px] text-slate-300 bg-slate-900/50 px-2 py-1 rounded backdrop-blur-sm pointer-events-none z-50 ltr" dir="ltr">
        Build: Dev | Auth: {authCode ? 'OK' : 'No'} | View: {view}
      </div>
    </>
  )
}
