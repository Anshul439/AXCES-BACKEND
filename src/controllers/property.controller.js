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
    const exactQuery = {};
    const similarQuery = {};

    // Apply filters for exact match query
    if (filters) {
      if (filters.property_type) {
        exactQuery.property_type = filters.property_type;
        similarQuery.property_type = filters.property_type;
      }
      if (filters.title) {
        exactQuery.title = { $regex: filters.title, $options: "i" };
        similarQuery.title = { $regex: filters.title, $options: "i" };
      }
      if (filters.description) {
        exactQuery.description = { $regex: filters.description, $options: "i" };
        similarQuery.description = { $regex: filters.description, $options: "i" };
      }
      if (filters.address) {
        exactQuery.address = { $regex: filters.address, $options: "i" };
        similarQuery.address = { $regex: filters.address, $options: "i" };
      }
      if (filters.pincode) {
        exactQuery.pincode = filters.pincode;
        similarQuery.pincode = filters.pincode;
      }
      if (filters.building_name) {
        exactQuery.building_name = { $regex: filters.building_name, $options: "i" };
        similarQuery.building_name = { $regex: filters.building_name, $options: "i" };
      }
      if (filters.bedrooms) {
        exactQuery.bedrooms = filters.bedrooms;
        similarQuery.bedrooms = { $gte: filters.bedrooms };
      }
      if (filters.bathrooms) {
        exactQuery.bathrooms = filters.bathrooms;
        similarQuery.bathrooms = { $gte: filters.bathrooms };
      }
      if (filters.area_sqft) {
        exactQuery.area_sqft = filters.area_sqft;
        similarQuery.area_sqft = { $gte: filters.area_sqft };
      }
      if (filters.property_age) {
        exactQuery.property_age = filters.property_age;
        similarQuery.property_age = { $gte: filters.property_age };
      }
      if (filters.facing) {
        exactQuery.facing = filters.facing;
        similarQuery.facing = filters.facing;
      }
      if (filters.floor_number) {
        exactQuery.floor_number = filters.floor_number;
        similarQuery.floor_number = { $gte: filters.floor_number };
      }
      if (filters.total_floors) {
        exactQuery.total_floors = filters.total_floors;
        similarQuery.total_floors = { $gte: filters.total_floors };
      }
      if (filters.furnish_type) {
        exactQuery.furnish_type = filters.furnish_type;
        similarQuery.furnish_type = filters.furnish_type;
      }
      if (filters.available_from) {
        exactQuery.available_from = { $gte: new Date(filters.available_from) };
        similarQuery.available_from = { $gte: new Date(filters.available_from) };
      }
      if (filters.monthly_rent) {
        exactQuery.monthly_rent = { $lte: filters.monthly_rent };
        similarQuery.monthly_rent = { $lte: filters.monthly_rent * 1.5 }; // Example adjustment for similar query
      }
      if (filters.security_deposit) {
        exactQuery.security_deposit = { $lte: filters.security_deposit };
        similarQuery.security_deposit = { $lte: filters.security_deposit * 1.5 }; // Example adjustment for similar query
      }
      if (filters.preferred_tenant) {
        exactQuery.preferred_tenant = filters.preferred_tenant;
        similarQuery.preferred_tenant = filters.preferred_tenant;
      }
      if (filters.localities && Array.isArray(filters.localities)) {
        exactQuery.localities = { $in: filters.localities };
        similarQuery.localities = { $in: filters.localities };
      }
      if (filters.landmark) {
        exactQuery.landmark = { $regex: filters.landmark, $options: "i" };
        similarQuery.landmark = { $regex: filters.landmark, $options: "i" };
      }
      if (filters.facilities && Array.isArray(filters.facilities)) {
        exactQuery.facilities = { $in: filters.facilities };
        similarQuery.facilities = { $in: filters.facilities };
      }
    }

    // Fetch exact matches
    const exactProperties = await Property.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [userLongitude, userLatitude],
          },
          distanceField: "distance",
          spherical: true,
          query: exactQuery,
        },
      },
      { $sort: { distance: 1 } }, // Sort by distance
    ]);

    // Fetch similar matches excluding exact matches
    const similarProperties = await Property.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [userLongitude, userLatitude],
          },
          distanceField: "distance",
          spherical: true,
          query: similarQuery,
        },
      },
      { $sort: { distance: 1 } }, // Sort by distance
      {
        $match: {
          _id: { $nin: exactProperties.map((p) => p._id) },
        },
      },
    ]);

    const combinedProperties = [...exactProperties, ...similarProperties];

    res.status(200).json({
      status: "success",
      data: combinedProperties,
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
