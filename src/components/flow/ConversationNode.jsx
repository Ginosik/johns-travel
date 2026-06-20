import FlowNodeCard from "./FlowNodeCard.jsx";

function ConversationNode({ data }) {
  return <FlowNodeCard data={data} nodeType="conversation" />;
}

export default ConversationNode;
