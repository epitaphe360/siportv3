# 📱 Guide WhatsApp Integration - SIPORT v3

## Configuration du Service WhatsApp

### 1. **Fichier de configuration principal**
- **Localisation:** `src/config/supportConfig.ts`
- **Contient:** Tous les numéros, emails et configurations de support

### 2. **Paramètres à personnaliser**

Ouvrez `src/config/supportConfig.ts` et mettez à jour:

```typescript
export const SUPPORT_CONFIG = {
  whatsapp: {
    number: '+212612345678', // ✏️ REMPLACER par votre numéro WhatsApp
    message: 'Bonjour, je souhaiterais entrer en contact avec votre équipe commerciale',
  },
  
  email: 'contact@siportevent.com', // ✏️ Votre email
  phone: '+212123456789', // ✏️ Votre téléphone
  
  // ... autres configurations
};
```

### 3. **Où et comment ça fonctionne**

#### A. **Page d'accueil - Section Services**
- Affiche 4 moyens de contact (WhatsApp, Email, Phone, Horaires)
- Botton "Démarrer une conversation WhatsApp"
- Fichier: `src/components/home/ServicesSection.tsx`

#### B. **Widget flottant WhatsApp**
- Petit widget en bas à droite de chaque page
- Pulse animation avec tooltip
- Fichier: `src/components/whatsapp/WhatsAppFloatingWidget.tsx`
- Intégré dans: `src/App.tsx`

#### C. **Composant bouton réutilisable**
- `<WhatsAppButton />` peut être utilisé partout
- Fichier: `src/components/ui/WhatsAppButton.tsx`

### 4. **Utilisation dans d'autres pages**

```tsx
import { WhatsAppButton } from '../components/ui/WhatsAppButton';
import { openWhatsApp, SUPPORT_CONFIG } from '../config/supportConfig';

// Simple - avec valeurs par défaut
<WhatsAppButton />

// Personnalisé
<WhatsAppButton 
  phoneNumber="+212612345678"
  message="Message personnalisé"
  label="Contacter notre équipe"
  variant="default"
/>

// Via la fonction utilitaire
openWhatsApp(SUPPORT_CONFIG.whatsapp.number, "Mon message");
```

### 5. **Fonctionnalités**

✅ **Lien WhatsApp direct** - Ouvre WhatsApp avec message pré-rempli  
✅ **Widget flottant** - Accessible depuis n'importe quelle page  
✅ **Bouton réutilisable** - Peut être intégré partout  
✅ **Configuration centralisée** - Un seul endroit pour éditer les infos  
✅ **Multi-équipes** - Support pour différents commerciaux/équipes  

### 6. **Nombres de WhatsApp à utiliser**

#### Format avec code pays (International)
```
+212 6 12 34 56 78  (Maroc)
+33 6 12 34 56 78   (France)
+1 (555) 123-4567   (USA)
```

#### Générer un lien WhatsApp
```
https://wa.me/212612345678?text=Message%20ici
```

### 7. **Masquer/Afficher le widget**

```tsx
// Pour désactiver le widget
<WhatsAppFloatingWidget 
  defaultVisible={false}  // Pas de widget visible par défaut
/>

// Pour utiliser uniquement la section Services sur la page d'accueil
// (sans widget flottant)
// → Supprimer l'import et le composant dans App.tsx
```

### 8. **Personnalisation des messages**

```typescript
// Message par défaut
const defaultMessage = 'Bonjour, je souhaiterais entrer en contact avec votre équipe commerciale';

// Pour différents contextes
const messages = {
  general: 'Bonjour, j\'aurais besoin d\'aide',
  commercial: 'Je suis intéressé par une collaboration',
  support: 'J\'ai une question technique',
  exhibitor: 'Je souhaite exposer au salon',
  visitor: 'Je veux visiter le salon',
};
```

### 9. **Intégration dans un formulaire de contact**

```tsx
import { WhatsAppButton } from '../components/ui/WhatsAppButton';

<form onSubmit={handleSubmit}>
  {/* ... autres champs ... */}
  
  <div className="flex gap-2">
    <Button type="submit">Envoyer par email</Button>
    <WhatsAppButton 
      label="Ou par WhatsApp"
      onClick={() => console.log('Stats: WhatsApp clicked')}
    />
  </div>
</form>
```

### 10. **Tests localement**

1. **Page d'accueil:** `http://localhost:9323/` 
   - Voir la section "Services" avec bouton WhatsApp
   - Widget flottant en bas à droite

2. **Cliquer sur les boutons** pour tester les liens
   - Doit ouvrir WhatsApp (web ou app)

3. **En production:** Fonctionne sur tous les navigateurs et mobiles

### 11. **Mobile vs Desktop**

- **Desktop:** Ouvre WhatsApp Web
- **Mobile:** Ouvre l'app WhatsApp installée
- **Fallback:** Si pas de WhatsApp, ça demande de l'installer

### 12. **Statistiques et suivi (Optional)**

```tsx
const handleWhatsAppClick = () => {
  // Tracker l'événement
  analytics.track('whatsapp_button_clicked', {
    location: 'home_page',
    timestamp: new Date(),
  });
  
  openWhatsApp(phoneNumber, message);
};
```

---

## 📝 Checklist avant le déploiement

- [ ] Numéro WhatsApp confirmé dans `supportConfig.ts`
- [ ] Email de support configuré
- [ ] Numéro de téléphone configuré
- [ ] Messages d'accueil personnalisés
- [ ] Widget testé sur desktop et mobile
- [ ] Lien WhatsApp fonctionne
- [ ] Section Services visible sur page d'accueil
- [ ] Widget flottant visible sur toutes les pages

---

## 🔗 Ressources utiles

- [WhatsApp Business](https://www.whatsapp.com/business/)
- [WhatsApp API Link Format](https://faq.whatsapp.com/5913398007381957)
- [QR Code Generator for WhatsApp](https://www.whatsappqrcode.com/)

---

## 💬 Questions?

Pour plus d'infos, voir les fichiers:
- `src/config/supportConfig.ts` - Configuration
- `src/components/home/ServicesSection.tsx` - Section d'accueil
- `src/components/whatsapp/WhatsAppFloatingWidget.tsx` - Widget flottant
- `src/components/ui/WhatsAppButton.tsx` - Bouton réutilisable
