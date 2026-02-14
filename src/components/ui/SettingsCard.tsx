import { toast } from "sonner";
import { RefObject } from "react";
import { ForceGraphMethods } from "react-force-graph-3d";
import type { GraphNode, GraphLink } from "@/types";
import type { GraphSettings } from "@/components/ui/Graph";
import { Switch } from "@headlessui/react";

type SettingsCardProps = {
  graphRef: RefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>;
  graphSettings: GraphSettings;
  setGraphSettings: (graphSettings: GraphSettings) => void;
};

export default function SettingsCard({
  graphRef,
  graphSettings,
  setGraphSettings,
}: SettingsCardProps) {
  // Helper to update individual settings
  const updateSetting = (
    key: keyof GraphSettings,
    value: number | boolean | string,
  ) => {
    setGraphSettings({ ...graphSettings, [key]: value });
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Node Settings Section */}
      <div className="space-y-4">
        <h3 className="text-2xl text-white">Node Settings</h3>

        {/* Node Size Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-300">Node Size</label>
            <span className="text-sm text-gray-400">
              {graphSettings.nodeSize}
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={graphSettings.nodeSize}
            onChange={(e) => updateSetting("nodeSize", Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
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
            min="0.5"
            max="5"
            step="0.1"
            value={graphSettings.linkWidth}
            onChange={(e) => updateSetting("linkWidth", Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
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
        </div>
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
              className={`${
                graphSettings.enableNodeDrag ? "bg-sky-500" : "bg-gray-700"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
            >
              <span
                className={`${
                  graphSettings.enableNodeDrag
                    ? "translate-x-6"
                    : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
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
              className={`${
                graphSettings.showNavInfo ? "bg-sky-500" : "bg-gray-700"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
            >
              <span
                className={`${
                  graphSettings.showNavInfo ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
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
              className={`${
                graphSettings.showLabels ? "bg-sky-500" : "bg-gray-700"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
            >
              <span
                className={`${
                  graphSettings.showLabels ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
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
              className={`${
                graphSettings.showThumbnails ? "bg-sky-500" : "bg-gray-700"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
            >
              <span
                className={`${
                  graphSettings.showThumbnails
                    ? "translate-x-6"
                    : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </Switch.Group>
        {/* Dark Mode Toggle */}
        <Switch.Group>
          <div className="flex items-center justify-between">
            <Switch.Label className="text-sm text-gray-300 cursor-pointer">
              Dark Mode
            </Switch.Label>
            <Switch
              checked={graphSettings.darkMode}
              onChange={(value) => updateSetting("darkMode", value)}
              className={`${
                graphSettings.darkMode ? "bg-sky-500" : "bg-gray-700"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
            >
              <span
                className={`${
                  graphSettings.darkMode ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </Switch.Group>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setGraphSettings({
            nodeSize: 1,
            nodeOpacity: 1.0,
            linkWidth: 1,
            linkOpacity: 1.0,
            showLabels: false,
            showThumbnails: false,
            cooldownTicks: 100,
            enableNodeDrag: false,
            showNavInfo: false,
            darkMode: false,
          });
          toast.success("Settings reset to defaults");
        }}
        className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
      >
        Reset to Defaults
      </button>
    </div>
  );
}
