export const validateProfile = (req, res, next) => {
    const { userId, name, email } = req.body;
  
    if (!userId || !name || !email) {
      return res.status(400).json({ status: 'fail', message: 'All 3 fields are required are required' });
    }
  
    next();
  };
  