import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import {
  onDocumentCreated,
} from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getEventConfig } from "./config";

initializeApp();

/**
 * Triggered when a new RSVP document is created.
 * Sends a verification email to the guest via the Trigger Email extension.
 */
export const onRSVPCreate = onDocumentCreated("rsvps/{rsvpId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const data = snapshot.data();
  if (data.status !== "pending") return;

  const config = await getEventConfig();
  const verificationLink = `${config.appBaseUrl}/verify?token=${data.verificationToken}`;

  const db = getFirestore();
  await db.collection("mail").add({
    to: data.email,
    message: {
      subject: `Confirm your RSVP for ${config.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Please confirm your RSVP</h2>
          <p>Hi ${data.name},</p>
          <p>Thank you for RSVPing to <strong>${config.title}</strong>!</p>
          <p>Please click the button below to confirm your response:</p>
          <p style="text-align: center; margin: 32px 0;">
            <a href="${verificationLink}"
               style="background-color: #3b82f6; color: white; padding: 12px 32px;
                      text-decoration: none; border-radius: 8px; font-weight: 600;">
              Confirm RSVP
            </a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 24 hours. If you did not submit this RSVP,
            you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">
            ${config.title} &middot; ${config.date} &middot; ${config.location}
          </p>
        </div>
      `,
    },
  });
});

/**
 * Callable function to verify an email token.
 * Marks the RSVP as verified and sends a notification to the host.
 */
export const verifyEmail = onCall(async (request) => {
  const { token } = request.data as { token?: string };

  if (!token || typeof token !== "string") {
    throw new HttpsError("invalid-argument", "A verification token is required.");
  }

  const db = getFirestore();
  const now = Timestamp.now();

  const query = await db
    .collection("rsvps")
    .where("status", "==", "pending")
    .where("verificationToken", "==", token)
    .where("verificationTokenExpiry", ">", now)
    .limit(1)
    .get();

  if (query.empty) {
    throw new HttpsError(
      "not-found",
      "Invalid or expired verification link. Please submit a new RSVP."
    );
  }

  const rsvpDoc = query.docs[0];
  const rsvpData = rsvpDoc.data();

  await rsvpDoc.ref.update({
    status: "verified",
    verifiedAt: FieldValue.serverTimestamp(),
  });

  // Send host notification email
  const config = await getEventConfig();

  const guestDetails = [
    `<strong>Name:</strong> ${rsvpData.name}`,
    `<strong>Email:</strong> ${rsvpData.email}`,
    `<strong>Attending:</strong> ${rsvpData.attending ? "Yes" : "No"}`,
  ];

  if (rsvpData.attending) {
    if (rsvpData.guestCount) {
      guestDetails.push(`<strong>Guests:</strong> ${rsvpData.guestCount}`);
    }
    if (rsvpData.arrivalTime) {
      guestDetails.push(`<strong>Arrival Time:</strong> ${rsvpData.arrivalTime}`);
    }
  }

  if (rsvpData.message) {
    guestDetails.push(`<strong>Message:</strong> ${rsvpData.message}`);
  }

  await db.collection("mail").add({
    to: config.hostEmail,
    message: {
      subject: `New RSVP: ${rsvpData.name} for ${config.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New RSVP Confirmed</h2>
          <p>A guest has confirmed their RSVP for <strong>${config.title}</strong>.</p>
          <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
            ${guestDetails.map((d) => `<p style="margin: 4px 0;">${d}</p>`).join("")}
          </div>
        </div>
      `,
    },
  });

  return { success: true };
});

/**
 * Scheduled function that runs every hour to clean up expired pending RSVPs.
 */
export const cleanupExpired = onSchedule("every 1 hours", async () => {
  const db = getFirestore();
  const now = Timestamp.now();

  const expired = await db
    .collection("rsvps")
    .where("status", "==", "pending")
    .where("verificationTokenExpiry", "<", now)
    .get();

  if (expired.empty) return;

  const batch = db.batch();
  for (const doc of expired.docs) {
    const data = doc.data();
    batch.delete(doc.ref);

    // Also delete the corresponding name reservation
    if (data.name) {
      const normalizedName = data.name.trim().toLowerCase().replace(/\s+/g, " ");
      batch.delete(db.collection("rsvp-names").doc(normalizedName));
    }
  }

  await batch.commit();
});
