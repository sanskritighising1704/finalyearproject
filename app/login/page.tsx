import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Login - TechHub",
  description: "Login to your TechHub account",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 px-4">
      <LoginForm />
    </div>
  )
}
