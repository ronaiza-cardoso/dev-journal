// Utility functions to parse markdown journal entries

export const parseMarkdownContent = (content) => {
  const entries = [];
  const lines = content.split("\n");
  let currentEntry = null;
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for code block markers
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      // Skip code block lines
      continue;
    }

    // Skip lines inside code blocks
    if (inCodeBlock) {
      continue;
    }

    // Check for date headers (## YYYY-MM-DD)
    if (line.match(/^## \d{4}-\d{2}-\d{2}$/)) {
      // Save previous entry if it exists
      if (currentEntry) {
        entries.push(currentEntry);
      }

      // Start new entry
      const date = line.replace("## ", "");
      currentEntry = {
        id: Date.now() + Math.random(), // Ensure unique ID
        date: date,
        mainEntry: "",
        subEntries: [],
        timestamp: new Date().toISOString(),
        imported: true,
      };
    }
    // Check for main entries (numbered items like "1. text" or bullet points "- text")
    else if (line.match(/^\d+\.\s/) || line.match(/^-\s/)) {
      if (currentEntry) {
        const entryText = line.replace(/^(\d+\.\s|-\s)/, "");
        if (!currentEntry.mainEntry) {
          currentEntry.mainEntry = entryText;
        } else {
          // If there's already a main entry, add this as a new main point
          currentEntry.mainEntry += "\n" + entryText;
        }
      }
    }
    // Check for sub-entries (indented numbered items like "   1.1 text", "  1.1 text", or numbered sub-items)
    else if (
      line.match(/^\s+\d+\.\d+\s/) ||
      line.match(/^\s+\d+\s-\s/) ||
      line.match(/^\d+\s-\s/)
    ) {
      if (currentEntry) {
        const subEntryText = line.replace(/^\s*(\d+\.\d+\s|\d+\s-\s)/, "");
        currentEntry.subEntries.push(subEntryText);
      }
    }
    // Check for lines that start with backticks (inline code) - treat as regular content
    else if (line.startsWith("`") && currentEntry) {
      if (!currentEntry.mainEntry) {
        currentEntry.mainEntry = line;
      } else {
        currentEntry.mainEntry += "\n" + line;
      }
    }
    // Check for continuation lines (lines that are part of previous entry)
    else if (
      line &&
      currentEntry &&
      !line.startsWith("##") &&
      !line.startsWith("=") &&
      !line.startsWith("---") &&
      !line.startsWith("```") &&
      currentEntry.mainEntry
    ) {
      // If it's not empty, not a header, and we have a current entry with content
      if (
        !line.match(/^\d+\./) &&
        !line.match(/^-\s/) &&
        !line.match(/^\s+\d+/)
      ) {
        // Add to main entry if it doesn't look like a numbered or bullet item
        // Check if it's indented (likely continuation of previous line)
        if (line.startsWith("  ") || line.startsWith("   ")) {
          currentEntry.mainEntry += " " + line.trim();
        } else {
          // Treat as new line in the same entry
          currentEntry.mainEntry += "\n" + line;
        }
      }
    }
  }

  // Don't forget the last entry
  if (currentEntry) {
    entries.push(currentEntry);
  }

  return entries.filter((entry) => entry.mainEntry.trim() !== "");
};

export const loadMarkdownFile = async (filePath) => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load ${filePath}`);
    }
    const content = await response.text();
    const parsed = parseMarkdownContent(content);
    console.log(`Parsed ${parsed.length} entries from ${filePath}`);
    if (filePath.includes("2025")) {
      console.log("Sample 2025 entries:", parsed.slice(0, 3));
    }
    return parsed;
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
    return [];
  }
};
