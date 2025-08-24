import { PrismaClient } from "@prisma/client";
import { userContactType } from "./types";
import { generateOtp, sendotpmsg } from '../utils/functions.js';

const prisma = new PrismaClient();
import redis from "redis";

const rediscli = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

rediscli.on('error', (err: any) => {
    console.error('Redis error:', err);
});

await rediscli.connect();


export const sendOtp = async (mobile: string, countryCode : string) => {
    const otp = generateOtp();
    const res=  await prisma.userContact.findUnique({
    where: {
      mobile:mobile,
    },
    });
if (res) {
    const error = new Error("User contact with this mobile number already exists");
    
    error.name = "ConflictError";
    throw error;
  }
    try {
      const key  = `otp:${mobile}`;
    
      await rediscli.set(key, otp, "EX", 300); // Store OTP for 5 minutes
      console.log(`OTP for ${mobile} stored in Redis: ${otp}`);
      await sendotpmsg(mobile, otp);
    console.log(`OTP sent to ${mobile}: ${otp}`);
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw new Error("Failed to send OTP");
    }
    return otp;
  }




export const createUserContact=async(data:userContactType)=>{
const res=  await prisma.userContact.findUnique({
    where: {
      mobile: data.mobile,
    },
    });
if (res) {
    const error = new Error("User contact with this mobile number already exists");
    
    error.name = "ConflictError";
    throw error;
  }
  console.log("Creating user contact with data:", data);
await prisma.userContact.create({
    data: {
      fullName: data.fullName,
        CountryCode: data.CountryCode,
        mobile: data.mobile,
        address: data.address,
        isVerified: data.isVerified,
        isWhatsApp: data.isWhatsApp,
    },
  });
}

export const getUsersData = async () => {
  const users = await prisma.userContact.findMany();
  return users;
}

export const deleteUserContact = async (id: string) => {
  const user = await prisma.userContact.findUnique({
    where: { id},
  });
  if (!user) {
    const error = new Error("User contact not found");
    error.name = "NotFoundError";
    throw error;
  }
  await prisma.userContact.delete({
    where: { id },
  });
  return { message: "User contact deleted successfully" };
}

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
   const expoNotifications = await prisma.expoPushToken.create({
    data: {
      expoToken,
      deviceName,
      modelName,
      osVersion,
      osName,
      deviceType,
      deviceId,
      lastSeen: lastSeen || new Date(),
    },
  });
  return expoNotifications;
  
}

export const addFavoriteCustomer = async (userId:string)=>{
  const existingFavorite = await prisma.addFavorite.findUnique({
    where: { userId },
  });
  if (existingFavorite) {
    const error = new Error("Favorite customer already exists for this user");
    error.name = "ConflictError";
    throw error;
  }
const res=  await  prisma.addFavorite.create({
    data:{
      userId: userId
    }
  })
return res

}



export const getFavoriteCustomers =async()=>{
  const data = await prisma.addFavorite.findMany()
  return data
}




