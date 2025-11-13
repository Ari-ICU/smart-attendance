"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="w-4 h-4" />,
        info: <InfoIcon className="w-4 h-4" />,
        warning: <TriangleAlertIcon className="w-4 h-4" />,
        error: <OctagonXIcon className="w-4 h-4" />,
        loading: <Loader2Icon className="w-4 h-4 animate-spin" />,
      }}
      style={
        {
          "--success-bg": "var(--green-100)",
          "--success-text": "var(--green-800)",
          "--error-bg": "var(--red-100)",
          "--error-text": "var(--red-800)",
          "--warning-bg": "var(--yellow-100)",
          "--warning-text": "var(--yellow-800)",
          "--info-bg": "var(--blue-100)",
          "--info-text": "var(--blue-800)",
          "--loading-bg": "var(--gray-100)",
          "--loading-text": "var(--gray-800)",
          "--border-radius": "var(--radius)",
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
