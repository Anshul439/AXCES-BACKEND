import axios from 'axios';

const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';

export const getAutocompleteSuggestions = async (req, res, next) => {
  const query = req.query.query || 'Bangalore, India'; // Default to Bangalore if no query is provided

  try {
    const response = await axios.get(NOMINATIM_API_URL, {
      params: {
        q: query,
        format: 'json',
        limit: 5, // Limit the number of suggestions
        bounded: 1,
        viewbox: '68.1766451354,35.4940095078,97.4025614766,6.5546079008', // Bounding box for India
        'accept-language': 'en', // Request results in English
        countrycodes: 'IN', // Restrict results to India
      },
      headers: {
        'User-Agent': 'AXCES-BACKEND/1.0',
        'Referer': 'https://axces-backend.onrender.com'
      }
    });

    const suggestions = response.data.map((item) => ({
      place_name: item.display_name,
      coordinates: {
        latitude: item.lat,
        longitude: item.lon,
      },
    }));

    res.status(200).json({
      status: 'success',
      data: suggestions,
    });
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error);
    next(error);
  }
};
