import { useState, useEffect } from "react";
import eventsCalendar from "../data/events-calendar.json";

export interface EventTheme {
  id: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  bannerText: string;
  keywords: string[];
}

export interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  theme: EventTheme;
}

export interface ActiveEvent extends Event {
  daysRemaining: number;
}

const isDateInRange = (
  date: Date,
  startDate: string,
  endDate: string
): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return date >= start && date <= end;
};

const getDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const useEventTheme = () => {
  const [activeEvent, setActiveEvent] = useState<ActiveEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkActiveEvent = () => {
      const now = new Date();

      const currentEvent = eventsCalendar.events.find((event) =>
        isDateInRange(now, event.startDate, event.endDate)
      );

      if (currentEvent) {
        setActiveEvent({
          ...currentEvent,
          daysRemaining: getDaysRemaining(currentEvent.endDate),
        });
      } else {
        setActiveEvent(null);
      }

      setIsLoading(false);
    };

    checkActiveEvent();

    // Check mỗi giờ xem có event mới không
    const interval = setInterval(checkActiveEvent, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    activeEvent,
    isLoading,
    hasActiveEvent: !!activeEvent,
  };
};
