export const createIconElement = (svgString) => {
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(svgString, "image/svg+xml");
  const svgElement = doc.documentElement;

  return svgElement;
};
