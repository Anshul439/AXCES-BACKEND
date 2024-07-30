import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema(
  {
    listing_type: {
      type: String,
      enum: ["buy", "rent"],
      required: true,
    },
    owner_name: {
      type: String,
    },
    owner_phone: {
      type: Number,
    },
    property_type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    building_name: {
      type: String,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    area_sqft: {
      type: Number,
      required: true,
    },
    property_age: {
      type: String,
      required: true,
    },
    facing: {
      type: String,
      required: true,
    },
    floor_number: {
      type: Number,
      required: true,
    },
    total_floors: {
      type: Number,
      required: true,
    },
    furnish_type: {
      type: String,
      required: true,
    },
    available_from: {
      type: Date,
      required: true,
    },
    monthly_rent: {
      type: Number,
      required: true,
    },
    security_deposit: {
      type: Number,
      required: true,
    },
    preferred_tenant: {
      type: String,
      required: true,
    },
    localities: [
      {
        type: String,
        required: true,
      },
    ],
    landmark: {
      type: String,
      required: true,
    },
    facilities: [
      {
        type: String,
        required: true,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);



const Property = mongoose.model("Property", PropertySchema);
export default Property;
