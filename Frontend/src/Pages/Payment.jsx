import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  CircularProgress,
  Button,
  Alert,
} from "@mui/material";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { propertyId, userId, amount } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          setRazorpayLoaded(true);
          resolve(true);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!razorpayLoaded) throw new Error("Razorpay SDK failed to load.");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated. Please log in.");

      // Create a payment order
      const response = await fetch("http://localhost:9090/api/payment/create-order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amount, userId: userId, propertyId: propertyId }),
      });

      if (!response.ok) throw new Error("Failed to create payment order.");
      const order = await response.json();

      // Open Razorpay payment modal
      const options = {
        key: "rzp_test_rFwjZbQ2DbFLZt", // Replace with actual Razorpay Key ID
        amount: order.amount,
        currency: order.currency,
        name: "Real Estate Platform",
        description: `Payment for property: ${propertyId}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const callbackResponse = await fetch("http://localhost:9090/api/payment/callback", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(response),
            });

            if (!callbackResponse.ok) throw new Error("Failed to process payment callback.");
            setSuccessMessage(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          } catch (error) {
            console.error("Payment callback error:", error);
            setError("Failed to process payment callback.");
          }
        },
        prefill: {
          name: "John Doe", // Replace with actual user details
          email: "john.doe@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!propertyId || !userId || !amount) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          Invalid payment details. Please go back and try again.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate("/")} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Complete Payment
      </Typography>
      <Typography variant="body1" gutterBottom>
        You are about to pay ₹{amount} for property ID: {propertyId}.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={handlePayment}
        disabled={loading || !razorpayLoaded}
        sx={{ mt: 2 }}
      >
        {loading ? "Processing..." : "Pay Now"}
      </Button>

      {successMessage && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default Payment;
