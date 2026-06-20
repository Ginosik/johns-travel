import { Handle, Position } from "@xyflow/react";

function FlowNodeCard({ data, nodeType }) {
  return (
    <div className={`trip-flow-node trip-flow-node--${nodeType} trip-flow-node--${data.status}`}>
      <Handle type="target" position={Position.Top} />
      <div className="trip-flow-node-heading">
        <span className="trip-flow-node-icon" aria-hidden="true">{data.icon}</span>
        <span className="trip-flow-node-kind">{data.kind}</span>
      </div>
      <strong className="trip-flow-node-label">{data.label}</strong>
      {data.summary && <span className="trip-flow-node-summary">{data.summary}</span>}
      <span className="trip-flow-status">{data.status}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default FlowNodeCard;
