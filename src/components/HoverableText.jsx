function HoverableText({ text, translations }) {
  return text.split(/(\s+)/).map((part, index) => {
    if (/^\s+$/.test(part)) {
      return part;
    }

    const normalizedWord = part.toLowerCase().replace(/^[^a-z']+|[^a-z']+$/g, "");
    const translation = translations[normalizedWord];

    return (
      <span
        className="word"
        data-translation={translation}
        tabIndex={translation ? 0 : undefined}
        key={`${part}-${index}`}
      >
        {part}
      </span>
    );
  });
}

export default HoverableText;
