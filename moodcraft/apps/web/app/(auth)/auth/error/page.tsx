'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have access to this resource.',
    Verification: 'The verification link has expired or has already been used.',
    Default: 'An authentication error occurred.',
  };

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-red-400 mb-4">The Path Is Blocked</h1>
      <p className="text-muted-foreground mb-6">
        {errorMessages[error || ''] || errorMessages.Default}
      </p>
      <Button asChild variant="veil">
        <Link href="/auth/login">Return to Login</Link>
      </Button>
    </>
  );
}

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center fog-bg px-4">
      <div className="text-center max-w-md">
        <Suspense
          fallback={
            <>
              <h1 className="font-display text-3xl font-bold text-red-400 mb-4">The Path Is Blocked</h1>
              <p className="text-muted-foreground mb-6">Loading...</p>
            </>
          }
        >
          <ErrorContent />
        </Suspense>
      </div>
    </main>
  );
}
