"use client";

import { useState, useCallback } from "react";
import type { RefundItem, RefundRequest, RefundType, ReturnCondition, RefundMethod, RefundValidation, RefundAnalytics } from "@/types/cashier";
import type { Transaction } from "@/data/salesData";
import { generateId, generateReturnAuthNo } from "@/lib/encryption";

const DEFAULT_POLICY = {
  maxDaysForReturn: 14,
  requiresReceipt: true,
  supervisorPinRequired: true,
  allowedConditions: ["damaged", "wrong_item", "expired", "changed_mind", "quality_issue"] as ReturnCondition[],
  refundMethods: ["original", "store_credit", "cash", "mpesa"] as RefundMethod[],
  restockDamaged: false,
  restockExpired: false,
};

export function useRefundValidation(supervisorPin?: string) {
  const [analytics, setAnalytics] = useState<RefundAnalytics>({
    totalReturns: 0,
    totalRefundAmount: 0,
    byReason: { damaged: 0, wrong_item: 0, expired: 0, changed_mind: 0, quality_issue: 0 },
    byType: { full: 0, partial: 0, exchange: 0, store_credit: 0 },
    returnRate: 0,
    avgRefundAmount: 0,
  });

  const validateReturn = useCallback((
    transaction: Transaction | null,
    items: RefundItem[],
    refundType: RefundType,
    condition: ReturnCondition | "",
    refundMethod: RefundMethod,
    inputPin: string
  ): RefundValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!transaction) {
      errors.push("Transaction not found");
      return { isValid: false, errors, warnings };
    }

    const selectedItems = items.filter((i) => i.selected);
    if (selectedItems.length === 0) {
      errors.push("Select at least one item to return");
    }

    // Check return window
    const txnDate = new Date(transaction.date);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - txnDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > DEFAULT_POLICY.maxDaysForReturn) {
      errors.push(`Return window expired (${DEFAULT_POLICY.maxDaysForReturn} days max)`);
    } else if (daysDiff > DEFAULT_POLICY.maxDaysForReturn - 3) {
      warnings.push("Return window expiring soon");
    }

    // Check quantities
    for (const item of selectedItems) {
      if (item.returnQty <= 0) {
        errors.push(`Invalid return quantity for ${item.productName}`);
      }
      if (item.returnQty > item.originalQty) {
        errors.push(`Return quantity exceeds purchased quantity for ${item.productName}`);
      }
    }

    // Check condition
    if (!condition) {
      errors.push("Select item condition");
    }

    // Check supervisor PIN
    const effectivePin = supervisorPin || "1234";
    if (DEFAULT_POLICY.supervisorPinRequired && !inputPin) {
      errors.push("Supervisor PIN required");
    } else if (DEFAULT_POLICY.supervisorPinRequired && inputPin !== effectivePin) {
      errors.push("Invalid supervisor PIN");
    }

    // Expiry warning
    const hasExpiredItems = selectedItems.some((i) => i.condition === "expired");
    if (hasExpiredItems) {
      warnings.push("Expired items will not be restocked");
    }

    // Exchange validation
    if (refundType === "exchange") {
      warnings.push("Select exchange items to complete the exchange");
    }

    // Store credit notice
    if (refundMethod === "store_credit") {
      warnings.push("Customer will receive store credit voucher");
    }

    return { isValid: errors.length === 0, errors, warnings };
  }, []);

  const createRefundRequest = useCallback((
    transaction: Transaction,
    items: RefundItem[],
    refundType: RefundType,
    condition: ReturnCondition,
    refundMethod: RefundMethod,
    reason: string,
    supervisorPin: string
  ): RefundRequest => {
    const selectedItems = items.filter((i) => i.selected);
    const refundAmount = selectedItems.reduce((s, i) => s + i.totalRefund, 0);

    return {
      id: generateId(),
      returnNo: generateReturnAuthNo(),
      originalTransactionId: transaction.id,
      receiptNo: transaction.receiptNo,
      refundType,
      items: selectedItems,
      customerName: transaction.customer,
      customerPhone: transaction.customerPhone || "",
      reason,
      condition,
      refundMethod,
      refundAmount,
      supervisorPin,
      status: DEFAULT_POLICY.supervisorPinRequired ? "pending" : "approved",
      createdAt: new Date().toISOString(),
      processedAt: "",
      processedBy: "",
      returnAuthNo: generateReturnAuthNo(),
    };
  }, []);

  const updateAnalytics = useCallback((refundAmount: number, reason: ReturnCondition, type: RefundType) => {
    setAnalytics((prev) => {
      const newByReason = { ...prev.byReason, [reason]: prev.byReason[reason] + 1 };
      const newByType = { ...prev.byType, [type]: prev.byType[type] + 1 };
      const newTotal = prev.totalReturns + 1;
      return {
        totalReturns: newTotal,
        totalRefundAmount: prev.totalRefundAmount + refundAmount,
        byReason: newByReason,
        byType: newByType,
        returnRate: 0,
        avgRefundAmount: Math.round((prev.totalRefundAmount + refundAmount) / newTotal),
      };
    });
  }, []);

  return {
    policy: DEFAULT_POLICY,
    analytics,
    validateReturn,
    createRefundRequest,
    updateAnalytics,
  };
}
