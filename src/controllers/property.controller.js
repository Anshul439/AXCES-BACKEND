import Property from "../models/property.model.js";
import Coins from "../models/coins.model.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import calculateDistance from "../utils/distance.js";

export const postProperty = async (req, res) => {
  const id = req.params.id;

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
  console.log(location);

  const { latitude, longitude } = location
  // console.log(latitude);

  try {
    let property = await Property.findOne({ address });

    if (property) {
      return res.status(400).json({
        status: "fail",
        message: "Property already exists",
      });
    }

    // console.log(latitude);

    // const { latitude, longitude } = property.location;

    const imageLocalPath = req.files?.images[0].path;
    // console.log(imageLocalPath);

    const imageResponse = await uploadOnCloudinary(imageLocalPath);
    // console.log(imageResponse);

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

    // const userCoins = await Coins.findOne({ userId: id });
    // if (!userCoins || userCoins.balance < 50) {
    //   return res.status(400).json({
    //     status: "fail",
    //     message: "Insufficient balance. Please recharge your coins.",
    //   });
    // }

    await property.save();
    console.log(property);

    // userCoins.balance -= 50;
    // await userCoins.save();

    res.status(201).json({
      status: "success",
      propertyId: property._id,
      token: token,
      message: "Property listed successfully",
    });
  } catch (error) {
    console.error("Error listing property:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while listing the property",
    });
  }
};

export const editProperty = async (req, res) => {
  const { propertyId, updatedPropertyDetails } = req.body;

  try {
    const property = await Property.findOne({ _id: propertyId });

    if (!property) {
      return res
        .status(404)
        .json({ status: "fail", message: "Property not found" });
    }

    // Update property details
    Object.assign(property, updatedPropertyDetails);
    await property.save();

    res
      .status(200)
      .json({ status: "success", message: "Property updated successfully" });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while updating the property",
    });
  }
};

export const deleteProperty = async (req, res) => {
  const { propertyId } = req.body;

  try {
    const property = await Property.findByIdAndDelete(propertyId);

    if (!property) {
      return res
        .status(404)
        .json({ status: "fail", message: "Property not found" });
    }

    res
      .status(200)
      .json({ status: "success", message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while deleting the property",
    });
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
        status: "fail",
        message: "Property not found",
      });
    }

    res.status(200).json({
      status: "success",
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
    });
  } catch (error) {
    console.error("Error fetching property details:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while fetching the property details",
    });
  }
};

export const listProperties = async (req, res) => {
  const { userLatitude, userLongitude, filters } = req.body;
  try {
    const query = {};

    // Apply filters if they exist
    if (filters) {
      // If the 'property_type' filter is provided, add it to the query
      if (filters.property_type) query.property_type = filters.property_type;

      // If the 'title' filter is provided, add a case-insensitive regex search to the query
      if (filters.title) query.title = { $regex: filters.title, $options: "i" };

      // If the 'description' filter is provided, add a case-insensitive regex search to the query
      if (filters.description)
        query.description = { $regex: filters.description, $options: "i" };

      // If the 'address' filter is provided, add a case-insensitive regex search to the query
      if (filters.address)
        query.address = { $regex: filters.address, $options: "i" };

      // If the 'pincode' filter is provided, add it to the query
      if (filters.pincode) query.pincode = filters.pincode;

      // If the 'building_name' filter is provided, add a case-insensitive regex search to the query
      if (filters.building_name)
        query.building_name = { $regex: filters.building_name, $options: "i" };

      // If the 'bedrooms' filter is provided, add it to the query
      if (filters.bedrooms) query.bedrooms = filters.bedrooms;

      // If the 'bathrooms' filter is provided, add it to the query
      if (filters.bathrooms) query.bathrooms = filters.bathrooms;

      // If the 'area_sqft' filter is provided, add it to the query
      if (filters.area_sqft) query.area_sqft = filters.area_sqft;

      // If the 'property_age' filter is provided, add it to the query
      if (filters.property_age) query.property_age = filters.property_age;

      // If the 'facing' filter is provided, add it to the query
      if (filters.facing) query.facing = filters.facing;

      // If the 'floor_number' filter is provided, add it to the query
      if (filters.floor_number) query.floor_number = filters.floor_number;

      // If the 'total_floors' filter is provided, add it to the query
      if (filters.total_floors) query.total_floors = filters.total_floors;

      // If the 'furnish_type' filter is provided, add it to the query
      if (filters.furnish_type) query.furnish_type = filters.furnish_type;

      // If the 'available_from' filter is provided, add a date comparison to the query
      if (filters.available_from)
        query.available_from = { $gte: new Date(filters.available_from) };

      // If the 'monthly_rent' filter is provided, add a less than or equal condition to the query
      if (filters.monthly_rent)
        query.monthly_rent = { $lte: filters.monthly_rent };

      // If the 'security_deposit' filter is provided, add a less than or equal condition to the query
      if (filters.security_deposit)
        query.security_deposit = { $lte: filters.security_deposit };

      // If the 'preferred_tenant' filter is provided, add it to the query
      if (filters.preferred_tenant)
        query.preferred_tenant = filters.preferred_tenant;

      // If the 'localities' filter is provided, add an 'in' condition to the query
      if (filters.localities) query.localities = { $in: filters.localities };

      // If the 'landmark' filter is provided, add a case-insensitive regex search to the query
      if (filters.landmark)
        query.landmark = { $regex: filters.landmark, $options: "i" };

      // If the 'facilities' filter is provided, add an 'in' condition to the query
      if (filters.facilities) query.facilities = { $in: filters.facilities };
    }

    const properties = await Property.find(query);

    const propertiesWithDistance = properties.map((property) => {
      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        property.location.latitude,
        property.location.longitude
      );
      return {
        ...property.toObject(), // Convert Mongoose document to plain JavaScript object
        distance: distance.toFixed(2), // Round distance to two decimal places
      };
    });

    res.status(200).json({
      status: "success",
      data: propertiesWithDistance,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while fetching properties",
    });
  }
};

export const contactOwner = async (req, res) => {
  const { propertyId } = req.params;
  const userId = req.user.id;
  console.log(userId);
  const property = await Property.findById(propertyId).populate("address");
  try {
    // Find the property by ID and populate the owner details

    if (!property) {
      return res.status(404).json({
        status: "fail",
        message: "Property not found",
      });
    }

    // Check user's coin balance
    const userCoins = await Coins.findOne({ userId });
    console.log(userCoins);
    if (!userCoins || userCoins.balance < 50) {
      return res.status(402).json({
        status: "fail",
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
      status: "success",
      owner_details: {
        owner_name: property.owner_name,
        contact_phone: property.owner_phone,
      },
      message: "Contact details retrieved successfully",
    });
  } catch (error) {
    console.error("Error retrieving contact details:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while retrieving contact details",
    });
  }
};

export const addToWishlist = async (req, res) => {
  const { propertyId } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    // Check if property is already in wishlist
    if (user.wishlist.includes(propertyId)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Property already in wishlist" });
    }

    user.wishlist.push(propertyId);
    await user.save();

    res
      .status(200)
      .json({ status: "success", message: "Property added to wishlist" });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while adding property to wishlist",
    });
  }
};

export const viewWishlist = async (req, res) => {
  const userId = req.user.id;
  console.log(userId);
  const user = await User.findById(userId).populate("wishlist");
  console.log(user);

  try {
    const user = await User.findById(userId).populate("wishlist");
    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    res.status(200).json({ status: "success", data: user.wishlist });
  } catch (error) {
    console.error("Error viewing wishlist:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while viewing wishlist",
    });
  }
};
