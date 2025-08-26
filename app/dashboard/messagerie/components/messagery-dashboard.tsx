import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  Paperclip,
  Phone,
  MoreVertical,
  RefreshCw,
  FileText,
  Image,
  Video,
  Music,
  Download,
  File,
  X,
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
  uploadFileMessage,
} from "@/app/api/messages/query";
import { uploadFile as supabaseUploadFile } from "@/app/api/clients/query";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fonction utilitaire pour déterminer le type de fichier à partir de l'extension
  const getFileTypeFromExtension = (extension: string): string => {
    const ext = extension?.toLowerCase();

    if (!ext) return ext;

    // Images seulement → "image"
    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) {
      return "image";
    }

    // Tous les autres types gardent leur extension exacte
    return ext;
  };

  // Fonction pour obtenir l'extension à partir d'une URL
  const getExtensionFromUrl = (url: string): string => {
    const urlParts = url.split("?")[0]; // Enlever les paramètres de query
    const fileName = urlParts.split("/").pop() || "";
    return fileName.split(".").pop()?.toLowerCase() || "";
  };

  // Fonction pour obtenir l'icône et le type selon l'extension de fichier ou URL
  const getFileIcon = (fileTypeOrUrl: string) => {
    // Si c'est une URL, extraire l'extension
    let extension = fileTypeOrUrl;
    if (fileTypeOrUrl.includes("http") || fileTypeOrUrl.includes("/")) {
      extension = getExtensionFromUrl(fileTypeOrUrl);
    } else {
      extension = fileTypeOrUrl?.toLowerCase();
    }

    if (!extension)
      return { icon: File, type: "Fichier", color: "text-gray-500" };

    // Images
    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(extension)
    ) {
      return { icon: Image, type: "Image", color: "text-green-500" };
    }

    // Vidéos
    if (
      ["mp4", "avi", "mkv", "mov", "wmv", "flv", "webm"].includes(extension)
    ) {
      return { icon: Video, type: "Vidéo", color: "text-red-500" };
    }

    // Audio
    if (["mp3", "wav", "flac", "aac", "ogg", "m4a"].includes(extension)) {
      return { icon: Music, type: "Audio", color: "text-purple-500" };
    }

    // Documents
    if (["pdf", "doc", "docx", "txt", "rtf", "odt"].includes(extension)) {
      return { icon: FileText, type: "Document", color: "text-blue-500" };
    }

    // Par défaut
    return { icon: File, type: "Fichier", color: "text-gray-500" };
  };

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
    if ((!newMessage.trim() && !selectedFile) || !selectedDiscussion || sending)
      return;

    try {
      setSending(true);
      setUploadProgress(0);

      let fileUrl = "";
      let fileType = "";

      // Si un fichier est sélectionné, l'uploader d'abord
      if (selectedFile) {
        try {
          const uploadResult = await uploadFile(selectedFile);
          fileUrl = uploadResult.url;
          fileType = uploadResult.type;
        } catch (uploadError) {
          alert(
            uploadError instanceof Error
              ? uploadError.message
              : "Erreur lors de l'upload du fichier"
          );
          return;
        }
      }

      // Envoyer le message avec ou sans fichier
      await sendMessage(
        selectedDiscussion.id_discussion,
        newMessage.trim() || "",
        fileType,
        fileUrl
      );

      // Recharger les messages
      await loadMessages(selectedDiscussion);

      // Recharger les discussions pour mettre à jour les compteurs
      const discussionsData = await getDiscussions();
      setDiscussions(discussionsData);

      // Reset
      setNewMessage("");
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      alert("Erreur lors de l'envoi du message. Veuillez réessayer.");
    } finally {
      setSending(false);
      setUploadProgress(0);
    }
  };

  // Fonction pour uploader un fichier
  const uploadFile = async (
    file: File
  ): Promise<{ url: string; type: string }> => {
    try {
      setUploadProgress(10);

      // Générer un nom de fichier unique avec timestamp
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      const fileName = `${timestamp}_${file.name}`;

      setUploadProgress(30);

      // Utiliser la fonction uploadFile de l'API clients
      const uploadResult = await uploadFileMessage(fileName, file);

      setUploadProgress(80);

      // Vérifier si c'est une erreur
      if ("error" in uploadResult) {
        throw new Error(
          uploadResult.error || "Erreur lors de l'upload du fichier"
        );
      }

      // Vérifier si on a bien l'URL publique
      if (!uploadResult.publicUrl) {
        throw new Error("URL publique non disponible");
      }

      setUploadProgress(100);

      // Déterminer le type de fichier basé sur l'extension
      const fileType = getFileTypeFromExtension(fileExtension);

      return {
        url: uploadResult.publicUrl,
        type: fileType,
      };
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      setUploadProgress(0);
      throw new Error("Impossible d'uploader le fichier. Veuillez réessayer.");
    }
  };

  // Gérer la sélection de fichier
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Le fichier est trop volumineux. Taille maximum : 10MB");
        return;
      }

      // Vérifier le type de fichier
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "video/mp4",
        "video/avi",
        "audio/mp3",
        "audio/wav",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(
          "Type de fichier non autorisé. Types autorisés : images, PDF, vidéos, audio, documents Word, texte"
        );
        return;
      }

      setSelectedFile(file);
      // Vider le champ de texte car on ne peut pas envoyer fichier + texte
      setNewMessage("");
    }
  };

  // Supprimer le fichier sélectionné
  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
          {/*    <div className="mt-2">
            <p className="text-xs text-gray-500 text-center">
              {refreshing
                ? "Actualisation en cours..."
                : "Actualisation automatique toutes les 3 secondes - 5 secondes"}
            </p>
          </div> */}
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
                          {/* Affichage du contenu ou du fichier */}
                          {message.content ? (
                            // Message texte normal
                            <p className="text-sm">{message.content}</p>
                          ) : message.file_type && message.file_url ? (
                            // Message avec fichier
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                {(() => {
                                  // Utiliser l'URL du fichier pour déterminer l'extension exacte
                                  const extension = getExtensionFromUrl(
                                    message.file_url
                                  );
                                  const {
                                    icon: IconComponent,
                                    type,
                                    color,
                                  } = getFileIcon(message.file_url);
                                  return (
                                    <>
                                      <IconComponent
                                        className={`w-5 h-5 ${
                                          isMyMessage ? "text-blue-100" : color
                                        }`}
                                      />
                                      <span className="text-sm font-medium">
                                        {type} (.{extension})
                                      </span>
                                    </>
                                  );
                                })()}
                              </div>

                              {/* Prévisualisation pour les images */}
                              {(() => {
                                const extension = getExtensionFromUrl(
                                  message.file_url
                                );
                                const isImage = [
                                  "jpg",
                                  "jpeg",
                                  "png",
                                  "gif",
                                  "webp",
                                  "svg",
                                  "bmp",
                                ].includes(extension.toLowerCase());

                                return (
                                  isImage && (
                                    <div className="mt-2">
                                      <img
                                        src={message.file_url}
                                        alt="Image partagée"
                                        className="max-w-full h-auto rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() =>
                                          window.open(
                                            message.file_url,
                                            "_blank"
                                          )
                                        }
                                        style={{ maxHeight: "200px" }}
                                      />
                                    </div>
                                  )
                                );
                              })()}

                              {/* Bouton de téléchargement */}
                              <button
                                onClick={() =>
                                  window.open(message.file_url, "_blank")
                                }
                                className={`flex items-center space-x-1 text-xs hover:underline transition-colors ${
                                  isMyMessage
                                    ? "text-blue-100 hover:text-white"
                                    : "text-blue-600 hover:text-blue-800"
                                }`}
                              >
                                <Download className="w-3 h-3" />
                                <span>Télécharger</span>
                              </button>
                            </div>
                          ) : (
                            // Message vide (cas d'erreur)
                            <p className="text-sm italic opacity-70">
                              Message sans contenu
                            </p>
                          )}

                          {/* Timestamp */}
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
              {/* Prévisualisation du fichier sélectionné */}
              {selectedFile && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const fileExtension =
                          selectedFile.name.split(".").pop()?.toLowerCase() ||
                          "";
                        const {
                          icon: IconComponent,
                          type,
                          color,
                        } = getFileIcon(fileExtension);
                        return (
                          <>
                            <IconComponent className={`w-5 h-5 ${color}`} />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {selectedFile.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {type} •{" "}
                                {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeSelectedFile}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Barre de progression d'upload */}
                  {sending && uploadProgress > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload: {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2">
                {/* Input de fichier caché */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,application/pdf,video/*,audio/*,.doc,.docx,.txt"
                  className="hidden"
                />

                {/* Bouton d'attachment */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                  className="hover:bg-gray-100"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>

                <Input
                  type="text"
                  placeholder={
                    selectedFile
                      ? "Envoi de fichier uniquement (texte désactivé)"
                      : "Tapez votre message..."
                  }
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                  disabled={sending || selectedFile !== null}
                />

                <Button
                  onClick={handleSendMessage}
                  disabled={
                    (selectedFile ? false : !newMessage.trim()) || sending
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Aide pour les types de fichiers */}
              <div className="mt-2">
                <p className="text-xs text-gray-400 text-center">
                  Formats acceptés : Images, PDF, Vidéos, Audio, Documents Word,
                  Texte (max 10MB)
                </p>
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
