# Fonctionnalité Colis Remis

## Description
Cette fonctionnalité permet aux livreurs de marquer les colis comme remis après avoir scanné le QR code du client ou recherché par ID de commande.

## Fonctionnalités

### 🔍 Recherche de commandes
- **Scanner QR Code** : Utilise la caméra pour scanner le QR code contenant l'ID de la commande
- **Recherche par ID** : Permet de saisir directement l'ID de la commande

### 📦 Affichage des informations
- **Détails de la commande** : ID, statut, date de création, type, description, poids
- **Informations client** : Nom, prénom, téléphone
- **Détails du trajet** : Source, destination, dates, type de transport

### ✅ Remise du colis
- **Validation** : Seuls les colis avec statut "Arrivé" peuvent être remis
- **Mise à jour** : Change le statut à "Remis" et ajoute `remis_at`
- **Feedback** : Notifications de succès/erreur

## Interface Responsive
- **Mobile First** : Optimisée pour les appareils mobiles
- **Desktop** : Interface adaptée pour les écrans plus grands
- **Scanner QR** : Modal plein écran sur mobile

## Champs de base de données requis

### Table `commande`
```sql
-- Ajouter ces champs à la table commande si pas déjà présents
ALTER TABLE commande ADD COLUMN IF NOT EXISTS remis_at TIMESTAMP;
ALTER TABLE commande ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

## Statuts des commandes
- `Entrepot` → En attente de préparation
- `Expédié` → En cours de transport  
- `Arrivé` → Arrivé à destination (peut être remis)
- `Remis` → Remis au client final

## Sécurité
- Vérification des permissions via `role?.access_groups.commandes`
- Validation des données côté serveur
- Gestion des erreurs et cas limites

## Utilisation
1. Naviguer vers "Colis Remis" dans la sidebar
2. Scanner le QR code ou rechercher par ID
3. Vérifier les informations affichées
4. Cliquer sur "Remettre le Colis" si statut = "Arrivé"
5. Confirmation de la remise

## Tests
- Tester avec différents IDs de commandes
- Vérifier les différents statuts
- Tester sur mobile et desktop
- Vérifier les permissions utilisateur
