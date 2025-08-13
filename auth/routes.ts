import {Router} from "express";
import { addFavoriteCustomers, deleteUserContactController, expoPushTokenController, getFavorites, getUsersDataController, sendOtpController, userContactController } from "./controllers";
import { rateLimiter } from "./middleware";


const router = Router();

router.post("/verifyuser", rateLimiter, userContactController);
router.post("/sendotp", rateLimiter, sendOtpController);



// admin routes
router.delete("/admin/deleteusercontact",deleteUserContactController);
router.get("/admin/userDetails", getUsersDataController);

router.post ("/admin/notifications",expoPushTokenController);
router.post("/admin/add-favorites",addFavoriteCustomers);
router.get("/admin/favorites",getFavorites)
export default router;