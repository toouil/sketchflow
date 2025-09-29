export const imageCache = new Map();
let textWriting = null;

export const writing = (id) => {
  textWriting = id
}

export const shapes = {
  arrow: ({ x1, y1, x2, y2 }, ctx) => {
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

  line: ({ x1, y1, x2, y2 }, ctx) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  },

  rectangle: ({ x1, y1, x2, y2, borderRadius }, ctx) => {
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const top = Math.min(y1, y2);
    const bottom = Math.max(y1, y2);

    const width = right - left;
    const height = bottom - top;

    const r = Math.min(borderRadius, width / 2, height / 2);

    ctx.beginPath();
    ctx.moveTo(left + r, top); // top-left
    ctx.lineTo(right - r, top);
    ctx.quadraticCurveTo(right, top, right, top + r);
    ctx.lineTo(right, bottom - r);
    ctx.quadraticCurveTo(right, bottom, right - r, bottom); // bottom-right
    ctx.lineTo(left + r, bottom);
    ctx.quadraticCurveTo(left, bottom, left, bottom - r); // bottom-left
    ctx.lineTo(left, top + r);
    ctx.quadraticCurveTo(left, top, left + r, top); // back to top-left
    ctx.closePath();
  },

  diamond: ({ x1, y1, x2, y2 }, ctx) => {
    ctx.beginPath();
    const width = x2 - x1;
    const height = y2 - y1;
    ctx.moveTo(x1 + width / 2, y1);
    ctx.lineTo(x2, y1 + height / 2);
    ctx.lineTo(x1 + width / 2, y2);
    ctx.lineTo(x1, y1 + height / 2);
    ctx.closePath();
  },

  circle: ({ x1, y1, x2, y2 }, ctx) => {
    ctx.beginPath();
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
    ctx.closePath();
  },
  image: ({ id, x1, y1, x2, y2, image }, ctx) => {
    let cached = imageCache.get(id);

    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    if (cached) {
      ctx.drawImage(cached, left, top, width, height);
      return;
    }

    cached = new Image();
    cached.src = image;
    cached.onload = () => {
      ctx.drawImage(cached, left, top, width, height);
      imageCache.set(id, cached);
    };
  },
  pencil: ({ points, strokeWidth }, ctx) => {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }

    const lastpoint = points[points.length - 1];

    if (
      !(
        Math.abs(lastpoint.x - points[0].x) < strokeWidth &&
        Math.abs(lastpoint.y - points[0].y) < strokeWidth
      )
    ) {
      ctx.fillStyle = "transparent";
    }
    ctx.lineTo(lastpoint.x, lastpoint.y);
  },
  text: ({ id, x1, y1, text }, ctx) => {
    if (id == textWriting)  return;
    ctx.font = "30px Arial";
    ctx.textBaseline = "top";

    const textLines = text.split("\n");

    textLines.forEach((line, index) => {
      ctx.fillText(line, x1, y1 + 30 * index); // x=100, y=50
    });
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
  if (!element) return;
  context.beginPath();
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
  const { tool, strokeWidth, strokeColor, strokeStyle, fill, opacity } =
    element;

  context.beginPath();
  context.lineWidth = strokeWidth;
  context.strokeStyle = strokeColor;
  context.fillStyle = tool == "text" ? strokeColor : fill;

  context.globalAlpha = opacity * 0.01;

  if (strokeStyle === "dashed")
    context.setLineDash([strokeWidth * 2, strokeWidth * 2]);
  else if (strokeStyle === "dotted")
    context.setLineDash([strokeWidth, strokeWidth]);
  else context.setLineDash([0, 0]);

  shapes[tool](element, context);
  context.fill();
  if (strokeWidth > 0) context.stroke();

  context.closePath();
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
  if (!element) return null;
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
