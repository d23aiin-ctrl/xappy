"use client";

import ChatPanel from "@/components/chat/ChatPanel";

export default function SupervisorChatPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)]">
        <ChatPanel mode="healthcare-demo" />
      </div>
    </div>
  );
}
