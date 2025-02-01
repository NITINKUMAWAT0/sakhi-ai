import { Doc, Id } from "@/convex/_generated/dataModel";
import { NavigationContext } from "@/lib/NavigationProvider";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { Button } from "./ui/button";
import { TrashIcon } from "@radix-ui/react-icons";

interface ChatRowProps {
  chat: Doc<"chats">;
  onDelete: (id: Id<"chats">) => void;
}

function ChatRow({ chat, onDelete }: ChatRowProps) {
  const router = useRouter();
  const { closeMobileNav } = useContext(NavigationContext);

  const handleClick = () => {
    router.push(`/dashboard/chat/${chat._id}`);
    closeMobileNav?.(); // Close mobile navigation if applicable
  };

  return (
    <div
      className="group rounded-xl border border-gray-200/30 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
      onClick={handleClick}
    >
      <div className="p-4">
      <div className="flex justify-between items-start group">
  <span>{chat.title}</span> {/* Display chat title */}
  <Button
    variant="ghost"
    size="icon"
    className="opacity-0 group-hover:opacity-100 mr-2 -mt-2 ml-2 transition-opacity"
    onClick={(e) => {
      e.stopPropagation(); // Prevent the chat row click event
      onDelete(chat._id);
    }}
  >
    <TrashIcon className="h-4 w-4 text-gray-950 hover:text-red-500 transition-colors" />
  </Button>
</div>
        {/* Uncomment and implement last message display if needed */}
        {/* {lastMessage && (
          <p className="text-xs text-gray-400 mt-1.5 font-medium">
            <TimeAgo date={lastMessage.createdAt} />
          </p>
        )} */}
      </div>
    </div>
  );
}

export default ChatRow;