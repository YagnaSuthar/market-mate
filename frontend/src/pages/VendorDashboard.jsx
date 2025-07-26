import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './Dashboard/Header';
import Sidebar from './Dashboard/Sidebar';
import Footer from './Dashboard/Footer';
import DashboardOverview from './Dashboard/DashboardOverview';
import styles from '../styles/VendorDashboard.module.css';
import ProductList from './ProductList';

const Suppliers = () => <div>Search Suppliers</div>;
const Orders = () => <div>Order Management</div>;
const Analytics = () => <div>Analytics</div>;
const Chat = () => <div>Communication Hub</div>;
const Notifications = () => <div>Notifications</div>;

const VendorDashboard = () => {
  return (
    <div className={styles.dashboard}>
      <Header />
      <div className={styles.dashboard__main}>
        <Sidebar />
        <main className={styles.dashboard__content}>
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="products" element={<ProductList />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="orders" element={<Orders />} />
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