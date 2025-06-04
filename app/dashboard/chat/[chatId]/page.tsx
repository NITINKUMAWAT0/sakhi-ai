import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'
import { getConvexClient } from '@/lib/convex';
import ChatInterface from '@/components/ChatInterface';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageParams {
    chatId: string;
}

export default async function ChatPage({
    params,
}: {
    params: PageParams;
}) {
    const chatId = params.chatId as Id<"chats">;

    const { userId } = await auth();

    if (!userId) {
        redirect("/");
    }
    try {
        const convex = getConvexClient();

        const initialMessages = await convex.query(api.messages.list, { chatId });

        return (
            <div className="flex-1 overflow-hidden">
                <ChatInterface chatId={chatId} initialMessages={initialMessages} />
            </div>
        )
    } catch (error) {
        console.error("Error loading chat:", error);
        redirect("/dashboard");
    }
}