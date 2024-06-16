import { useCallback, useEffect, useRef, useState } from 'react';

export const useHighlightElement = () => {
  const highlightImageRef = useRef<HTMLImageElement>(null);
  const [highlightedId, setHighlightedId] = useState<number>();
  const [highlightedPosition, setHighlightedPosition] = useState<{
    x: number;
    y: number;
    width: number;
  }>();

  const handleHighlightChange = useCallback(
    (change?: { value: { id: number }; node: HTMLDivElement }) => {
      if (!change) {
        setHighlightedId(undefined);
        setHighlightedPosition(undefined);
        return;
      }

      const { x, y, width } = change.node.getBoundingClientRect();

      setHighlightedId(change.value.id);
      setHighlightedPosition({ x, y, width });
    },
    [],
  );

  // TODO Fix delay of getting size when highlightedId changes too fast
  useEffect(() => {
    if (!highlightImageRef.current || !highlightedPosition) return;

    const rect = highlightImageRef.current.getBoundingClientRect();

    // Prevent images from being cropped when the option position is too left
    const xOffset =
      highlightedPosition.x - 240 - 12 < 0 // 240 === max-width of image
        ? `${highlightedPosition.x + highlightedPosition.width + 12}px`
        : `calc(${highlightedPosition.x - 12}px - 100%)`; // Cannot know image width at first image render

    // Prevent images from being cropped when the option position is too low
    const yOffset =
      highlightedPosition.y + rect.height + 12 > window.innerHeight
        ? `${window.innerHeight - rect.height - 12}px`
        : `${highlightedPosition.y}px`;

    highlightImageRef.current.style.transform = `translate(${xOffset}, ${yOffset})`;
  }, [highlightedPosition]);

  return { highlightImageRef, highlightedId, handleHighlightChange };
};
