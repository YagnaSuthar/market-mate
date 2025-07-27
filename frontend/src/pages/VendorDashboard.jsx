import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Dashboard/Header';
import Sidebar from './Dashboard/Sidebar';
import Footer from './Dashboard/Footer';
import DashboardOverview from './Dashboard/DashboardOverview';
import styles from '../styles/VendorDashboard.module.css';
import ProductList from './ProductList';
import { SearchSuppliers } from './Dashboard/SearchSuppliers';
import OrderManagement from './Dashboard/OrderManagement';

const Orders = () => <div>Order Management</div>;
const Analytics = () => <div>Analytics</div>;
const Chat = () => <div>Communication Hub</div>;
const Notifications = () => <div>Notifications</div>;

const VendorDashboard = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/api/supplierdetails')
      .then(response => {
        setSuppliers(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching supplier details:', error);
        setError('Failed to fetch supplier details');
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.dashboard}>
      <Header />
      <div className={styles.dashboard__main}>
        <Sidebar />
        <main className={styles.dashboard__content}>
          {loading && <p>Loading suppliers...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="products" element={<ProductList />} />
            <Route path="suppliers" element={<SearchSuppliers suppliers={suppliers} setSuppliers={setSuppliers} />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="chat" element={<Chat />} />
            <Route path="notifications" element={<Notifications />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default VendorDashboard;
