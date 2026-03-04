export interface TaskCardData {
  title: string;
  area: 'oaia' | 'swell' | 'partio' | 'personal' | 'work';
  type: 'thought' | 'decision' | 'person' | 'meeting' | 'insight';
  dueDate?: string;
}

/**
 * Parse task-card blocks from Claude's message content
 * Format: ```task-card\n{...json...}\n```
 */
export function parseTaskCards(content: string): { text: string; taskCard?: TaskCardData }[] {
  const parts: { text: string; taskCard?: TaskCardData }[] = [];

  // Regex to match ```task-card blocks
  const taskCardRegex = /```task-card\s*\n([\s\S]*?)\n```/g;

  let lastIndex = 0;
  let match;

  while ((match = taskCardRegex.exec(content)) !== null) {
    // Add text before the task card
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index).trim();
      if (textBefore) {
        parts.push({ text: textBefore });
      }
    }

    // Parse the JSON task card
    try {
      const jsonStr = match[1].trim();
      const taskCard = JSON.parse(jsonStr) as TaskCardData;

      // Validate required fields
      if (taskCard.title && taskCard.area && taskCard.type) {
        parts.push({ text: '', taskCard });
      } else {
        // Invalid task card, treat as text
        parts.push({ text: match[0] });
      }
    } catch (error) {
      // Failed to parse JSON, treat as text
      console.error('Failed to parse task card:', error);
      parts.push({ text: match[0] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last task card
  if (lastIndex < content.length) {
    const textAfter = content.slice(lastIndex).trim();
    if (textAfter) {
      parts.push({ text: textAfter });
    }
  }

  // If no task cards found, return entire content as text
  if (parts.length === 0 && content.trim()) {
    parts.push({ text: content });
  }

  return parts;
}

/**
 * Check if content contains any task cards
 */
export function hasTaskCards(content: string): boolean {
  return /```task-card\s*\n[\s\S]*?\n```/.test(content);
}
