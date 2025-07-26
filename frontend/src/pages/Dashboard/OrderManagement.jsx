import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../../CSS/OrderManagement.css';

// Vite uses import.meta.env for environment variables
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Helper: Priority badge color
const getPriorityColor = (score) => {
  if (score >= 1500) return 'red';
  if (score >= 1000) return 'orange';
  return 'green';
};

const OrderManagement = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [orderQueue, setOrderQueue] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [customerFilter, setCustomerFilter] = useState('');
  const [loading, setLoading] = useState({ fetch: false, bulk: false, status: false });
  const [error, setError] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [automationRules, setAutomationRules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [bulkAction, setBulkAction] = useState(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkPayload, setBulkPayload] = useState({});
  const [modification, setModification] = useState({ changeType: '', changeDetails: {} });
  const [modificationLoading, setModificationLoading] = useState(false);
  const [automationEdit, setAutomationEdit] = useState(null);
  const [automationForm, setAutomationForm] = useState({ condition: {}, action: {} });

  // Socket reference
  const socketRef = useRef(null);

  // Effect: Connect to socket.io for real-time updates
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('orderUpdate', (data) => {
      // Placeholder: handle real-time order updates
      setNotifications((prev) => [...prev, { type: 'orderUpdate', data }]);
    });
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Effect: Fetch initial orders and queue
  useEffect(() => {
    setLoading((l) => ({ ...l, fetch: true }));
    axios.get('/api/vendor/orders/queue')
      .then((res) => {
        setOrderQueue(res.data.queue || []);
        setOrders(res.data.queue || []);
        setFilteredOrders(res.data.queue || []);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading((l) => ({ ...l, fetch: false })));
  }, []);

  // Effect: Auto-refresh queue every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get('/api/vendor/orders/queue')
        .then((res) => {
          setOrderQueue(res.data.queue || []);
          setOrders(res.data.queue || []);
          setFilteredOrders(res.data.queue || []);
        });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Placeholder: Filtering, searching, and selection logic
  // ...

  // Fetch order details for modal
  const fetchOrderDetails = async (orderId) => {
    setLoading((l) => ({ ...l, details: true }));
    try {
      const res = await axios.get(`/api/vendor/orders/${orderId}/details`);
      setSelectedOrder(res.data.order);
      setShowOrderDetails(true);
    } catch (err) {
      setError(err);
    } finally {
      setLoading((l) => ({ ...l, details: false }));
    }
  };

  // Handle select for bulk
  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };
  const handleSelectAll = () => {
    if (selectedOrders.length === orderQueue.length) setSelectedOrders([]);
    else setSelectedOrders(orderQueue.map((o) => o._id));
  };

  // Bulk action handler
  const handleBulkAction = (action) => {
    setBulkAction(action);
    setBulkDialogOpen(true);
  };
  const confirmBulkAction = async () => {
    setLoading((l) => ({ ...l, bulk: true }));
    try {
      await axios.post('/api/vendor/orders/bulk-action', {
        action: bulkAction,
        orderIds: selectedOrders,
        payload: bulkPayload
      });
      setBulkDialogOpen(false);
      setBulkAction(null);
      setSelectedOrders([]);
      // Refresh queue
      const res = await axios.get('/api/vendor/orders/queue');
      setOrderQueue(res.data.queue || []);
      setOrders(res.data.queue || []);
      setFilteredOrders(res.data.queue || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading((l) => ({ ...l, bulk: false }));
    }
  };

  // Order modification handler
  const submitModification = async () => {
    if (!modification.changeType) return;
    setModificationLoading(true);
    try {
      await axios.put(`/api/vendor/orders/${selectedOrder._id}/modify`, modification);
      setModification({ changeType: '', changeDetails: {} });
      setShowOrderDetails(false);
    } catch (err) {
      setError(err);
    } finally {
      setModificationLoading(false);
    }
  };

  // Automation rules handlers
  const fetchAutomationRules = useCallback(async () => {
    const res = await axios.get('/api/vendor/orders/automation-rules');
    setAutomationRules(res.data.rules || []);
  }, []);
  useEffect(() => { fetchAutomationRules(); }, [fetchAutomationRules]);
  const saveAutomationRules = async (rules) => {
    await axios.post('/api/vendor/orders/automation-rules', { rules });
    fetchAutomationRules();
  };

  return (
    <div className="ordermanagement-container">
      <header className="ordermanagement-header">
        <h1>Order Management</h1>
        {/* Global stats and action buttons */}
      </header>
      <div className="ordermanagement-toolbar">
        {/* Filters, search, view options */}
      </div>
      <main className="ordermanagement-content">
        <section className="ordermanagement-queue-container">
          <div className="ordermanagement-queue-header">
            <span>Order Queue</span>
            <span>
              <input
                type="checkbox"
                className="ordermanagement-select-all"
                checked={selectedOrders.length === orderQueue.length && orderQueue.length > 0}
                onChange={handleSelectAll}
              /> Select All
            </span>
          </div>
          {orderQueue.map((order) => (
            <div
              key={order._id}
              className={`ordermanagement-queue-item${selectedOrders.includes(order._id) ? ' selected' : ''}`}
            >
              <input
                type="checkbox"
                className="ordermanagement-select-checkbox"
                checked={selectedOrders.includes(order._id)}
                onChange={() => handleSelectOrder(order._id)}
              />
              <span className="ordermanagement-order-number">
                #{order.orderNumber} ({new Date(order.createdAt).toLocaleString()})
              </span>
              <span className="ordermanagement-customer-info">
                {order.customerName || order.supplierId?.name || 'Customer'}
              </span>
              <span className="ordermanagement-order-value">
                ${order.total?.toFixed(2) || '0.00'} ({order.items?.length || 0} items)
              </span>
              <span
                className="ordermanagement-priority-badge"
                style={{ background: getPriorityColor(order.priorityScore) }}
              >
                {order.priorityScore >= 1500 ? 'High' : order.priorityScore >= 1000 ? 'Medium' : 'Low'}
              </span>
              <span className="ordermanagement-delivery-info">
                {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}
              </span>
              <span className="ordermanagement-quick-actions">
                <button className="btn-ordermanagement" onClick={() => fetchOrderDetails(order._id)}>
                  View
                </button>
                {/* Accept/Reject quick actions can be added here */}
              </span>
              <span className="ordermanagement-expand-toggle">
                <button onClick={() => fetchOrderDetails(order._id)}>Details</button>
              </span>
            </div>
          ))}
        </section>
        {/* Bulk operations panel */}
        {selectedOrders.length > 0 && (
          <aside className="ordermanagement-bulk-panel">
            <button className="btn-ordermanagement-bulk-accept" onClick={() => handleBulkAction('accept')}>Accept</button>
            <button className="btn-ordermanagement-bulk-reject" onClick={() => handleBulkAction('reject')}>Reject</button>
            <button className="btn-ordermanagement-bulk-schedule" onClick={() => handleBulkAction('schedule')}>Schedule</button>
            <button className="btn-ordermanagement-bulk-export">Export</button>
            <button className="btn-ordermanagement-bulk-assign">Assign</button>
            <button className="btn-ordermanagement-bulk-priority">Priority</button>
            {/* Confirmation dialog */}
            {bulkDialogOpen && (
              <div className="ordermanagement-bulk-confirmation">
                <h4>Confirm Bulk Action: {bulkAction}</h4>
                <p>Affected Orders: {selectedOrders.length}</p>
                {bulkAction === 'reject' && (
                  <input
                    type="text"
                    placeholder="Reason for rejection"
                    value={bulkPayload.reason || ''}
                    onChange={e => setBulkPayload({ ...bulkPayload, reason: e.target.value })}
                  />
                )}
                {bulkAction === 'schedule' && (
                  <input
                    type="date"
                    className="ordermanagement-date-picker"
                    value={bulkPayload.deliveryDate || ''}
                    onChange={e => setBulkPayload({ ...bulkPayload, deliveryDate: e.target.value })}
                  />
                )}
                <button onClick={confirmBulkAction}>Confirm</button>
                <button onClick={() => setBulkDialogOpen(false)}>Cancel</button>
              </div>
            )}
          </aside>
        )}
        {/* Scheduling and capacity planning */}
        <section className="ordermanagement-scheduling-panel">
          {/* Calendar, capacity dashboard, delivery calendar, etc. */}
        </section>
        {/* Automation rules configuration */}
        <section className="ordermanagement-automation-panel">
          <h3>Automation Rules</h3>
          <ul>
            {automationRules.map((rule, idx) => (
              <li key={idx}>
                <span className="ordermanagement-rule-builder">
                  If {rule.condition?.customerType || 'any customer'} & value ≥ {rule.condition?.minValue || 0} → {rule.action?.type || 'action'}
                </span>
                <button onClick={() => setAutomationEdit(rule)}>Edit</button>
              </li>
            ))}
          </ul>
          <button onClick={() => setAutomationEdit({ condition: {}, action: {} })}>Add Rule</button>
          {automationEdit && (
            <div className="ordermanagement-rule-builder">
              <h4>{automationEdit.id ? 'Edit' : 'Add'} Rule</h4>
              <input
                type="text"
                placeholder="Customer Type"
                value={automationForm.condition.customerType || ''}
                onChange={e => setAutomationForm({ ...automationForm, condition: { ...automationForm.condition, customerType: e.target.value } })}
              />
              <input
                type="number"
                placeholder="Min Value"
                value={automationForm.condition.minValue || ''}
                onChange={e => setAutomationForm({ ...automationForm, condition: { ...automationForm.condition, minValue: e.target.value } })}
              />
              <input
                type="text"
                placeholder="Action Type"
                value={automationForm.action.type || ''}
                onChange={e => setAutomationForm({ ...automationForm, action: { ...automationForm.action, type: e.target.value } })}
              />
              <button onClick={() => {
                const newRules = automationEdit.id
                  ? automationRules.map(r => r.id === automationEdit.id ? { ...automationEdit, ...automationForm } : r)
                  : [...automationRules, { ...automationForm, id: Date.now() }];
                saveAutomationRules(newRules);
                setAutomationEdit(null);
                setAutomationForm({ condition: {}, action: {} });
              }}>Save</button>
              <button onClick={() => setAutomationEdit(null)}>Cancel</button>
            </div>
          )}
        </section>
        {/* Notifications */}
        <aside className="ordermanagement-notifications">
          {/* Notification list */}
        </aside>
      </main>
      {/* Order details modal */}
      {showOrderDetails && selectedOrder && (
        <div className="ordermanagement-details-modal" onClick={() => setShowOrderDetails(false)}>
          <div className="ordermanagement-modal-content" onClick={e => e.stopPropagation()}>
            <section className="ordermanagement-details-summary">
              <h2>Order #{selectedOrder.orderNumber}</h2>
              <p>Status: <span className="ordermanagement-status-badge">{selectedOrder.status}</span></p>
              <p>Placed: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              <p>Customer: {selectedOrder.customer?.name || 'N/A'}</p>
              <p>Contact: {selectedOrder.customer?.email || 'N/A'}</p>
              <p>Billing: {selectedOrder.customer?.billingAddress || 'N/A'}</p>
              <p>Shipping: {selectedOrder.customer?.shippingAddress || 'N/A'}</p>
              <p>Payment: {selectedOrder.payment?.method} ({selectedOrder.payment?.status})</p>
              <div className="ordermanagement-timeline">
                <h4>Order Timeline</h4>
                <ul>
                  {selectedOrder.timeline?.map((t, idx) => (
                    <li key={idx}>{t.status} - {new Date(t.timestamp).toLocaleString()}</li>
                  ))}
                </ul>
              </div>
            </section>
            <section className="ordermanagement-product-details">
              <h3>Products</h3>
              <ul className="ordermanagement-product-list">
                {selectedOrder.products?.map((item, idx) => (
                  <li key={idx}>
                    {item.name} x{item.quantity} @ ${item.price?.toFixed(2)}
                    <span className="ordermanagement-inventory-status">{item.inventoryStatus}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="ordermanagement-customer-history">
              <h3>Customer History</h3>
              <p>Rating: {selectedOrder.customer?.rating || 'N/A'}</p>
              <p>Reliability: {selectedOrder.customer?.reliabilityScore || 'N/A'}</p>
              <ul>
                {selectedOrder.customer?.orderHistory?.map((o, idx) => (
                  <li key={idx}>#{o.orderNumber} - {o.status} - {new Date(o.createdAt).toLocaleDateString()}</li>
                ))}
              </ul>
            </section>
            <section className="ordermanagement-internal-notes">
              <h3>Internal Notes</h3>
              <div className="ordermanagement-notes-editor">(Notes editor placeholder)</div>
              <ul>
                {selectedOrder.modifications?.map((m, idx) => (
                  <li key={idx}>{m.changeType} - {m.approvalStatus} - {new Date(m.timestamp).toLocaleString()}</li>
                ))}
              </ul>
              {/* Order modification controls */}
              <div className="ordermanagement-modification-panel">
                <select value={modification.changeType} onChange={e => setModification({ ...modification, changeType: e.target.value })}>
                  <option value="">Select Change Type</option>
                  <option value="quantity">Quantity</option>
                  <option value="substitution">Product Substitution</option>
                  <option value="address">Address Change</option>
                  <option value="date">Delivery Date</option>
                  <option value="special">Special Requirements</option>
                </select>
                <input
                  type="text"
                  placeholder="Change Details (JSON)"
                  value={JSON.stringify(modification.changeDetails)}
                  onChange={e => {
                    try {
                      setModification({ ...modification, changeDetails: JSON.parse(e.target.value) });
                    } catch { }
                  }}
                />
                <button className="btn-ordermanagement" onClick={submitModification} disabled={modificationLoading}>
                  Submit Modification
                </button>
              </div>
            </section>
            <button className="btn-ordermanagement" onClick={() => setShowOrderDetails(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement; 