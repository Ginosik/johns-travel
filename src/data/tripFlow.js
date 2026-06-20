import { posts } from "./posts.js";

export const tripFlowTypes = ["day", "location", "conversation", "audio", "draft"];
export const tripFlowStatuses = ["planned", "written", "audio-needed", "recorded", "published"];

const plannedStories = [
  {
    id: "day-3-draft",
    day: 3,
    label: "Day 3 - Joaquina and the Dunes",
    location: "Praia da Joaquina",
    status: "planned",
    audioStatus: "audio-needed",
    notes: "Draft idea: surf, dunes, and a sandboarding misunderstanding."
  }
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildGraphModel() {
  const nodes = [];
  const edges = [];
  const storyGroups = [
    ...posts.map((post) => ({ kind: "published", post })),
    ...plannedStories.map((draft) => ({ kind: "draft", draft }))
  ];

  storyGroups.forEach((group, groupIndex) => {
    const isPublished = group.kind === "published";
    const item = isPublished ? group.post : group.draft;
    const locationName = isPublished ? item.location.name : item.location;
    const locationId = `location-${slugify(locationName)}`;
    const primaryId = item.id;
    const conversationId = `${primaryId}-conversation`;
    const audioId = `${primaryId}-audio`;

    if (!nodes.some((node) => node.id === locationId)) {
      nodes.push({
        id: locationId,
        type: "location",
        role: "location",
        groupIndex,
        data: {
          icon: "⌖",
          kind: "Location",
          label: locationName,
          location: locationName,
          status: isPublished ? "published" : "planned",
          notes: `Content grouped around ${locationName}.`
        }
      });
    }

    nodes.push({
      id: primaryId,
      type: isPublished ? "day" : "draft",
      role: "primary",
      groupIndex,
      data: {
        icon: isPublished ? "☀" : "✎",
        kind: isPublished ? "Day" : "Draft",
        label: isPublished ? item.tripLabel : item.label,
        summary: isPublished ? `${item.story.conversation.length} messages` : "Story outline",
        status: item.status,
        route: isPublished ? item.href : null,
        postId: isPublished ? item.id : null,
        location: locationName,
        audioStatus: isPublished ? item.workflow.audioStatus : item.audioStatus,
        notes: isPublished ? item.workflow.notes : item.notes,
        messageCount: isPublished ? item.story.conversation.length : null
      }
    });

    nodes.push({
      id: conversationId,
      type: "conversation",
      role: "conversation",
      groupIndex,
      data: {
        icon: "◌",
        kind: "Conversation",
        label: isPublished ? `${item.story.conversation.length} message script` : "Conversation outline",
        summary: isPublished ? `${item.story.conversationTranslations.length} translations` : "Not written",
        status: isPublished ? item.workflow.writingStatus : "planned",
        route: isPublished ? item.href : null,
        postId: isPublished ? item.id : null,
        location: locationName,
        audioStatus: isPublished ? item.workflow.audioStatus : item.audioStatus,
        notes: isPublished ? "English script and Portuguese sentence translations." : "Define the Day 3 conversation beat."
      }
    });

    nodes.push({
      id: audioId,
      type: "audio",
      role: "audio",
      groupIndex,
      data: {
        icon: "▶",
        kind: "Audio",
        label: isPublished ? `${item.story.conversation.length} message clips` : "Audio recording",
        summary: isPublished ? "Ready for playback" : "Recording required",
        status: isPublished ? item.workflow.audioStatus : item.audioStatus,
        route: isPublished ? item.href : null,
        postId: isPublished ? item.id : null,
        location: locationName,
        audioStatus: isPublished ? item.workflow.audioStatus : item.audioStatus,
        notes: isPublished ? "All conversation messages have an audio resolver." : "Record after the script is approved."
      }
    });

    edges.push(
      { id: `${locationId}-${primaryId}`, source: locationId, target: primaryId },
      { id: `${primaryId}-${conversationId}`, source: primaryId, target: conversationId },
      { id: `${primaryId}-${audioId}`, source: primaryId, target: audioId }
    );
  });

  return { nodes, edges };
}

function getNodePosition(node, layoutMode) {
  const x = node.groupIndex * 390;

  if (layoutMode === "location") {
    const yByRole = { location: 0, primary: 190, conversation: 380, audio: 570 };
    return { x, y: yByRole[node.role] };
  }

  if (layoutMode === "branching") {
    const offsets = { location: 0, primary: 0, conversation: -120, audio: 140 };
    const yByRole = { location: 0, primary: 190, conversation: 390, audio: 390 };
    return { x: x + offsets[node.role], y: yByRole[node.role] };
  }

  const offsets = { location: 0, primary: 0, conversation: -100, audio: 130 };
  const yByRole = { location: 0, primary: 160, conversation: 340, audio: 340 };
  return { x: x + offsets[node.role], y: yByRole[node.role] };
}

export function createTripFlow(layoutMode = "timeline") {
  const graph = buildGraphModel();

  return {
    nodes: graph.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: getNodePosition(node, layoutMode),
      data: node.data
    })),
    edges: graph.edges.map((edge) => ({
      ...edge,
      animated: edge.target.endsWith("-audio") && !edge.target.startsWith("day-3")
    }))
  };
}
