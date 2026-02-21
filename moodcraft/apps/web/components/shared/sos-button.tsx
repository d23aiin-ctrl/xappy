'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SOSButton() {
  return (
    <Link href="/escalation">
      <Button
        variant="destructive"
        size="sm"
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg h-12 w-12 p-0"
        title="Get Help"
      >
        <AlertTriangle className="w-5 h-5" />
      </Button>
    </Link>
  );
}
