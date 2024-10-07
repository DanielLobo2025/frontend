import React, { useEffect, useState } from 'react';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState('');
    const limit = 10; 

    const debouncedSearch = useDebounce(search, 1000); 

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/api/customers?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`);
                const data = await response.json();
                setCustomers(data.results);
                setTotalCount(data.total);  
            } catch (error) {
                console.error('Error fetching customers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, [page, debouncedSearch]);  

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1); 
    };

    if (loading) return <p>Loading...</p>;

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div>
            <h1 class= "text-center">Customers List</h1>
            <div class ="text-center">
            <input 
                type="text" 
                placeholder="Search by ID, First Name, Last Name" 
                value={search} 
                onChange={handleSearchChange} 
            />
            </div>
            {customers.length === 0 ? (
                <p>No customers found.</p>
            ) : (
                <table class="table">
                    <thead>
                        <tr>
                            <th scope = "col">ID</th>
                            <th scope = "col">Store ID</th>
                            <th scope = "col">First Name</th>
                            <th scope = "col">Last Name</th>
                            <th scope = "col">Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(customer => (
                            <tr key={customer.customer_id}>
                                <td>{customer.customer_id}</td>
                                <td>{customer.store_id}</td>
                                <td>{customer.first_name}</td>
                                <td>{customer.last_name}</td>
                                <td>{customer.active ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div class= "text-center">
                <button type="button" class="btn btn-primary" onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1}>Previous</button>
                <span> Page {page} </span>
                <button type="button" class="btn btn-primary" onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>Next</button>
            </div>
        </div>
    );
};

export default Customers;
