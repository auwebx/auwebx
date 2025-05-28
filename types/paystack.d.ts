// types/paystack.d.ts

interface PaystackCustomField {
  display_name: string;
  variable_name: string;
  value: string;
}

interface PaystackMetadata {
  custom_fields: PaystackCustomField[];
}

interface PaystackPopSetupOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  metadata?: PaystackMetadata;
  callback: (response: { reference: string }) => void;
  onClose?: () => void;
}

interface PaystackPop {
  setup(options: PaystackPopSetupOptions): {
    openIframe: () => void;
  };
}

interface Window {
  PaystackPop: PaystackPop;
}
