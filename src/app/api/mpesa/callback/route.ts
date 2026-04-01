import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { sendSMS } from "@/lib/sms";

interface CallbackItem {
  Name: string;
  Value: string | number;
}

interface CallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: CallbackItem[];
      };
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: CallbackBody = await req.json();
    const callback = body.Body.stkCallback;

    const mpesaReceipt = callback.CallbackMetadata?.Item.find(
      (i) => i.Name === "MpesaReceiptNumber"
    )?.Value as string | undefined;

    const transactionDate = callback.CallbackMetadata?.Item.find(
      (i) => i.Name === "TransactionDate"
    )?.Value;

    const phoneNumber = callback.CallbackMetadata?.Item.find(
      (i) => i.Name === "PhoneNumber"
    )?.Value;

    const amount = callback.CallbackMetadata?.Item.find(
      (i) => i.Name === "Amount"
    )?.Value;

    let shopId: string | null = null;
    const pendingQ = query(
      collection(db, "mpesa_pending_requests"),
      where("checkoutRequestId", "==", callback.CheckoutRequestID),
      limit(1)
    );
    const pendingSnap = await getDocs(pendingQ);
    if (!pendingSnap.empty) {
      shopId = pendingSnap.docs[0].data().shopId;
    }

    await addDoc(collection(db, "mpesa_callbacks"), {
      shopId: shopId || null,
      merchantRequestId: callback.MerchantRequestID,
      checkoutRequestId: callback.CheckoutRequestID,
      resultCode: callback.ResultCode,
      resultDesc: callback.ResultDesc,
      mpesaReceiptNumber: mpesaReceipt || null,
      transactionDate: transactionDate || null,
      phoneNumber: phoneNumber || null,
      amount: amount || null,
      status: callback.ResultCode === 0 ? "success" : "failed",
      createdAt: serverTimestamp(),
    });

    if (callback.ResultCode === 0 && phoneNumber && amount) {
      const shopSnap = await getDocs(query(collection(db, "shops"), where("__name__", "==", shopId || ""), limit(1)));
      const shopName = shopSnap.empty ? "DukaManager" : shopSnap.docs[0].data().name || "DukaManager";

      sendSMS({
        to: String(phoneNumber),
        message: `M-Pesa payment of KSh ${Number(amount).toLocaleString()} received for ${shopName}. Receipt: ${mpesaReceipt || "confirmed"}. Thank you!`,
      }).catch((e) => console.error("SMS send failed:", e));
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
