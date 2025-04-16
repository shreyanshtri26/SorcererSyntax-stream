import React, { useState, useEffect } from 'react';
import { getPersonDetails } from '../api/api'; // Import the new API function
import './PersonDetailsModal.css'; // Create this CSS file

// Re-use MediaItem for displaying known_for works, or create simpler version
const KnownForItem = ({ item, onClick, imageBaseUrl }) => {
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv'); // Infer type
    const handleClick = () => {
        onClick(item, mediaType, false); // Pass false for showTrailer
    };

    return (
        <div className="known-for-item" onClick={handleClick} title={`View details for ${item.title || item.name}`}>
            <img
                src={item.poster_path ? `${imageBaseUrl}${item.poster_path}` : 'no-poster.jpg'}
                alt={item.title || item.name}
                onError={(e) => { e.target.onerror = null; e.target.src='no-poster.jpg'; }}
            />
            <div className="known-for-info">
                <span className="known-for-title">{item.title || item.name}</span>
                <span className="known-for-year">
                    {mediaType === 'movie'
                    ? (item.release_date ? item.release_date.substring(0, 4) : 'N/A')
                    : (item.first_air_date ? item.first_air_date.substring(0, 4) : 'N/A')}
                </span>
            </div>
        </div>
    );
};

const PersonDetailsModal = ({ person, imageBaseUrl, onClose, currentTheme, onKnownForItemClick }) => {
    // State for detailed data, loading, and errors
    const [personDetails, setPersonDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBioExpanded, setIsBioExpanded] = useState(false);

    // Fetch detailed data when the component mounts or person changes
    useEffect(() => {
        if (!person?.id) return; // Don't fetch if no person ID

        const fetchDetails = async () => {
            setIsLoading(true);
            setError(null);
            setPersonDetails(null); // Clear previous details
            try {
                const details = await getPersonDetails(person.id);
                if (details) {
                    setPersonDetails(details);
                } else {
                    setError('Could not load person details.');
                }
            } catch (err) {
                setError('Failed to fetch person details.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [person?.id]); // Re-run if person.id changes

    if (!person) return null; // Should not happen if modal is open, but safe check

    // Prepare data for rendering
    const profileUrl = personDetails?.profile_path ? `${imageBaseUrl}${personDetails.profile_path}` : (person?.profile_path ? `${imageBaseUrl}${person.profile_path}` : 'no-profile.jpg');
    const name = personDetails?.name || person.name;
    const department = personDetails?.known_for_department || person.known_for_department;
    const popularity = personDetails?.popularity || person.popularity;
    const biography = personDetails?.biography;

    // Process and sort combined credits
    const getCredits = (type) => {
        if (!personDetails?.combined_credits) return [];
        
        const credits = [
            ...(personDetails.combined_credits.cast || []),
            ...(personDetails.combined_credits.crew || [])
        ];
        
        // Filter by type and remove duplicates based on ID
        const filteredCredits = credits
            .filter(credit => credit.media_type === type)
            .filter((credit, index, self) => 
                index === self.findIndex((c) => c.id === credit.id)
            );
            
        // Sort by popularity (descending)
        filteredCredits.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        
        return filteredCredits;
    };

    const movieCredits = getCredits('movie');
    const tvCredits = getCredits('tv');

    const toggleBio = () => setIsBioExpanded(!isBioExpanded);

    // Determine if biography needs truncation
    const shortBioLength = 300; // Adjust character limit as needed
    const requiresTruncation = biography && biography.length > shortBioLength;
    const displayBio = isBioExpanded ? biography : (biography ? biography.substring(0, shortBioLength) + (requiresTruncation ? '...' : '') : 'No biography available.');

    return (
        <div className={`modal-overlay theme-${currentTheme}-modal`} onClick={onClose}>
            <div className={`modal-content person-modal-content theme-${currentTheme}-modal-content`} onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>

                {isLoading && <p className="loading-text">Loading details...</p>}
                {error && <p className="error-text">{error}</p>}
                
                {!isLoading && !error && (
                    <div className="person-details-container">
                        <div className="person-header">
                            <img 
                               src={profileUrl} 
                               alt={name} 
                               className="person-profile-image" 
                               onError={(e) => { e.target.onerror = null; e.target.src='no-profile.jpg'; }}
                            />
                            <div className="person-info">
                                <h2 className="person-name">{name}</h2>
                                {department && (
                                    <p className="person-department">{department}</p>
                                )}
                                {popularity > 0 && (
                                  <p className="person-popularity">Popularity: {popularity.toFixed(1)}</p>
                                )}
                            </div>
                        </div>

                        {/* Biography Section */} 
                        {biography && (
                            <div className="person-biography">
                                <h3>Biography</h3>
                                <p className={`bio-text ${isBioExpanded ? 'expanded' : 'collapsed'}`}>
                                    {displayBio}
                                </p>
                                {requiresTruncation && (
                                    <button onClick={toggleBio} className="read-more-btn">
                                        {isBioExpanded ? 'Read Less' : 'Read More'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Movie Credits Section */} 
                        {movieCredits.length > 0 && (
                            <div className="person-credits-section">
                                <h3>Movie Credits ({movieCredits.length})</h3>
                                <div className="credits-grid">
                                    {movieCredits.map((work) => (
                                        <KnownForItem 
                                          key={`movie-${work.id}`}
                                          item={work} 
                                          onClick={onKnownForItemClick} 
                                          imageBaseUrl={imageBaseUrl} 
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                         {/* TV Credits Section */} 
                        {tvCredits.length > 0 && (
                            <div className="person-credits-section">
                                <h3>TV Credits ({tvCredits.length})</h3>
                                <div className="credits-grid">
                                    {tvCredits.map((work) => (
                                        <KnownForItem 
                                          key={`tv-${work.id}`}
                                          item={work} 
                                          onClick={onKnownForItemClick} 
                                          imageBaseUrl={imageBaseUrl} 
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {(movieCredits.length === 0 && tvCredits.length === 0) && (
                             <p>No movie or TV credits found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersonDetailsModal; 