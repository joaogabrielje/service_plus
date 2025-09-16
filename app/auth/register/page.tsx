import { RegisterForm } from "@/components/register-form"
import { Clock } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <Clock className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">AttendanceHub</span>
          </Link>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
