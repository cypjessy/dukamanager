import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface MpesaCredentials {
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  shortcode: string;
  environment: "sandbox" | "production";
}

async function getCredentials(shopId: string): Promise<MpesaCredentials | null> {
  try {
    const ref = doc(db, "shops", shopId, "settings", "payments");
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    if (!data.mpesaConsumerKey || !data.mpesaConsumerSecret) return null;
    return {
      consumerKey: data.mpesaConsumerKey,
      consumerSecret: data.mpesaConsumerSecret,
      passkey: data.mpesaPasskey,
      shortcode: data.mpesaShortcode || data.mpesaPaybill,
      environment: data.mpesaEnvironment || "sandbox",
    };
  } catch {
    return null;
  }
}

function getBaseUrl(env: string) {
  return env === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

async function getAccessToken(creds: MpesaCredentials): Promise<string> {
  const auth = Buffer.from(`${creds.consumerKey}:${creds.consumerSecret}`).toString("base64");
  const res = await fetch(`${getBaseUrl(creds.environment)}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(data.errorMessage || "Failed to get access token");
  return data.access_token;
}

function generateTimestamp(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}${String(d.getSeconds()).padStart(2, "0")}`;
}

function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shopId, phone, amount, receiptCode } = body;

    if (!shopId || !phone || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const creds = await getCredentials(shopId);
    if (!creds) {
      return NextResponse.json({ error: "M-Pesa credentials not configured. Go to Settings > Payments to set up." }, { status: 400 });
    }

    const accessToken = await getAccessToken(creds);
    const timestamp = generateTimestamp();
    const password = generatePassword(creds.shortcode, creds.passkey, timestamp);

    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) formattedPhone = "254" + formattedPhone.slice(1);
    if (formattedPhone.startsWith("+")) formattedPhone = formattedPhone.slice(1);
    if (!formattedPhone.startsWith("254")) formattedPhone = "254" + formattedPhone;

    const callbackUrl = `${req.headers.get("origin") || "https://dukamanager.co.ke"}/api/mpesa/callback`;

    const stkRes = await fetch(`${getBaseUrl(creds.environment)}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: creds.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: creds.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: receiptCode || "DukaManager",
        TransactionDesc: `Payment to DukaManager`,
      }),
    });

    const stkData = await stkRes.json();

    if (stkData.ResponseCode !== "0") {
      return NextResponse.json({
        error: stkData.errorMessage || stkData.ResponseDescription || "STK Push failed",
        code: stkData.ResponseCode,
      }, { status: 400 });
    }

    // Save pending request mapping so callback can link to shopId
    await addDoc(collection(db, "mpesa_pending_requests"), {
      shopId,
      checkoutRequestId: stkData.CheckoutRequestID,
      merchantRequestId: stkData.MerchantRequestID,
      phone: formattedPhone,
      amount: Math.round(amount),
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      checkoutRequestId: stkData.CheckoutRequestID,
      merchantRequestId: stkData.MerchantRequestID,
      message: stkData.CustomerMessage || "STK Push sent",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "M-Pesa request failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
