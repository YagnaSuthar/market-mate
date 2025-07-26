import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../../CSS/SearchSuppliers.css';

const initialFilters = {
  location: '',
  distance: 50,
  categories: [],
  minOrder: '',
  paymentTerms: [],
  delivery: [],
  trustScore: [0, 100],
  priceRange: ['', ''],
};

const paymentOptions = ['COD', 'UPI', 'Bank Transfer', 'Credit'];
const deliveryOptions = ['Same Day', 'Next Day', 'Express', 'Standard'];
const categoryOptions = ['Electronics', 'Apparel', 'Food', 'Machinery', 'Other']; // Example

function SearchSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [favoriteSuppliers, setFavoriteSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      searchSuppliers();
    }, 400);
    return () => clearTimeout(handler);
    // eslint-disable-next-line
  }, [searchTerm, filters]);

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line
  }, []);

  // Fetch all suppliers
  const fetchSuppliers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/vendor/suppliers', { params: filters });
      setSuppliers(res.data.suppliers || []);
      setFilteredSuppliers(res.data.suppliers || []);
    } catch (err) {
      setError('Failed to fetch suppliers.');
    }
    setLoading(false);
  };

  // Search suppliers
  const searchSuppliers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/vendor/suppliers', {
        params: { ...filters, search: searchTerm },
      });
      setFilteredSuppliers(res.data.suppliers || []);
      setAutocompleteSuggestions(res.data.suggestions || []);
    } catch (err) {
      setError('Search failed.');
    }
    setLoading(false);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters(initialFilters);
  };

  // Toggle favorite supplier
  const toggleFavorite = (supplierId) => {
    setFavoriteSuppliers((prev) => {
      const updated = prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : [...prev, supplierId];
      localStorage.setItem('favoriteSuppliers', JSON.stringify(updated));
      // TODO: Sync with backend
      return updated;
    });
  };

  // Handle compare selection
  const handleCompareSelect = (supplierId) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(supplierId)) {
        return prev.filter((id) => id !== supplierId);
      }
      if (prev.length < 4) {
        return [...prev, supplierId];
      }
      return prev;
    });
  };

  // Open supplier profile modal
  const openProfileModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowProfileModal(true);
  };

  // Open contact modal
  const openContactModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowContactModal(true);
  };

  // Map view toggle
  const handleViewToggle = (mode) => {
    setViewMode(mode);
  };

  // Render supplier cards
  const renderSupplierCards = () => (
    <div className="searchsupplier-grid-container">
      {filteredSuppliers.map((supplier) => (
        <div className="searchsupplier-card" key={supplier._id}>
          <div className="searchsupplier-logo">
            <img src={supplier.logoUrl || '/default-avatar.png'} alt="logo" />
          </div>
          <div className="searchsupplier-company-name">
            {(supplier.profile && supplier.profile.company) || supplier.name || 'No Name'}
          </div>
          <div className={`searchsupplier-trust-score trust-${getTrustColor(supplier.trustScore)}`}>{supplier.trustScore}</div>
          <div className="searchsupplier-rating">{renderStars(supplier.rating)}</div>
          <div className="searchsupplier-tags">
            {supplier.specializations?.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="searchsupplier-location">{supplier.city} ({supplier.distance} km)</div>
          <div className="searchsupplier-metrics">
            <span>Response: {supplier.responseTime}h</span>
            <span>Delivery: {supplier.deliverySuccess}%</span>
            <span>Orders: {supplier.orderCompletion}%</span>
          </div>
          <div className="searchsupplier-actions">
            <button className="btn-searchsupplier-contact" onClick={() => openContactModal(supplier)}>Contact</button>
            <button className="btn-searchsupplier-favorite" onClick={() => toggleFavorite(supplier._id)}>
              {favoriteSuppliers.includes(supplier._id) ? '♥' : '♡'}
            </button>
            <button className="btn-searchsupplier-profile" onClick={() => openProfileModal(supplier)}>Profile</button>
            <label>
              <input
                type="checkbox"
                className="searchsupplier-compare-checkbox"
                checked={selectedForComparison.includes(supplier._id)}
                onChange={() => handleCompareSelect(supplier._id)}
                disabled={
                  !selectedForComparison.includes(supplier._id) && selectedForComparison.length >= 4
                }
              />
              Compare
            </label>
          </div>
        </div>
      ))}
    </div>
  );

  // Helper: Trust score color
  function getTrustColor(score) {
    if (score > 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  }

  // Helper: Render stars
  function renderStars(rating) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star-filled' : 'star-empty'}>★</span>
      );
    }
    return stars;
  }

  // Render comparison modal
  const renderComparisonModal = () => (
    <div className="searchsupplier-modal-overlay" onClick={() => setShowComparison(false)}>
      <div className="searchsupplier-modal-content searchsupplier-comparison-modal" onClick={e => e.stopPropagation()}>
        <h2>Compare Suppliers</h2>
        <div className="searchsupplier-comparison-table">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Trust</th>
                <th>Rating</th>
                <th>Price</th>
                <th>Delivery</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {selectedForComparison.map((id) => {
                const s = suppliers.find((sup) => sup._id === id);
                return s ? (
                  <tr key={s._id}>
                    <td>{(s.profile && s.profile.company) || s.name || 'No Name'}</td>
                    <td>{s.trustScore}</td>
                    <td>{s.rating}</td>
                    <td>{s.priceRange?.join(' - ')}</td>
                    <td>{s.delivery?.join(', ')}</td>
                    <td>{s.paymentTerms?.join(', ')}</td>
                  </tr>
                ) : null;
              })}
            </tbody>
          </table>
        </div>
        <button className="btn-searchsupplier-close" onClick={() => setShowComparison(false)}>Close</button>
      </div>
    </div>
  );

  // Render profile modal
  const renderProfileModal = () => (
    <div className="searchsupplier-modal-overlay" onClick={() => setShowProfileModal(false)}>
      <div className="searchsupplier-modal-content" onClick={e => e.stopPropagation()}>
        <div className="searchsupplier-profile-header">
          <img src={selectedSupplier?.logoUrl || '/default-avatar.png'} alt="logo" />
          <div>
            <h2>{(selectedSupplier?.profile && selectedSupplier?.profile.company) || selectedSupplier?.name || 'No Name'}</h2>
            <div className={`searchsupplier-trust-score trust-${getTrustColor(selectedSupplier?.trustScore)}`}>{selectedSupplier?.trustScore}</div>
            <div className="searchsupplier-rating">{renderStars(selectedSupplier?.rating)}</div>
          </div>
        </div>
        <div className="searchsupplier-company-details">
          <p><b>Location:</b> {selectedSupplier?.city}, {selectedSupplier?.state}</p>
          <p><b>Certifications:</b> <span className="searchsupplier-certifications">{selectedSupplier?.certifications?.join(', ')}</span></p>
          <p><b>Contact:</b> {selectedSupplier?.contactEmail}</p>
        </div>
        <div className="searchsupplier-reviews">
          <h3>Customer Reviews</h3>
          {(selectedSupplier?.reviews || []).map((r, idx) => (
            <div key={idx} className="searchsupplier-review-item">
              <div>{renderStars(r.rating)} <span>{r.comment}</span></div>
            </div>
          ))}
        </div>
        <form className="searchsupplier-contact-form">
          <h4>Contact Supplier</h4>
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Message" required />
          <button type="submit">Send</button>
        </form>
        <button className="btn-searchsupplier-close" onClick={() => setShowProfileModal(false)}>Close</button>
      </div>
    </div>
  );

  // Render contact modal
  const renderContactModal = () => (
    <div className="searchsupplier-modal-overlay" onClick={() => setShowContactModal(false)}>
      <div className="searchsupplier-modal-content" onClick={e => e.stopPropagation()}>
        <h3>Contact {(selectedSupplier?.profile && selectedSupplier?.profile.company) || selectedSupplier?.name || 'No Name'}</h3>
        <form className="searchsupplier-contact-form">
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Message" required />
          <button type="submit">Send</button>
        </form>
        <button className="btn-searchsupplier-close" onClick={() => setShowContactModal(false)}>Close</button>
      </div>
    </div>
  );

  // Render map view (placeholder)
  const renderMapView = () => (
    <div className="searchsupplier-map-container">
      <div style={{ height: 400, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>Map View Coming Soon</span>
      </div>
    </div>
  );

  return (
    <div className="container-searchsupplier">
      <div className="searchsupplier-header">
        <h1>Search Suppliers</h1>
        <div className="searchsupplier-breadcrumbs">Dashboard &gt; Suppliers</div>
        <div className="searchsupplier-view-toggle">
          <button className="btn-searchsupplier-map-toggle" onClick={() => handleViewToggle('grid')}>Grid</button>
          <button className="btn-searchsupplier-map-toggle" onClick={() => handleViewToggle('map')}>Map</button>
        </div>
      </div>
      <div className="searchsupplier-search-section">
        <input
          className="searchsupplier-search-input"
          type="text"
          placeholder="Search suppliers by name, specialization..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          list="searchsupplier-autocomplete"
        />
        <datalist id="searchsupplier-autocomplete">
          {autocompleteSuggestions.map((s, idx) => (
            <option key={idx} value={s} />
          ))}
        </datalist>
        <button className="btn-searchsupplier-filter" onClick={() => setShowFilters(v => !v)}>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        <button className="btn-searchsupplier-clear-filters" onClick={clearFilters}>Clear Filters</button>
        {selectedForComparison.length >= 2 && (
          <button className="btn-searchsupplier-compare" onClick={() => setShowComparison(true)}>
            Compare ({selectedForComparison.length})
          </button>
        )}
      </div>
      {showFilters && (
        <div className="searchsupplier-filters-panel">
          <div className="searchsupplier-location-filter">
            <label>Location:</label>
            <input
              type="text"
              value={filters.location}
              onChange={e => handleFilterChange('location', e.target.value)}
              placeholder="City or State"
            />
          </div>
          <div className="searchsupplier-distance-slider">
            <label>Distance: {filters.distance} km</label>
            <input
              type="range"
              min="0"
              max="500"
              value={filters.distance}
              onChange={e => handleFilterChange('distance', Number(e.target.value))}
            />
          </div>
          <div className="searchsupplier-category-filter">
            <label>Categories:</label>
            {categoryOptions.map((cat) => (
              <label key={cat}>
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat)}
                  onChange={e => {
                    const newCats = e.target.checked
                      ? [...filters.categories, cat]
                      : filters.categories.filter(c => c !== cat);
                    handleFilterChange('categories', newCats);
                  }}
                />
                {cat}
              </label>
            ))}
          </div>
          <div className="searchsupplier-min-order-filter">
            <label>Min Order Qty:</label>
            <input
              type="number"
              value={filters.minOrder}
              onChange={e => handleFilterChange('minOrder', e.target.value)}
              min="0"
            />
          </div>
          <div className="searchsupplier-payment-filter">
            <label>Payment Terms:</label>
            {paymentOptions.map((opt) => (
              <label key={opt}>
                <input
                  type="checkbox"
                  checked={filters.paymentTerms.includes(opt)}
                  onChange={e => {
                    const newTerms = e.target.checked
                      ? [...filters.paymentTerms, opt]
                      : filters.paymentTerms.filter(t => t !== opt);
                    handleFilterChange('paymentTerms', newTerms);
                  }}
                />
                {opt}
              </label>
            ))}
          </div>
          <div className="searchsupplier-delivery-filter">
            <label>Delivery:</label>
            {deliveryOptions.map((opt) => (
              <label key={opt}>
                <input
                  type="checkbox"
                  checked={filters.delivery.includes(opt)}
                  onChange={e => {
                    const newDel = e.target.checked
                      ? [...filters.delivery, opt]
                      : filters.delivery.filter(d => d !== opt);
                    handleFilterChange('delivery', newDel);
                  }}
                />
                {opt}
              </label>
            ))}
          </div>
          <div className="searchsupplier-trustscore-slider">
            <label>Trust Score: {filters.trustScore[0]} - {filters.trustScore[1]}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.trustScore[0]}
              onChange={e => handleFilterChange('trustScore', [Number(e.target.value), filters.trustScore[1]])}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={filters.trustScore[1]}
              onChange={e => handleFilterChange('trustScore', [filters.trustScore[0], Number(e.target.value)])}
            />
          </div>
          <div className="searchsupplier-price-range">
            <label>Price Range:</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange[0]}
              onChange={e => handleFilterChange('priceRange', [e.target.value, filters.priceRange[1]])}
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange[1]}
              onChange={e => handleFilterChange('priceRange', [filters.priceRange[0], e.target.value])}
            />
          </div>
        </div>
      )}
      <div className="searchsupplier-content">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : viewMode === 'grid' ? (
          renderSupplierCards()
        ) : (
          renderMapView()
        )}
      </div>
      {showComparison && renderComparisonModal()}
      {showProfileModal && renderProfileModal()}
      {showContactModal && renderContactModal()}
    </div>
  );
}

export default SearchSuppliers; 