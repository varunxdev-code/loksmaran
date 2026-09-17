export type IndiaState = {
  name: string;
  qid: string;
  iso: string;
  region: "North" | "South" | "East" | "West" | "Central" | "Northeast";
};

export const INDIA_STATES: IndiaState[] = [
  { name: "Andhra Pradesh", qid: "Q1159", iso: "IN-AP", region: "South" },
  { name: "Arunachal Pradesh", qid: "Q1162", iso: "IN-AR", region: "Northeast" },
  { name: "Assam", qid: "Q1164", iso: "IN-AS", region: "Northeast" },
  { name: "Bihar", qid: "Q1165", iso: "IN-BR", region: "East" },
  { name: "Chhattisgarh", qid: "Q1168", iso: "IN-CT", region: "Central" },
  { name: "Goa", qid: "Q1171", iso: "IN-GA", region: "West" },
  { name: "Gujarat", qid: "Q1061", iso: "IN-GJ", region: "West" },
  { name: "Haryana", qid: "Q1174", iso: "IN-HR", region: "North" },
  { name: "Himachal Pradesh", qid: "Q1177", iso: "IN-HP", region: "North" },
  { name: "Jharkhand", qid: "Q1184", iso: "IN-JH", region: "East" },
  { name: "Karnataka", qid: "Q1185", iso: "IN-KA", region: "South" },
  { name: "Kerala", qid: "Q1186", iso: "IN-KL", region: "South" },
  { name: "Madhya Pradesh", qid: "Q1188", iso: "IN-MP", region: "Central" },
  { name: "Maharashtra", qid: "Q1191", iso: "IN-MH", region: "West" },
  { name: "Manipur", qid: "Q1193", iso: "IN-MN", region: "Northeast" },
  { name: "Meghalaya", qid: "Q1195", iso: "IN-ML", region: "Northeast" },
  { name: "Mizoram", qid: "Q1502", iso: "IN-MZ", region: "Northeast" },
  { name: "Nagaland", qid: "Q1198", iso: "IN-NL", region: "Northeast" },
  { name: "Odisha", qid: "Q22048", iso: "IN-OD", region: "East" },
  { name: "Punjab", qid: "Q22424", iso: "IN-PB", region: "North" },
  { name: "Rajasthan", qid: "Q1437", iso: "IN-RJ", region: "North" },
  { name: "Sikkim", qid: "Q1505", iso: "IN-SK", region: "Northeast" },
  { name: "Tamil Nadu", qid: "Q1445", iso: "IN-TN", region: "South" },
  { name: "Telangana", qid: "Q677037", iso: "IN-TG", region: "South" },
  { name: "Tripura", qid: "Q1363", iso: "IN-TR", region: "Northeast" },
  { name: "Uttar Pradesh", qid: "Q1498", iso: "IN-UP", region: "North" },
  { name: "Uttarakhand", qid: "Q1499", iso: "IN-UT", region: "North" },
  { name: "West Bengal", qid: "Q1356", iso: "IN-WB", region: "East" },
  { name: "Delhi", qid: "Q1353", iso: "IN-DL", region: "North" },
  { name: "Jammu and Kashmir", qid: "Q1180", iso: "IN-JK", region: "North" },
  { name: "Ladakh", qid: "Q200019", iso: "IN-LA", region: "North" },
  { name: "Puducherry", qid: "Q66743", iso: "IN-PY", region: "South" },
];

export function stateByName(name?: string) {
  if (!name) return undefined;
  const q = name.toLowerCase();
  return INDIA_STATES.find((s) => s.name.toLowerCase() === q);
}
