// services.ts
import { PrismaClient } from "@prisma/client";
import { userContactType } from "./types.js";
import { generateOtp, sendotpmsg } from "../utils/functions.js";
import redis from "redis";
import fa from "zod/v4/locales/fa.cjs";

const prisma = new PrismaClient();

// Redis client setup
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

await redisClient.connect();

// ===================== OTP =====================
export const sendOtp = async (mobile: string, countryCode: string) => {
  const otp = generateOtp();

  // Check if user already exists
  const existingUser = await prisma.userContact.findUnique({
    where: { mobile },
  });

  if (existingUser) {
    const error = new Error(
      "User contact with this mobile number already exists"
    );
    error.name = "ConflictError";
    throw error;
  }

  try {
    const key = `otp:${mobile}`;
    await redisClient.set(key, otp, { EX: 300 }); // 5 minutes expiry
    console.log(`OTP for ${mobile} stored in Redis: ${otp}`);

    await sendotpmsg(mobile, otp);
    console.log(`OTP sent to ${mobile}: ${otp}`);
  } catch (err) {
    console.error("Error sending OTP:", err);
    throw new Error("Failed to send OTP");
  }

  return otp;
};

// ===================== User Contact =====================
export const createUserContact = async (data: userContactType) => {
  const existing = await prisma.userContact.findUnique({
    where: { mobile: data.mobile },
  });

  if (existing) {
    const error = new Error(
      "User contact with this mobile number already exists"
    );
    error.name = "ConflictError";
    throw error;
  }

  console.log("Creating user contact with data:", data);

  await prisma.userContact.create({
    data: {
      fullName: data.fullName,
      CountryCode: data.CountryCode,
      mobile: data.mobile,
      customerType: data.customerType,
      address: data.address,
      isVerified: data.isVerified,
      isWhatsApp: data.isWhatsApp,
    },
  });
};

export const getUsersData = async () => {
  try {
    const users = await prisma.userContact.findMany();
    const favourites = await prisma.addFavorite.findMany();

    const favouritesData = new Set(favourites.map((fav) => fav.userId));
    const usersWithFavouriteStatus = users.map((user) => ({
      ...user,
      isFavourite: favouritesData.has(user.id),
    }));
    return usersWithFavouriteStatus;
  } catch (error) {
    console.error("Error fetching user contacts:", error);
    throw new Error("Failed to fetch user contacts");
  }
};

export const deleteUserContact = async (id: string) => {
  const user = await prisma.userContact.findUnique({ where: { id } });
  if (!user) {
    const error = new Error("User contact not found");
    error.name = "NotFoundError";
    throw error;
  }

  await prisma.userContact.delete({ where: { id } });
  return { message: "User contact deleted successfully" };
};

// ===================== Expo Notifications =====================
export const adminNotifications = async ({
  expoToken,
  deviceName,
  modelName,
  osVersion,
  osName,
  deviceType,
  deviceId,
  lastSeen,
}: {
  expoToken: string;
  deviceName?: string;
  modelName?: string;
  osVersion?: string;
  osName?: string;
  deviceType?: number;
  deviceId?: string;
  lastSeen?: Date;
}) => {
return await prisma.expoPushToken.upsert({
  where: { expoToken }, // must have a unique constraint on expoToken
  update: {},           // nothing to update if exists
  create: { expoToken }, // create if not exists
});
};

// ===================== Favorites =====================
export const addFavoriteCustomer = async (userId: string) => {
  const existing = await prisma.addFavorite.findUnique({ where: { userId } });
  if (existing) {
    const error = new Error("Favorite customer already exists for this user");
    error.name = "ConflictError";
    throw error;
  }

  return await prisma.addFavorite.create({ data: { userId } });
};

export const deleteFavoriteCustomer = async (userId: string) => {
  console.log("Deleting favorite customer with userId:", userId);
  const favorite = await prisma.addFavorite.findUnique({
    where: { userId},
  });
  console.log(await prisma.addFavorite.findMany(), "All favorites in DB");

  if (!favorite) {
    const error = new Error("Favorite customer not found");
    error.name = "NotFoundError";
    throw error;
  }

  await prisma.addFavorite.delete({ where: { userId} });
  return { message: "Favorite customer deleted successfully" };
};

export const deleteAllData = async () => {
  await prisma.addFavorite.deleteMany();
  await prisma.userContact.deleteMany();
  return { message: "All data deleted successfully" };
};
