import React, { useState, useEffect } from 'react';

const ActorList = () => {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedActor, setSelectedActor] = useState(null);

  useEffect(() => {
    const fetchActors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/actors');
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Network response was not ok: ${response.status} - ${errorMessage}`);
        }
        const data = await response.json();
        setActors(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActors();
  }, []);

  const fetchActorDetails = async (actorId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/actors/${actorId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch actor details');
      }
      const data = await response.json();
      setSelectedActor(data);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-4 text-center">Top 5 Actors</h1>
      <ul className="mb-4 text-center list-none p-0">
        {actors.map(actor => (
          <li 
            key={actor.actor_id} 
            onClick={() => fetchActorDetails(actor.actor_id)} 
            className="cursor-pointer list-group"
          >
           <div class="list-group-item list-group-item-action"> {actor.first_name} {actor.last_name} (Films: {actor.film_count}) </div>
          </li>
        ))}
      </ul>
      {selectedActor && (
        <div className="text-center">
          <h2 className="mb-2">{selectedActor.actor.first_name} {selectedActor.actor.last_name}</h2>
          <p><strong>Film Count:</strong> {selectedActor.actor.film_count}</p>
          
          <h3 className="mt-4 mb-2">Top 5 Rented Films</h3>
          
          <div className="flex justify-center">
            <ul className="list-none p-0">
              {selectedActor.topFilms.map(film => (
                <li key={film.film_id} className="mb-1">
                  <strong>Film ID:</strong> {film.film_id} - <strong>Title:</strong> {film.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActorList;
