import { toast } from "sonner";
import { RefObject } from "react";
import { ForceGraphMethods } from "react-force-graph-3d";
import type { GraphNode, GraphLink } from "@/types";
import type { GraphSettings } from "@/components/ui/Graph";
import { Switch } from "@headlessui/react";
import clsx from "clsx";

type SettingsCardProps = {
  graphRef: RefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>;
  graphSettings: GraphSettings;
  setGraphSettings: (graphSettings: GraphSettings) => void;
  sidebarMode: "fullscreen" | "one-third";
  setSidebarMode: (sidebarMode: "fullscreen" | "one-third") => void;
};

export default function SettingsCard({
  graphRef,
  graphSettings,
  setGraphSettings,
  sidebarMode,
  setSidebarMode,
}: SettingsCardProps) {
  // Helper to update individual settings
  const updateSetting = (
    key: keyof GraphSettings,
    value: number | boolean | string | null | undefined,
  ) => {
    setGraphSettings({ ...graphSettings, [key]: value });
  };

  return (
    <div className="flex flex-col gap-6 p-4 overflow-y-auto">
      {/* Node Settings Section */}
      <div className="space-y-4">
        <h3 className="text-lg text-white">Node Settings</h3>

        {/* Dynamic Node Setting*/}
        <Switch.Group>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Switch.Label className="text-sm text-gray-300">
                Enable Dynamic Node sizing
              </Switch.Label>
              <Switch
                checked={graphSettings.enableDynamicNodeSizing}
                onChange={(value) =>
                  updateSetting("enableDynamicNodeSizing", value)
                }
                className={clsx(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900",
                  graphSettings.enableDynamicNodeSizing
                    ? "bg-sky-500"
                    : "bg-gray-700",
                )}
              >
                <span
                  className={clsx(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    graphSettings.enableDynamicNodeSizing
                      ? "translate-x-6"
                      : "translate-x-1",
                  )}
                />
              </Switch>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Scales nodes by the number of connections they have
          </p>
        </Switch.Group>

        {/* Node Size Slider - Disabled when dynamic sizing is enabled */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className={clsx("text-sm", "text-gray-300")}>
              Base Node Size
            </label>
            <span className={clsx("text-sm", "text-gray-400")}>
              {graphSettings.nodeSize}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={graphSettings.nodeSize}
            onChange={(e) => updateSetting("nodeSize", Number(e.target.value))}
            // disabled={graphSettings.enableDynamicNodeSizing}
            className={clsx(
              "w-full h-2 rounded-lg appearance-none cursor-pointer accent-sky-500",
              "bg-gray-700",
            )}
          />
          <p className="text-xs text-gray-500">
            Base size of each node — used as a multiplier when dynamic sizing is
            on
          </p>
        </div>

        {/* Node Opacity Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-300">Node Opacity</label>
            <span className="text-sm text-gray-400">
              {graphSettings.nodeOpacity.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={graphSettings.nodeOpacity}
            onChange={(e) =>
              updateSetting("nodeOpacity", Number(e.target.value))
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <p className="text-xs text-gray-500">
            Transparency of the default node sphere (has no effect when
            thumbnails are enabled)
          </p>
        </div>
      </div>

      {/* Link Settings Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Link Settings</h3>

        {/* Link Width Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-300">Link Width</label>
            <span className="text-sm text-gray-400">
              {graphSettings.linkWidth}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={graphSettings.linkWidth}
            onChange={(e) => updateSetting("linkWidth", Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <p className="text-xs text-gray-500">
            Thickness of the lines connecting nodes
          </p>
        </div>

        {/* Link Opacity Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-300">Link Opacity</label>
            <span className="text-sm text-gray-400">
              {graphSettings.linkOpacity.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={graphSettings.linkOpacity}
            onChange={(e) =>
              updateSetting("linkOpacity", Number(e.target.value))
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <p className="text-xs text-gray-500">
            Global transparency of all links
          </p>
        </div>

        {/* Highlight Distance Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-300">Highlight Distance</label>
            <span className="text-sm text-gray-400">
              {graphSettings.highlightDistance}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="6"
            step="1"
            value={graphSettings.highlightDistance}
            onChange={(e) =>
              updateSetting("highlightDistance", Number(e.target.value))
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <p className="text-xs text-gray-500">
            How many hops from the selected node remain visible — links beyond
            this fade out
          </p>
        </div>

        {/* Edge Colour Mode */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Edge Colour Mode</label>
          <div className="flex gap-2">
            {(["auto", "depth"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => updateSetting("edgeColorMode", mode)}
                className={clsx(
                  "flex-1 py-1.5 rounded-md text-sm capitalize transition-colors",
                  graphSettings.edgeColorMode === mode
                    ? "bg-sky-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600",
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Auto: default colouring | Depth: colour by distance from today&aposs
          root article
        </p>
      </div>

      {/* Behavior Settings Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Behavior</h3>

        {/* Cooldown Ticks Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-300">Simulation Cooldown</label>
            <span className="text-sm text-gray-400">
              {graphSettings.cooldownTicks}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={graphSettings.cooldownTicks}
            onChange={(e) =>
              updateSetting("cooldownTicks", Number(e.target.value))
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <p className="text-xs text-gray-500">
            Higher values = smoother animation but slower settling
          </p>
        </div>

        {/* Enable Node Drag Toggle */}
        <Switch.Group>
          <div className="flex items-center justify-between">
            <Switch.Label className="text-sm text-gray-300 cursor-pointer">
              Enable Node Dragging
            </Switch.Label>
            <Switch
              checked={graphSettings.enableNodeDrag}
              onChange={(value) => updateSetting("enableNodeDrag", value)}
              className={clsx(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900",
                graphSettings.enableNodeDrag ? "bg-sky-500" : "bg-gray-700",
              )}
            >
              <span
                className={clsx(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  graphSettings.enableNodeDrag
                    ? "translate-x-6"
                    : "translate-x-1",
                )}
              />
            </Switch>
          </div>
          <p className="text-xs text-gray-500">
            Allows nodes to be repositioned by dragging
          </p>
        </Switch.Group>

        {/* Show Nav Info Toggle */}
        <Switch.Group>
          <div className="flex items-center justify-between">
            <Switch.Label className="text-sm text-gray-300 cursor-pointer">
              Show Navigation Info
            </Switch.Label>
            <Switch
              checked={graphSettings.showNavInfo}
              onChange={(value) => updateSetting("showNavInfo", value)}
              className={clsx(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900",
                graphSettings.showNavInfo ? "bg-sky-500" : "bg-gray-700",
              )}
            >
              <span
                className={clsx(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  graphSettings.showNavInfo ? "translate-x-6" : "translate-x-1",
                )}
              />
            </Switch>
          </div>
          <p className="text-xs text-gray-500">
            Shows camera controls hint in the bottom-left corner of the graph
          </p>
        </Switch.Group>

        {/* Control Type Select */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Camera Control Type</label>
          <select
            value={graphSettings.controlType}
            onChange={(e) =>
              updateSetting(
                "controlType",
                e.target.value as "trackball" | "orbit" | "fly",
              )
            }
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="trackball">Trackball</option>
            <option value="orbit">Orbit</option>
            <option value="fly">Fly</option>
          </select>
          <p className="text-xs text-gray-500">
            Trackball: Free rotation | Orbit: Around target | Fly: First-person
          </p>
        </div>
      </div>

      {/* Display Settings Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Display</h3>

        {/* Show Labels Toggle */}
        <Switch.Group>
          <div className="flex items-center justify-between">
            <Switch.Label className="text-sm text-gray-300 cursor-pointer">
              Show Labels
            </Switch.Label>
            <Switch
              checked={graphSettings.showLabels}
              onChange={(value) => updateSetting("showLabels", value)}
              className={clsx(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900",
                graphSettings.showLabels ? "bg-sky-500" : "bg-gray-700",
              )}
            >
              <span
                className={clsx(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  graphSettings.showLabels ? "translate-x-6" : "translate-x-1",
                )}
              />
            </Switch>
          </div>
          <p className="text-xs text-gray-500">
            Displays article names below each node on hover
          </p>
        </Switch.Group>

        {/* Show Thumbnails Toggle */}
        <Switch.Group>
          <div className="flex items-center justify-between">
            <Switch.Label className="text-sm text-gray-300 cursor-pointer">
              Show Thumbnails
            </Switch.Label>
            <Switch
              checked={graphSettings.showThumbnails}
              onChange={(value) => updateSetting("showThumbnails", value)}
              className={clsx(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900",
                graphSettings.showThumbnails ? "bg-sky-500" : "bg-gray-700",
              )}
            >
              <span
                className={clsx(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  graphSettings.showThumbnails
                    ? "translate-x-6"
                    : "translate-x-1",
                )}
              />
            </Switch>
          </div>
          <p className="text-xs text-gray-500">
            Renders Wikipedia thumbnail images as node sprites — disabling
            improves performance on large graphs
          </p>
        </Switch.Group>

        {/* Sidebar Mode Toggle */}
        <Switch.Group>
          <div className="hidden sm:flex items-center justify-between">
            <Switch.Label className="text-sm text-gray-300 cursor-pointer">
              Fullscreen Sidebar
            </Switch.Label>
            <Switch
              checked={sidebarMode === "fullscreen"}
              onChange={(value) =>
                setSidebarMode(value ? "fullscreen" : "one-third")
              }
              className={clsx(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900",
                sidebarMode === "fullscreen" ? "bg-sky-500" : "bg-gray-700",
              )}
            >
              <span
                className={clsx(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  sidebarMode === "fullscreen"
                    ? "translate-x-6"
                    : "translate-x-1",
                )}
              />
            </Switch>
          </div>
          <p className="text-xs text-gray-500">
            Switches the sidebar between fullscreen or one-third widths
          </p>
        </Switch.Group>

        {/* Dark Mode Toggle */}
        <Switch.Group>
          <div className="flex items-center justify-between">
            <Switch.Label className="text-sm text-gray-300 cursor-pointer">
              Dark Mode
            </Switch.Label>
            <Switch
              checked={graphSettings.darkMode}
              onChange={(value) => updateSetting("darkMode", value || null)}
              className={clsx(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900",
                graphSettings.darkMode ? "bg-sky-500" : "bg-gray-700",
              )}
            >
              <span
                className={clsx(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  graphSettings.darkMode ? "translate-x-6" : "translate-x-1",
                )}
              />
            </Switch>
          </div>
          <p className="text-xs text-gray-500">
            Switches the graph background to a dark theme
          </p>
        </Switch.Group>
      </div>

      {/* Layout Settings Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Layout</h3>

        {/* DAG Mode Select */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">DAG Layout Mode</label>
          <select
            value={graphSettings.dagMode || ""}
            onChange={(e) => updateSetting("dagMode", e.target.value || null)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">None (Free layout)</option>
            <option value="td">Top-Down</option>
            <option value="bu">Bottom-Up</option>
            <option value="lr">Left-Right</option>
            <option value="rl">Right-Left</option>
            <option value="zout">Near-Far</option>
            <option value="zin">Far-Near</option>
            <option value="radialout">Radial Out</option>
            <option value="radialin">Radial In</option>
          </select>
          <p className="text-xs text-gray-500">
            Apply hierarchical layout constraints (works best for acyclic
            graphs)
          </p>
        </div>

        {/* DAG Level Distance - Only show when dagMode is active */}
        {graphSettings.dagMode && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-300">Level Distance</label>
              <span className="text-sm text-gray-400">
                {graphSettings.dagLevelDistance || 200}
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={graphSettings.dagLevelDistance || 200}
              onChange={(e) =>
                updateSetting("dagLevelDistance", Number(e.target.value))
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <p className="text-xs text-gray-500">
              Distance between graph hierarchy levels
            </p>
          </div>
        )}
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setGraphSettings({
            nodeSize: 1,
            nodeOpacity: 1.0,
            linkWidth: 1,
            linkOpacity: 1.0,
            showLabels: true,
            showThumbnails: true,
            cooldownTicks: 100,
            enableNodeDrag: false,
            showNavInfo: false,
            darkMode: false,
            controlType: "trackball",
            enableDynamicNodeSizing: true,
            dagMode: null,
            dagLevelDistance: undefined,
            edgeColorMode: "depth",
            highlightDistance: 4,
          });
          setSidebarMode("one-third");
          toast.success("Settings reset to defaults");
        }}
        className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
      >
        Reset to Defaults
      </button>
    </div>
  );
}
