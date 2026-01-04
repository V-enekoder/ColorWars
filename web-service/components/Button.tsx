import type { ComponentChildren } from "preact";

export interface ButtonProps {
  id?: string;
  onClick?: () => void;
  children?: ComponentChildren;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function Button({ type = "button", ...props }: ButtonProps) { // Valor por defecto: "button"
  return (
    <button
      type={type}
      {...props}
      class="px-2 py-1 border-gray-500 border-2 rounded-sm bg-white hover:bg-gray-200 transition-colors"
    >
      {props.children}
    </button>
  );
}
