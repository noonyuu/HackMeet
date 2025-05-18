import { Fab } from "@/components/ui/fab";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import ImageFX from "@/assets/icons/add-work-icon.jpg";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  component: Index,
});

const messages = ["作品を登録しよう！！"];

function Index() {
  const navigate = useNavigate();

  const [showBubble, setShowBubble] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    setShowBubble(true);
    setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);

    // 5秒後に非表示
    setTimeout(() => setShowBubble(false), 5000);

    // その後は定期的に表示
    const intervalId = setInterval(() => {
      setShowBubble(true);
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
      setTimeout(() => setShowBubble(false), 5000);
    }, 1000000);

    return () => clearInterval(intervalId);
  }, []);

  const { isAuthenticated, loading: authLoading } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (authLoading) {
      return;
    }

    if (isAuthenticated) {
      navigate({
        to: "/works/create",
      });
    } else {
      navigate({
        to: "/login",
      });
    }
  };

  return (
    <div className="p-2">
      <div className="h-1234">Hello from Index!</div>
      <Fab
        variant="default"
        size="lg"
        className="fixed right-4 bottom-4 z-50"
        onClick={() => {}}
      >
        <a href="/works/edit" onClick={handleClick}>
          <img src={ImageFX} alt="" className="rounded-full" />
        </a>
      </Fab>
      <div className="fixed right-4 bottom-16 z-50">
        <div className="relative">
          {showBubble && (
            <div className="animate-fade-in absolute right-0 bottom-full mb-2 w-64 rounded-lg bg-white p-4 shadow-lg">
              <div className="text-sm text-black">{messages[messageIndex]}</div>
              <div className="absolute right-4 bottom-0 h-3 w-3 translate-y-1/2 rotate-45 transform bg-white"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
