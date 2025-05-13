import { useState } from "react";
import { Link } from "react-router-dom";
import { useTicketContext } from "../../context/TicketContext";
import styles from "./tickets.module.css";

export function Tickets() {
  const { tickets, users, addTicket, toggleTicketStatus, assignTicket, unassignTicket } = useTicketContext();
  const [newTicket, setNewTicket] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">("all");

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === "completed") return ticket.completed;
    if (filter === "incomplete") return !ticket.completed;
    return true;
  });

  const handleAddButtonClick = async () => {
    if (newTicket.trim()) {
      await addTicket(newTicket);
      setNewTicket("");
    }
  };

  const handleAssignUser = (ticketId: number, userId: number) => {
    assignTicket(ticketId, userId);
  };

  const handleUnassignUser = (ticketId: number) => {
    unassignTicket(ticketId);
  };

  return (
    <div className={styles["tickets"]}>
      <h2>Tickets</h2>
      <div>
        <input
          type="text"
          value={newTicket}
          onChange={(e) => setNewTicket(e.target.value)}
          placeholder="Enter ticket description"
        />
        <button onClick={handleAddButtonClick}>Add Ticket</button>
      </div>
      <div>
        <label>Filter: </label>
        <select onChange={(e) => setFilter(e.target.value as any)} value={filter}>
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="incomplete">Incomplete</option>
        </select>
      </div>
      <ul>
        {filteredTickets.map((ticket) => (
          <li key={ticket.id}>
            <Link to={`/${ticket.id}`} className={styles["ticket-link"]}>
              <span>
                {ticket.description} - {ticket.completed ? "Completed" : "Incomplete"}
              </span>
            </Link>
            <div>
              <span>
                Assignee:{" "}
                {ticket.assigneeId ? (
                  <>
                    <select
                      onChange={(e) => handleAssignUser(ticket.id, Number(e.target.value))}
                      defaultValue={ticket.assigneeId}>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => handleUnassignUser(ticket.id)}>Unassign</button>
                  </>
                ) : (
                  <select onChange={(e) => handleAssignUser(ticket.id, Number(e.target.value))} defaultValue="">
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
              </span>
            </div>
            <button onClick={() => toggleTicketStatus(ticket.id, !ticket.completed)}>
              {ticket.completed ? "Mark as Incomplete" : "Mark as Completed"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Tickets;
