import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";

export function BookDetail() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [book, setBook] = useState(null);
  const [form, setForm] = useState({ title: "", author: "", quantity: 0, location: "", status: "ACTIVE" });

  const isAdmin = useMemo(() => user.role === "ADMIN", [user.role]);

  const loadBook = async () => {
    const res = await fetch(`${API_URL}/api/book/${id}`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      navigate("/books");
      return;
    }

    const data = await res.json();
    setBook(data);
    setForm({
      title: data.title,
      author: data.author,
      quantity: data.quantity,
      location: data.location,
      status: data.status,
    });
  };

  useEffect(() => {
    loadBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateBook = async () => {
    await fetch(`${API_URL}/api/book/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        quantity: Number(form.quantity),
      }),
    });
    await loadBook();
  };

  const softDeleteBook = async () => {
    await fetch(`${API_URL}/api/book/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    navigate("/books");
  };

  if (!book) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Book Detail</h2>
      <div style={{ marginBottom: 12 }}>
        <Link to="/books">Back to Books</Link> | <Link to="/borrow">Borrow Requests</Link>
      </div>

      <table>
        <tbody>
          <tr>
            <th>Title</th>
            <td>
              {isAdmin ? (
                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              ) : (
                book.title
              )}
            </td>
          </tr>
          <tr>
            <th>Author</th>
            <td>
              {isAdmin ? (
                <input value={form.author} onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))} />
              ) : (
                book.author
              )}
            </td>
          </tr>
          <tr>
            <th>Quantity</th>
            <td>
              {isAdmin ? (
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                />
              ) : (
                book.quantity
              )}
            </td>
          </tr>
          <tr>
            <th>Location</th>
            <td>
              {isAdmin ? (
                <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
              ) : (
                book.location
              )}
            </td>
          </tr>
          <tr>
            <th>Status</th>
            <td>
              {isAdmin ? (
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DELETED">DELETED</option>
                </select>
              ) : (
                book.status
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {isAdmin ? (
        <div style={{ marginTop: 12 }}>
          <button onClick={updateBook}>Update</button>
          <button onClick={softDeleteBook} style={{ marginLeft: 8 }}>
            Soft Delete
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          <Link to="/borrow">Request Borrow</Link>
        </div>
      )}
    </div>
  );
}
