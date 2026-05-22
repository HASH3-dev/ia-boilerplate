import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-muted">
      <main className="flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <div className="max-w-xl w-full mx-auto space-y-12">

          <div className="space-y-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <span className="size-1.5 rounded-full bg-green-500" />
                Ready to build
              </div>
              <ThemeToggle />
            </div>

            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-foreground leading-[1.05]">
              Your next<br />
              <span className="text-muted-foreground">great app.</span>
            </h1>

            <p className="text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Next.js 15 + NestJS monorepo, fully wired. Just start building.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/items"
              className="group card-elevated flex flex-col gap-2 rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-ring/30"
            >
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm">
                  ⊞
                </div>
                <span className="text-muted-foreground group-hover:translate-x-0.5 transition-transform text-sm">→</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Items CRUD</p>
                <p className="text-xs text-muted-foreground mt-0.5">Create, read, update, delete example</p>
              </div>
            </Link>

            <div className="card-elevated flex flex-col gap-2 rounded-xl border border-dashed bg-muted/50 p-5 opacity-60 cursor-not-allowed">
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-lg bg-border flex items-center justify-center text-muted-foreground text-sm">
                  ⚿
                </div>
                <span className="text-[0.65rem] font-medium text-muted-foreground bg-border rounded px-1.5 py-0.5">soon</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Authentication</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">Firebase Auth integration</p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Edit{' '}
            <code className="font-mono bg-border/60 px-1.5 py-0.5 rounded text-foreground/70">
              apps/web/src/app/page.tsx
            </code>{' '}
            to get started
          </p>

        </div>
      </main>
    </div>
  );
}
