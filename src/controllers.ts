import { 
  addFavoriteSchema, 
  deleteUserContactSchema, 
  expoPushTokenSchema, 
  sendOtpSchema, 
  userContactSchema 
} from "./schema.js";
import { z } from "zod";
import { userContactType } from "./types";
import { 
  addFavoriteCustomer, 
  adminNotifications, 
  createUserContact, 
  deleteUserContact, 
  getFavoriteCustomers, 
  getUsersData, 
  sendOtp 
} from "./services.js";
import { Request, Response } from "express";
import { sendPushNotificationFunction } from "../utils/functions.js";

/**
 * Create User Contact
 */
export const userContactController = (req: Request, res: Response) => {
  const parsedData = userContactSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid input data",
      errors: parsedData.error,
    });
  }

  if (
    !parsedData.data.mobile ||
    !parsedData.data.fullName ||
    !parsedData.data.CountryCode
  ) {
    return res.status(400).json({
      message: "Mobile, Full name and country code are required",
    });
  }

  const userContactData: userContactType = parsedData.data;
  console.log("User contact data:", userContactData);

  createUserContact(userContactData)
    .then(() => {
      res.status(200).json({
        message: "User contact created successfully",
        data: userContactData,
      });
      sendPushNotificationFunction();
    })
    .catch((err: unknown) => {
      const error = err as Error;
      console.error("Error creating user contact:", error);

      if ((error as any).name === "ConflictError") {
        return res.status(409).json({
          message: error.message,
        });
      }

      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    });
};

/**
 * Send OTP
 */
export const sendOtpController = async (req: Request, res: Response) => {
  const parsedData = sendOtpSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid input data",
      errors: parsedData.error,
    });
  }

  const { mobile, CountryCode } = parsedData.data;
  try {
    await sendOtp(mobile, CountryCode);
    res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error sending OTP:", error);
    res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

/**
 * Delete User Contact
 */
export const deleteUserContactController = async (req: Request, res: Response) => {
  const parsedData = deleteUserContactSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid input data",
      errors: parsedData.error,
    });
  }

  const { id } = parsedData.data;
  try {
    const result = await deleteUserContact(id);
    res.status(200).json({
      message: result.message,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error deleting user contact:", error);

    if ((error as any).name === "NotFoundError") {
      return res.status(404).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Save Expo Push Token
 */
export const expoPushTokenController = async (req: Request, res: Response) => {
  const parsedData = expoPushTokenSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid input data",
      errors: parsedData.error,
    });
  }

  try {
    await adminNotifications(parsedData.data);
    res.status(200).json({
      message: "Expo push token saved successfully",
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error saving expo push token:", error);
    res.status(500).json({
      message: "Failed to save expo push token",
      error: error.message,
    });
  }
};

/**
 * Get All Users
 */
export const getUsersDataController = async (req: Request, res: Response) => {
  try {
    const users = await getUsersData();
    res.status(200).json({
      message: "Users data retrieved successfully",
      data: users,
    });
    console.log("Users data:", users);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error retrieving users data:", error);
    res.status(500).json({
      message: "Failed to retrieve users data",
      error: error.message,
    });
  }
};

/**
 * Add Favorite Customer
 */
export const addFavoriteCustomers = async (req: Request, res: Response) => {
  const parsedData = addFavoriteSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid input data",
      errors: parsedData.error,
    });
  }

  const { userId } = parsedData.data;

  try {
    const favorite = await addFavoriteCustomer(userId);
    res.status(200).json({
      message: "Favorite customer added successfully",
      data: favorite,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error adding favorite customer:", error);

    if ((error as any).name === "ConflictError") {
      return res.status(409).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to add favorite customer",
      error: error.message,
    });
  }
};

/**
 * Get Favorites
 */
export const getFavorites = async (req: Request, res: Response) => {
  try {
    const favUsers = await getFavoriteCustomers();
    res.status(200).json({
      message: "Favorites retrieved successfully",
      data: favUsers,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.log("Error retrieving favorites:", error);
    res.status(500).json({
      message: "Failed to retrieve users data",
      error: error.message,
    });
  }
};
