# Tooltip and Toast Usage Guide

## 🎯 Tooltip Component

### Basic Usage

```tsx
import { SimpleTooltip } from '@/components/ui/Tooltip';

// Simple tooltip
<SimpleTooltip tooltip="Acesta este un tooltip simplu">
    <Button>Hover pentru tooltip</Button>
</SimpleTooltip>

// Tooltip with custom positioning
<SimpleTooltip tooltip="Tooltip în partea de jos" side="bottom">
    <Button>Buton cu tooltip jos</Button>
</SimpleTooltip>
```

### Advanced Usage

```tsx
import { Tooltip } from '@/components/ui/Tooltip';

<Tooltip 
    content={
        <div>
            <strong>Tooltip complex</strong>
            <p>Cu conținut HTML</p>
        </div>
    }
    side="right"
    align="start"
    delayDuration={300}
>
    <Button>Tooltip avansat</Button>
</Tooltip>
```

### Props

- `tooltip/content`: Text sau JSX pentru tooltip
- `side`: 'top' | 'right' | 'bottom' | 'left'
- `align`: 'start' | 'center' | 'end'
- `delayDuration`: Întârziere în milisecunde

## 🔔 Toast Notifications

### Basic Usage

```tsx
import showToast from '@/components/ui/Toast';

// Toast-uri simple
showToast.success('Operațiune reușită!');
showToast.error('A apărut o eroare!');
showToast.info('Informație importantă');
showToast.loading('Se încarcă...');
```

### Predefined Messages (Romanian)

```tsx
// Pentru operațiuni cu utilizatori
showToast.userCreated();
showToast.userUpdated();
showToast.userDeleted();
showToast.userCreationFailed();
showToast.userUpdateFailed();
showToast.userDeleteFailed();

// Pentru operațiuni generale
showToast.networkError();
showToast.unauthorized();
showToast.savingChanges();
showToast.creatingUser();
```

### Advanced Usage

```tsx
// Toast cu opțiuni personalizate
showToast.success('Mesaj personalizat', {
    duration: 6000,
    style: {
        background: '#custom-color',
    },
});

// Loading toast cu actualizare
const loadingId = showToast.loading('Se procesează...');
// După finalizare
showToast.success('Finalizat!', { id: loadingId });
```

### Available Messages

#### Success Messages
- `userCreated`: "Utilizatorul a fost creat cu succes!"
- `userUpdated`: "Utilizatorul a fost actualizat cu succes!"
- `userDeleted`: "Utilizatorul a fost șters cu succes!"
- `changesSaved`: "Modificările au fost salvate!"
- `loginSuccess`: "Autentificare reușită!"

#### Error Messages
- `userCreationFailed`: "Crearea utilizatorului a eșuat"
- `userUpdateFailed`: "Actualizarea utilizatorului a eșuat"
- `userDeleteFailed`: "Ștergerea utilizatorului a eșuat"
- `networkError`: "Eroare de rețea. Verificați conexiunea."
- `unauthorized`: "Nu aveți permisiuni pentru această acțiune"

#### Loading Messages
- `savingChanges`: "Se salvează modificările..."
- `creatingUser`: "Se creează utilizatorul..."
- `updatingUser`: "Se actualizează utilizatorul..."
- `deletingUser`: "Se șterge utilizatorul..."

## 🎨 Styling

### Tooltip Styling
Tooltip-urile folosesc Tailwind CSS și pot fi personalizate prin clasa `className`:

```tsx
<Tooltip 
    content="Tooltip personalizat" 
    className="bg-blue-900 text-blue-100"
>
    <Button>Hover me</Button>
</Tooltip>
```

### Toast Styling
Toast-urile sunt pre-stilizate dar pot fi personalizate:

```tsx
showToast.success('Mesaj', {
    style: {
        background: '#10B981',
        color: '#ffffff',
        fontSize: '16px',
    }
});
```

## 📱 Best Practices

### Tooltips
1. Folosiți tooltip-uri pentru butoane cu funcții neobvioase
2. Păstrați textul scurt și descriptiv
3. Folosiți poziționarea potrivită pentru spațiul disponibil
4. Evitați tooltip-uri pe elemente mobile (touch)

### Toasts
1. Folosiți mesajele predefinite pentru consistență
2. Toast-urile de eroare să rămână mai mult timp (5s)
3. Toast-urile de succes să dispară rapid (4s)
4. Folosiți loading toast-uri pentru operații lungi
5. Actualizați loading toast-urile cu rezultatul final

## 🔧 Integration Examples

### Form Submission with Toast

```tsx
const handleSubmit = async (data) => {
    try {
        const loadingId = showToast.creatingUser();
        await apiCall(data);
        showToast.success('', { id: loadingId }); // Close loading
        showToast.userCreated(); // Show success
    } catch (error) {
        showToast.userCreationFailed(error.message);
    }
};
```

### Button with Tooltip

```tsx
<SimpleTooltip tooltip="Această acțiune va șterge permanent datele">
    <Button variant="danger" onClick={handleDelete}>
        Șterge
    </Button>
</SimpleTooltip>
```
