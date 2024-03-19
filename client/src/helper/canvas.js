export const shapes = {
  arrow: (x1, y1, x2, y2, ctx) => {
    const headlen = 5;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headlen * Math.cos(angle - Math.PI / 7),
      y2 - headlen * Math.sin(angle - Math.PI / 7)
    );

    ctx.lineTo(
      x2 - headlen * Math.cos(angle + Math.PI / 7),
      y2 - headlen * Math.sin(angle + Math.PI / 7)
    );

    ctx.lineTo(x2, y2);
    ctx.lineTo(
      x2 - headlen * Math.cos(angle - Math.PI / 7),
      y2 - headlen * Math.sin(angle - Math.PI / 7)
    );
  },
  line: (x1, y1, x2, y2, ctx) => {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  },
  rectangle: (x1, y1, x2, y2, ctx) => {
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
  },
  diamond: (x1, y1, x2, y2, ctx) => {
    const width = x2 - x1;
    const height = y2 - y1;
    ctx.moveTo(x1 + width / 2, y1);
    ctx.lineTo(x2, y1 + height / 2);
    ctx.lineTo(x1 + width / 2, y2);
    ctx.lineTo(x1, y1 + height / 2);
  },
  circle: (x1, y1, x2, y2, ctx) => {
    const width = x2 - x1;
    const height = y2 - y1;
    ctx.ellipse(
      x1 + width / 2,
      y1 + height / 2,
      Math.abs(width) / 2,
      Math.abs(height) / 2,
      0,
      0,
      2 * Math.PI
    );
  },
};

export function distance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export function getFocuseDemention(element, padding) {
  const { x1, y1, x2, y2 } = element;

  if (element.tool == "line" || element.tool == "arrow")
    return { fx: x1, fy: y1, fw: x2, fh: y2 };

  const p = { min: padding, max: padding * 2 };
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  return {
    fx: minX - p.min,
    fy: minY - p.min,
    fw: maxX - minX + p.max,
    fh: maxY - minY + p.max,
  };
}

export function getFocuseCorners(element, padding, position) {
  let { fx, fy, fw, fh } = getFocuseDemention(element, padding);

  if (element.tool == "line" || element.tool == "arrow") {
    return {
      line: { fx, fy, fw, fh },
      corners: [
        {
          slug: "l1",
          x: fx - position,
          y: fy - position,
        },
        {
          slug: "l2",
          x: fw - position,
          y: fh - position,
        },
      ],
    };
  }
  return {
    line: { fx, fy, fw, fh },
    corners: [
      {
        slug: "tl",
        x: fx - position,
        y: fy - position,
      },
      {
        slug: "tr",
        x: fx + fw - position,
        y: fy - position,
      },
      {
        slug: "bl",
        x: fx - position,
        y: fy + fh - position,
      },
      {
        slug: "br",
        x: fx + fw - position,
        y: fy + fh - position,
      },
      {
        slug: "tt",
        x: fx + fw / 2 - position,
        y: fy - position,
      },
      {
        slug: "rr",
        x: fx + fw - position,
        y: fy + fh / 2 - position,
      },
      {
        slug: "ll",
        x: fx - position,
        y: fy + fh / 2 - position,
      },
      {
        slug: "bb",
        x: fx + fw / 2 - position,
        y: fy + fh - position,
      },
    ],
  };
}

export function drawFocuse(element, context, padding, scale) {
  const lineWidth = 1 / scale;
  const square = 10 / scale;
  let round = square;
  const position = square / 2;

  let demention = getFocuseCorners(element, padding, position);
  let { fx, fy, fw, fh } = demention.line;
  let corners = demention.corners;

  context.lineWidth = lineWidth;
  context.strokeStyle = "#211C6A";
  context.fillStyle = "#EEF5FF";

  if (element.tool != "line" && element.tool != "arrow") {
    context.beginPath();
    context.rect(fx, fy, fw, fh);
    context.setLineDash([0, 0]);
    context.stroke();
    context.closePath();
    round = 3 / scale;
  }

  context.beginPath();
  corners.forEach((corner) => {
    context.roundRect(corner.x, corner.y, square, square, round);
  });
  context.fill();
  context.stroke();
  context.closePath();
}

export function draw(element, context) {
  context.beginPath();
  const {
    tool,
    x1,
    y1,
    x2,
    y2,
    strokeWidth,
    strokeColor,
    strokeStyle,
    fill,
    opacity,
  } = element;

  context.lineWidth = strokeWidth;
  context.strokeStyle = rgba(strokeColor, opacity);
  context.fillStyle = rgba(fill, opacity);

  if (strokeStyle == "dashed")
    context.setLineDash([strokeWidth * 2, strokeWidth * 2]);
  if (strokeStyle == "dotted") context.setLineDash([strokeWidth, strokeWidth]);
  if (strokeStyle == "solid") context.setLineDash([0, 0]);

  shapes[tool](x1, y1, x2, y2, context);
  context.fill();
  context.closePath();
  if (strokeWidth > 0) context.stroke();
}

function rgba(color, opacity) {
  if (color == "transparent") return "transparent";

  let matches = color.match(
    /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
  );
  if (!matches) {
    throw new Error(
      "Invalid color format. Please provide a color in RGBA format."
    );
  }
  opacity /= 100;
  let red = parseInt(matches[1]);
  let green = parseInt(matches[2]);
  let blue = parseInt(matches[3]);
  let alpha = parseFloat(matches[4] * opacity || opacity);

  let newColor = `rgba(${red}, ${green}, ${blue}, ${alpha})`;

  return newColor;
}

export function inSelectedCorner(element, x, y, padding, scale) {
  padding = element.tool == "line" || element.tool == "arrow" ? 0 : padding;

  const square = 10 / scale;
  const position = square / 2;

  const corners = getFocuseCorners(element, padding, position).corners;

  const hoveredCorner = corners.find(
    (corner) =>
      x - corner.x <= square &&
      x - corner.x >= 0 &&
      y - corner.y <= square &&
      y - corner.y >= 0
  );

  return hoveredCorner;
}

export function cornerCursor(corner) {
  switch (corner) {
    case "tt":
    case "bb":
      return "s-resize";
    case "ll":
    case "rr":
      return "e-resize";
    case "tl":
    case "br":
      return "se-resize";
    case "tr":
    case "bl":
      return "ne-resize";
    case "l1":
    case "l2":
      return "pointer";
  }
}
