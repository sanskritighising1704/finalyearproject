import { RegisterForm } from "@/components/auth/register-form"

export const metadata = {
  title: "Register - TechHub",
  description: "Create a new TechHub account",
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 px-4">
      <RegisterForm />
    </div>
  )
}
