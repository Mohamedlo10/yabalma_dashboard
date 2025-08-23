import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  Paperclip,
  Phone,
  MoreVertical,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  getDiscussions,
  getMessages,
  sendMessage,
  isMessageFromDashboard,
  Discussion,
  Message,
} from "@/app/api/messages/query";
import { getSupabaseUser } from "@/lib/authMnager";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { DEFAULT_SENDER_ID } from "@/lib/constants";
import NewDiscussionDialog from "./new-discussion-dialog";

export default function MessageryDashboard() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] =
    useState<Discussion | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll vers le bas automatiquement
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Charger les discussions
  useEffect(() => {
    const loadDiscussions = async () => {
      try {
        setLoading(true);
        const discussionsData = await getDiscussions();
        setDiscussions(discussionsData);
      } catch (error) {
        console.error("Erreur lors du chargement des discussions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDiscussions();
  }, [currentUser]);

  // Charger les messages d'une discussion
  const loadMessages = async (discussion: Discussion) => {
    try {
      const messagesData = await getMessages(discussion.id_discussion);
      setMessages(messagesData);
      setSelectedDiscussion(discussion);
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
    }
  };

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedDiscussion || sending) return;

    try {
      setSending(true);

      // Tous les messages depuis le dashboard utilisent DEFAULT_SENDER_ID
      await sendMessage(selectedDiscussion.id_discussion, newMessage.trim());

      // Recharger les messages
      await loadMessages(selectedDiscussion);

      // Recharger les discussions pour mettre à jour les compteurs
      const discussionsData = await getDiscussions();
      setDiscussions(discussionsData);

      setNewMessage("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    } finally {
      setSending(false);
    }
  };

  // Fonction pour actualiser les données
  const refreshData = async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);

      // Recharger les discussions
      const discussionsData = await getDiscussions();
      setDiscussions(discussionsData);

      // Si une discussion est sélectionnée, recharger ses messages
      if (selectedDiscussion) {
        const messagesData = await getMessages(
          selectedDiscussion.id_discussion
        );
        setMessages(messagesData);
      }

      console.log("🔄 Données actualisées");
    } catch (error) {
      console.error("Erreur lors de l'actualisation:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Actualisation automatique toutes les 3 secondes
  useEffect(() => {
    // Démarrer l'intervalle d'actualisation
    intervalRef.current = setInterval(() => {
      refreshData();
    }, 3 * 1000); // 3 secondes en millisecondes

    // Nettoyer l'intervalle lors du démontage du composant
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedDiscussion]); // Redémarrer si la discussion change

  // Filtrer les discussions
  const filteredDiscussions = discussions.filter(
    (discussion) =>
      discussion.nom_client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.nom_gp?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Déterminer si l'utilisateur est le client ou le GP
  const isUserClient = (discussion: Discussion) =>
    discussion.id_client === DEFAULT_SENDER_ID;
  const getOtherPersonName = (discussion: Discussion) =>
    isUserClient(discussion) ? discussion.nom_gp : discussion.nom_client;

  const getUnreadCount = (discussion: Discussion) =>
    isUserClient(discussion)
      ? discussion.msg_count_gp
      : discussion.msg_count_client;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Liste des discussions */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <NewDiscussionDialog
            currentUserId={currentUser?.id || ""}
            currentUserName={currentUser?.email || "Utilisateur"}
            onDiscussionCreated={async () => {
              // Recharger les discussions après création
              if (currentUser?.id) {
                const discussionsData = await getDiscussions();
                setDiscussions(discussionsData);
              }
            }}
          />

          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
              className="px-3"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* Indicateur d'actualisation automatique */}
          <div className="mt-2">
            <p className="text-xs text-gray-500 text-center">
              {refreshing
                ? "Actualisation en cours..."
                : "Actualisation automatique toutes les 3 secondes - 5 secondes"}
            </p>
          </div>
        </div>

        {/* Liste des discussions */}
        <ScrollArea className="flex-1">
          {filteredDiscussions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>Aucune discussion trouvée</p>
            </div>
          ) : (
            <div className="divide-y max-h-[50vh] divide-gray-100">
              {filteredDiscussions.map((discussion) => {
                const otherPersonName = getOtherPersonName(discussion);
                const unreadCount = getUnreadCount(discussion);
                const isActive =
                  selectedDiscussion?.id_discussion ===
                  discussion.id_discussion;

                return (
                  <div
                    key={discussion.id_discussion}
                    onClick={() => loadMessages(discussion)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isActive ? "bg-blue-50 border-r-2 border-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {otherPersonName?.charAt(0)?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {otherPersonName || "Utilisateur inconnu"}
                          </p>
                          {discussion.lastMessageDate && (
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(
                                new Date(discussion.lastMessageDate),
                                {
                                  addSuffix: true,
                                  locale: fr,
                                }
                              )}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-500">
                            {discussion.msg_count_client +
                              discussion.msg_count_gp}{" "}
                            messages
                          </p>
                          {unreadCount > 0 && (
                            <Badge variant="default" className="bg-blue-600">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col">
        {selectedDiscussion ? (
          <>
            {/* Header du chat */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-green-100 text-green-600">
                      {getOtherPersonName(selectedDiscussion)
                        ?.charAt(0)
                        ?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getOtherPersonName(selectedDiscussion) ||
                        "Utilisateur inconnu"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {isUserClient(selectedDiscussion)
                        ? "Gestionnaire de points"
                        : "Client"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshData}
                    disabled={refreshing}
                    className="hover:bg-blue-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                  </Button>
                  {/*  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button> */}
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4  h-[50vh] overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <p>Aucun message dans cette conversation</p>
                    <p className="text-sm mt-2">
                      Écrivez le premier message pour commencer
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    // Message du dashboard = message envoyé par ce projet
                    const isMyMessage = isMessageFromDashboard(message);

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isMyMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isMyMessage
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isMyMessage ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Zone de saisie */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>

                <Input
                  type="text"
                  placeholder="Tapez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                  disabled={sending}
                />

                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          // État vide
          <div className="flex-1 flex lg:min-h-[70vh] items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <Send className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-gray-500">
                Choisissez une discussion dans la liste pour commencer à chatter
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
