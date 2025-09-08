"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Toaster, toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPending(true);
    try {
      const { error } = await authClient.signUp.email({
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });

      if (error?.code) {
        const map: Record<string, string> = {
          USER_ALREADY_EXISTS: "Email already registered",
        };
        toast.error(map[error.code] || "Registration failed");
        setPending(false);
        return;
      }

      toast.success("Account created! Check your email to verify.");
      router.push("/login?registered=true");
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-xl border p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold font-heading">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-2">Join BoostFund AI</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                disabled={pending}
                className="mt-1 w-full rounded-lg border border-input bg-surface-1 px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-ring focus:border-ring disabled:opacity-60"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={pending}
                className="mt-1 w-full rounded-lg border border-input bg-surface-1 px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-ring focus:border-ring disabled:opacity-60"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="off"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={pending}
                className="mt-1 w-full rounded-lg border border-input bg-surface-1 px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-ring focus:border-ring disabled:opacity-60"
                placeholder="Create a strong password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="off"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={pending}
                className="mt-1 w-full rounded-lg border border-input bg-surface-1 px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-ring focus:border-ring disabled:opacity-60"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="mt-2 w-full rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {pending ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:underline font-medium">Sign in</a>
            </p>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}