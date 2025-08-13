
import { error } from './../node_modules/effect/src/Brand';

import {  addFavoriteSchema, deleteUserContactSchema, expoPushTokenSchema, sendOtpSchema, userContactSchema } from "./schema";
import { z } from "zod";
import  { userContactType } from "./types";
import { addFavoriteCustomer, adminNotifications, createUserContact, deleteUserContact, getFavoriteCustomers, getUsersData, sendOtp } from "./services";
import { Request, Response } from "express";
import { sendPushNotificationFunction } from '../utils/functions';



export const userContactController =(req:Request,res: Response)=>{
        const parsedData = userContactSchema.safeParse(req.body);
     if(!parsedData.success){
        return res.status(400).json({
            message: "Invalid input data",
            errors: parsedData.error,
        });
     }
        // If validation passes, proceed with creating the user contact
        if(!parsedData.data.mobile || !parsedData.data.firstName || !parsedData.data.lastName || !parsedData.data.CountryCode){
            return res.status(400).json({
                message: "Mobile, first name, last name, and country code are required",
            });
        }


    const userContactData: userContactType = parsedData.data;
    createUserContact(userContactData)
        .then(() => {
            res.status(200).json({
                message: "User contact created successfully",
                data: userContactData,
            });
            sendPushNotificationFunction()
        })
        .catch((error) => {
            console.error("Error creating user contact:", error);
          

            if (error.name === "ConflictError") {
                return res.status(409).json({
                    message: error.message,
                });
            }

              res.status(500).json({
                message: "Internal server error",
                error: error.message,
            });
        });
        
     



}


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
        const otp = await sendOtp(mobile, CountryCode);
        res.status(200).json({
            message: "OTP sent successfully",
            // You might want to remove this in production for security reasons
        });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({
            message: "Failed to send OTP",
            error: error.message,
        });
    }
};


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
    }
    catch (error) {
        console.error("Error deleting user contact:", error);
        if (error.name === "NotFoundError") {
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

export const expoPushTokenController = async (req: Request, res: Response) => {
    const parsedData = expoPushTokenSchema.safeParse(req.body);
    if (!parsedData.success) {  
        return res.status(400).json({
            message: "Invalid input data",
            errors: parsedData.error,
        });
    }
    const { expoToken, deviceName, modelName, osVersion, osName, deviceType, deviceId, lastSeen } = parsedData.data;
    try {
           await adminNotifications({
            expoToken,
            deviceName,
            modelName,
            osVersion,
            osName,
            deviceType,
            deviceId,
            lastSeen,
        });
        res.status(200).json({
            message: "Expo push token saved successfully",
        });
    } catch (error) {
        console.error("Error saving expo push token:", error);
        res.status(500).json({
            message: "Failed to save expo push token",
            error: error.message,
        });
    }
};


export const getUsersDataController = async (req: Request, res: Response) => {
    try {
        const users = await getUsersData();
        res.status(200).json({
            message: "Users data retrieved successfully",
            data: users,
        });
        console.log("Users data:", users);
    } catch (error) {
        console.error("Error retrieving users data:", error);
        res.status(500).json({
            message: "Failed to retrieve users data",
            error: error.message,
        });
    }   
};


export const addFavoriteCustomers=async(req:Request,res:Response)=>{

    const parsedData= addFavoriteSchema.safeParse(req.body)
    if(!parsedData.success){
        return res.status(400).json({
            message: "Invalid input data",
            errors: parsedData.error,
        });
    }
     const { id, userId, createdAt, updatedAt, userContact } = parsedData.data;
    try {
        const favorite = await addFavoriteCustomer(userId);
        res.status(200).json({
            message: "Favorite customer added successfully",
            data: favorite,
        });



    } catch (error) {
        console.error("Error adding favorite customer:", error);
        if (error.name === "ConflictError") {
            return res.status(409).json({
                message: error.message,
            });
        }
        res.status(500).json({
            message: "Failed to add favorite customer",
            error: error.message,
        }); 
    }
}

export const getFavorites = async(req: Request , res:Response)=>{
     try {
         const favUsers = await getFavoriteCustomers();
         res.status(200).json({
            message:"favorites retrived successfully",
            data: favUsers
         })

     } catch (error) {
           console.log("Error in retrieving favorites", error)

                res.status(500).json({
            message: "Failed to retrieve users data",
            error: error.message,
        });
     }

}
