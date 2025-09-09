import Link from "next/link"

export default function NotFound(): JSX.Element {
  return (
    <div className="min-h-[60vh] grid place-items-center px-6">
      <div className="border bg-card rounded-xl p-6 shadow-sm text-center max-w-md w-full">
        <h1 className="text-4xl font-heading font-bold tracking-tight mb-4">
          Page not found
        </h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            aria-label="Go to homepage"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Go Home
          </Link>
          <Link
            href="/#dashboard"
            aria-label="Jump to Dashboard section"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}