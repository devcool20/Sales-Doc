import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] py-20">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-gray-900 border border-gray-700 shadow-2xl",
              headerTitle: "text-white text-2xl",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "bg-gray-800 border border-gray-600 text-white hover:bg-gray-700 transition-colors",
              formFieldLabel: "text-white",
              formFieldInput: "bg-gray-800 border border-gray-600 text-white focus:border-blue-500",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white transition-colors",
              footerActionLink: "text-blue-400 hover:text-blue-300",
              dividerLine: "bg-gray-600",
              dividerText: "text-gray-400",
              formResendCodeLink: "text-blue-400 hover:text-blue-300",
              otpCodeFieldInput: "bg-gray-800 border border-gray-600 text-white",
              identityPreviewText: "text-gray-300",
              identityPreviewEditButton: "text-blue-400 hover:text-blue-300"
            }
          }}
        />
      </div>
    </div>
  )
} 