"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Toaster, toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("registered") === "true") {
      toast.success("Account created! Please verify your email before logging in.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
        callbackURL: "/"
      });

      if (error?.code) {
        toast.error("Invalid email or password. Please make sure you have already registered an account and try again.");
        setPending(false);
        return;
      }

      // Redirect handled by authClient
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      setPending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <div className="text-center">
            <h1 className="text-xl font-semibold">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={pending}
                className="w-full rounded-md border bg-surface-1 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)] disabled:opacity-60"
                aria-invalid={false}
                aria-busy={pending}
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="off"
                value={formData.password}
                onChange={handleChange}
                disabled={pending}
                className="w-full rounded-md border bg-surface-1 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)] disabled:opacity-60"
                aria-invalid={false}
                aria-busy={pending}
              />
            </div>

            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={pending}
                className="h-4 w-4 rounded border border-border bg-surface-1 text-primary focus:ring-2 focus:ring-[var(--color-ring)]"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-muted-foreground">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-busy={pending}
            >
              {pending ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a href="/register" className="text-primary underline">
                Create an account
              </a>
            </p>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}