"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "@/lib/cart/cart-context";
import { createOrder } from "@/lib/api/orders";
import { getStripe, createPaymentIntent } from "@/lib/api/stripe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  Lock,
  MapPin,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Loader2
} from "lucide-react";

interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// Card element styles to match the dark theme
const cardElementOptions = {
  style: {
    base: {
      color: "#e8f5e8",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: "16px",
      "::placeholder": {
        color: "#6b8e6b",
      },
    },
    invalid: {
      color: "#dc2626",
    },
  },
};

function PaymentForm({
  orderId,
  total,
  shippingForm,
  onSuccess,
  onError,
}: {
  orderId: string;
  total: number;
  shippingForm: ShippingFormData;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      onError("Payment system not ready");
      return;
    }

    setIsProcessing(true);
    onError("");

    try {
      const { clientSecret } = await createPaymentIntent(orderId);
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error("Card information is required");
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${shippingForm.firstName} ${shippingForm.lastName}`,
            email: shippingForm.email,
            phone: shippingForm.phone,
            address: {
              line1: shippingForm.address,
              city: shippingForm.city,
              state: shippingForm.state,
              postal_code: shippingForm.zipCode,
              country: shippingForm.country,
            },
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent?.status === "succeeded") {
        onSuccess();
      } else {
        throw new Error("Payment not completed");
      }
    } catch (err: any) {
      onError(err.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#e8f5e8] flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#4ade80]" />
              PAYMENT
            </h2>
            <div className="flex items-center gap-1 text-xs text-[#6b8e6b]">
              <Lock className="h-3 w-3" />
              SECURE SSL
            </div>
          </div>

          <div className="bg-[#050805] border border-[#1a2e1a] p-4">
            <div className="text-sm text-[#a3c9a3]">
              <p className="font-bold text-[#e8f5e8]">
                {shippingForm.firstName} {shippingForm.lastName}
              </p>
              <p>{shippingForm.address}</p>
              <p>{shippingForm.city}, {shippingForm.state} {shippingForm.zipCode}</p>
              <p className="text-[#6b8e6b] mt-1">{shippingForm.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#6b8e6b] font-mono text-xs">CARD DETAILS</Label>
            <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
              <CardElement options={cardElementOptions} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full h-14 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none font-black tracking-wider"
      >
        {isProcessing ? (
          <><Loader2 className="h-5 w-5 animate-spin mr-2" />PROCESSING...</>
        ) : (
          <><Lock className="h-4 w-4 mr-2" />PAY ${(total / 100).toFixed(2)}</>
        )}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { items, subtotal } = cart;
  
  const [step, setStep] = useState<"shipping" | "payment" | "processing">("shipping");
  const [shippingForm, setShippingForm] = useState<ShippingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  // Redirect if cart is empty
  if (items.length === 0 && step !== "processing") {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-[#050805]">
        <div className="max-w-[600px] mx-auto px-4 sm:px-8 text-center">
          <ShoppingBag className="h-16 w-16 text-[#1a2e1a] mx-auto mb-4" />
          <h1 className="text-2xl font-black text-[#e8f5e8] mb-2">YOUR BAG IS EMPTY</h1>
          <p className="text-[#6b8e6b] mb-6">Add some fresh ink to get started.</p>
          <Link href="/shop">
            <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black">
              SHOP FLASH
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const shipping = subtotal >= 7500 ? 0 : 699;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsProcessing(true);
      
      // Create order in database (prices calculated server-side)
      const order = await createOrder({
        items: items.map(item => ({
          product_design_id: item.product_design_id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        shipping_address: {
          first_name: shippingForm.firstName,
          last_name: shippingForm.lastName,
          email: shippingForm.email,
          phone: shippingForm.phone,
          address: shippingForm.address,
          city: shippingForm.city,
          state: shippingForm.state,
          zip_code: shippingForm.zipCode,
          country: shippingForm.country,
        },
      });
      
      setOrderId(order.id);
      setStep("payment");
      setIsProcessing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setIsProcessing(false);
      setError(err.message || "Failed to create order. Please try again.");
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    router.push(`/checkout/success?order=${orderId}`);
  };

  const steps = [
    { id: "shipping", label: "SHIPPING", icon: MapPin },
    { id: "payment", label: "PAYMENT", icon: CreditCard },
    { id: "review", label: "CONFIRM", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[#050805]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/shop">
            <Button variant="ghost" size="icon" className="text-[#6b8e6b] hover:text-[#e8f5e8]">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-black tracking-tighter text-[#e8f5e8]">CHECKOUT</h1>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4 mb-12 max-w-2xl">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id || (s.id === "payment" && step === "processing");
            const isCompleted = (s.id === "shipping" && step !== "shipping") || 
                               (s.id === "payment" && step === "processing");
            
            return (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 ${
                  isActive ? "bg-[#dc2626] text-white" : 
                  isCompleted ? "bg-[#4ade80] text-black" : 
                  "bg-[#1a2e1a] text-[#6b8e6b]"
                }`}>
                  <Icon className="h-4 w-4" />
                  <span className="font-black text-xs tracking-wider hidden sm:inline">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-[#1a2e1a] mx-2" />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Main Form */}
          <div className="lg:col-span-3">
            {step === "shipping" && (
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
                  <CardContent className="p-6 space-y-6">
                    <h2 className="text-lg font-black text-[#e8f5e8] flex items-center gap-2">
                      <Truck className="h-5 w-5 text-[#4ade80]" />
                      SHIPPING ADDRESS
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[#6b8e6b] font-mono text-xs">FIRST NAME *</Label>
                        <Input
                          value={shippingForm.firstName}
                          onChange={e => setShippingForm(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                          className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] focus:border-[#4ade80]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#6b8e6b] font-mono text-xs">LAST NAME *</Label>
                        <Input
                          value={shippingForm.lastName}
                          onChange={e => setShippingForm(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                          className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] focus:border-[#4ade80]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[#6b8e6b] font-mono text-xs">EMAIL *</Label>
                        <Input
                          type="email"
                          value={shippingForm.email}
                          onChange={e => setShippingForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                          className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] focus:border-[#4ade80]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#6b8e6b] font-mono text-xs">PHONE</Label>
                        <Input
                          type="tel"
                          value={shippingForm.phone}
                          onChange={e => setShippingForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] focus:border-[#4ade80]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#6b8e6b] font-mono text-xs">ADDRESS *</Label>
                      <Input
                        value={shippingForm.address}
                        onChange={e => setShippingForm(prev => ({ ...prev, address: e.target.value }))}
                        required
                        className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] focus:border-[#4ade80]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[#6b8e6b] font-mono text-xs">CITY *</Label>
                        <Input
                          value={shippingForm.city}
                          onChange={e => setShippingForm(prev => ({ ...prev, city: e.target.value }))}
                          required
                          className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] focus:border-[#4ade80]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#6b8e6b] font-mono text-xs">STATE *</Label>
                        <Input
                          value={shippingForm.state}
                          onChange={e => setShippingForm(prev => ({ ...prev, state: e.target.value }))}
                          required
                          className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] focus:border-[#4ade80]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#6b8e6b] font-mono text-xs">ZIP CODE *</Label>
                        <Input
                          value={shippingForm.zipCode}
                          onChange={e => setShippingForm(prev => ({ ...prev, zipCode: e.target.value }))}
                          required
                          className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] focus:border-[#4ade80]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {error && (
                  <div className="flex items-center gap-2 text-[#dc2626] text-sm bg-[#dc2626]/10 p-4 border border-[#dc2626]/30">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-14 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none font-black tracking-wider"
                >
                  {isProcessing ? (
                    <><Loader2 className="h-5 w-5 animate-spin mr-2" />CREATING ORDER...</>
                  ) : (
                    <>CONTINUE TO PAYMENT <ChevronRight className="h-5 w-5 ml-2" /></>
                  )}
                </Button>
              </form>
            )}

            {step === "payment" && orderId && stripePromise && (
              <Elements stripe={stripePromise}>
                <PaymentForm
                  orderId={orderId}
                  total={total}
                  shippingForm={shippingForm}
                  onSuccess={handlePaymentSuccess}
                  onError={setError}
                />
              </Elements>
            )}

            {step === "payment" && orderId && !stripePromise && (
              <div className="text-center py-12 text-[#dc2626]">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p className="font-bold">Payment system is not configured</p>
                <p className="text-sm text-[#6b8e6b]">Please contact support to complete your order.</p>
              </div>
            )}

            {step === "processing" && (
              <div className="text-center py-20">
                <Loader2 className="h-16 w-16 text-[#4ade80] animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-black text-[#e8f5e8] mb-2">PROCESSING ORDER</h2>
                <p className="text-[#6b8e6b]">Please don&apos;t refresh the page...</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6 sticky top-24">
              <h2 className="text-lg font-black text-[#e8f5e8] mb-6">ORDER SUMMARY</h2>
              
              <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-[#050805] border border-[#1a2e1a] overflow-hidden flex-shrink-0">
                      <OptimizedImage
                        src={item.mockup_image}
                        alt=""
                        width={64}
                        height={80}
                        className="object-cover w-full h-full"
                        transform={{ width: 64, height: 80, resize: "cover" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#e8f5e8] truncate">{item.product_name || item.design_title}</p>
                      <p className="text-xs text-[#6b8e6b]">{item.artist_name}</p>
                      <p className="text-xs text-[#6b8e6b]">{item.color} / {item.size}</p>
                      <p className="text-xs text-[#4ade80] mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-[#e8f5e8]">${((item.unit_price * item.quantity) / 100).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <Separator className="bg-[#1a2e1a] mb-6" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#a3c9a3]">
                  <span>Subtotal</span>
                  <span>${(subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#a3c9a3]">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-[#4ade80]" : ""}>
                    {shipping === 0 ? "FREE" : `$${(shipping / 100).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-[#a3c9a3]">
                  <span>Tax</span>
                  <span>${(tax / 100).toFixed(2)}</span>
                </div>
              </div>

              <Separator className="bg-[#1a2e1a] my-6" />

              <div className="flex justify-between items-center">
                <span className="font-black text-[#e8f5e8]">TOTAL</span>
                <span className="text-2xl font-black text-[#4ade80]">${(total / 100).toFixed(2)}</span>
              </div>

              {shipping === 0 && (
                <p className="text-xs text-[#4ade80] mt-4 text-center">
                  You qualify for free shipping!
                </p>
              )}

              <div className="mt-6 p-4 bg-[#050805] border border-[#1a2e1a]">
                <p className="text-xs text-[#6b8e6b] text-center">
                  <Lock className="h-3 w-3 inline mr-1" />
                  Secure checkout by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
