import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushReceipt } from 'expo-server-sdk';

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true,
});

export async function SendPushNotification(
  pushTokens: string[],

): Promise<void> {
  try {
    // Filter valid tokens & prepare messages
    const messages: ExpoPushMessage[] = pushTokens
      .filter((token) => {
        if (!Expo.isExpoPushToken(token)) {
          console.error(`Invalid Expo push token: ${token}`);
          return false;
        }
        return true;
      })
      .map((token) => ({
        to: token,
        sound: 'default',
        title : "You got new user contact",
        body: "Check your app for new user contact",
       
      }));

    if (messages.length === 0) {
      throw new Error('No valid Expo push tokens provided');
    }

    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log('Ticket Chunk:', ticketChunk);
      tickets.push(...ticketChunk);
    }

    // Collect receipt IDs
    const receiptIds: string[] = tickets
      .filter((ticket) => ticket.status === 'ok')
      .map((ticket) => ticket.id as string);

    if (receiptIds.length === 0) {
      console.warn('No valid receipt IDs received.');
      return;
    }

    // Check receipts
    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    for (const chunk of receiptIdChunks) {
      const receipts: Record<string, ExpoPushReceipt> = await expo.getPushNotificationReceiptsAsync(chunk);
      console.log('Receipts:', receipts);

      for (const receiptId in receipts) {
        const { status, details } = receipts[receiptId];
        if (status === 'error') {
          console.error(`Error sending notification to ${receiptId}: ${details?.error}`);
        }
      }
    }
  } catch (error) {
    console.error('Error sending push notifications:', error);
  }
}
