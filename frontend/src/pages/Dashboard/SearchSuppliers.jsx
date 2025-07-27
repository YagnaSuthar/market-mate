import React from 'react';
import '../../CSS/SearchSuppliers.css';

export function SearchSuppliers({ suppliers, setSuppliers }) {
  return (
    <div className="container-searchsupplier">
      <h2 className="searchsupplier-header">Registered Suppliers</h2>
      <div className="searchsupplier-grid-container">
        {suppliers.map((supplier, index) => (
          <div key={index} className="searchsupplier-card">
            <p><strong>Name:</strong> {supplier.username}</p>
            <p><strong>Email:</strong> {supplier.email}</p>
            <p><strong>Company:</strong> {supplier.company}</p>
            <p><strong>Phone:</strong> {supplier.phone}</p>
            <p><strong>Address:</strong> 
              {supplier.address?.street}, {supplier.address?.city}, 
              {supplier.address?.state}, {supplier.address?.zip}, 
              {supplier.address?.country}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
