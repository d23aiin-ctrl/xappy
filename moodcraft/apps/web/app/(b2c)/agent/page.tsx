'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to AI Twin - Agent functionality has been merged into AI Twin
export default function AgentRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ai-twin');
  }, [router]);

  return (
    <div className="min-h-screen bg-midnight-950 flex items-center justify-center">
      <div className="text-center">
        <div className="oracle-spinner mx-auto mb-4" />
        <p className="text-gray-400">Redirecting to AI Twin...</p>
      </div>
    </div>
  );
}
