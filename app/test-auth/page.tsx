import { auth } from "@/lib/auth/server"

export default async function TestAuthPage() {
  const session = await auth.getSession()
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Authentication</h1>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">Session Status:</h2>
        {session?.user ? (
          <div>
            <p>✅ Authenticated</p>
            <p>User ID: {session.user.id}</p>
            <p>Email: {session.user.email || "N/A"}</p>
          </div>
        ) : (
          <p>❌ Not authenticated</p>
        )}
      </div>
      <div className="mt-4">
        <a href="/api/auth/sign-in" className="text-blue-500 hover:underline">
          Sign In
        </a>
        {" | "}
        <a href="/api/auth/sign-up" className="text-blue-500 hover:underline">
          Sign Up
        </a>
      </div>
    </div>
  )
}