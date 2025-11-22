import React from 'react';

const UserSelector = ({ users, selectedUser, onUserChange }) => {
    return (
        <div className="user-selector">
            <h3>Seleccionar Usuario</h3>
            <select 
                value={selectedUser} 
                onChange={(e) => onUserChange(parseInt(e.target.value))}
                className="form-select"
            >
                <option value="">Selecciona un usuario</option>
                {users.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.username} (ID: {user.id})
                    </option>
                ))}
            </select>
        </div>
    );
};

export default UserSelector;