import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";

export default function Books() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useUser();

  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({ title: "", author: "", includeDeleted: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({ title: "", author: "", quantity: 0, location: "" });
  const isAdmin = useMemo(() => user.role === "ADMIN", [user.role]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.title) params.set("title", filters.title);
      if (filters.author) params.set("author", filters.author);
      if (filters.includeDeleted && isAdmin) params.set("includeDeleted", "true");

      const res = await fetch(`${API_URL}/api/book?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setBooks([]);
        return;
      }

      const data = await res.json();
      setBooks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const flashMessage = sessionStorage.getItem("flash_message");
    if (flashMessage) {
      setMessage(flashMessage);
      sessionStorage.removeItem("flash_message");
    }
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createBook = async () => {
    if (!isAdmin) return;

    await fetch(`${API_URL}/api/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: form.title,
        author: form.author,
        quantity: Number(form.quantity),
        location: form.location,
      }),
    });

    setForm({ title: "", author: "", quantity: 0, location: "" });
    await loadBooks();
  };

  return (
    <div>
      <h2>Books</h2>
      <div style={{ marginBottom: 12 }}>
        <Link to="/borrow">Borrow Requests</Link> | <Link to="/logout">Logout</Link>
      </div>
      {message && <div className="status-msg">{message}</div>}

      <div>
        <input
          placeholder="Filter by title"
          value={filters.title}
          onChange={(e) => setFilters((p) => ({ ...p, title: e.target.value }))}
        />
        <input
          placeholder="Filter by author"
          value={filters.author}
          onChange={(e) => setFilters((p) => ({ ...p, author: e.target.value }))}
          style={{ marginLeft: 8 }}
        />
        {isAdmin && (
          <label style={{ marginLeft: 8 }}>
            <input
              type="checkbox"
              checked={filters.includeDeleted}
              onChange={(e) => setFilters((p) => ({ ...p, includeDeleted: e.target.checked }))}
            />
            Include deleted
          </label>
        )}
        <button onClick={loadBooks} style={{ marginLeft: 8 }}>
          Search
        </button>
      </div>

      {isAdmin && (
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <h3>Create Book</h3>
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
          <input
            placeholder="Author"
            value={form.author}
            onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
            style={{ marginLeft: 8 }}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
            style={{ marginLeft: 8, width: 100 }}
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            style={{ marginLeft: 8 }}
          />
          <button onClick={createBook} style={{ marginLeft: 8 }}>
            Create
          </button>
        </div>
      )}

      {loading ? (
        <div>Loading books...</div>
      ) : (
        <table border="1" cellPadding="6" style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Quantity</th>
              <th>Location</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book._id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.quantity}</td>
                <td>{book.location}</td>
                <td>{book.status}</td>
                <td>
                  <Link to={`/books/${book._id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
