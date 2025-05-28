// types/global.d.ts
import type { PaystackPop } from "@types/paystack__inline-js";

declare global {
  interface Window {
    PaystackPop: PaystackPop;
  }
}
