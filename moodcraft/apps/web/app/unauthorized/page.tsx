'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center fog-bg px-4">
      <div className="text-center max-w-md">
        <ShieldX className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="font-display text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          This chamber of the labyrinth is not meant for you. Your role does not grant passage here.
        </p>
        <Button asChild variant="veil">
          <Link href="/dashboard">Return to Your Path</Link>
        </Button>
      </div>
    </main>
  );
}
