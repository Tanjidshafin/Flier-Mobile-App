const hotelService = require('../services/hotelService');

async function getHome(req, res) {
  const data = await hotelService.getHomeContent();

  res.status(200).json({
    success: true,
    message: 'Home content fetched successfully.',
    data,
  });
}

async function getDestinationSuggestions(req, res) {
  const data = await hotelService.getDestinationSuggestions(req.query.q);

  res.status(200).json({
    success: true,
    message: 'Destination suggestions fetched successfully.',
    data,
  });
}

async function listHotels(req, res) {
  const data = await hotelService.listHotels(req.query);

  res.status(200).json({
    success: true,
    message: 'Hotels fetched successfully.',
    data,
  });
}

async function getHotelDetails(req, res) {
  const data = await hotelService.getHotelDetails(req.params.slug);

  res.status(200).json({
    success: true,
    message: 'Hotel details fetched successfully.',
    data,
  });
}

module.exports = {
  getDestinationSuggestions,
  getHome,
  getHotelDetails,
  listHotels,
};
