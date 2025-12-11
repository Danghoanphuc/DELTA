import * as React from "react";
import { ChevronDown } from "lucide-react";

const AccordionContext = React.createContext<{
  value: string | null;
  onValueChange: (value: string) => void;
  type: "single" | "multiple";
}>({
  value: null,
  onValueChange: () => {},
  type: "single",
});

interface AccordionProps {
  type: "single" | "multiple";
  collapsible?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Accordion = ({
  type,
  collapsible,
  children,
  className,
}: AccordionProps) => {
  const [value, setValue] = React.useState<string | null>(null);

  const handleValueChange = (newValue: string) => {
    if (type === "single") {
      setValue(value === newValue && collapsible ? null : newValue);
    }
  };

  return (
    <AccordionContext.Provider
      value={{ value, onValueChange: handleValueChange, type }}
    >
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const AccordionItem = ({ value, children, className }: AccordionItemProps) => {
  return (
    <div className={`border-b ${className || ""}`} data-value={value}>
      {children}
    </div>
  );
};

interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ className, children, ...props }, ref) => {
  const { value: currentValue, onValueChange } =
    React.useContext(AccordionContext);
  const itemValue = React.useContext(AccordionItemContext);
  const isOpen = currentValue === itemValue;

  return (
    <button
      ref={ref}
      className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180 ${
        className || ""
      }`}
      onClick={() => onValueChange(itemValue)}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </button>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionItemContext = React.createContext<string>("");

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { value: currentValue } = React.useContext(AccordionContext);
  const itemValue = React.useContext(AccordionItemContext);
  const isOpen = currentValue === itemValue;

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={`overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down ${
        className || ""
      }`}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
});
AccordionContent.displayName = "AccordionContent";

// Wrap AccordionItem to provide context
const WrappedAccordionItem = ({
  value,
  children,
  className,
}: AccordionItemProps) => {
  return (
    <AccordionItemContext.Provider value={value}>
      <AccordionItem value={value} className={className}>
        {children}
      </AccordionItem>
    </AccordionItemContext.Provider>
  );
};

export {
  Accordion,
  WrappedAccordionItem as AccordionItem,
  AccordionTrigger,
  AccordionContent,
};
