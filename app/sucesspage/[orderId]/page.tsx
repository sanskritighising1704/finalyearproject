"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"

// Helper function to decode base64
export function base64Decode(base64:string) {
  if (!base64) {
    console.error("Base64 string is null or undefined");
    return null;
  }
  try {
    const standardBase64 = base64.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(standardBase64);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error decoding base64 string:", error);
    return null;
  }
}

export default function PaymentSuccessPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [verificationError, setVerificationError] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState<any>(null)

  useEffect(() => {
    verifyPaymentAndUpdateStatus()
  }, [])

  const verifyPaymentAndUpdateStatus = async () => {
    try {
      // For eSewa: Decode the data parameter
      const token = searchParams.get("data")
      console.log(token)
      const decoded = token ? base64Decode(token) : null

      console.log(decoded,"decoded")
      
      // Get order ID - prioritize direct query param, then decoded data
      let orderId:any = params.orderId
      
      // Clean orderId if it contains extra parameters
      if (orderId && orderId.includes("?")) {
        orderId = orderId.split("?")[0]
      }
      
      // Fallback to decoded transaction_uuid if no direct orderId
      if (!orderId && decoded?.transaction_uuid) {
        orderId = decoded.transaction_uuid
      }

      if (!orderId) {
        setIsLoading(false)
        setVerificationError(true)
        return
      }

      // Check if it's Khalti payment
      const isKhalti = searchParams.get("pidx") !== null
      const pidx = searchParams.get("pidx")
      
      // Get amount
      const rawAmount = 
        decoded?.total_amount || 
        searchParams.get("total_amount") || 
        searchParams.get("amount")
      const total_amount = isKhalti ? Number(rawAmount) / 100 : Number(rawAmount)

      // Verify payment with backend
      const response = await apiClient.post<any>("/esewa/payment-status", {
        orderId,
        pidx: pidx || undefined,
        payment_gateway: isKhalti ? "khalti" : "esewa",
        status: "SUCCESS",
      })

      setIsLoading(false)

      if (response.status === "COMPLETED") {
        setPaymentStatus("COMPLETED")
        setTransactionDetails({
          orderId,
          amount: total_amount,
          paymentMethod: isKhalti ? "Khalti" : "eSewa",
          transactionId: pidx || decoded?.transaction_code || orderId,
        })
      } else {
        // Redirect to failure page if payment verification failed
        router.push(`/payment/failure?orderId=${orderId}`)
      }
    } catch (error: any) {
      console.error("Error confirming payment:", error)
      setIsLoading(false)
      setVerificationError(true)
      
      if (error.response && error.response.status === 400) {
        const orderId = searchParams.get("orderId")
        if (orderId) {
          router.push(`/payment/failure?orderId=${orderId}`)
        }
      }
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center space-y-4">
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Verifying Payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Error state - when can't verify the payment status
  if (verificationError) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Oops! Error occurred on confirming payment</h1>
              <h2 className="text-lg text-muted-foreground">We will resolve it soon.</h2>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800 text-left space-y-2">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Your transaction is being processed, but we couldn't verify its status.
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                If the amount was deducted from your account, please contact our support team.
              </p>
              <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Reference ID:</strong>{" "}
                  {searchParams.get("orderId") || 
                   searchParams.get("pidx") || 
                   searchParams.get("transaction_uuid") || 
                   "Unknown"}
                </p>
              </div>
            </div>

            <Button onClick={() => router.push("/")} className="w-full">
              Go to Homepage
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Success state - only shown for confirmed successful payments
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground">
              Thank you for your payment. Your transaction was successful.
            </p>
          </div>

          {transactionDetails && (
            <div className="bg-secondary/50 p-6 rounded-lg text-left space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2">Transaction Details</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-semibold">NPR {transactionDetails.amount?.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono text-xs font-semibold break-all">
                    {transactionDetails.orderId}
                  </span>
                </div>
                
                {paymentStatus === "COMPLETED" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-semibold">{transactionDetails.paymentMethod}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        Completed
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span className="font-mono text-xs break-all">
                        {transactionDetails.transactionId}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => router.push(`/orders/${transactionDetails?.orderId}`)} 
              className="flex-1"
            >
              View Order
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/")} 
              className="flex-1"
            >
              Go to Homepage
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}