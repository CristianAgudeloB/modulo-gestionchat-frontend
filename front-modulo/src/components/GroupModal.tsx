import React, { useState } from "react";
import "./GroupModal.css";

// Define the Contact interface if not imported from elsewhere
interface Contact {
  CONSECUSER: string;
  NOMBRE: string;
  APELLIDO: string;
}

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupName: string, members: string[]) => void;
  contacts: Contact[];
}

const GroupModal: React.FC<GroupModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreateGroup,
  contacts 
}) => {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId]
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      onCreateGroup(groupName, selectedMembers);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="group-modal">
        <h2>Crear nuevo grupo</h2>
        
        <div className="form-group">
          <label>Nombre del grupo</label>
          <input 
            type="text" 
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Nombre del grupo"
          />
        </div>
        
        <div className="form-group">
          <label>Seleccionar miembros</label>
          <div className="members-list">
            {contacts.map(contact => (
              <div key={contact.CONSECUSER} className="member-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(contact.CONSECUSER)}
                    onChange={() => handleMemberToggle(contact.CONSECUSER)}
                  />
                  {contact.NOMBRE} {contact.APELLIDO}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button 
            onClick={handleCreateGroup}
            disabled={!groupName || selectedMembers.length === 0}
          >
            Crear grupo
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupModal;