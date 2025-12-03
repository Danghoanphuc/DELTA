import { cn } from "@/shared/lib/utils";

export const AUTH_STYLES = {
  // Input: Vuông sắc cạnh, bỏ bo tròn, nền xám đá nhạt
  input: (hasError?: boolean, hasIcon?: boolean) =>
    cn(
      "h-12 bg-stone-50 border border-stone-200 rounded-none text-base font-medium text-stone-900",
      "placeholder:text-stone-400 placeholder:font-sans",
      "focus-visible:bg-white focus-visible:ring-0 focus-visible:border-stone-900 focus-visible:border-2",
      "transition-all duration-200",
      hasError ? "border-red-500 focus-visible:border-red-600" : "",
      hasIcon ? "pl-11" : "px-4", // Fix lỗi text đè icon
      "autofill:bg-stone-50 autofill:shadow-[0_0_0_30px_#fafaf9_inset]"
    ),

  // Nút bấm: Đen đặc hoặc Emerald đậm, vuông góc
  button: (variant: "primary" | "secondary" = "primary") =>
    cn(
      "h-12 w-full rounded-none uppercase tracking-[0.15em] font-bold text-xs",
      "transition-all duration-300 shadow-none hover:shadow-lg hover:-translate-y-0.5",
      variant === "primary"
        ? "bg-stone-900 text-white hover:bg-emerald-800"
        : "bg-emerald-800 text-white hover:bg-stone-900"
    ),

  // Label: Mono font, nhỏ, in hoa
  label:
    "font-mono text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1.5 block",

  // Wrapper cho Icon trong Input (Căn giữa tuyệt đối)
  iconWrapper:
    "absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center text-stone-400 pointer-events-none z-10",

  // Link text
  link: "font-serif italic text-sm text-stone-500 hover:text-stone-900 border-b border-stone-200 hover:border-stone-900 transition-all pb-0.5 cursor-pointer",
};
