import { createFileRoute, Link } from "@tanstack/react-router";

import github from "@/assets/icons/github.svg";
import google from "@/assets/icons/google.svg";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const HOST_URL = import.meta.env.VITE_HOST_URL || "";
  const handleButtonClick = (provider: string) => {
    window.location.href =
      HOST_URL + "api/v1/auth/" + provider + "?redirect_path=/";
  };

  return (
    <section className="flex flex-col gap-8 pt-8">
      <div className="font-main text-center text-xl">新規登録</div>
      <div className="flex flex-col gap-y-3 rounded-md border border-gray-300 bg-white px-8">
        <div className="flex flex-col gap-3 pt-16">
          <Button
            variant="sns"
            size="lg"
            icon
            onClick={() => handleButtonClick("google")}
          >
            <img src={google} alt="google icon" className="size-4" />
            Googleで新規登録
          </Button>
          <Button
            variant="sns"
            size="lg"
            icon
            onClick={() => handleButtonClick("github")}
          >
            <img src={github} alt="github icon" className="size-4" />
            GitHubで新規登録
          </Button>
        </div>
        <div className="flex flex-col gap-y-3 py-4">
          <div className="text-center">
            <Link to="/login">ログインはこちら</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
