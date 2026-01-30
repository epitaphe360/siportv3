# Correction du Bug: Colonne proof_url manquante

## Problème Identifié
L'application plantait lors des paiements ou de la consultation de l'historique avec l'erreur :
`column payment_requests.proof_url does not exist`

Cette erreur survenait car le code TypeScript dans les services (`paymentService.ts` et `partnerPaymentService.ts`) essayait de sélectionner la colonne `proof_url`, alors que la base de données (et les migrations) utilisent le nom `transfer_proof_url`.

## Solution Appliquée
Les fichiers suivants ont été corrigés pour utiliser le nom de colonne correct `transfer_proof_url` :

1. **`src/services/paymentService.ts`**
   - Fonction `createPaymentRecord`
   - Fonction `getPaymentHistory`

2. **`src/services/partnerPaymentService.ts`**
   - Fonction `getPartnerBankTransferRequests`
   - Fonction `approvePartnerBankTransfer`
   - Fonction `rejectPartnerBankTransfer`

## Vérification
- Une recherche globale confirme que toutes les requêtes `.select()` utilisent désormais correctment `transfer_proof_url`.
- Les composants React (`PartnerBankTransferPage`, `PaymentValidationPage`) utilisaient déjà le bon nom, donc ils n'ont pas été modifiés.
