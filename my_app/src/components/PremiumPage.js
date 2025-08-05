import React, { useState, useEffect } from "react";
import "./PremiumModal.css";
import { useNavigate, Link } from 'react-router-dom';
//import { FaUserCircle } from 'react-icons/fa';
import config from "../config/config";
import mylogo from '../assets/mylogo.jpg';

const plans = [
  {
    name: "Free",
    price: "$0",
    duration: "14-days",
    features: [
      "Basic decorations",
      "Standard backgrounds",
      "Create 3 altars",
      "Share with friends"
    ],
    isCurrent: true,
    planKey: "free"
  },
  {
    name: "Monthly",
    price: `$${config.premium.monthlyPrice}/mo`,
    duration: "1 Month",
    features: [
      "All free features",
      "Premium decorations",
      "Exclusive backgrounds",
      "Unlimited altars",
      "Premium badge"
    ],
    planKey: "monthly",
    popular: true
  },
  {
    name: "6 Months",
    price: `$${config.premium.sixMonthsPrice}/6mo`,
    duration: "6 Months",
    features: [
      "All monthly features",
      "Save 10% vs monthly"
    ],
    planKey: "6months"
  },
  {
    name: "Annual",
    price: `$${config.premium.annualPrice}/yr`,
    duration: "12 Months",
    features: [
      "All monthly features",
      "Save 25% vs monthly"
    ],
    planKey: "annual"
  }
];

const featureList = [
  { label: "Basic decorations", free: true, premium: true },
  { label: "Premium decorations", free: false, premium: true },
  { label: "Standard backgrounds", free: true, premium: true },
  { label: "Exclusive backgrounds", free: false, premium: true },
  { label: "Create 3 altars", free: true, premium: false },
  { label: "Unlimited altars", free: false, premium: true },
  { label: "Premium badge", free: false, premium: true },
  { label: "Ad-free experience", free: false, premium: true },
  { label: "Priority support", free: false, premium: true },
];

export default function PremiumPage() {
  const defaultPlan = plans.find(p => p.popular) || plans.find(p => !p.isCurrent);
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan.planKey);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [premiumDetails, setPremiumDetails] = useState(null);
  const [user, setUser] = useState(null);
  const [restrictionDialog, setRestrictionDialog] = useState(false);
  const navigate = useNavigate();

  // Get profile photo from localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const profilePhoto = userInfo.profile_photo || null;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${config.apiBaseUrl}/premium/status`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUser(data));
  }, [success]); // refetch after successful upgrade

  const handleBuy = () => setShowDialog(true);
  const handleCancel = () => setShowDialog(false);

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${config.apiBaseUrl}/premium/upgrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upgrade failed");
      setPremiumDetails({ expiry: data.premiumExpiry, plan: data.premiumPlan });
      setSuccess(true);
      setShowDialog(false);
      
      // Trigger features refresh after successful premium upgrade
      window.dispatchEvent(new CustomEvent('userLoggedIn'));
    } catch (err) {
      setError(err.message || "Upgrade failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <img src={mylogo} alt="MiAltar Logo" className="logo-image" />
              <div className="logo-text-container">
                <span className="logo-text">MiAltar</span>
                <span className="logo-subtitle">Virtual Memorial</span>
              </div>
            </div>
            <div className="nav-section">
              <nav className="nav">
                <Link to="/" className="nav-link">Home</Link>
               
              </nav>
              <button
                className="profile-icon-btn"
                title="Go to Profile"
                onClick={() => navigate('/profile')}
              >
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" />
                ) : (
                  <span role="img" aria-label="profile">👤</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="premium-main">
        <div className="premium-page-container">
          <section className="premium-hero">
            <h1 className="premium-hero-title">Upgrade to <span className="highlight">MiAltar Prime</span></h1>
            <p className="premium-hero-subtitle">Unlock exclusive decorations, backgrounds, unlimited altars, and more. Choose the plan that fits you best!</p>
          </section>
          <div className="premium-plans-grid">
            {plans.map(plan => {
              let isCurrent = false;
              if (user && user.isPremium && user.premiumPlan === plan.planKey) {
                isCurrent = true;
              } else if ((!user || !user.isPremium) && plan.planKey === 'free') {
                isCurrent = true;
              }
              const showRestriction = user && user.isPremium && !isCurrent;
              return (
                <div
                  className={`premium-plan-card${plan.popular ? " popular-plan" : ""}${isCurrent ? " current-plan" : ""}${selectedPlan === plan.planKey ? " selected-plan" : ""}`}
                  key={plan.planKey}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedPlan === plan.planKey}
                  onClick={() => setSelectedPlan(plan.planKey)}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSelectedPlan(plan.planKey)}
                  style={{ cursor: 'pointer', outline: selectedPlan === plan.planKey ? '2px solid #00b4ff' : undefined }}
                >
                  {plan.popular && <div className="plan-popular-badge">Most Popular</div>}
                  <h3>{plan.name}</h3>
                  <div className="premium-plan-price">{plan.price}</div>
                  <div className="premium-plan-duration">{plan.duration}</div>
                  <ul className="premium-plan-features">
                    {plan.features.map(f => <li key={f}>{f}</li>)}
                  </ul>
                  {isCurrent ? (
                    <button className="premium-current-btn" disabled>Current Plan</button>
                  ) : plan.planKey === 'free' ? null : (
                    <button
                      className="premium-buy-btn"
                      onClick={e => {
                        e.stopPropagation();
                        if (showRestriction) {
                          setRestrictionDialog(true);
                        } else {
                          handleBuy();
                        }
                      }}
                      disabled={loading || success}
                    >
                      Buy
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {showDialog && (
            <div className="premium-confirm-dialog-overlay">
              <div className="premium-confirm-dialog">
                <h3>Confirm Purchase</h3>
                <p>Are you sure you want to buy the <b>{plans.find(p => p.planKey === selectedPlan)?.name || ''}</b> plan?</p>
                <div className="premium-confirm-actions">
                  <button onClick={handleConfirm} disabled={loading} className="premium-buy-btn">{loading ? "Processing..." : "Confirm"}</button>
                  <button onClick={handleCancel} disabled={loading} className="premium-current-btn">Cancel</button>
                </div>
                {error && <div className="premium-error-msg">{error}</div>}
              </div>
            </div>
          )}
          {restrictionDialog && (
            <div className="premium-confirm-dialog-overlay">
              <div className="premium-confirm-dialog">
                <h3>Plan Change Not Allowed</h3>
                <p>You already have an active premium plan.<br />
                You can upgrade or change your plan after it expires on <b>{user && user.premiumExpiry ? new Date(user.premiumExpiry).toLocaleString() : "N/A"}</b>.</p>
                <div className="premium-confirm-actions">
                  <button onClick={() => setRestrictionDialog(false)} className="premium-current-btn">OK</button>
                </div>
              </div>
            </div>
          )}
          {user && user.isPremium ? (
            <div className="premium-success-msg">
              <h3>🎉 You are a Premium member!</h3>
              <p>Plan: <b>{user.premiumPlan || "Premium"}</b></p>
              <p>Expiry: <b>{user.premiumExpiry ? new Date(user.premiumExpiry).toLocaleString() : "N/A"}</b></p>
            </div>
          ) : (
            success && premiumDetails && (
              <div className="premium-success-msg">
                <h3>🎉 Purchase Successful!</h3>
                <p>You are now a <b>Premium</b> member.</p>
                <p>Plan: <b>{premiumDetails.plan}</b></p>
                <p>Expiry: <b>{new Date(premiumDetails.expiry).toLocaleString()}</b></p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
} 