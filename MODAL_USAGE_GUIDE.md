# Ghid de utilizare pentru sistemul de modal-uri

Acest ghid explică cum să folosești sistemul de modal-uri bazat pe Radix UI Dialog din proiect.

## Tipuri de modal-uri disponibile

### 1. Modal de bază (`Modal`)
Modal-ul de bază care oferă o fundație pentru alte tipuri de modal-uri.

```tsx
import { Modal } from '../components/ui/Modal';

<Modal isOpen={isOpen} onClose={onClose} title="Titlu" size="md">
  <p>Conținutul modal-ului</p>
</Modal>
```

### 2. Modal pentru formulare (`FormModal`)
Optimizat pentru formulare cu padding și structură specifice.

```tsx
import { FormModal } from '../components/ui/Modal';

<FormModal isOpen={isOpen} onClose={onClose} title="Adaugă utilizator" size="lg">
  <form>
    <div className="form-group">
      <input type="text" className="form-input" />
    </div>
    <div className="modal-footer">
      <Button variant="secondary" onClick={onClose}>Anulează</Button>
      <Button variant="primary" type="submit">Salvează</Button>
    </div>
  </form>
</FormModal>
```

### 3. Modal de confirmare (`ConfirmationModal`)
Pentru acțiuni care necesită confirmare.

```tsx
import { ConfirmationModal } from '../components/ui/Modal';

<ConfirmationModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleDelete}
  title="Confirmă ștergerea"
  description="Ești sigur că vrei să ștergi acest element? Această acțiune nu poate fi anulată."
  confirmText="Șterge"
  cancelText="Anulează"
  confirmVariant="danger"
/>
```

## Proprietăți disponibile

### Modal de bază
- `isOpen: boolean` - Controlează vizibilitatea modal-ului
- `onClose: () => void` - Funcția apelată la închiderea modal-ului
- `title?: string` - Titlul modal-ului (opțional)
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Dimensiunea modal-ului (implicit: 'md')
- `children: React.ReactNode` - Conținutul modal-ului

### FormModal
Moștenește toate proprietățile de la Modal.

### ConfirmationModal
- `isOpen: boolean`
- `onClose: () => void`
- `onConfirm: () => void` - Funcția apelată la confirmare
- `title: string` - Titlul modal-ului
- `description: string` - Descrierea acțiunii
- `confirmText?: string` - Textul butonului de confirmare (implicit: 'Confirmă')
- `cancelText?: string` - Textul butonului de anulare (implicit: 'Anulează')
- `confirmVariant?: ButtonVariant` - Varianta butonului de confirmare (implicit: 'primary')

## Dimensiuni disponibile

- `sm` - Mic (max-width: 24rem / 384px)
- `md` - Mediu (max-width: 32rem / 512px) - implicit
- `lg` - Mare (max-width: 48rem / 768px)
- `xl` - Extra mare (max-width: 64rem / 1024px)

## Exemple de utilizare

### Exemplu complet cu gestionarea stării

```tsx
import React, { useState } from 'react';
import { FormModal, ConfirmationModal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

const MyComponent: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleSave = (formData: any) => {
    // Logica de salvare
    console.log('Salvez datele:', formData);
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    // Logica de ștergere
    console.log('Șterg elementul');
    setIsDeleteConfirmOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setIsFormOpen(true)}>
        Deschide formularul
      </Button>
      
      <Button 
        variant="danger" 
        onClick={() => setIsDeleteConfirmOpen(true)}
      >
        Șterge element
      </Button>

      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Adaugă element nou"
        size="lg"
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Nume</label>
            <input type="text" className="form-input" required />
          </div>
          
          <div className="modal-footer">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setIsFormOpen(false)}
            >
              Anulează
            </Button>
            <Button type="submit" variant="primary">
              Salvează
            </Button>
          </div>
        </form>
      </FormModal>

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Confirmă ștergerea"
        description="Ești sigur că vrei să ștergi acest element?"
        confirmText="Șterge"
        confirmVariant="danger"
      />
    </div>
  );
};
```

## Stilizare

Modal-urile folosesc clase CSS din `styles/globals.css`:

- `.modal-overlay` - Suprapunerea de fundal
- `.modal-content` - Containerul principal al modal-ului  
- `.modal-header` - Antetul modal-ului
- `.modal-title` - Titlul modal-ului
- `.modal-close` - Butonul de închidere
- `.modal-footer` - Subsolul modal-ului cu butoanele
- `.modal-*` - Clasele pentru dimensiuni (sm, md, lg, xl)

## Funcționalități incluse

### Accesibilitate
- Suport complet pentru keyboard navigation
- Focus management automat
- ARIA attributes corecte
- Escape key pentru închidere

### Responsive design
- Layout-uri adaptabile pentru mobile și desktop
- Dimensiuni flexibile
- Padding și spacing optimizate

### Animații
- Fade in/out smooth
- Scale animation pentru conținut
- CSS transitions performante

## Integrare cu toast-urile

Modal-urile se integrează perfect cu sistemul de toast-uri:

```tsx
import { showToast } from '../components/ui/Toast';

const handleSubmit = async () => {
  try {
    const loadingToastId = showToast.loading('Se salvează...');
    
    await saveData();
    
    showToast.success('Salvat cu succes!', { id: loadingToastId });
    setIsModalOpen(false);
  } catch (error) {
    showToast.error('Eroare la salvare');
  }
};
```

## Best practices

1. **Gestionarea stării**: Folosește sempre un state boolean pentru controlul modal-urilor
2. **Cleanup**: Resetează formularul la închiderea modal-ului
3. **Loading states**: Afișează loading pe butoane în timpul operațiunilor async
4. **Validare**: Implementează validarea formulare înainte de submit
5. **Feedback**: Folosește toast-urile pentru confirmări și erori
6. **Dimensiuni**: Alege dimensiunea potrivită pentru conținut (sm pentru confirmări, lg pentru formulare complexe)
