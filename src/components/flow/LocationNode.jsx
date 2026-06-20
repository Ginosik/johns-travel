import FlowNodeCard from "./FlowNodeCard.jsx";

function LocationNode({ data }) {
  return <FlowNodeCard data={data} nodeType="location" />;
}

export default LocationNode;
