import axios from 'axios';

const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';

export const getAutocompleteSuggestions = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      status: 'fail',
      message: 'Query parameter is required',
    });
  }

  try {
    const response = await axios.get(NOMINATIM_API_URL, {
      params: {
        q: query,
        format: 'json',
        limit: 5, // Limit the number of suggestions
      },
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
    res.status(500).json({
      status: 'fail',
      message: 'An error occurred while fetching suggestions',
    });
  }
};
