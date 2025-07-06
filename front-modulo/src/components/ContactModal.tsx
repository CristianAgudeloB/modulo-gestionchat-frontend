// ContactModal.tsx
import React from 'react';
import './ContactModal.css';

interface Contact {
  CONSECUSER: string;
  NOMBRE: string;
  APELLIDO: string;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (contact: Contact) => void;
  contacts: Contact[];
  isLoading?: boolean;
}

const ContactModal: React.FC<ContactModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectContact,
  contacts,
  isLoading = false
}) => {
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Seleccionar Contacto</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="contacts-list">
          {isLoading ? (
            <div className="loading-contacts">Cargando contactos...</div>
          ) : contacts.length === 0 ? (
            <div className="no-contacts">No se encontraron contactos</div>
          ) : (
            contacts.map(contact => (
              <div 
                key={contact.CONSECUSER}
                className={`contact-item ${selectedContact?.CONSECUSER === contact.CONSECUSER ? 'selected' : ''}`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="contact-avatar">
                  {contact.NOMBRE.charAt(0)}{contact.APELLIDO.charAt(0)}
                </div>
                <div className="contact-info">
                  <h3>{contact.NOMBRE} {contact.APELLIDO}</h3>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            className="start-chat-button"
            disabled={!selectedContact}
            onClick={() => {
              if (selectedContact) {
                onSelectContact(selectedContact);
              }
            }}
          >
            Iniciar Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;