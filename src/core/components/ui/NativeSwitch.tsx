"use client";

import React from 'react';

interface NativeSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function NativeSwitch({ checked, onChange, disabled = false }: NativeSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer 
        items-center rounded-full border-2 border-transparent 
        transition-colors duration-300 ease-in-out focus:outline-none 
        focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black
        ${checked ? 'bg-blue-500' : 'bg-zinc-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span className="sr-only">Toggle</span>
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-[27px] w-[27px] 
          transform rounded-full bg-white shadow-md 
          transition duration-300 ease-in-out
          ${checked ? 'translate-x-[20px]' : 'translate-x-0'}
        `}
      />
    </button>
  );
}
