"use client";

import { useCart } from "@/app/context/CartContext";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Replace with your actual key
const PAYSTACK_PUBLIC_KEY = "pk_test_79f6e1f1b469ad67530a82756225e84c4e924a6b";

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"paystack" | "bank" | "">("");
  const [submitting, setSubmitting] = useState(false);

  const total = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const amountInKobo = total * 100;

  const payWithPaystack = () => {
  if (!email) return toast.error("Enter your email.");
  if (!window.PaystackPop || typeof window.PaystackPop.setup !== "function") {
    return toast.error("Paystack SDK not loaded. Try refreshing the page.");
  }

const handler = window.PaystackPop.setup({
  key: PAYSTACK_PUBLIC_KEY,
  email,
  amount: amountInKobo,
  currency: "NGN",
  ref: `ref-${Date.now()}`,
  metadata: {
    custom_fields: [
      {
        display_name: "Courses",
        variable_name: "courses",
        value: cart.map((item) => item.title).join(", "),
      },
    ],
  },
  callback: async function (response: { reference: string }) {
    toast.success("Payment successful!");

    // 👇🏽 NEW: Save to backend
    try {
      const payload = {
        email,
        amount: amountInKobo,
        currency: "NGN",
        reference: response.reference,
        courses: cart.map((item) => item.title).join(", "),
        status: "success",
      };

      const res = await fetch("https://ns.auwebx.com/api/payments/save_payment.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("❌ Failed to save payment on server. Status:", res.status);
        toast.error("Payment saved, but server rejected the record.");
      }
    } catch (err) {
      console.error("❌ Exception while saving payment:", err);
      toast.error("Payment saved, but could not reach server.");
    }

    // 👇🏽 Redirect
    router.push(`/thank-you?ref=${response.reference}`);
  },

  onClose: function () {
    toast("Payment window closed.");
  },
});

handler.openIframe(); // VERY IMPORTANT
  }

  const handleBankTransfer = async () => {
    if (!email) return toast.error("Enter your email.");
    try {
      setSubmitting(true);
      toast.success("Marked for manual review.");
      router.push("/thank-you");
    } catch {
      toast.error("Failed to submit bank transfer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <ul className="space-y-4 mb-6">
          {cart.map((item) => (
            <li key={item.id} className="flex items-center gap-4 border p-3 rounded">
              <Image
                src={`https://ns.auwebx.com/api/courses/${item.thumbnail}`}
                alt={item.title || "Course"}
                width={64}
                height={64}
                className="rounded"
              />
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-gray-600">₦{Number(item.price).toFixed(2)}</p>
              </div>
            </li>
          ))}
        </ul>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-md mb-4"
          placeholder="you@example.com"
          required
        />

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Select Payment Method:</h2>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment"
              value="paystack"
              checked={method === "paystack"}
              onChange={() => setMethod("paystack")}
            />
            Pay with Paystack
          </label>
          <label className="flex items-center gap-2 mt-2">
            <input
              type="radio"
              name="payment"
              value="bank"
              checked={method === "bank"}
              onChange={() => setMethod("bank")}
            />
            Pay via Bank Transfer
          </label>
        </div>

        {method === "bank" && (
          <div className="bg-gray-50 p-4 rounded border mb-6">
            <h3 className="font-semibold mb-2 text-lg">Bank Transfer Instructions</h3>
            <ul className="text-sm text-gray-700 mt-2 space-y-1">
              <li><strong>Bank:</strong> Zenith Bank</li>
              <li><strong>Account Name:</strong> AUWEBx Academy</li>
              <li><strong>Account Number:</strong> 1234567890</li>
              <li>
                <strong>Amount:</strong> ₦
                {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </li>
            </ul>
            <p className="mt-3 text-sm text-gray-600">
              After transferring, click below to notify us for verification and enrollment.
            </p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">
            Total: ₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>

          {method === "paystack" ? (
            <>
              <button
                onClick={payWithPaystack}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition"
              >
                Pay with Paystack
              </button>

              {/* Hidden Paystack HTML Form */}
              <form
                id="paystack-form"
                method="POST"
                action="https://checkout.paystack.com"
                hidden
              >
                <input type="hidden" name="key" value={PAYSTACK_PUBLIC_KEY} />
                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="amount" value={amountInKobo.toString()} />
                <input type="hidden" name="currency" value="NGN" />
                <input
                  type="hidden"
                  name="metadata"
                  value={JSON.stringify({
                    custom_fields: [
                      {
                        display_name: "Cart Courses",
                        variable_name: "courses",
                        value: cart.map((item) => item.title).join(", "),
                      },
                    ],
                  })}
                />
              </form>
            </>
          ) : method === "bank" ? (
            <button
              onClick={handleBankTransfer}
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md disabled:opacity-50 transition"
            >
              {submitting ? "Submitting..." : "Mark as Paid"}
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}
