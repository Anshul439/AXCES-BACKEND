import axios from 'axios';

const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';

export const getAutocompleteSuggestions = async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return next(errorHandler(400, res, "Query parameter is required"));
  }

  try {
    const response = await axios.get(NOMINATIM_API_URL, {
      params: {
        q: query,
        format: 'json',
        limit: 5, // Limit the number of suggestions
      },
      headers: {
        'User-Agent': 'AXCES-BACKEND/1.0',
        'Referer': 'https://https://axces-backend.onrender.com'
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
