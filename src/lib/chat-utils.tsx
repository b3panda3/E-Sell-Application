import React from 'react';

/**
 * Renders chat content by converting URLs into clickable links
 * while preserving non-URL text, whitespace, and newlines.
 */
export function renderChatContent(content: string): React.ReactNode[] {
  // Regex to match URLs (http:// or https:// followed by non-whitespace chars)
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const parts = content.split(urlRegex);
  const elements: React.ReactNode[] = [];

  parts.forEach((part, index) => {
    if (urlRegex.test(part)) {
      // This part is a URL — render as a clickable link
      elements.push(
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 dark:text-blue-400 underline hover:text-blue-600 dark:hover:text-blue-300"
        >
          {part}
        </a>
      );
    } else if (part) {
      // Non-URL text — preserve as-is (whitespace handled by whitespace-pre-wrap on parent)
      elements.push(<React.Fragment key={index}>{part}</React.Fragment>);
    }
  });

  return elements;
}
