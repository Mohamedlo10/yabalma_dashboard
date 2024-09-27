import React, { useEffect, useState } from 'react';

interface User {
  id: bigint; 
  created_at: Date; 
  id_client: string;
  prenom: string; 
  nom: string;
  Tel: string; 
  Pays: string;
  is_gp: boolean; 
  delivery?:bigint;
  fcm_token: string;
  ville: string; 
  commande?: bigint;
  img_url: string;
}

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Fetch data from the API
    fetch('../api/gpApi')
      .then(response => response.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div>
      <h1>List of Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id.toString()}>
            <img src={user.img_url} alt={user.nom} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
            <p>Name: {user.prenom} {user.nom}</p>
            <p>Phone: {user.Tel}</p>
            <p>Country: {user.Pays}</p>
            <p>City: {user.ville}</p>
            <p>Client ID: {user.id_client}</p>
            <p>GP Status: {user.is_gp ? 'Yes' : 'No'}</p>
            <p>GP delivery: {user.delivery}</p>
            <p>Client commande: {user.commande}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersList;
