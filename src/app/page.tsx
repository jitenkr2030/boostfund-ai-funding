export default function Home() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-6 py-24">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Your Landing Page
        </h1>
        <p className="text-lg text-muted-foreground">
          Replace this copy with your product value proposition and a short
          supporting description.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/get-started"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-primary-foreground font-medium hover:opacity-90"
          >
            Get Started
          </a>
          <a
            href="/contact"
            className="inline-flex h-11 items-center justify-center rounded-md border border-input px-5 font-medium hover:bg-accent"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </main>
  );
}