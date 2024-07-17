import Property from "../models/property.model.js";
import Coins from "../models/coins.model.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { errorHandler } from "../utils/error.js";

export const postProperty = async (req, res, next) => {
  const id = req.params.id;
  console.log(id);

  const {
    property_type,
    title,
    description,
    address,
    pincode,
    building_name,
    bedrooms,
    bathrooms,
    area_sqft,
    property_age,
    facing,
    floor_number,
    total_floors,
    furnish_type,
    available_from,
    monthly_rent,
    security_deposit,
    preferred_tenant,
    localities,
    landmark,
    facilities,
  } = req.body;

  // console.log(req.body);
  let location = JSON.parse(req.body.location);
  // console.log(location);

  try {
    let property = await Property.findOne({
      $or: [
        { "location.latitude": location.latitude },
        { "location.longitude": location.longitude },
      ],
    });

    if (property) {
      if (
        property.location.latitude === location.latitude &&
        property.location.longitude === location.longitude
      ) {
        return next(errorHandler(400, res, "Property already exists"));
      }
    }

    if (!req.files || !req.files.images || req.files.images.length === 0) {
      return res
        .status(400)
        .json({ code: 400, data: {}, message: "Image upload is required" });
    }

    const imageLocalPath = req.files.images[0].path;
    const imageResponse = await uploadOnCloudinary(imageLocalPath);

    const owner_name_model = await User.findById(id).select("name");
    // console.log(owner_name_model.name);

    const owner_name = owner_name_model.name; // final owner name extracted from user model

    // Create a new property
    property = new Property({
      owner_name,
      property_type,
      title,
      description,
      address,
      pincode,
      location,
      building_name,
      bedrooms,
      bathrooms,
      area_sqft,
      property_age,
      facing,
      floor_number,
      total_floors,
      furnish_type,
      available_from,
      monthly_rent,
      security_deposit,
      preferred_tenant,
      localities,
      landmark,
      facilities,
      images: imageResponse.url,
    });

    // Create a token
    const token = jwt.sign(
      { propertyId: property._id },
      process.env.JWT_SECRET
    );

    const userCoins = await Coins.findOne({ userId: id });
    if (!userCoins || userCoins.balance < 50) {
      return next(errorHandler(402, res, "Insufficient balance"));
    }

    await property.save();
    // console.log(property);

    userCoins.balance -= 50;
    await userCoins.save();

    res.status(201).json({
      code: 201,
      data: { propertyId: property._id, token: token },
      message: "Success",
    });
  } catch (error) {
    console.error("Error listing property:", error);
    next(error);
  }
};

export const editProperty = async (req, res, next) => {
  const { propertyId, updatedPropertyDetails } = req.body;

  try {
    const property = await Property.findOne({ _id: propertyId });

    if (!property) {
      return res
        .status(404)
        .json({ code: 404, data: {}, message: "Property not found" });
    }

    // Update property details
    Object.assign(property, updatedPropertyDetails);
    await property.save();

    res.status(201).json({
      code: 201,
      data: { updatedProperty: property },
      message: "Property updated successfully",
    });
  } catch (error) {
    console.error("Error updating property:", error);
    next(error);
  }
};

export const deleteProperty = async (req, res) => {
  const { propertyId } = req.body;

  try {
    const property = await Property.findByIdAndDelete(propertyId);

    if (!property) {
      return res
        .status(404)
        .json({ code: 404, data: {}, message: "Property not found" });
    }

    res
      .status(200)
      .json({ code: 200, data: {}, message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    next(error);
  }
};

export const getPropertyDetails = async (req, res) => {
  const { id } = req.params;
  // console.log(id);

  try {
    const property = await Property.findById(id);
    // console.log(property);

    if (!property) {
      return res.status(404).json({
        code: 404,
        data: {},
        message: "Property not found",
      });
    }

    res.status(200).json({
      code: 200,
      data: {
        title: property.title,
        description: property.description,
        address: property.address,
        pincode: property.pincode,
        location: {
          latitude: property.location.latitude,
          longitude: property.location.longitude,
        },
        building_name: property.building_name,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area_sqft: property.area_sqft,
        property_age: property.property_age,
        facing: property.facing,
        floor_number: property.floor_number,
        total_floors: property.total_floors,
        furnish_type: property.furnish_type,
        available_from: property.available_from,
        monthly_rent: property.monthly_rent,
        security_deposit: property.security_deposit,
        preferred_tenant: property.preferred_tenant,
        localities: property.localities,
        landmark: property.landmark,
        facilities: property.facilities,
        images: property.images,
      },
      message: "Property details fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching property details:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while fetching the property details",
    });
  }
};

import { getDistance } from "geolib";

export const listProperties = async (req, res, next) => {
  const { userLatitude, userLongitude, filters } = req.body;

  if (!userLatitude || !userLongitude) {
    return res.status(400).json({
      code: 400,
      data: {},
      message: "User latitude and longitude are required",
    });
  }

  try {
    const exactQuery = {};

    // Apply filters for exact match query
    if (filters) {
      if (filters.property_type) {
        exactQuery.property_type = filters.property_type;
      }
      if (filters.title) {
        exactQuery.title = { $regex: filters.title, $options: "i" };
      }
      if (filters.description) {
        exactQuery.description = { $regex: filters.description, $options: "i" };
      }
      if (filters.address) {
        exactQuery.address = { $regex: filters.address, $options: "i" };
      }
      if (filters.pincode) {
        exactQuery.pincode = filters.pincode;
      }
      if (filters.building_name) {
        exactQuery.building_name = {
          $regex: filters.building_name,
          $options: "i",
        };
      }
      if (filters.bedrooms) {
        exactQuery.bedrooms = filters.bedrooms;
      }
      if (filters.bathrooms) {
        exactQuery.bathrooms = filters.bathrooms;
      }
      if (filters.area_sqft) {
        exactQuery.area_sqft = filters.area_sqft;
      }
      if (filters.property_age) {
        exactQuery.property_age = filters.property_age;
      }
      if (filters.facing) {
        exactQuery.facing = filters.facing;
      }
      if (filters.floor_number) {
        exactQuery.floor_number = filters.floor_number;
      }
      if (filters.total_floors) {
        exactQuery.total_floors = filters.total_floors;
      }
      if (filters.furnish_type) {
        exactQuery.furnish_type = filters.furnish_type;
      }
      if (filters.available_from) {
        exactQuery.available_from = { $gte: new Date(filters.available_from) };
      }
      if (filters.monthly_rent) {
        exactQuery.monthly_rent = { $lte: filters.monthly_rent };
      }
      if (filters.security_deposit) {
        exactQuery.security_deposit = { $lte: filters.security_deposit };
      }
      if (filters.preferred_tenant) {
        exactQuery.preferred_tenant = filters.preferred_tenant;
      }
      if (filters.localities && Array.isArray(filters.localities)) {
        exactQuery.localities = { $in: filters.localities };
      }
      if (filters.landmark) {
        exactQuery.landmark = { $regex: filters.landmark, $options: "i" };
      }
      if (filters.facilities && Array.isArray(filters.facilities)) {
        exactQuery.facilities = { $in: filters.facilities };
      }
    }

    const exactProperties = await Property.find(exactQuery).lean(); // Using .lean() to get plain JavaScript objects
    const allProperties = await Property.find().lean(); // Fetch all properties for fallback

    // Calculate distance and add it to the properties
    const addDistanceToProperties = (properties) => {
      return properties.map((property) => {
        if (
          !property.location ||
          !property.location.latitude ||
          !property.location.longitude
        ) {
          property.distance = Infinity; // or some default value
        } else {
          const distance = getDistance(
            { latitude: userLatitude, longitude: userLongitude },
            {
              latitude: property.location.latitude,
              longitude: property.location.longitude,
            }
          );
          property.distance = distance / 1000; // distance in kilometers
        }
        return property;
      });
    };

    const exactPropertiesWithDistance =
      addDistanceToProperties(exactProperties);
    const allPropertiesWithDistance = addDistanceToProperties(allProperties);

    // Filter out properties that are already in exactProperties from allProperties
    const uniqueFallbackProperties = allPropertiesWithDistance.filter(
      (fallbackProperty) =>
        !exactPropertiesWithDistance.some(
          (exactProperty) =>
            exactProperty._id.toString() === fallbackProperty._id.toString()
        )
    );

    // Sort unique fallback properties by distance
    uniqueFallbackProperties.sort(
      (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)
    );

    // Combine exact match properties and distance-sorted fallback properties
    const combinedProperties = [
      ...exactPropertiesWithDistance,
      ...uniqueFallbackProperties,
    ];

    res.status(200).json({
      code: 200,
      data: combinedProperties.slice(0, 10), // Limit to 10 properties
      message: "Properties fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    next(error);
  }
};

export const contactOwner = async (req, res, next) => {
  const { propertyId } = req.params;
  const userId = req.user.id;
  console.log(userId);
  const property = await Property.findById(propertyId).populate("address");
  try {

    if (!propertyId.match(/^[a-fA-F0-9]{24}$/)) {
      return res.status(400).json({
        code: 400,
        data: {},
        message: "Invalid property ID format",
      });
    }
    // Find the property by ID and populate the owner details

    if (!property) {
      return res.status(404).json({
        code: 404,
        data: {},
        message: "Property not found",
      });
    }

    // Check user's coin balance
    const userCoins = await Coins.findOne({ userId });
    console.log(userCoins);
    if (!userCoins || userCoins.balance < 50) {
      return res.status(402).json({
        code: 402,
        data: {},
        message: "Insufficient balance. Please recharge your coins.",
      });
    }

    // Deduct coins (assuming 50 coins deduction)
    userCoins.balance -= 50;
    await userCoins.save();

    // Respond with owner's contact details
    // const { owner_id } = property;
    // console.log(owner_id);
    // const { contact_details } = owner_id;
    // console.log(contact_details);

    res.status(200).json({
      code: 200,
      data: {
        owner_details: {
          owner_name: property.owner_name,
          contact_phone: property.owner_phone,
        },
      },
      message: "Contact details retrieved successfully",
    });
  } catch (error) {
    console.error("Error retrieving contact details:", error);
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  const { propertyId } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ code: 404, data: {}, message: "User not found" });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ code: 404, data: {}, message: "Property not found" });
    }

    // Check if property is already in wishlist
    if (user.wishlist.includes(propertyId)) {
      return res
        .status(400)
        .json({ code:400, data:{}, message: "Property already in wishlist" });
    }

    user.wishlist.push(propertyId);
    await user.save();

    res
      .status(200)
      .json({ code: 200, data: {wishlist: user.wishlist}, message: "Property added to wishlist" });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    next(error);
  }
};

export const viewWishlist = async (req, res, next) => {
  const userId = req.user.id;
  console.log(userId);
  const user = await User.findById(userId).populate("wishlist");
  console.log(user);

  try {
    const user = await User.findById(userId).populate("wishlist");
    if (!user) {
      return res
        .status(404)
        .json({code: 404, data: {}, message: "User not found" });
    }

    res.status(200).json({ status: "success", data: user.wishlist });
  } catch (error) {
    console.error("Error viewing wishlist:", error);
    next(error);
  }
};
