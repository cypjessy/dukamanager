import Africastalking from "africastalking";

const apiKey = process.env.AFRICASTALKING_API_KEY || "";
const username = process.env.AFRICASTALKING_USERNAME || "sandbox";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let smsInstance: any = null;

function getSMS() {
  if (!smsInstance) {
    const at = Africastalking({ apiKey, username });
    smsInstance = at.SMS;
  }
  return smsInstance;
}

function formatPhone(num: string): string {
  const cleaned = num.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("0")) return "+254" + cleaned.slice(1);
  if (cleaned.startsWith("254")) return "+" + cleaned;
  if (cleaned.startsWith("+")) return cleaned;
  return "+254" + cleaned;
}

export interface SMSOptions {
  to: string | string[];
  message: string;
  from?: string;
  shopId?: string;
}

export async function sendSMS({ to, message, from }: SMSOptions) {
  const sms = getSMS();
  const recipients = Array.isArray(to) ? to : [to];
  const formattedRecipients = recipients.map(formatPhone);

  const options: Record<string, unknown> = {
    to: formattedRecipients,
    message,
  };

  if (from) options.from = from;

  try {
    const result = await sms.send(options);
    return { success: true, data: result };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Africa's Talking SMS error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function sendVerificationCode(phone: string, code: string) {
  return sendSMS({
    to: phone,
    message: `Your DukaManager verification code is: ${code}. It expires in 10 minutes.`,
  });
}

export async function sendReceiptSMS(phone: string, shopName: string, amount: number, receiptId: string, senderId?: string) {
  return sendSMS({
    to: phone,
    message: `${shopName}\nReceipt: ${receiptId}\nAmount: KSh ${amount.toLocaleString()}\nThank you for your purchase!`,
    from: senderId,
  });
}

export async function sendLowStockAlert(phone: string, itemName: string, quantity: number, shopName?: string, senderId?: string) {
  const prefix = shopName ? `${shopName}: ` : "";
  return sendSMS({
    to: phone,
    message: `${prefix}STOCK ALERT: "${itemName}" is running low (${quantity} units left). Please restock.`,
    from: senderId,
  });
}

export async function sendPaymentConfirmation(phone: string, amount: number, shopName: string, senderId?: string) {
  return sendSMS({
    to: phone,
    message: `M-Pesa payment of KSh ${amount.toLocaleString()} received for ${shopName}. Thank you!`,
    from: senderId,
  });
}

export async function sendBulkSMS(phones: string[], message: string, senderId?: string) {
  return sendSMS({
    to: phones.map(formatPhone),
    message,
    from: senderId,
  });
}
