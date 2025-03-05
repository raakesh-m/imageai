import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn appearance={{
        elements: {
          formButtonPrimary: "bg-black hover:bg-gray-800 text-sm normal-case",
        },
      }} />
    </div>
  );
} 