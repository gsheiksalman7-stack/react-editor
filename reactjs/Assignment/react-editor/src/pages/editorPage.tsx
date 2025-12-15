import { useState } from "react";
import WebsiteEditor from "../components/websiteEditor";

export default function EditorPage() {
  const [code, setCode] = useState(`
    function MyComponent() {
      return (
        <div style={{ padding: 20 }}>
          <h1>Hello World</h1>
          <p>This is editable text.</p>
        </div>
      );
    }
    export default MyComponent;
  `);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <textarea
        style={{ width: 400, height: "100%", padding: 10 }}
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <WebsiteEditor
        componentCode={code}
        onSave={(updated) => {
          console.log("Updated JSX:", updated);
          setCode(updated);
        }}
      />
    </div>
  );
}