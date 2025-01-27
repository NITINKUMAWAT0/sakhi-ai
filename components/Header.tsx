import { UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";

function Header() {
  return (
    <header className="border-b border-gray-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section: Logo and Menu Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open mobile navigation"
            className="md:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 focus:ring-2 focus:ring-gray-300"
            onClick={() => console.log("Mobile menu toggle clicked")} // Add your functionality here
          >
            <HamburgerMenuIcon className="h-5 w-5" />
          </Button>
          <div className="font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Chat with your Sakhi
          </div>
        </div>

        {/* Right Section: User Button */}
        <div className="flex items-center">
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "h-8 w-8 ring-2 ring-gray-200/50 ring-offset-2 rounded-full transition-shadow hover:ring-gray-300/50 focus:ring-gray-400/50",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
