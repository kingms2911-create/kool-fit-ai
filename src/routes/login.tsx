import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Dumbbell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore, roleHome, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } from "@/lib/fitpulse-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Kool Fit AI Gym Management" },
      {
        name: "description",
        content:
          "Sign in to Kool Fit AI to manage your gym finances, trainer plan approvals and member workouts in one place.",
      },
      { property: "og:title", content: "Sign in — Kool Fit AI Gym Management" },
      {
        property: "og:description",
        content: "One login for gym owners, trainers and members of Kool Fit AI.",
      },
    ],
  }),
  component: LoginPage,
});





function LoginPage() {
  const { signIn, guestSignIn } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const attempt = (mail: string, pass: string) => {
    const res = signIn(mail, pass);
    if (!res.ok || !res.user) return setError(res.error ?? "Unable to sign in");
    setError("");
    void navigate({ to: roleHome[res.user.role] });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/15 text-primary glow-ring">
            <Dumbbell className="size-6" />
          </span>
          <h1 className="mt-4 text-3xl font-semibold">
            Kool <span className="text-gradient-emerald">Fit AI</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gym management for owners, trainers and members.
          </p>
        </div>

        <form
          className="glass rounded-3xl p-6"
          onSubmit={(e) => {
            e.preventDefault();
            attempt(email, password);
          }}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gym.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="h-10 w-full">
              Sign In <ArrowRight className="size-4" />
            </Button>
          </div>

          <div className="mt-4 flex flex-col gap-2 text-center text-sm">
            <Link to="/signup" className="text-primary hover:underline">
              Create account (Gym Owner or Member)
            </Link>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full border-border/70 bg-secondary"
              onClick={() => {
                const res = guestSignIn();
                if (!res.ok) return setError(res.error ?? "Demo unavailable");
                setError("");
                void navigate({ to: "/member-portal" });
              }}
            >
              Explore Demo / Guest View
            </Button>
          </div>

        </form>
      </div>

    </div>
  );
}
