import {Router} from "express";
import { deleteUserContactController, expoPushTokenController, getUsersDataController, sendOtpController, userContactController } from "./controllers";
import { rateLimiter } from "./middleware";


const router = Router();

router.post("/verifyuser", rateLimiter, userContactController);
router.post("/sendotp", rateLimiter, sendOtpController);
router.delete("/deleteusercontact",deleteUserContactController);
router.get("/admin/userDetails", getUsersDataController);
router.post ("/admin/notifications", rateLimiter,expoPushTokenController);
export default router;