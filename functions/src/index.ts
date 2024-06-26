import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

interface ChatParticipant {
  userId: string;
  unreadMessagesCount: number;
}


interface UserToken {
  userId: string;
  token: string | null;
}

exports.sendChatNotification = functions.firestore
  .document("chats/{chatId}/messages/{messageId}")
  .onCreate(async (snapshot, context) => {
    const messageData = snapshot.data();
    const chatId = context.params.chatId;

    const chatSnapshot = await admin.firestore().doc(`chats/${chatId}`).get();
    const chatInfo = chatSnapshot.data();
    const eventId = chatInfo?.details?.eventId;

    const senderSnapshot =
      await admin.firestore().doc(`users/${messageData.senderId}`).get();
    const senderInfo = senderSnapshot.data();
    const senderName = senderInfo?.username || "Unknown User";

    if (!eventId) {
      console.log("Chat is not relevant to event");
      return null;
    }

    const eventSnapshot =
      await admin.firestore().doc(`events/${eventId}`).get();
    const eventInfo = eventSnapshot.data();
    const participants = eventInfo?.participants || [];

    const userTokens = participants
      .map((participant: {userId: string}) => ({
        userId: participant.userId,
        token: null,
      }));

    for (const userToken of userTokens) {
      if (userToken.userId !== messageData.senderId) {
        const userSnapshot =
          await admin.firestore().doc(`users/${userToken.userId}`).get();
        const user = userSnapshot.data();
        if (user?.fcmToken) {
          userToken.token = user.fcmToken;
        }
      }
    }

    const tokens = userTokens.filter((u: UserToken) => u.token)
      .map((u: UserToken) => u.token);

    const multicastMessage = {
      notification: {
        title: chatInfo?.details?.name || "New message in chat",
        body: `${senderName}: ${messageData.text ||
        "You have received a new message"}`,
      },
      data: {
        chatId,
        chatName: chatInfo?.details?.name,
        senderName,
        message: messageData.text,
      },
      tokens,
    };

    try {
      const response = await admin.messaging().sendMulticast(multicastMessage);

      for (const res of response.responses) {
        const idx = response.responses.indexOf(res);
        if (!res.success) {
          const errorCode = res.error?.code;
          const failedUserToken = userTokens[idx] as UserToken;

          console.error("Failure sending notification to",
            failedUserToken.token, "with error", errorCode);
          if (errorCode === "messaging/registration-token-not-registered" &&
            failedUserToken.token) {
            await admin.firestore().doc(`users/${failedUserToken.userId}`)
              .update({
                fcmToken: admin.firestore.FieldValue.delete(),
              });
            console.log(`Removed expired token for user
             ${failedUserToken.userId}`);
          }
        }
      }

      for (const userToken of userTokens) {
        if (userToken.token) {
          await incrementUnreadMessages(userToken.userId);
        }
      }

      console.log("Notifications sent successfully:", response);
    } catch (error) {
      console.error("Error sending notification:", error);
    }

    return null;
  });
/**
 * @param {string} userId - user ID.
 */
async function incrementUnreadMessages(userId: string) {
  const userRef = admin.firestore().doc(`users/${userId}`);
  return admin.firestore().runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists) {
      console.log(`User not found: ${userId}`);
      return;
    }
    const userData = userDoc.data() || {};
    const unreadCount = (userData.unreadMessagesCount || 0) + 1;
    transaction.update(userRef, {unreadMessagesCount: unreadCount});
  });
}

exports.incrementUnreadMessages = functions.firestore
  .document("chats/{chatId}/messages/{messageId}")
  .onCreate((snapshot, context) => {
    const chatId = context.params.chatId;
    const chatRef = admin.firestore().collection("chats").doc(chatId);

    return chatRef.get().then((doc) => {
      if (!doc.exists) {
        throw new Error("Chat not found");
      }

      const chatData = doc.data();
      const participants = chatData?.details.participants as ChatParticipant[];

      const updatedParticipants =
        participants.map((participant: ChatParticipant) => {
          if (participant.userId !== snapshot.data().senderId) {
            return {
              unreadMessagesCount: ++participant.unreadMessagesCount,
              userId: participant.userId,
            };
          }
          return participant;
        });

      return chatRef.update({"details.participants": updatedParticipants});
    }).catch((error) => {
      console.error("Error incrementing unread messages:", error);
      throw new Error(error);
    });
  });


