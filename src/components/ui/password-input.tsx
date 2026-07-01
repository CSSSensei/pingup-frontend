"use client";

import { forwardRef, useState } from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { IconEye, IconEyeOff } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  function PasswordInput({ className, ...props }, ref) {
    const [show, setShow] = useState(false);
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={show ? "text" : "password"}
          className={cn("pr-11", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Скрыть пароль" : "Показать пароль"}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted transition-colors hover:text-fg-2"
        >
          {show ? <IconEyeOff size={18} /> : <IconEye size={18} />}
        </button>
      </div>
    );
  },
);
