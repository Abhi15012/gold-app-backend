import {Router} from "express";
import { addFavoriteCustomers, deleteAllUsersController, deleteFavoriteCustomers, deleteUserContactController, expoPushTokenController, getFavorites, getUsersDataController, sendOtpController, userContactController } from "./controllers.js";
import { rateLimiter } from "./middleware.js";


const router = Router();

router.post("/verifyuser", rateLimiter, userContactController);
router.post("/sendotp", rateLimiter, sendOtpController);



// admin routes
router.delete("/admin/deleteusercontact",deleteUserContactController);
router.get("/admin/userDetails", getUsersDataController);
router.post ("/admin/notifications",expoPushTokenController);
router.post("/admin/add-favorites",addFavoriteCustomers);
router.get("/admin/favorites",getFavorites)
router.delete("/admin/delete-favorite",deleteFavoriteCustomers);
router.delete("/admin/delete-all", deleteAllUsersController);
export default router;