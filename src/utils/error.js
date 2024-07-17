export const errorHandler = (statusCode, res , message) => {
  const error = new Error();
  error.statusCode = statusCode;
  error.message = message;
  res.status(statusCode).json({
    code: error.statusCode,
    data: {},
    message: error.message,
  });
};
