// src/lib/graph/tutorial.ts
import { useEffect, useState, useRef } from "react";
import { driver, type DriveStep, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { version, name } from "../../../package.json";

const desktopControls = `
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td><strong>Left drag</strong></td><td style="text-align: center;">—</td><td>Rotate</td></tr>
    <tr><td><strong>Right drag</strong></td><td style="text-align: center;">—</td><td>Pan</td></tr>
    <tr><td><strong>Scroll</strong></td><td style="text-align: center;">—</td><td>Zoom</td></tr>
    <tr><td><strong>Click node</strong></td><td style="text-align: center;">—</td><td>Select</td></tr>
    <tr><td><strong>Double click node</strong></td><td style="text-align: center;">—</td><td>Select and focus</td></tr>
    <tr><td><strong>Click background</strong></td><td style="text-align: center;">—</td><td>Deselect</td></tr>
    <tr><td><strong>Double click background</strong></td><td style="text-align: center;">—</td><td>Fit to screen</td></tr>
  </table>
`;

const mobileControls = `
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td><strong>Drag</strong></td><td style="text-align: center;">—</td><td>Rotate</td></tr>
    <tr><td><strong>Two finger drag</strong></td><td style="text-align: center;">—</td><td>Pan</td></tr>
    <tr><td><strong>Pinch</strong></td><td style="text-align: center;">—</td><td>Zoom</td></tr>
    <tr><td><strong>Tap node</strong></td><td style="text-align: center;">—</td><td>Select</td></tr>
    <tr><td><strong>Double tap node</strong></td><td style="text-align: center;">—</td><td>Select and focus</td></tr>
    <tr><td><strong>Tap background</strong></td><td style="text-align: center;">—</td><td>Deselect</td></tr>
    <tr><td><strong>Double tap background</strong></td><td style="text-align: center;">—</td><td>Fit to screen</td></tr>
  </table>
`;

const keyboardShortcuts = `
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td><kbd>A</kbd></td><td style="text-align: center;">—</td><td>Articles</td></tr>
    <tr><td><kbd>S</kbd></td><td style="text-align: center;">—</td><td>Settings</td></tr>
    <tr><td><kbd>D</kbd></td><td style="text-align: center;">—</td><td>Downloads</td></tr>
    <tr><td><kbd>Z</kbd></td><td style="text-align: center;">—</td><td>Stats</td></tr>
    <tr><td><kbd>R</kbd></td><td style="text-align: center;">—</td><td>Select root node</td></tr>
    <tr><td><kbd>G</kbd></td><td style="text-align: center;">—</td><td>Fit graph to screen</td></tr>
    <tr><td><kbd>F</kbd></td><td style="text-align: center;">—</td><td>Focus selected node</td></tr>
    <tr><td><kbd>Esc</kbd></td><td style="text-align: center;">—</td><td>Close sidebar / deselect</td></tr>
  </table>
`;

const buildSteps = (isMobile: boolean): DriveStep[] => [
  {
    popover: {
      title: "Welcome!",
      description: `This quick tour will walk you through using ${name}. Use the arrows or your keyboard to navigate.`,
    },
  },
  {
    element: "#fakegraph",
    popover: {
      title: "The Graph",
      description:
        "This is your knowledge graph. Each node represents a Wikipedia article, and each link represents a connection between them.",
    },
  },
  {
    element: "#fakegraph",
    popover: {
      title: "Graph Controls",
      description: isMobile ? mobileControls : desktopControls,
    },
  },
  {
    element: "#sidebar",
    popover: {
      title: "Sidebar",
      description:
        "The sidebar gives you access to articles, settings, stats, and downloads.",
      side: "left",
      align: "center",
    },
    disableActiveInteraction: true,
  },
  {
    element: "#articles",
    popover: {
      title: "Articles",
      description:
        "Search Wikipedia and explore the details of any selected node. Press <kbd>A</kbd> to toggle.",
      side: "left",
      align: "start",
    },
    disableActiveInteraction: true,
  },
  {
    element: "#stats",
    popover: {
      title: "Statistics",
      description:
        "View stats about your current graph, such as node and link counts. Press <kbd>Z</kbd> to toggle.",
      side: "left",
      align: "start",
    },
    disableActiveInteraction: true,
  },
  {
    element: "#downloads",
    popover: {
      title: "Downloads",
      description:
        "Export your graph as an image or data file. Press <kbd>D</kbd> to toggle.",
      side: "left",
      align: "start",
    },
    disableActiveInteraction: true,
  },
  {
    element: "#settings",
    popover: {
      title: "Settings",
      description:
        "Customise the graph appearance — node size, link opacity, labels, and more. Press <kbd>S</kbd> to toggle.",
      side: "left",
      align: "start",
    },
    disableActiveInteraction: true,
  },
  {
    element: "#focusnode",
    popover: {
      title: "Focus Node",
      description:
        "Move the camera to focus on the selected node. Only available when a node is selected. Press <kbd>F</kbd> to focus.",
      side: "left",
      align: "center",
    },
    disableActiveInteraction: true,
  },
  {
    element: "#focusgraph",
    popover: {
      title: "Focus Graph",
      description:
        "Zoom the camera out to fit the entire graph in view. Press <kbd>G</kbd> to focus.",
      side: "left",
      align: "center",
    },
    disableActiveInteraction: true,
  },
  ...(!isMobile
    ? [
        {
          element: "#sidebar",
          popover: {
            title: "Keyboard Shortcuts",
            align: "center" as const,
            description: keyboardShortcuts,
          },
          disableActiveInteraction: true,
        },
      ]
    : []),
  {
    element: "#tutorial",
    popover: {
      title: "You're all set!",
      description:
        "You can replay this tour any time by clicking this button or pressing <kbd>T</kbd>. Happy exploring! 🚀",
    },
    disableActiveInteraction: true,
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
    const isMobile = window.matchMedia("(pointer: coarse)").matches;

    driverRef.current = driver({
      steps: buildSteps(isMobile),
      animate: true,
      disableActiveInteraction: false,
      showProgress: true,
      smoothScroll: true,
      allowClose: true,
      stagePadding: 5,
      onPopoverRender: (popover) => {
        popover.title.insertAdjacentHTML(
          "afterbegin",
          `<small style="float: right; opacity: 0.6;">${name} v${version}</small>`,
        );
      },
    });

    if (newUser) {
      try {
        localStorage.setItem("newUser", "newUser");
      } catch {
        console.debug("Failed to set newUser");
      }
      driverRef.current.drive();
    }

    return () => driverRef.current?.destroy();
  }, [newUser]);

  return {
    startTutorial: () => driverRef.current?.drive(),
    isTutorialActive: () => driverRef.current?.isActive() ?? false,
  };
}
