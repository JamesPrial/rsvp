import { getFirestore } from "firebase-admin/firestore";

export interface EventConfig {
  title: string;
  date: string;
  location: string;
  hostEmail: string;
  appBaseUrl: string;
}

let cachedConfig: EventConfig | null = null;

export async function getEventConfig(): Promise<EventConfig> {
  if (cachedConfig) return cachedConfig;

  const db = getFirestore();
  const doc = await db.collection("config").doc("event").get();

  if (doc.exists) {
    cachedConfig = doc.data() as EventConfig;
    return cachedConfig;
  }

  // Fallback to environment variables
  cachedConfig = {
    title: process.env.EVENT_TITLE || "Event",
    date: process.env.EVENT_DATE || "",
    location: process.env.EVENT_LOCATION || "",
    hostEmail: process.env.HOST_EMAIL || "",
    appBaseUrl: process.env.APP_BASE_URL || "",
  };

  return cachedConfig;
}
