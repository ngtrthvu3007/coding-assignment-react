import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Ticket, User } from "@acme/shared-models";

interface TicketContextType {
  tickets: Ticket[];
  users: User[];
  fetchTickets: () => void;
  addTicket: (description: string) => Promise<void>;
  toggleTicketStatus: (id: number, completed: boolean) => Promise<void>;
  assignTicket: (id: number, userId: number) => Promise<void>;
  unassignTicket: (ticketId: number) => Promise<void>;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const fetchTickets = async () => {
    const response = await fetch("/api/tickets");
    const data = await response.json();
    setTickets(data);
  };

  const fetchUsers = async () => {
    const response = await fetch("/api/users");
    const data = await response.json();
    setUsers(data);
  };

  const addTicket = async (description: string) => {
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    const newTicket = await response.json();
    setTickets((prev) => [...prev, newTicket]);
  };

  const toggleTicketStatus = async (id: number, completed: boolean) => {
    const endpoint = completed ? `/api/tickets/${id}/complete` : `/api/tickets/${id}/complete`;
    const method = completed ? "PUT" : "DELETE";

    await fetch(endpoint, { method });
    setTickets((prev) => prev.map((ticket) => (ticket.id === id ? { ...ticket, completed } : ticket)));
  };

  const assignTicket = async (id: number, userId: number) => {
    await fetch(`/api/tickets/${id}/assign/${userId}`, { method: "PUT" });
    setTickets((prev) => prev.map((ticket) => (ticket.id === id ? { ...ticket, assigneeId: userId } : ticket)));
  };

  const unassignTicket = async (ticketId: number) => {
    await fetch(`/api/tickets/${ticketId}/unassign`, { method: "PUT" });
    setTickets((prev) => prev.map((ticket) => (ticket.id === ticketId ? { ...ticket, assigneeId: null } : ticket)));
  };

  useEffect(() => {
    fetchTickets();
    fetchUsers();
  }, []);

  return (
    <TicketContext.Provider
      value={{ tickets, users, fetchTickets, addTicket, toggleTicketStatus, assignTicket, unassignTicket }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTicketContext = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error("useTicketContext must be used within a TicketProvider");
  }
  return context;
};
