import React, { useState, useEffect, useCallback } from 'react';

const AllFilms = () => {
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);  

  const fetchMovies = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/films?page=${page}&limit=${limit}&query=${query}`);
      const data = await response.json();
      console.log('API Response:', data);  
      setMovies(data.results || []);  
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  }, [page, limit, query]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies, page]);  

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setPage(1); 
  };

  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;  

  return (
    <div class= "text-center">
      <h1 class= "text-center">Films List</h1>

      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search for a film, actor, or genre"
      />
      <table class="table">
        <thead>
          <tr>
            <th scope = "col">ID</th>
            <th scope = "col">Title</th>
            <th scope = "col">Genre</th>
          </tr>
        </thead>
        <tbody>
          {movies.length > 0 ? (
            movies.map((movie) => (
              <tr key={movie.film_id}>
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
        <button  type="button" class="btn btn-primary" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
          Previous
        </button>
        <span> Page {page} of {totalPages} </span>
        <button   type="button" class="btn btn-primary"onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default AllFilms;
