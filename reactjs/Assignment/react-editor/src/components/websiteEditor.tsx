import { useEffect, useRef, useState } from "react";
import * as Babel from "@babel/standalone";
import { renderToString } from "react-dom/server";

interface Props {
    componentCode: string;
    onSave: (jsx: string) => void;
}

export default function WebsiteEditor({ componentCode, onSave }: Props) {
    const previewRef = useRef<HTMLDivElement>(null);
    const [selectedEl, setSelectedEl] = useState<HTMLElement | null>(null);

    // ✅ Editor state that React controls
    const [editorValues, setEditorValues] = useState({
        text: "",
        color: "#000000",
        fontSize: 16,
        fontWeight: "normal",
    });

    useEffect(() => {
        try {
            const compiled = Babel.transform(componentCode, {
                filename: "component.tsx",
                presets: ["react", "typescript"],
                plugins: ["transform-modules-commonjs"],
            }).code;

            const Component = eval(`
        const exports = {};
        const React = window.React;
        ${compiled}
        exports.default;
      `);

            const root = previewRef.current;

            if (root) {
                root.innerHTML = "";
                const mount = document.createElement("div");
                root.appendChild(mount);

                // ✅ Render to HTML string (NOT React DOM)
                const html = renderToString(<Component />);
                mount.innerHTML = html;

                enableSelection(mount, (el) => {
                    setSelectedEl(el);

                    // ✅ Load DOM values into React state
                    setEditorValues({
                        text: el.innerText,
                        color: el.style.color || "#000000",
                        fontSize: parseInt(el.style.fontSize || "16"),
                        fontWeight: el.style.fontWeight || "normal",
                    });
                });
            }
        } catch (err) {
            console.error("Compilation error:", err);
        }
    }, [componentCode]);

    function updateStyle(key: string, value: string | number) {
        if (!selectedEl) return;

        // ✅ Update DOM
        if (key === "fontSize") {
            selectedEl.style.fontSize = value + "px";
        } else {
            selectedEl.style[key as any] = value as string;
        }

        // ✅ Update React state
        setEditorValues((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    function save() {
        if (!previewRef.current) return;

        const el = previewRef.current.children[0] as HTMLElement;
        const jsx = serializeElement(el);
        onSave(jsx);
    }

    const inputStyle: React.CSSProperties = {
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid #d1d5db",
        fontSize: 14,
        outline: "none",
        transition: "0.2s",
    };

    return (
        <div style={{
            display: "flex",
            height: "100vh",
            background: "#f5f7fa",
            fontFamily: "Inter, sans-serif"
        }}>

            {/* ✅ Preview Area */}
            <div
                ref={previewRef}
                style={{
                    flex: 1,
                    margin: 20,
                    background: "white",
                    borderRadius: 12,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    padding: 20,
                    overflow: "auto",
                    border: "1px solid #e5e7eb",
                }}
            />

            {/* ✅ Sidebar */}
            <div
                style={{
                    width: 320,
                    background: "white",
                    borderLeft: "1px solid #e5e7eb",
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                    boxShadow: "-4px 0 20px rgba(0,0,0,0.04)",
                }}
            >
                <h2 style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#111827",
                }}>
                    Element Editor
                </h2>

                {selectedEl ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* ✅ Label + Input */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={{ fontSize: 14, color: "#374151" }}>Text</label>
                            <input
                                value={editorValues.text}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    selectedEl.innerText = value;
                                    setEditorValues((v) => ({ ...v, text: value }));
                                }}
                                style={inputStyle}
                            />
                        </div>

                        {/* ✅ Color */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={{ fontSize: 14, color: "#374151" }}>Color</label>
                            <input
                                type="color"
                                value={editorValues.color}
                                onChange={(e) => updateStyle("color", e.target.value)}
                                style={{
                                    width: "100%",
                                    height: 40,
                                    borderRadius: 8,
                                    border: "1px solid #d1d5db",
                                    cursor: "pointer",
                                }}
                            />
                        </div>

                        {/* ✅ Font Size */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={{ fontSize: 14, color: "#374151" }}>Font Size</label>
                            <input
                                type="number"
                                value={editorValues.fontSize}
                                onChange={(e) =>
                                    updateStyle("fontSize", parseInt(e.target.value))
                                }
                                style={inputStyle}
                            />
                        </div>

                        {/* ✅ Font Weight */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={{ fontSize: 14, color: "#374151" }}>Font Weight</label>
                            <select
                                value={editorValues.fontWeight}
                                onChange={(e) => updateStyle("fontWeight", e.target.value)}
                                style={inputStyle}
                            >
                                <option value="normal">Normal</option>
                                <option value="bold">Bold</option>
                            </select>
                        </div>

                        {/* ✅ Save Button */}
                        <button
                            onClick={save}
                            style={{
                                marginTop: 10,
                                padding: "12px 16px",
                                background: "#2563eb",
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                fontSize: 15,
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "0.2s",
                            }}
                        >
                            Save Changes
                        </button>

                    </div>
                ) : (
                    <p style={{ color: "#6b7280" }}>Select an element to edit</p>
                )}
            </div>
        </div>
    );
}

/* ✅ Selection logic */
function enableSelection(root: HTMLElement, onSelect: (el: HTMLElement) => void) {
    root.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const target = e.target as HTMLElement;

        root.querySelectorAll("[data-selected]").forEach((el) => {
            el.removeAttribute("data-selected");
            (el as HTMLElement).style.outline = "none";
        });

        target.setAttribute("data-selected", "true");
        target.style.outline = "2px solid #4A90E2";

        onSelect(target);
    });
}

/* ✅ Custom JSX serializer */
function serializeElement(el: HTMLElement): string {
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