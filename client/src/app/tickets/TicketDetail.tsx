import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Ticket } from "@acme/shared-models";
import { useTicketContext } from "../../context/TicketContext";
import styles from "./tickets.module.css";

export function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const { users, assignTicket, unassignTicket } = useTicketContext();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/tickets/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch ticket details");
        }
        const data = await response.json();
        setTicket(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchTicket();
  }, [id]);

  const toggleTicketStatus = async () => {
    if (!ticket) return;

    try {
      const endpoint = ticket.completed ? `/api/tickets/${ticket.id}/complete` : `/api/tickets/${ticket.id}/complete`;
      const method = ticket.completed ? "DELETE" : "PUT";

      const response = await fetch(endpoint, { method });
      if (!response.ok) {
        throw new Error("Failed to update ticket status");
      }
      setTicket((prev) => (prev ? { ...prev, completed: !prev.completed } : prev));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAssignUser = async (userId: number) => {
    if (!ticket) return;

    try {
      await assignTicket(ticket.id, userId);
      setTicket((prev) => (prev ? { ...prev, assigneeId: userId } : prev));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUnassignUser = async () => {
    if (!ticket) return;

    try {
      await unassignTicket(ticket.id);
      setTicket((prev) => (prev ? { ...prev, assigneeId: null } : prev));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (error) {
    return <h2>{error}</h2>;
  }
  if (!ticket) {
    return <h2>Ticket not found</h2>;
  }

  return (
    <div className={styles["ticket-details"]}>
      <h2>Ticket Details</h2>
      <p>ID: {ticket.id}</p>
      <p>Description: {ticket.description}</p>
      <p>Status: {ticket.completed ? "Completed" : "Incomplete"}</p>
      <button onClick={toggleTicketStatus}>{ticket.completed ? "Mark as Incomplete" : "Mark as Completed"}</button>
      <div>
        <p>
          Assignee:{" "}
          {ticket.assigneeId ? users.find((user) => user.id === ticket.assigneeId)?.name || "Unknown" : "None"}
        </p>
        {ticket.assigneeId ? (
          <button onClick={handleUnassignUser}>Unassign</button>
        ) : (
          <select onChange={(e) => handleAssignUser(Number(e.target.value))} defaultValue="">
            <option value="" disabled>
              Select a user
            </option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
