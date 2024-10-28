import React, { useEffect, useState, useCallback } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [customerData, setCustomerData] = useState(null);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [editData, setEditData] = useState({});
    const [newCustomerData, setNewCustomerData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        address: '',
        address2: '',
        city: '',
        district: '',
        country: '',
        postal_code: '',
        phone: '',
    });
    const [emailError, setEmailError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/customers?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
            const data = await response.json();
            setCustomers(data.results || []);
            setTotalCustomers(data.totalCount);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    }, [page, search, limit]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleDeleteCustomer = async () => {
        console.log("Deleting customer with ID:", customerToDelete);
        if (customerToDelete) {
            try {
                const response = await fetch(`http://localhost:5000/api/customers/${customerToDelete}`, {
                    method: 'DELETE',
                });
    
                if (!response.ok) {
                    throw new Error('Failed to delete customer');
                }
    
                await fetchCustomers();
                setShowDeleteModal(false); 
            } catch (error) {
                console.error('Error deleting customer:', error);
                alert('An error occurred while deleting the customer. Please try again.');
            }
        }
    };
    

    const viewCustomerDetails = async (customerId) => {
        const response = await fetch(`http://localhost:5000/api/customers/${customerId}/details`);
        const data = await response.json();
        setCustomerData(data);
        setShowDetailsModal(true);
    };

    const openEditModal = async (customer) => {
        const response = await fetch(`http://localhost:5000/api/customers/${customer.customer_id}`);
        const customerDetails = await response.json();
        setEditData(customerDetails);
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleEditSubmit = async () => {
        const response = await fetch('http://localhost:5000/api/editcustomer', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(editData),
        });

        if (response.ok) {
            fetchCustomers();
            setShowEditModal(false);
        } else {
            const errorData = await response.json();
            console.error('Error updating customer:', errorData);
        }
    };

    const handleNewCustomerChange = (e) => {
        const { name, value } = e.target;
        setNewCustomerData((prevData) => ({ ...prevData, [name]: value }));
        setEmailError('');
    };

    const handleCreateCustomer = async () => {
        const response = await fetch('http://localhost:5000/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newCustomerData),
        });

        if (response.ok) {
            fetchCustomers();
            setShowCreateModal(false);
            setNewCustomerData({
                first_name: '',
                last_name: '',
                email: '',
                address: '',
                address2: '',
                city: '',
                district: '',
                country: '',
                postal_code: '',
                phone: '',
            });
            setEmailError('');
            setSuccessMessage('Customer created successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } else {
            const errorData = await response.json();
            if (errorData.message.includes('email')) {
                setEmailError('Email is already in use. Please try again with a different email address.');
            }
            console.error('Error creating customer:', errorData);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h1 className="text-center">Customers List</h1>
            {successMessage && <p style={{ color: 'green', textAlign: 'center' }}>{successMessage}</p>}
            <div className="text-center">
                <input
                    type="text"
                    placeholder="Search by ID, First Name, Last Name"
                    value={search}
                    onChange={handleSearchChange}
                />
            </div>
            <button onClick={() => setShowCreateModal(true)}>Create New Customer</button>
            {customers.length === 0 ? (
                <p>No customers found.</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Store ID</th>
                            <th scope="col">First Name</th>
                            <th scope="col">Last Name</th>
                            <th scope="col">Active</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(customer => (
                            <tr key={customer.customer_id}>
                                <td>{customer.customer_id}</td>
                                <td>{customer.store_id}</td>
                                <td onClick={() => viewCustomerDetails(customer.customer_id)}>{customer.first_name}</td>
                                <td onClick={() => viewCustomerDetails(customer.customer_id)}>{customer.last_name}</td>
                                <td>{customer.active ? 'Yes' : 'No'}</td>
                                <td>
                                    <button onClick={() => openEditModal(customer)}>Edit</button>
                                    <button onClick={() => { setCustomerToDelete(customer.customer_id); setShowDeleteModal(true); }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div className="pagination">
                <button
                    onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
                    disabled={page === 1}
                >
                    Previous
                </button>
                <span>Page {page}</span>
                <button
                    onClick={() => setPage((prevPage) => prevPage + 1)}
                    disabled={customers.length < limit}
                >
                    Next
                </button>
            </div>
            <Modal
                isOpen={showDeleteModal}
                onRequestClose={() => setShowDeleteModal(false)}
                contentLabel="Delete Customer"
            >
                <h2>Are you sure you want to delete this customer?</h2>
                <button onClick={handleDeleteCustomer}>Confirm</button>
                <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </Modal>

            <Modal
                isOpen={showDetailsModal}
                onRequestClose={() => setShowDetailsModal(false)}
                contentLabel="Customer Details"
            >
                {customerData && (
                    <>
                        <h2>{customerData.customer.first_name} {customerData.customer.last_name}</h2>
                        <p>Email: {customerData.customer.email}</p>
                        <p>Address: {customerData.customer.address || 'N/A'}</p>
                        <p>City: {customerData.customer.city || 'N/A'}</p>
                        <p>Phone: {customerData.customer.phone || 'N/A'}</p>
                        <h3>Rental History:</h3>
                        <ul>
                            {customerData.rentals.length > 0 ? (
                                customerData.rentals.map(rental => (
                                    <li key={rental.rental_id}>
                                        {rental.title} - Rented on: {new Date(rental.rental_date).toLocaleDateString()} {rental.return_date ? ` - Returned on: ${new Date(rental.return_date).toLocaleDateString()}` : ' - Not returned yet'}
                                    </li>
                                ))
                            ) : (
                                <p>No rental history found.</p>
                            )}
                        </ul>
                        <button onClick={() => setShowDetailsModal(false)}>Close</button>
                    </>
                )}
            </Modal>

            <Modal
                isOpen={showEditModal}
                onRequestClose={() => setShowEditModal(false)}
                contentLabel="Edit Customer"
            >
                <h2>Edit Customer Details</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }}>
                    <input
                        name="first_name"
                        value={editData.first_name || ''}
                        onChange={handleEditChange}
                        placeholder="First Name"
                        required
                    />
                    <input
                        name="last_name"
                        value={editData.last_name || ''}
                        onChange={handleEditChange}
                        placeholder="Last Name"
                        required
                    />
                    <input
                        name="email"
                        value={editData.email || ''}
                        onChange={handleEditChange}
                        placeholder="Email"
                        required
                    />
                    <input
                        name="address"
                        value={editData.address || ''}
                        onChange={handleEditChange}
                        placeholder="Address"
                        required
                    />
                    <input
                        name="address2"
                        value={editData.address2 || ''}
                        onChange={handleEditChange}
                        placeholder="Address 2"
                    />
                    <input
                        name="city"
                        value={editData.city || ''}
                        onChange={handleEditChange}
                        placeholder="City"
                        required
                    />
                    <input
                        name="district"
                        value={editData.district || ''}
                        onChange={handleEditChange}
                        placeholder="District"
                        required
                    />
                    <input
                        name="country"
                        value={editData.country || ''}
                        onChange={handleEditChange}
                        placeholder="Country"
                        required
                    />
                    <input
                        name="postal_code"
                        value={editData.postal_code || ''}
                        onChange={handleEditChange}
                        placeholder="Postal Code"
                        required
                    />
                    <input
                        name="phone"
                        value={editData.phone || ''}
                        onChange={handleEditChange}
                        placeholder="Phone"
                        required
                    />
                    <button type="submit">Update</button>
                    <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
                </form>
            </Modal>

            <Modal
                isOpen={showCreateModal}
                onRequestClose={() => setShowCreateModal(false)}
                contentLabel="Create New Customer"
            >
                <h2>Create New Customer</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleCreateCustomer(); }}>
                    <input
                        name="first_name"
                        value={newCustomerData.first_name}
                        onChange={handleNewCustomerChange}
                        placeholder="First Name"
                        required
                    />
                    <input
                        name="last_name"
                        value={newCustomerData.last_name}
                        onChange={handleNewCustomerChange}
                        placeholder="Last Name"
                        required
                    />
                    <input
                        name="email"
                        value={newCustomerData.email}
                        onChange={handleNewCustomerChange}
                        placeholder="Email"
                        required
                    />
                    <input
                        name="address"
                        value={newCustomerData.address}
                        onChange={handleNewCustomerChange}
                        placeholder="Address"
                        required
                    />
                    <input
                        name="address2"
                        value={newCustomerData.address2}
                        onChange={handleNewCustomerChange}
                        placeholder="Address 2"
                    />
                    <input
                        name="city"
                        value={newCustomerData.city}
                        onChange={handleNewCustomerChange}
                        placeholder="City"
                        required
                    />
                    <input
                        name="district"
                        value={newCustomerData.district}
                        onChange={handleNewCustomerChange}
                        placeholder="District"
                        required
                    />
                    <input
                        name="country"
                        value={newCustomerData.country}
                        onChange={handleNewCustomerChange}
                        placeholder="Country"
                        required
                    />
                    <input
                        name="postal_code"
                        value={newCustomerData.postal_code}
                        onChange={handleNewCustomerChange}
                        placeholder="Postal Code"
                        required
                    />
                    <input
                        name="phone"
                        value={newCustomerData.phone}
                        onChange={handleNewCustomerChange}
                        placeholder="Phone"
                        required
                    />
                    {emailError && <p style={{ color: 'red' }}>{emailError}</p>}
                    <button type="submit">Create</button>
                    <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                </form>
            </Modal>
        </div>
    );
};

export default Customers;
//attempted to implement other features but there are bugs 