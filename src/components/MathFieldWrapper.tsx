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
          // Prevent the default line break
          (evt.target as MathfieldElement).executeCommand("plonk");
          if (onEnter) onEnter();
        }
      };

      mf.current.addEventListener("input", handleInput);
      return () => mf.current?.removeEventListener("input", handleInput);
    }
  }, [onEnter, disabled]);

  // 2. Sync value (One-way binding pattern to prevent cursor jumping)
  useEffect(() => {
    if (mf.current && mf.current.value !== value) {
      mf.current.value = value;
    }
  }, [value]);

  return (
    <math-field
      ref={mf}
      onInput={(evt) => onChange((evt.target as MathfieldElement).value)}
      style={{
        width: "100%",
        padding: "0.5rem",
        borderRadius: "0.75rem",
        border: "1px solid #333",
        backgroundColor: "#0a0a0a", // specific to your dark theme
        color: "white",
        fontSize: "1.2rem",
      }}
    >
      {value}
    </math-field>
  );
}
