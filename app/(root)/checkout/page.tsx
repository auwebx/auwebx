"use client";

import { useCart } from "@/app/context/CartContext";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Replace with your actual key
const PAYSTACK_PUBLIC_KEY = "pk_test_79f6e1f1b469ad67530a82756225e84c4e924a6b";
const WHATSAPP_NUMBER = "+2347043619930";

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"paystack" | "bank" | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    fullName: "",
    phoneNumber: "",
    paymentEvidence: null as File | null,
  });
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

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

      callback: function (response: { reference: string }) {
        toast.success("Payment successful!");

        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;

        const payload = {
          user_id: user?.id || null,
          email,
          amount: amountInKobo,
          currency: "NGN",
          reference: response.reference,
          courses: cart.map((item) => item.title).join(", "),
          status: "success",
        };

        (async () => {
          try {
            await fetch("https://ns.auwebx.com/api/payments/save_payment.php", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });

            for (const item of cart) {
              await fetch("https://ns.auwebx.com/api/enrollments/create.php", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  user_id: user?.id,
                  course_id: item.id,
                }),
              });
            }

            router.push(`/thank-you?ref=${response.reference}`);
          } catch (error) {
            console.error("Error saving payment or enrollments:", error);
            toast.error("Payment saved, but enrollment failed.");
          }
        })();
      },

      onClose: function () {
        toast("Payment window closed.");
      },
    });

    handler.openIframe();
  };

  const handleBankTransferClick = () => {
    if (!email) return toast.error("Enter your email.");
    setShowBankForm(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (images only)
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file (PNG, JPG, etc.)");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setBankFormData(prev => ({ ...prev, paymentEvidence: file }));
      toast.success("Payment evidence selected!");
    }
  };

  const uploadPaymentEvidence = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('evidence', file);
    
    try {
      const response = await fetch('https://ns.auwebx.com/api/payments/upload_evidence.php', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.filename;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Evidence upload error:', error);
      return null;
    }
  };

  const generateWhatsAppMessage = (reference: string) => {
    const coursesList = cart.map(item => item.title).join(', ');
    const message = `Hi! I just completed a bank transfer for course enrollment:

📚 *Course(s):* ${coursesList}
💰 *Amount:* ₦${total.toLocaleString()}
📧 *Email:* ${email}
👤 *Full Name:* ${bankFormData.fullName}
📱 *Phone:* ${bankFormData.phoneNumber}
🔗 *Reference:* ${reference}

Payment evidence has been uploaded for verification. Please confirm my enrollment. Thank you! 🎓`;

    return encodeURIComponent(message);
  };

  const handleBankTransferSubmit = async () => {
    if (!bankFormData.fullName || !bankFormData.phoneNumber || !bankFormData.paymentEvidence) {
      return toast.error("Please fill all fields and upload payment evidence.");
    }

    try {
      setSubmitting(true);
      setUploadingEvidence(true);

      // Upload payment evidence
      const evidenceFilename = await uploadPaymentEvidence(bankFormData.paymentEvidence);
      
      if (!evidenceFilename) {
        toast.error("Failed to upload payment evidence. Please try again.");
        return;
      }

      setUploadingEvidence(false);

      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const reference = `bank-${Date.now()}`;

      // Save payment record with pending status
      const payload = {
        user_id: user?.id || null,
        email,
        amount: amountInKobo,
        currency: "NGN",
        reference,
        courses: cart.map((item) => item.title).join(", "),
        status: "pending",
        payment_method: "bank_transfer",
        full_name: bankFormData.fullName,
        phone_number: bankFormData.phoneNumber,
        evidence_filename: evidenceFilename,
      };

      await fetch("https://ns.auwebx.com/api/payments/save_payment.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Generate WhatsApp message and open WhatsApp
      const whatsappMessage = generateWhatsAppMessage(reference);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${whatsappMessage}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');

      toast.success("Payment submitted successfully! WhatsApp opened for confirmation.");
      
      // Redirect to thank you page
      setTimeout(() => {
        router.push(`/thank-you?ref=${reference}&type=bank`);
      }, 2000);

    } catch (error) {
      console.error("Error submitting bank transfer:", error);
      toast.error("Failed to submit bank transfer. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadingEvidence(false);
    }
  };

  const resetBankForm = () => {
    setShowBankForm(false);
    setBankFormData({
      fullName: "",
      phoneNumber: "",
      paymentEvidence: null,
    });
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {/* Cart Items */}
        <ul className="space-y-4 mb-6">
          {cart.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-4 border p-3 rounded"
            >
              <Image
                src={`https://ns.auwebx.com/api/courses/${item.thumbnail}`}
                alt={item.title || "Course"}
                width={64}
                height={64}
                className="rounded"
              />
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-gray-600">
                  ₦{Number(item.price).toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* Email Input */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-md mb-4"
          placeholder="you@example.com"
          required
        />

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Payment Method:</h2>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="payment"
                value="paystack"
                checked={method === "paystack"}
                onChange={() => {
                  setMethod("paystack");
                  setShowBankForm(false);
                }}
                className="w-4 h-4 text-green-600"
              />
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-xl">💳</span>
                <span className="font-medium">Pay with Paystack (Instant)</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="payment"
                value="bank"
                checked={method === "bank"}
                onChange={() => setMethod("bank")}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex items-center gap-2">
                <span className="text-blue-600 text-xl">🏦</span>
                <span className="font-medium">Bank Transfer (Manual Verification)</span>
              </div>
            </label>
          </div>
        </div>

        {/* Bank Transfer Instructions */}
        {method === "bank" && !showBankForm && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏦</span>
              <h3 className="font-bold text-lg text-blue-900">Bank Transfer Details</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Bank:</span>
                  <span className="font-bold text-blue-800">OPAY</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Account Name:</span>
                  <span className="font-bold text-blue-800">Abdulahi Umar Abubakar</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Account Number:</span>
                  <span className="font-bold text-blue-800">7043619930</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Amount:</span>
                  <span className="font-bold text-green-600 text-lg">
                    ₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-md border-l-4 border-blue-500 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Next Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Make the transfer to the account details above</li>
                <li>Take a screenshot or photo of your payment receipt</li>
                <li>Click Continue below to upload your payment evidence</li>
                <li>We will verify and activate your enrollment within 24 hours</li>
              </ol>
            </div>
          </div>
        )}

        {/* Bank Transfer Form */}
        {method === "bank" && showBankForm && (
          <div className="bg-white p-6 rounded-lg border-2 border-blue-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📄</span>
                <h3 className="font-bold text-lg text-blue-900">Upload Payment Evidence</h3>
              </div>
              <button
                onClick={resetBankForm}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankFormData.fullName}
                  onChange={(e) => setBankFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={bankFormData.phoneNumber}
                  onChange={(e) => setBankFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+234 xxx xxx xxxx"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Payment Evidence <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                    id="evidence-upload"
                  />
                  <label htmlFor="evidence-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <div className="text-4xl">📷</div>
                      <div className="text-blue-600 font-medium">
                        {bankFormData.paymentEvidence 
                          ? `Selected: ${bankFormData.paymentEvidence.name}`
                          : "Click to upload payment receipt"
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        Supported: PNG, JPG, JPEG (Max: 5MB)
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {uploadingEvidence && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span>Uploading evidence...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Total and Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold text-gray-800">
            Total: <span className="text-green-600">
              ₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex gap-3">
            {method === "paystack" && (
              <button
                onClick={payWithPaystack}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                💳 Pay with Paystack
              </button>
            )}

            {method === "bank" && !showBankForm && (
              <button
                onClick={handleBankTransferClick}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🏦 Continue with Bank Transfer
              </button>
            )}

            {method === "bank" && showBankForm && (
              <button
                onClick={handleBankTransferSubmit}
                disabled={submitting || uploadingEvidence}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:transform-none disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "🚀 Submit & Open WhatsApp"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Hidden Paystack HTML Form */}
        <form
          id="paystack-form"
          method="POST"
          action="https://checkout.paystack.com"
          hidden
        >
          <input type="hidden" name="key" value={PAYSTACK_PUBLIC_KEY} />
          <input type="hidden" name="email" value={email} />
          <input
            type="hidden"
            name="amount"
            value={amountInKobo.toString()}
          />
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
      </div>
    </>
  );
}