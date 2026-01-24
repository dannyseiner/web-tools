"use client";

import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  className?: string;
  text?: boolean;
  onClick?: () => void;
};

export const Logo = ({ className = "", text = true, onClick }: Props) => {
  const { push } = useRouter();

  const handleClick = () => {
    if (onClick) onClick();
    else push("/");
  };

  const renderLogoBox = () => {
    return (
      <div className="bg-linear-to-br from-primary to-orange-600 flex items-center justify-center w-9 h-9 rounded-lg shadow-2xl">
        <Zap className="w-5 h-5 text-white" />
      </div>
    );
  };

  if (text) {
    return (
      <div
        className={cn("flex items-center gap-2 cursor-pointer", className)}
        onClick={handleClick}
      >
        {renderLogoBox()}
        <span className="font-semibold text-lg text-foreground">Web Tools</span>
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-2 cursor-pointer", className)}
      onClick={handleClick}
    >
      {renderLogoBox()}
    </div>
  );
};
