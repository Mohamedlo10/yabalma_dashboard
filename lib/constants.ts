// Constantes globales de l'application

// ID par défaut du sender/utilisateur principal du dashboard
export const DEFAULT_SENDER_ID = "d04cda0e-0fa8-4fbc-bc3d-50e446e4ac79";

// Autres constantes que vous pourriez ajouter
export const APP_NAME = "Yabalma Dashboard";
export const API_VERSION = "v1";

// Types d'utilisateurs
export const USER_TYPES = {
  CLIENT: "client",
  GP: "gp", // Gestionnaire de Points
  ADMIN: "admin",
} as const;

// Statuts des transactions
export const TRANSACTION_STATUS = {
  PENDING: "en_attente",
  COMPLETED: "completee",
  CANCELLED: "annulee",
  REFUNDED: "remboursee",
} as const;

// Devises supportées
export const SUPPORTED_CURRENCIES = {
  EUR: "EUR",
  USD: "USD",
  XOF: "XOF",
} as const;
