import { id } from "zod/locales";
import { sendOtp } from "./services";
import z from "zod";

export const userContactSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    CountryCode: z.string(),
    mobile: z.string(),
    address: z.string().optional(),
    isVerified: z.boolean().default(false),
    isWhatsApp: z.boolean().default(false),
  })
  .refine((data) => data.mobile.length >= 10, {
    message: "Mobile number must be at least 10 characters long",
  });

// ExponentPushToken[qnPtemLwekAu242T_oFrkt]
export const expoPushTokenSchema = z.object({
  expoToken: z
    .string()
    .refine(
      (token) => token.startsWith("ExponentPushToken[") && token.endsWith("]"),
      {
        message: "Invalid Expo push token format",
      }
    ),
  deviceName: z.string().optional(),
  modelName: z.string().optional(),
  osVersion: z.string().optional(),
  osName: z.string().optional(),
  deviceType: z.number().optional(),
  deviceId: z.string().optional(),
  lastSeen: z.date().optional(),
});

export const sendOtpSchema = z
  .object({
    mobile: z.string().max(10, "Mobile number must be 10 characters long"),
    CountryCode: z.string().default("+91"), // Default to +1 for US numbers
  })
  .refine((data) => data.mobile.length >= 10, {
    message: "Mobile number must be at least 10 characters long",
  });

export const deleteUserContactSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

export const addFavoriteSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  // userContact is a relation, so you can add a nested schema or leave as optional
  userContact: z.any().optional(),
});
