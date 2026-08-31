import { auth } from "@clerk/nextjs/server"

export default async function TestAuthPage() {
  const { userId, sessionClaims } = await auth()
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Authentication</h1>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">Session Status:</h2>
        {userId ? (
          <div>
            <p>✅ Authenticated</p>
            <p>User ID: {userId}</p>
            <p>Email: {typeof (sessionClaims as any)?.email === "string" ? (sessionClaims as any).email : "N/A"}</p>
          </div>
        ) : (
          <p>❌ Not authenticated</p>
        )}
      </div>
      <div className="mt-4">
        <a href="/sign-in" className="text-blue-500 hover:underline">
          Sign In
        </a>
        {" | "}
        <a href="/sign-up" className="text-blue-500 hover:underline">
          Sign Up
        </a>
      </div>
    </div>
  )
}