"use client";

import React from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import Script from "next/script";

const PremiumPage = () => {
  const [upgrading, setUpgrading] = React.useState<string | null>(null);
  const { user, setUser } = useUser();
  const router = useRouter();

  const plans = [
    { name: "Bronze", price: 10, limit: "7 mins", icon: "🥉", description: "Extended watch time and downloads" },
    { name: "Silver", price: 50, limit: "10 mins", icon: "🥈", description: "More watch time and premium badge" },
    { name: "Gold", price: 100, limit: "Unlimited", icon: "🥇", description: "Unrestricted access and priority" },
  ];

  const handleUpgrade = async (planName: string, amount: number, paymentId: string = "manual_test", orderId?: string, signature?: string) => {
    if (!user) return alert("Please login first");

    setUpgrading(planName);
    try {
      const res = await axiosInstance.post("/plan/upgrade", {
        userId: user._id,
        userEmail: user.email,
        amount,
        paymentId,
        orderId,
        signature
      });

      if (res.data.plan) {
        if (res.data.emailSent) {
          alert(`${planName} Plan Activated Successfully! \n\nCheck ${user.email} for your PDF invoice.`);
        } else {
          alert(`${planName} Plan Activated! \n\n⚠️ INVOICE NOT SENT: ${res.data.emailMessage}`);
        }

        const updatedUser = { ...user, isPremium: true, plan: res.data.plan };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        router.push("/");
      }
    } catch (error: any) {
      console.error("Upgrade Error Log:", error);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";
      alert(`Upgrade failed. \n\nConnecting to: ${backendUrl}\n\nReason: ${error.response?.data?.message || "Server unreachable. Please check if your backend is hosted and the URL is set in Vercel settings."}`);
    } finally {
      setUpgrading(null);
    }
  };

  const openRazorpay = async (planName: string, amount: number) => {
    if (!user) return alert("Please login first");

    // DETECT PLACEHOLDER KEYS
    const isMock = !process.env.NEXT_PUBLIC_RAZORPAY_KEY ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY.includes("YourTestKeyHere") ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY === "rzp_test_YourTestKeyHere";

    if (isMock) {
      if (confirm(`Development Mode: You are using placeholder Razorpay keys. Would you like to SIMULATE a successful test payment for ₹${amount} and trigger an email invoice to ${user.email}?`)) {
        return handleUpgrade(planName, amount, `mock_success_${Date.now()}`);
      }
      return;
    }

    try {
      // 1. Create order on backend
      const { data: order } = await axiosInstance.post("/plan/create-order", { amount });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: `YourTube ${planName}`,
        description: `Upgrade to ${planName} Plan`,
        order_id: order.id,
        handler: (response: any) => handleUpgrade(
          planName,
          amount,
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        ),
        prefill: { name: user.name, email: user.email },
        theme: { color: "#df0000" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay init error:", error);
      alert("Could not initialize payment. Please check your console/network logs.");
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 flex flex-col items-center">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground">Select a tier that fits your watching habits.</p>
        <div className="mt-4 p-3 bg-red-500/10 text-red-600 rounded-lg inline-block text-sm">
          Free Plan Limit: 5 mins watch time per video
        </div>
        {(!process.env.NEXT_PUBLIC_RAZORPAY_KEY || process.env.NEXT_PUBLIC_RAZORPAY_KEY.includes("YourTestKeyHere")) && (
          <div className="mt-4 p-3 bg-yellow-500/10 text-yellow-700 rounded-lg block text-xs border border-yellow-200">
            ⚠️ <b>Razorpay Keys Missing:</b> Please update <code>server/.env</code> and <code>yourtube/.env.local</code> with your real Razorpay Test Keys to enable the payment modal.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {plans.map((p) => (
          <div key={p.name} className={`relative flex flex-col bg-card border ${user?.plan === p.name ? 'border-primary ring-2 ring-primary/20' : 'border-border'} rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all`}>
            {user?.plan === p.name && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold py-1 px-4 rounded-full uppercase">Current Plan</span>
            )}
            <div className="text-4xl mb-4">{p.icon}</div>
            <h2 className="text-2xl font-bold mb-2">{p.name}</h2>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold">₹{p.price}</span>
              <span className="text-muted-foreground">/one-time</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 h-12 leading-relaxed">{p.description}</p>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-500 font-bold">✓</span>
                <span>Watch up to {p.limit} per video</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-500 font-bold">✓</span>
                <span>Email Invoice & Receipt</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-500 font-bold">✓</span>
                <span>Premium Access</span>
              </li>
            </ul>

            <div className="space-y-3">
              <button
                onClick={() => openRazorpay(p.name, p.price)}
                disabled={upgrading !== null}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {upgrading === p.name ? "Processing..." : "Pay with Razorpay"}
              </button>
              <button
                onClick={() => handleUpgrade(p.name, p.price)}
                disabled={upgrading !== null}
                className="w-full py-2 border border-dashed border-primary/40 text-primary text-xs font-semibold rounded-xl hover:bg-primary/5 transition-all disabled:opacity-50"
              >
                {upgrading === p.name ? "Upgrading..." : "Test Bypass (Free for Dev)"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* TEST CARD INFO */}
      <div className="mt-12 max-w-md w-full p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl">
        <h3 className="text-xs font-bold text-yellow-600 uppercase mb-4 tracking-widest text-center">Razorpay Test Card Details</h3>
        <div className="grid grid-cols-2 gap-4 font-mono text-sm">
          <div>
            <p className="text-[10px] text-muted-foreground mb-1 uppercase">Card Number</p>
            <p className="font-bold">4111 1111 1111 1111</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1 uppercase">Expiry / CVV</p>
            <p className="font-bold">12/26 | 123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;
