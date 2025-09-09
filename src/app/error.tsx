"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] grid place-items-center px-6">
      <div className="border bg-card rounded-xl p-6 shadow-sm max-w-md w-full">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-card-foreground">
              Something went wrong
            </h1>
            <div className="text-muted-foreground text-sm" aria-live="polite">
              An unexpected error occurred. Please try again or return to the homepage.
            </div>
          </div>

          {error.digest && (
            <div className="text-xs text-muted-foreground">
              Error ID: {error.digest}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring transition-opacity"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </button>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center border bg-secondary text-secondary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring transition-opacity"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}