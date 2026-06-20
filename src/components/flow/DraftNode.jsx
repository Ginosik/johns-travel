import FlowNodeCard from "./FlowNodeCard.jsx";

function DraftNode({ data }) {
  return <FlowNodeCard data={data} nodeType="draft" />;
}

export default DraftNode;
