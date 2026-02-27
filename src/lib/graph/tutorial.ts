// src/lib/graph/tutorial.ts
import { useEffect, useState, useRef } from "react";
import { driver, type DriveStep, type Driver } from "driver.js";
import "driver.js/dist/driver.css";

const steps: DriveStep[] = [
  {
    element: "#sidebar",
    popover: { title: "Sidebar", description: "Click on me!" },
  },
];

export function useTutorial() {
  const driverRef = useRef<Driver | null>(null);

  const [newUser] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      return !localStorage.getItem("newUser");
    } catch {
      return true;
    }
  });

  useEffect(() => {
    driverRef.current = driver({ steps, animate: true });

    if (newUser) {
      localStorage.setItem("newUser", "newUser");
      driverRef.current.drive();
    }

    return () => driverRef.current?.destroy();
  }, [newUser]);

  return { startTutorial: () => driverRef.current?.drive() };
}
