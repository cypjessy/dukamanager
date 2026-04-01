import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, orderBy, limit, QueryConstraint } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export async function POST(req: NextRequest) {
  try {
    const { checkoutRequestId, shopId } = await req.json();
    if (!checkoutRequestId) {
      return NextResponse.json({ error: "Missing checkoutRequestId" }, { status: 400 });
    }

    const conditions: QueryConstraint[] = [where("checkoutRequestId", "==", checkoutRequestId)];
    if (shopId) {
      conditions.push(where("shopId", "==", shopId));
    }

    const q = query(
      collection(db, "mpesa_callbacks"),
      ...conditions,
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const snap = await getDocs(q);
    if (snap.empty) {
      return NextResponse.json({ status: "pending" });
    }

    const data = snap.docs[0].data();
    return NextResponse.json({
      status: data.status,
      resultCode: data.resultCode,
      resultDesc: data.resultDesc,
      mpesaReceiptNumber: data.mpesaReceiptNumber,
      transactionDate: data.transactionDate,
      phoneNumber: data.phoneNumber,
      amount: data.amount,
    });
  } catch (error) {
    console.error("M-Pesa status check error:", error);
    return NextResponse.json({ status: "pending" });
  }
}
