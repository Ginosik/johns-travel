import { posts } from "./posts.js";
import { storyIdeas } from "./storyIdeas.js";

export const tripFlowTypes = ["day", "location", "conversation", "audio", "draft"];
export const tripFlowStatuses = ["planned", "written", "audio-needed", "recorded", "published"];

const plannedStories = storyIdeas.map((idea) => ({
  id: idea.id,
  day: idea.day,
  label: idea.title,
  location: idea.location,
  status: "planned",
  audioStatus: "audio-needed",
  activity: idea.activity,
  languageFocus: idea.languageFocus,
  vocabularyTheme: idea.vocabularyTheme,
  conversationConflict: idea.conversationConflict,
  notes: idea.notes
}));

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

  const columns = 5;

  storyGroups.forEach((group, storyIndex) => {
    const groupIndex = storyIndex % columns;
    const groupRow = Math.floor(storyIndex / columns);
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

        groupRow,
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

      groupRow,
      data: {
        icon: isPublished ? "☀" : "✎",
        kind: isPublished ? "Day" : "Draft",
        label: isPublished ? item.tripLabel : item.label,
        summary: isPublished ? `${item.story.conversation.length} messages` : item.vocabularyTheme,
        status: item.status,
        route: isPublished ? item.href : null,
        postId: isPublished ? item.id : null,
        location: locationName,
        audioStatus: isPublished ? item.workflow.audioStatus : item.audioStatus,
        notes: isPublished ? item.workflow.notes : `Activity: ${item.activity} Language focus: ${item.languageFocus} Vocabulary: ${item.vocabularyTheme} Conflict: ${item.conversationConflict} Notes: ${item.notes}`,
        messageCount: isPublished ? item.story.conversation.length : null
      }
    });

    if (!isPublished) {
      edges.push({ id: `${locationId}-${primaryId}`, source: locationId, target: primaryId });
      return;
    }

    nodes.push({
      id: conversationId,
      type: "conversation",
      role: "conversation",
      groupIndex,

      groupRow,
      data: {
        icon: "◌",
        kind: "Conversation",
        label: isPublished ? `${item.story.conversation.length} message script` : item.conversationConflict,
        summary: isPublished ? `${item.story.conversationTranslations.length} translations` : item.languageFocus,
        status: isPublished ? item.workflow.writingStatus : "planned",
        route: isPublished ? item.href : null,
        postId: isPublished ? item.id : null,
        location: locationName,
        audioStatus: isPublished ? item.workflow.audioStatus : item.audioStatus,
        notes: isPublished ? "English script and Portuguese sentence translations." : item.conversationConflict
      }
    });

    nodes.push({
      id: audioId,
      type: "audio",
      role: "audio",
      groupIndex,

      groupRow,
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
  const rowOffset = (node.groupRow ?? 0) * 760;

  if (layoutMode === "location") {
    const yByRole = { location: 0, primary: 190, conversation: 380, audio: 570 };
    return { x, y: rowOffset + yByRole[node.role] };
  }

  if (layoutMode === "branching") {
    const offsets = { location: 0, primary: 0, conversation: -120, audio: 140 };
    const yByRole = { location: 0, primary: 190, conversation: 390, audio: 390 };
    return { x: x + offsets[node.role], y: rowOffset + yByRole[node.role] };
  }

  const offsets = { location: 0, primary: 0, conversation: -100, audio: 130 };
  const yByRole = { location: 0, primary: 160, conversation: 340, audio: 340 };
  return { x: x + offsets[node.role], y: rowOffset + yByRole[node.role] };
}

export function createTripFlow(layoutMode = "timeline") {
  const graph = buildGraphModel();
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));

  return {
    nodes: graph.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: getNodePosition(node, layoutMode),
      data: node.data
    })),
    edges: graph.edges.map((edge) => ({
      ...edge,
      animated: edge.target.endsWith("-audio") && nodeById.get(edge.target)?.data.status === "recorded"
    }))
  };
}
