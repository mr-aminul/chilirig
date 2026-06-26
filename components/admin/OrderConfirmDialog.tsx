"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isOrderCancelled } from "@/lib/order-status";

export type OrderConfirmDialogVariant = "delete" | "cancel" | "pathao" | "recreate";

const COPY: Record<
  OrderConfirmDialogVariant,
  {
    title: string;
    description: (
      orderNumber: string,
      fullName: string,
      pathaoConsignmentId?: string | null,
      status?: string | null
    ) => string;
    confirmWordClass: string;
    confirmButtonClass: string;
    confirmLabel: string;
    loadingLabel: string;
  }
> = {
  delete: {
    title: "Delete order?",
    description: (
      orderNumber,
      fullName,
      pathaoConsignmentId,
      status
    ) => {
      if (pathaoConsignmentId && isOrderCancelled(status)) {
        return `This permanently removes order ${orderNumber} for ${fullName} and cancels the active Pathao shipment (${pathaoConsignmentId}). If the parcel has already been picked up, Pathao may reject the cancellation. This cannot be undone.`;
      }
      if (pathaoConsignmentId) {
        return `This permanently removes order ${orderNumber} for ${fullName} and cancels the Pathao shipment (${pathaoConsignmentId}). If the parcel has already been picked up, Pathao may reject the cancellation. This cannot be undone.`;
      }
      return `This permanently removes order ${orderNumber} for ${fullName}. This cannot be undone.`;
    },
    confirmWordClass: "bg-red-50 text-red-700",
    confirmButtonClass:
      "border-red-600/20 bg-red-600 text-white shadow-red-600/20 hover:bg-red-700 hover:shadow-red-600/30",
    confirmLabel: "Delete order",
    loadingLabel: "Deleting…",
  },
  cancel: {
    title: "Cancel order?",
    description: (
      orderNumber,
      fullName,
      pathaoConsignmentId,
      status
    ) => {
      if (pathaoConsignmentId && isOrderCancelled(status)) {
        return `Order ${orderNumber} for ${fullName} is cancelled locally, but the Pathao shipment (${pathaoConsignmentId}) is still active. Confirm to cancel it on Pathao. If the parcel has already been picked up, Pathao may reject the cancellation.`;
      }
      if (pathaoConsignmentId) {
        return `Order ${orderNumber} for ${fullName} will be marked cancelled and the Pathao shipment (${pathaoConsignmentId}) will be cancelled. If the parcel has already been picked up, Pathao may reject the cancellation.`;
      }
      return `Order ${orderNumber} for ${fullName} will stay in the list with status cancelled. It will not be sent to Pathao.`;
    },
    confirmWordClass: "bg-amber-50 text-amber-800",
    confirmButtonClass:
      "border-amber-600/20 bg-amber-600 text-white shadow-amber-600/20 hover:bg-amber-700 hover:shadow-amber-600/30",
    confirmLabel: "Cancel order",
    loadingLabel: "Cancelling…",
  },
  pathao: {
    title: "Send to Pathao?",
    description: (orderNumber, fullName) =>
      `Create a Pathao delivery for order ${orderNumber} (${fullName}). The customer will be notified for shipment.`,
    confirmWordClass: "",
    confirmButtonClass:
      "border-primary/20 bg-[hsl(var(--primary))] text-white shadow-[hsl(var(--primary))]/20 hover:bg-[hsl(var(--primary-hover))]",
    confirmLabel: "Send to Pathao",
    loadingLabel: "Sending…",
  },
  recreate: {
    title: "Re-create this order?",
    description: (orderNumber, fullName) =>
      `Create a new order for ${fullName} using the same items and delivery details as ${orderNumber}. The new order will be ready to send to Pathao.`,
    confirmWordClass: "",
    confirmButtonClass:
      "border-primary/20 bg-[hsl(var(--primary))] text-white shadow-[hsl(var(--primary))]/20 hover:bg-[hsl(var(--primary-hover))]",
    confirmLabel: "Re-create order",
    loadingLabel: "Re-creating…",
  },
};

type OrderConfirmDialogProps = {
  variant: OrderConfirmDialogVariant;
  order: {
    order_number: string;
    full_name: string;
    pathao_consignment_id?: string | null;
    status?: string | null;
  };
  isSubmitting: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  confirmText?: string;
  onConfirmTextChange?: (value: string) => void;
  confirmWord?: string;
  canConfirm?: boolean;
};

export function OrderConfirmDialog({
  variant,
  order,
  confirmText,
  onConfirmTextChange,
  confirmWord,
  canConfirm,
  isSubmitting,
  onDismiss,
  onConfirm,
}: OrderConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);
  const copy = COPY[variant];
  const titleId = `${variant}-order-title`;
  const inputId = `${variant}-order-confirm`;
  const needsTypedConfirm = variant === "delete" || variant === "cancel";
  const canSubmit = needsTypedConfirm ? Boolean(canConfirm) : true;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        onClick={onDismiss}
        disabled={isSubmitting}
        aria-label="Close dialog"
      />

      <div
        className="relative z-10 w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="font-display text-xl font-bold text-neutral-900">
              {copy.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              {copy.description(
                order.order_number,
                order.full_name,
                order.pathao_consignment_id,
                order.status
              )}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-neutral-600"
            onClick={onDismiss}
            disabled={isSubmitting}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {needsTypedConfirm ? (
          <>
            <label htmlFor={inputId} className="mt-6 block text-sm font-medium text-neutral-900">
              Type{" "}
              <span className={`rounded px-1.5 py-0.5 font-mono ${copy.confirmWordClass}`}>
                {confirmWord}
              </span>{" "}
              to confirm
            </label>
            <Input
              id={inputId}
              type="text"
              value={confirmText ?? ""}
              onChange={(e) => onConfirmTextChange?.(e.target.value)}
              placeholder={confirmWord}
              className="mt-2 border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400"
              autoComplete="off"
              autoFocus
              disabled={isSubmitting}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit && !isSubmitting) {
                  e.preventDefault();
                  onConfirm();
                }
              }}
            />
          </>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            className="text-neutral-700"
            onClick={onDismiss}
            disabled={isSubmitting}
          >
            Dismiss
          </Button>
          <Button
            type="button"
            className={copy.confirmButtonClass}
            onClick={onConfirm}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {copy.loadingLabel}
              </>
            ) : (
              copy.confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
    ),
    document.body
  );
}
