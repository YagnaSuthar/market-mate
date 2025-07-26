import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styles from '../styles/Register.module.css';
import Header from './Navbar.jsx';

const Register = () => {
  const { login } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('vendor');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Registration failed');
      login(data.user);
      if (data.user.role === 'vendor') navigate('/vendor/dashboard');
      else if (data.user.role === 'supplier') navigate('/supplier/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.register}>
      {/* Navbar */}
      <Header />
      
      {/* Animated Background Elements */}
      <div className={styles.register__bg_element}></div>
      <div className={styles.register__bg_element}></div>
      <div className={styles.register__bg_element}></div>
      
      <form className={styles.register__form} onSubmit={handleSubmit}>
        <h2 className={styles.register__title}>Register</h2>
        {error && <div className={styles.register__error}>{error}</div>}
        <input
          className={styles.register__input}
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          className={styles.register__input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className={styles.register__input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <select
          className={styles.register__input}
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="vendor">Vendor</option>
          <option value="supplier">Supplier</option>
        </select>
        <button className={styles.register__button} type="submit">Register</button>
        <div className={styles.register__footer}>
          <span>Already have an account?</span>
          <a href="/login">Login</a>
        </div>
      </form>
    </div>
  );
};

export default Register; 