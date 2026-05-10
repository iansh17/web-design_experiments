import React, { useState } from "react";

function NotesApp() {
  const [notes, setNotes]   = useState([]);
  const [input, setInput]   = useState("");
  const [editId, setEditId] = useState(null);

  const addOrUpdateNote = () => {
    if (input.trim() === "") return;

    if (editId !== null) {
      setNotes(notes.map(note =>
        note.id === editId ? { ...note, text: input } : note
      ));
      setEditId(null);
    } else {
      setNotes([...notes, { id: Date.now(), text: input }]);
    }
    setInput("");
  };

  const editNote = (id) => {
    const note = notes.find(n => n.id === id);
    setInput(note.text);
    setEditId(id);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
    if (editId === id) { setEditId(null); setInput(""); }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "30px auto", textAlign: "center",
                  fontFamily: "Arial, sans-serif" }}>
      <h2>📝 Notes App</h2>

      <input
        type="text"
        placeholder="Enter note..."
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && addOrUpdateNote()}
        style={{ padding: "10px", width: "70%", borderRadius: "6px",
                 border: "1px solid #ccc", fontSize: "1rem" }}
      />
      <button
        onClick={addOrUpdateNote}
        style={{ marginLeft: "10px", padding: "10px 16px", borderRadius: "6px",
                 background: editId ? "#d97706" : "#1a56a5", color: "#fff",
                 border: "none", cursor: "pointer", fontSize: "1rem" }}
      >
        {editId !== null ? "Update" : "Add"}
      </button>

      {editId !== null && (
        <button
          onClick={() => { setEditId(null); setInput(""); }}
          style={{ marginLeft: "8px", padding: "10px 16px", borderRadius: "6px",
                   background: "#64748b", color: "#fff", border: "none", cursor: "pointer" }}
        >
          Cancel
        </button>
      )}

      <p style={{ color: "#64748b", fontSize: ".85rem", marginTop: "8px" }}>
        {notes.length} note{notes.length !== 1 ? "s" : ""}
      </p>

      <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
        {notes.length === 0 && (
          <p style={{ color: "#94a3b8" }}>No notes yet. Add one above!</p>
        )}
        {notes.map(note => (
          <li key={note.id}
              style={{ margin: "10px 0", padding: "12px 16px",
                       border: editId === note.id ? "2px solid #d97706" : "1px solid #e2e8f0",
                       borderRadius: "8px", background: "#f8fafc",
                       display: "flex", justifyContent: "space-between", alignItems: "center",
                       gap: "8px", textAlign: "left" }}>
            <span style={{ flex: 1, wordBreak: "break-word" }}>{note.text}</span>
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <button onClick={() => editNote(note.id)}
                      style={{ padding: "5px 10px", borderRadius: "5px",
                               background: "#1a56a5", color: "#fff",
                               border: "none", cursor: "pointer" }}>
                ✏️ Edit
              </button>
              <button onClick={() => deleteNote(note.id)}
                      style={{ padding: "5px 10px", borderRadius: "5px",
                               background: "#dc2626", color: "#fff",
                               border: "none", cursor: "pointer" }}>
                🗑️ Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotesApp;