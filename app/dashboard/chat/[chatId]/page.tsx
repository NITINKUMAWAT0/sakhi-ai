// import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'
// import { getConvexClient } from '@/lib/convex';

interface ChatPageProps {
    params: {
        chatId: Id<"chats">;
    };
}

export default async function ChatPage({ params }: ChatPageProps) {
    const { chatId } = await params;

    const {userId} = await auth();

    if(!userId){
        redirect("/");
    }

    // const convex = getConvexClient();
    
    // const initialMessages = await convex.query(api.messages.list,{chatId});

    return <div>Chat Page: {chatId}</div>
}