"use client";

import { useEffect, useRef } from "react";
import "mathlive";
import type { MathfieldElement } from "mathlive";

interface MathFieldWrapperProps {
  value: string;
  onChange: (val: string) => void;
  onEnter?: () => void;
  disabled?: boolean;
}

export default function MathFieldWrapper({
  value,
  onChange,
  onEnter,
  disabled = false,
}: MathFieldWrapperProps) {
  const mf = useRef<MathfieldElement>(null);

  // 1. Initialize settings
  useEffect(() => {
    if (mf.current) {
      mf.current.smartFence = true;
      mf.current.readOnly = disabled; // Handle disabled state

      // Listen for the "Enter" key
      const handleInput = (evt: Event) => {
        if ((evt as InputEvent).inputType === "insertLineBreak") {
          if (onEnter) onEnter();
        }
      };

      mf.current.addEventListener("input", handleInput);
      return () => mf.current?.removeEventListener("input", handleInput);
    }
  }, [onEnter, disabled]);

  useEffect(() => {
    if (mf.current && mf.current.value !== value) {
      mf.current.value = value;
    }
  }, [value]);

  return (
    <div className="w-full" onClick={() => mf.current?.focus()}>
      <math-field
        className="[&::part(menu-toggle)]:hidden"
        ref={mf}
        onInput={(evt) => onChange((evt.target as MathfieldElement).value)}
        style={{
          width: "100%",
          padding: "0.75rem",
          borderRadius: "0.75rem",
          border: "1px solid #333",
          backgroundColor: "#0a0a0a",
          color: "white",
          fontSize: "1.2rem",
        }}
      >
        {value}
      </math-field>
    </div>
  );
}
