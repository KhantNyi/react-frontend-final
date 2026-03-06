import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";

export default function BookBorrow() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useUser();

  const [requests, setRequests] = useState([]);
  const [books, setBooks] = useState([]);
  const [bookId, setBookId] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [message, setMessage] = useState("");

  const isUser = useMemo(() => user.role === "USER", [user.role]);
  const isAdmin = useMemo(() => user.role === "ADMIN", [user.role]);

  const bookMap = useMemo(() => {
    const map = new Map();
    books.forEach((book) => map.set(book._id, book));
    return map;
  }, [books]);

  const loadRequests = async () => {
    const res = await fetch(`${API_URL}/api/borrow`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      setRequests([]);
      return;
    }
    const data = await res.json();
    setRequests(data);
  };

  const loadBooks = async () => {
    const res = await fetch(`${API_URL}/api/book`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      setBooks([]);
      return;
    }
    const data = await res.json();
    setBooks(data);
  };

  useEffect(() => {
    loadRequests();
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitBorrow = async () => {
    if (!bookId || !targetDate) return;

    const res = await fetch(`${API_URL}/api/borrow`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, targetDate }),
    });

    const data = await res.json().catch(() => ({}));
    setMessage(data.message || (res.ok ? "Request submitted" : "Unable to submit request"));

    setBookId("");
    setTargetDate("");
    await loadRequests();
    await loadBooks();
  };

  const updateRequest = async (requestId, action) => {
    const res = await fetch(`${API_URL}/api/borrow`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action }),
    });

    const data = await res.json().catch(() => ({}));
    setMessage(data.message || (res.ok ? "Request updated" : "Unable to update request"));

    await loadRequests();
    await loadBooks();
  };

  return (
    <div className="page-wrap">
      <h2>Borrow Requests</h2>
      <div className="top-nav">
        <Link to="/books">Books</Link>
        <span> | </span>
        <Link to="/logout">Logout</Link>
      </div>

      {message && <div className="status-msg">{message}</div>}

      {isUser && (
        <section className="panel">
          <h3>Submit Borrow Request</h3>
          <div className="inline-controls">
            <select value={bookId} onChange={(e) => setBookId(e.target.value)}>
              <option value="">Select Book</option>
              {books.map((book) => (
                <option key={book._id} value={book._id}>
                  {book.title} - {book.author}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
            <button onClick={submitBorrow}>Submit</button>
          </div>
        </section>
      )}

      <section className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Book</th>
              <th>Created At</th>
              <th>Target Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => {
              const book = bookMap.get(request.bookId);
              const canAdminAct = isAdmin && request.requestStatus === "INIT";
              const canUserAct =
                isUser &&
                request.requestStatus === "INIT" &&
                request.userId === user.id;

              return (
                <tr key={request._id}>
                  <td>{request.userId}</td>
                  <td>{book ? `${book.title} (${book.author})` : request.bookId}</td>
                  <td>{new Date(request.createdAt).toLocaleString()}</td>
                  <td>{new Date(request.targetDate).toLocaleDateString()}</td>
                  <td>{request.requestStatus}</td>
                  <td>
                    {canAdminAct && (
                      <>
                        <button
                          className="btn-secondary"
                          onClick={() => updateRequest(request._id, "APPROVE")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => updateRequest(request._id, "CANCEL_ADMIN")}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {canUserAct && (
                      <button
                        className="btn-danger"
                        onClick={() => updateRequest(request._id, "CANCEL_USER")}
                      >
                        Cancel
                      </button>
                    )}
                    {!canAdminAct && !canUserAct && <span className="muted">-</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
