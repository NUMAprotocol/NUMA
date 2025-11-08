// const express = require("express");
import express from "express";

// const { ethers } = require("ethers");
import { ethers } from "ethers";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Paid API endpoint - returns 402 if no payment
app.get("/api/premium-data", async (req, res) => {
  const paymentProof = req.headers["x-payment-proof"];

  if (!paymentProof || !(await verifyPayment(paymentProof))) {
    // Return 402 - Payment Required
    return res.status(402).json({
      error: "Payment Required",
      message: "This endpoint requires payment",
      paymentAddress: "0xYourPaymentAddress",
      amount: "0.001 ETH",
      paymentVerificationEndpoint: "/api/verify-payment",
    });
  }

  // If payment verified, return premium data
  res.json({
    data: "This is your premium content!",
    accessGranted: true,
    timestamp: new Date().toISOString(),
  });
});

// Payment verification endpoint
app.post("/api/verify-payment", async (req, res) => {
  const { transactionHash, userAddress } = req.body;

  try {
    const isValid = await verifyOnChainPayment(transactionHash, userAddress);
    res.json({ verified: isValid });
  } catch (error) {
    res.status(400).json({ error: "Payment verification failed" });
  }
});

async function verifyOnChainPayment(txHash, userAddress) {
  // Implement blockchain payment verification
  // Check if transaction exists and is confirmed
  // Verify amount and recipient address
  return true; // Simplified for demo
}

// app.listen(3001, () => {
//   console.log("x402 Server running on port 3001");
// });

const PORT = process.env.PORT || 5005;

const startServer = async () => {
  //   await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 API Health: http://localhost:${PORT}/api/health`);
  });
};

startServer().catch(console.error);
