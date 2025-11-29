import { createContext, useContext, ReactNode } from "react";
import { useEventTheme, ActiveEvent } from "../hooks/useEventTheme";

interface EventThemeContextValue {
  activeEvent: ActiveEvent | null;
  hasActiveEvent: boolean;
  isLoading: boolean;
}

const EventThemeContext = createContext<EventThemeContextValue | undefined>(
  undefined
);

export const EventThemeProvider = ({ children }: { children: ReactNode }) => {
  const eventTheme = useEventTheme();

  return (
    <EventThemeContext.Provider value={eventTheme}>
      {children}
    </EventThemeContext.Provider>
  );
};

export const useEventThemeContext = () => {
  const context = useContext(EventThemeContext);
  if (context === undefined) {
    throw new Error(
      "useEventThemeContext must be used within EventThemeProvider"
    );
  }
  return context;
};
