import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="bg-card border-border w-full max-w-sm rounded-lg border p-8 shadow-lg">
        <h1 className="text-foreground mb-2 text-2xl font-bold">Ticket Generator</h1>
        <p className="text-muted-foreground mb-6 text-sm">Inicia sesión para continuar</p>
        <LoginForm />
      </div>
    </main>
  );
}
