import { z } from "zod";

// Schéma pour les discussions
export const discussionSchema = z.object({
  id: z.number(),
  created_at: z.string(),
  id_discussion: z.string(),
  id_client: z.string(),
  id_gp: z.string(),
  nom_gp: z.string(),
  nom_client: z.string(),
  msg_count_client: z.number(),
  msg_count_gp: z.number(),
  lastMessageDate: z.string().nullable(),
});

// Schéma pour les messages
export const messageSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  content: z.string(),
  id_discussion: z.string(),
  sender_id: z.string(),
  file_type: z.string().optional(),
  file_url: z.string().optional(),
});

// Types dérivés
export type Discussion = z.infer<typeof discussionSchema>;
export type Message = z.infer<typeof messageSchema>;

// Types pour les props des composants
export interface DiscussionListProps {
  discussions: Discussion[];
  onSelectDiscussion: (discussion: Discussion) => void;
  selectedDiscussion: Discussion | null;
  currentUserId: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  discussion: Discussion;
}

export interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}
