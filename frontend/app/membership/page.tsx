import { MembershipForm } from "@/components/membership-form"
import { Navbar } from "@/components/navbar"

export default function MembershipPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Library Membership</h1>
        <MembershipForm />
      </main>
    </div>
  )
}