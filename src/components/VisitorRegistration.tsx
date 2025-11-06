import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function VisitorRegistration() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [level, setLevel] = useState('free');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profile = { public_bio: bio };
    const { error } = await supabase
      .from('users')
      .insert([{
        email,
        name,
        type: 'visitor',
        visitor_level: level,
        profile,
        status: 'active'
      }])
      .select();

    if (error) {
      setMessage('Erreur: ' + error.message);
    } else {
      setMessage('Inscription réussie !');
      setEmail('');
      setName('');
      setBio('');
      setLevel('free');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Inscription Visiteur</h2>
      <input type="text"
        placeholder="Nom"
        value={name}
        onChange={e =
                      aria-label="Nom"> setName(e.target.value)}
        required
      />
      <input type="email"
        placeholder="Email"
        value={email}
        onChange={e =
                      aria-label="Email"> setEmail(e.target.value)}
        required
      />
      <textarea
        placeholder="Bio"
        value={bio}
        onChange={e => setBio(e.target.value)}
      />
      <label>Niveau d'accès :</label>
      <select value={level} onChange={e => setLevel(e.target.value)} required>
        <option value="free">Free Pass</option>
        <option value="basic">Basic Pass</option>
        <option value="premium">Premium Pass</option>
        <option value="vip">VIP Pass</option>
      </select>
      <button type="submit">S'inscrire</button>
      {message && <div>{message}</div>}
    </form>
  );
}
