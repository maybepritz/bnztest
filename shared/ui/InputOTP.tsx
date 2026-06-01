"use client";

import { OTPInput } from "input-otp";

interface InputOTPProps {
  maxLength?: number;
  value: string;
  onChange: (value: string) => void;
}

export function InputOTP({ maxLength = 6, value, onChange }: InputOTPProps) {
  return (
    <OTPInput
      maxLength={maxLength}
      value={value}
      onChange={onChange}
      render={({ slots }) => (
        <div className="flex gap-2 w-full justify-center">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className={`
                relative flex w-12 h-14 items-center justify-center text-2xl font-bold rounded-lg border transition-all text-primary
                ${slot.isActive ? 'border-primary bg-surface-hover shadow-elevated' : 'border-border bg-surface-secondary'}
              `}
            >
              {slot.char}
              {slot.hasFakeCaret && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center animate-pulse">
                  <div className="w-px h-6 bg-primary" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    />
  );
}
