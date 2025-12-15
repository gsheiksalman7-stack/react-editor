export function serializeElement(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase();

  const children = Array.from(el.childNodes)
    .map((child) =>
      child.nodeType === 3
        ? child.textContent
        : serializeElement(child as HTMLElement)
    )
    .join("");

  const style = el.getAttribute("style");
  const styleAttr = style ? ` style={{ ${styleToJs(style)} }}` : "";

  return `<${tag}${styleAttr}>${children}</${tag}>`;
}

function styleToJs(style: string) {
  return style
    .split(";")
    .filter(Boolean)
    .map((s) => {
      const [k, v] = s.split(":");
      return `${toCamel(k.trim())}: "${v.trim()}"`;
    })
    .join(", ");
}

function toCamel(str: string) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}