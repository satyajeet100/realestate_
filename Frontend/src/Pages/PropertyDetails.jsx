import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  Chip,
  Divider,
  Box,
  Rating,
  Button,
  Alert,
} from "@mui/material";

const PropertyDetails = () => {
  const { id } = useParams(); // Property ID from the URL
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [rating, setRating] = useState(0); // State to store the average rating
  const [userRating, setUserRating] = useState(0); // State to store the user's rating input
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated. Please log in.");

        // Fetch property details
        const propertyResponse = await fetch(`http://localhost:9090/api/properties/${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!propertyResponse.ok) throw new Error(`Failed to fetch property details. Status: ${propertyResponse.status}`);

        const propertyData = await propertyResponse.json();
        setProperty(propertyData);

        // Fetch ratings for the user (assuming userId is available in the property data)
        const userId = propertyData.seller.id; // Replace with the correct user ID field
        const ratingsResponse = await fetch(`http://localhost:9090/ratings?userId=${userId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!ratingsResponse.ok) throw new Error(`Failed to fetch ratings. Status: ${ratingsResponse.status}`);

        const ratingsData = await ratingsResponse.json();

        // Calculate average rating
        if (ratingsData.length > 0) {
          const totalRating = ratingsData.reduce((sum, rating) => sum + rating.rating, 0);
          const averageRating = totalRating / ratingsData.length;
          setRating(averageRating);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  const handleRatingSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated. Please log in.");

      const ratingData = {
        rating: userRating,
        propertyId: id,
      };

      const response = await fetch("http://localhost:9090/ratings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ratingData),
      });

      if (!response.ok) throw new Error("Failed to submit rating.");

      const data = await response.json();
      setSuccessMessage("Rating submitted successfully!");
      setUserRating(0); // Reset the user's rating input

      // Refetch ratings to update the average
      const userId = property.seller.id; // Replace with the correct user ID field
      const ratingsResponse = await fetch(`http://localhost:9090/ratings?userId=${userId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!ratingsResponse.ok) throw new Error(`Failed to fetch updated ratings. Status: ${ratingsResponse.status}`);

      const ratingsData = await ratingsResponse.json();

      // Recalculate average rating
      if (ratingsData.length > 0) {
        const totalRating = ratingsData.reduce((sum, rating) => sum + rating.rating, 0);
        const averageRating = totalRating / ratingsData.length;
        setRating(averageRating);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      setError(error.message);
    }
  };

  const handlePayment = () => {
    // Redirect to Payment.jsx with necessary data
    navigate("/payment", {
      state: {
        propertyId: id,
        userId: property.seller.id,
        amount: property.discountedPrice || property.price,
      },
    });
  };

  if (loading) return <CircularProgress sx={{ display: "block", margin: "20% auto" }} />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!property) return <Typography>No property details available.</Typography>;

  return (
    <Container sx={{ py: 4 }}>
      <Card>
        <CardMedia
          component="img"
          height="400"
          image={property.imageUrls?.[0] || "default-image-url.jpg"}
          alt={property.propertyTitle}
          sx={{ objectFit: "cover" }}
        />
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {property.propertyTitle}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {property.description}
          </Typography>
          <Divider sx={{ my: 2 }} />

          {/* Ratings Section */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Rating
              name="property-rating"
              value={rating || 0} // Use the fetched average rating
              precision={0.5} // Allow half-star ratings
              readOnly // Make the rating read-only
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({rating.toFixed(1)}/5)
            </Typography>
          </Box>

          {/* User Rating Input */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Rate this property:
            </Typography>
            <Rating
              name="user-rating"
              value={userRating}
              precision={0.5}
              onChange={(event, newValue) => setUserRating(newValue)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleRatingSubmit}
              sx={{ mt: 1, ml: 2 }}
              disabled={!userRating}
            >
              Submit Rating
            </Button>
          </Box>

          {/* Success or Error Message */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Property Details */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color="primary">
                Price: ₹{property.price.toLocaleString("en-IN")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Discounted Price: ₹{property.discountedPrice.toLocaleString("en-IN")}
              </Typography>
              <Chip
                label={`${property.discountPercent}% OFF`}
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">
                <strong>Location:</strong> {property.location}
              </Typography>
              <Typography variant="body2">
                <strong>Category:</strong> {property.propertyCategory}
              </Typography>
              <Typography variant="body2">
                <strong>Type:</strong> {property.propertyType}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">
                <strong>Bedrooms:</strong> {property.numberOfBedrooms}
              </Typography>
              <Typography variant="body2">
                <strong>Bathrooms:</strong> {property.numberOfBathrooms}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">
                <strong>Area:</strong> {property.squareFeet} sq ft
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Seller Details
            </Typography>
            <Typography variant="body2">
              <strong>Name:</strong> {property.seller.name}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {property.seller.email}
            </Typography>
          </Box>

          {/* Buy Now Button */}
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePayment}
              fullWidth
              size="large"
            >
              Buy Now
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PropertyDetails;