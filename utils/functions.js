import { SendPushNotification } from "./pushNotifications";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
export const sendotpmsg = async (mobile, otp) => {
    const apiKey = process.env.FAST2_SMS_API_KEY;
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: apiKey || "", // fallback to empty string to avoid undefined
        },
        body: JSON.stringify({
            route: "otp", // or "v3" if you are using DLT templates
            variables_values: otp,
            numbers: mobile,
        }),
    });
    const data = await response.json();
    console.log("Response from Fast2SMS:", data);
    if (!data.return) {
        console.error("Failed to send OTP:", data);
        throw new Error(`Failed to send OTP: ${data.message}`);
    }
    console.log("OTP sent successfully:", data);
    return data;
};
export const sendPushNotificationFunction = async () => {
    const tokens = await prisma.expoPushToken.findMany({
        select: {
            expoToken: true,
        }
    });
    const res = await SendPushNotification(tokens.map(token => token.expoToken));
    console.log("Push notifications sent successfully:", res);
    return res;
};
