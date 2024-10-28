import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const AllFilms = () => {
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [filmDetails, setFilmDetails] = useState(null);
  const [customerId, setCustomerId] = useState('');
  const [rentalMessage, setRentalMessage] = useState('');

  const fetchMovies = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/films?page=${page}&limit=${limit}&query=${query}`);
      const data = await response.json();
      setMovies(data.results || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  }, [page, limit, query]);

  const fetchFilmDetails = async (filmId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/films/${filmId}`);
      const data = await response.json();
      setFilmDetails(data);
      setModalIsOpen(true);
      setRentalMessage(''); // Clear previous rental message
      setCustomerId(''); // Clear previous customer ID
    } catch (error) {
      console.error('Error fetching film details:', error);
    }
  };

  const handleRentFilm = async () => {
    if (!customerId) {
      setRentalMessage('Please enter a valid Customer ID.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/rent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filmId: filmDetails.film_id,
          customerId: parseInt(customerId, 10), // Ensure customerId is a number
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setRentalMessage('Film rented successfully!');
        setCustomerId(''); // Clear the input if successful
        fetchMovies(); // Refresh the movie list
      } else {
        setRentalMessage(data.error || 'An error occurred while renting the film.');
      }
    } catch (error) {
      console.error('Error renting film:', error);
      setRentalMessage('An error occurred while renting the film.');
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies, page]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  return (
    <div className="text-center">
      <h1 className="text-center">Films List</h1>

      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search for a film, actor, or genre"
      />
      <table className="table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Title</th>
            <th scope="col">Genre</th>
          </tr>
        </thead>
        <tbody>
          {movies.length > 0 ? (
            movies.map((movie) => (
              <tr key={movie.film_id} onClick={() => fetchFilmDetails(movie.film_id)} style={{ cursor: 'pointer' }}>
                <td>{movie.film_id}</td>
                <td>{movie.title}</td>
                <td>{movie.category_name}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No movies found. Please try a different search.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div>
        <button type="button" className="btn btn-primary" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
          Previous
        </button>
        <span> Page {page} of {totalPages} </span>
        <button type="button" className="btn btn-primary" onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>
          Next
        </button>
      </div>

      {/* Modal for Film Details */}
      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} contentLabel="Film Details">
        <h2>{filmDetails?.title}</h2>
        <p><strong>Description:</strong> {filmDetails?.description}</p>
        <p><strong>Release Year:</strong> {filmDetails?.release_year}</p>
        <p><strong>Rental Duration:</strong> {filmDetails?.rental_duration} days</p>
        <p><strong>Rental Rate:</strong> ${filmDetails?.rental_rate}</p>
        <p><strong>Length:</strong> {filmDetails?.length} minutes</p>
        <p><strong>Replacement Cost:</strong> ${filmDetails?.replacement_cost}</p>
        <p><strong>Rating:</strong> {filmDetails?.rating}</p>
        <p><strong>Special Features:</strong> {filmDetails?.special_features}</p>
        <p><strong>Last Updated:</strong> {filmDetails?.last_update}</p>

        <input
          type="text"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          placeholder="Enter Customer ID"
        />
        <button onClick={handleRentFilm}>Rent</button>
        {rentalMessage && <p>{rentalMessage}</p>}

        <button onClick={() => setModalIsOpen(false)}>Close</button>
      </Modal>
    </div>
  );
};

export default AllFilms;
