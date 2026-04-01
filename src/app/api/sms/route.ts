import { NextRequest, NextResponse } from "next/server";
import { sendSMS, sendVerificationCode, sendReceiptSMS, sendLowStockAlert, sendPaymentConfirmation } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, to, message, from, code, shopName, amount, receiptId, itemName, quantity } = body;

    if (!to) {
      return NextResponse.json({ error: "Recipient phone number is required" }, { status: 400 });
    }

    let result;

    switch (type) {
      case "verification":
        if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 });
        result = await sendVerificationCode(to, code);
        break;

      case "receipt":
        if (!shopName || amount === undefined || !receiptId) {
          return NextResponse.json({ error: "shopName, amount, receiptId required" }, { status: 400 });
        }
        result = await sendReceiptSMS(to, shopName, amount, receiptId);
        break;

      case "low-stock":
        if (!itemName || quantity === undefined) {
          return NextResponse.json({ error: "itemName, quantity required" }, { status: 400 });
        }
        result = await sendLowStockAlert(to, itemName, quantity);
        break;

      case "payment":
        if (amount === undefined || !shopName) {
          return NextResponse.json({ error: "amount, shopName required" }, { status: 400 });
        }
        result = await sendPaymentConfirmation(to, amount, shopName);
        break;

      default:
        if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });
        result = await sendSMS({ to, message, from });
        break;
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
