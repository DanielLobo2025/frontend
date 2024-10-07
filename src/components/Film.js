import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const FilmList = () => {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilm, setSelectedFilm] = useState(null);

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/films');
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Network response was not ok: ${response.status} - ${errorMessage}`);
        }
        const data = await response.json();
        setFilms(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, []);

  const fetchFilmDetails = async (filmId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/films/${filmId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch film details');
      }
      const data = await response.json();
      setSelectedFilm(data);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-center">Top 5 Rented Films</h1>
      <ul className="text-center list-none p-0">
        {films.map(film => (
          <li
            key={film.film_id}
            onClick={() => fetchFilmDetails(film.film_id)}
            className="cursor-pointer list-group"
          >
           <div class="list-group-item list-group-item-action">{film.title}</div>
          </li>
        ))}
      </ul>

      {selectedFilm && (
        <div className="text-center">
          <h2>{selectedFilm.title}</h2>
          <p><strong>Film ID:</strong> {selectedFilm.film_id}</p>
          <p><strong>Description:</strong> {selectedFilm.description}</p>
          <p><strong>Release Year:</strong> {selectedFilm.release_year}</p>
          <p><strong>Rental Duration:</strong> {selectedFilm.rental_duration} days</p>
          <p><strong>Rental Rate:</strong> ${selectedFilm.rental_rate}</p>
          <p><strong>Length:</strong> {selectedFilm.length} minutes</p>
          <p><strong>Replacement Cost:</strong> ${selectedFilm.replacement_cost}</p>
          <p><strong>Rating:</strong> {selectedFilm.rating}</p>
          <p><strong>Special Features:</strong> {selectedFilm.special_features}</p>
          <p><strong>Last Updated:</strong> {new Date(selectedFilm.last_update).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default FilmList;
