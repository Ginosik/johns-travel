import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AudioNode, ConversationNode, DayNode, DraftNode, LocationNode } from "../components/flow/index.js";
import { createTripFlow, tripFlowStatuses, tripFlowTypes } from "../data/tripFlow.js";
import "../styles/tripMap.css";

const nodeTypes = {
  audio: AudioNode,
  conversation: ConversationNode,
  day: DayNode,
  draft: DraftNode,
  location: LocationNode
};

const themeOptions = [
  { id: "clean", label: "Clean" },
  { id: "blueprint", label: "Blueprint" },
  { id: "night", label: "Night" }
];

const densityOptions = [
  { id: "comfortable", label: "Comfortable" },
  { id: "compact", label: "Compact" }
];

const edgeOptions = [
  { id: "calm", label: "Calm" },
  { id: "strong", label: "Strong" }
];

const layoutOptions = [
  { id: "timeline", label: "Timeline" },
  { id: "branching", label: "Branching" },
  { id: "location", label: "Location" }
];

const statusColors = {
  planned: "#7b61a8",
  written: "#d18a16",
  "audio-needed": "#cf4a4a",
  recorded: "#237a57",
  published: "#1877f2"
};

function DesignOptionGroup({ label, options, value, onChange }) {
  return (
    <div className="trip-map-control-group">
      <span>{label}</span>
      <div className="trip-map-segmented" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            className={value === option.id ? "is-active" : ""}
            type="button"
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
            key={option.id}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FilterOptionGroup({ label, options, selected, onToggle }) {
  return (
    <div className="trip-map-control-group trip-map-filter-group">
      <span>{label}</span>
      <div className="trip-map-filter-options" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            className={selected.includes(option) ? "is-active" : ""}
            type="button"
            aria-pressed={selected.includes(option)}
            onClick={() => onToggle(option)}
            key={option}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function NodeInspector({ node, onClose, onOpenPost }) {
  if (!node) {
    return (
      <aside className="trip-map-inspector is-empty" aria-label="Selected node inspector">
        <span className="inspector-empty-icon" aria-hidden="true">◇</span>
        <h2>Select a node</h2>
        <p>Inspect its route, workflow status, audio state, and planning notes.</p>
      </aside>
    );
  }

  const { data, type } = node;

  return (
    <aside className="trip-map-inspector" aria-label="Selected node inspector">
      <div className="trip-map-inspector-heading">
        <div>
          <span>{data.kind}</span>
          <h2>{data.label}</h2>
        </div>
        <button type="button" aria-label="Close inspector" onClick={onClose}>×</button>
      </div>

      <dl className="trip-map-inspector-details">
        <div><dt>Type</dt><dd>{type}</dd></div>
        <div><dt>Status</dt><dd><span className={`inspector-status inspector-status--${data.status}`}>{data.status}</span></dd></div>
        {data.route && <div><dt>Route</dt><dd><code>{data.route}</code></dd></div>}
        {data.location && <div><dt>Location</dt><dd>{data.location}</dd></div>}
        {data.messageCount && <div><dt>Messages</dt><dd>{data.messageCount}</dd></div>}
        {data.audioStatus && <div><dt>Audio</dt><dd>{data.audioStatus}</dd></div>}
      </dl>

      {data.notes && (
        <div className="trip-map-inspector-notes">
          <h3>Notes</h3>
          <p>{data.notes}</p>
        </div>
      )}

      {data.postId && (
        <button className="trip-map-open-story" type="button" onClick={() => onOpenPost(data.postId)}>
          Open story
        </button>
      )}
    </aside>
  );
}

function toggleSelection(selected, value) {
  return selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value];
}

function TripMapPage({ onOpenPost }) {
  const [theme, setTheme] = useState("clean");
  const [density, setDensity] = useState("comfortable");
  const [edgeStyle, setEdgeStyle] = useState("calm");
  const [layoutMode, setLayoutMode] = useState("timeline");
  const [visibleTypes, setVisibleTypes] = useState(tripFlowTypes);
  const [visibleStatuses, setVisibleStatuses] = useState(tripFlowStatuses);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const pageClassName = `trip-map-page trip-map-theme-${theme} trip-map-density-${density} trip-map-edges-${edgeStyle}`;

  const flow = useMemo(() => {
    const completeFlow = createTripFlow(layoutMode);
    const nodes = completeFlow.nodes.filter((node) => (
      visibleTypes.includes(node.type) && visibleStatuses.includes(node.data.status)
    ));
    const visibleNodeIds = new Set(nodes.map((node) => node.id));
    const edges = completeFlow.edges.filter((edge) => (
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    ));

    return { nodes, edges };
  }, [layoutMode, visibleStatuses, visibleTypes]);

  const selectedNode = flow.nodes.find((node) => node.id === selectedNodeId) ?? null;

  useEffect(() => {
    if (selectedNodeId && !selectedNode) setSelectedNodeId(null);
  }, [selectedNode, selectedNodeId]);

  return (
    <main className={pageClassName}>
      <div className="trip-map-page-actions">
        <Link className="back-link" to="/">Back to feed</Link>
        <div>
          <span className="trip-map-developer-badge">Developer workspace</span>
          <strong>Trip content map</strong>
        </div>
      </div>

      <section className="trip-map-workbench" aria-label="Trip map design controls">
        <DesignOptionGroup label="Layout" options={layoutOptions} value={layoutMode} onChange={setLayoutMode} />
        <DesignOptionGroup label="Theme" options={themeOptions} value={theme} onChange={setTheme} />
        <DesignOptionGroup label="Density" options={densityOptions} value={density} onChange={setDensity} />
        <DesignOptionGroup label="Edges" options={edgeOptions} value={edgeStyle} onChange={setEdgeStyle} />
        <FilterOptionGroup
          label="Content types"
          options={tripFlowTypes}
          selected={visibleTypes}
          onToggle={(type) => setVisibleTypes((current) => toggleSelection(current, type))}
        />
        <FilterOptionGroup
          label="Workflow statuses"
          options={tripFlowStatuses}
          selected={visibleStatuses}
          onToggle={(status) => setVisibleStatuses((current) => toggleSelection(current, status))}
        />
      </section>

      <div className="trip-map-workspace">
        <section className="trip-map-panel" aria-label="Trip map">
          <ReactFlow
            nodes={flow.nodes}
            edges={flow.edges}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            key={`${layoutMode}-${visibleTypes.join("-")}-${visibleStatuses.join("-")}`}
          >
            <Background />
            <MiniMap
              nodeColor={(node) => statusColors[node.data.status] ?? "#8a93a3"}
              pannable={false}
              zoomable={false}
            />
            <Controls showInteractive={false} />
          </ReactFlow>
        </section>

        <NodeInspector
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onOpenPost={onOpenPost}
        />
      </div>
    </main>
  );
}

export default TripMapPage;
