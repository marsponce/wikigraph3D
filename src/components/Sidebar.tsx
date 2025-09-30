// src/app/components/Sidebar.tsx
import parse from "html-react-parser";
import he from "he";

export default function Sidebar({ node }) {
  if (!node)
    return (
      <div className="p-4 border rounded bg-gray-100">No node selected</div>
    );

  const decodedDescription = node.description
    ? he.decode(node.description)
    : null;

  const decodedExtract = node.extract ? he.decode(node.extract) : null;

  return (
    <div className="p-4 border rounded">
      <h1 className="font-bold">{node.name}</h1>
      {node.extract && (
        <div className="prose">
          <h2 className="font-bold">Extract</h2>
          {parse(decodedExtract)}
        </div>
      )}
      {node.description && (
        <div className="prose">
          <h2 className="font-bold">Description</h2>
          {parse(decodedDescription)}
        </div>
      )}
    </div>
  );
}
