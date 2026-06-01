import { LoginFormWidget } from "@/widgets/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-primary flex overflow-hidden font-sans">
      <main className="flex-1 relative flex flex-col justify-center items-center p-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-125 opacity-[0.15] pointer-events-none" 
             style={{ background: 'radial-gradient(circle at top, white 0%, transparent 60%)' }} />
        <div className="relative z-10 w-full flex justify-center">
          <LoginFormWidget />
        </div>
      </main>
    </div>
  );
}