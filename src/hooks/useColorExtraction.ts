import { useState, useEffect } from "react";

interface ExtractedColors {
  dominant: string;
  vibrant: string;
}

export function useColorExtraction(imageUrl: string | null): ExtractedColors {
  const [colors, setColors] = useState<ExtractedColors>({
    dominant: "hsl(var(--primary))",
    vibrant: "hsl(var(--primary))",
  });

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);

      const imageData = ctx.getImageData(0, 0, 50, 50).data;
      const colorCounts: Record<string, { count: number; r: number; g: number; b: number }> = {};

      for (let i = 0; i < imageData.length; i += 4) {
        const r = Math.round(imageData[i] / 20) * 20;
        const g = Math.round(imageData[i + 1] / 20) * 20;
        const b = Math.round(imageData[i + 2] / 20) * 20;
        const key = `${r},${g},${b}`;

        if (!colorCounts[key]) {
          colorCounts[key] = { count: 0, r, g, b };
        }
        colorCounts[key].count++;
      }

      const sortedColors = Object.values(colorCounts)
        .filter(c => c.r + c.g + c.b > 50 && c.r + c.g + c.b < 700)
        .sort((a, b) => b.count - a.count);

      if (sortedColors.length > 0) {
        const dominant = sortedColors[0];
        const vibrant = sortedColors.find(c => {
          const saturation = Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
          return saturation > 50;
        }) || dominant;

        setColors({
          dominant: `rgb(${dominant.r}, ${dominant.g}, ${dominant.b})`,
          vibrant: `rgb(${vibrant.r}, ${vibrant.g}, ${vibrant.b})`,
        });
      }
    };
  }, [imageUrl]);

  return colors;
}
