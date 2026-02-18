import Boom from "@hapi/boom";

// Global error handler middleware
const globalErrorHandler = (err, req, res, next) => {
  // If error is a Boom error
  if (Boom.isBoom(err)) {
    return res.status(err.output.statusCode).json(err.output.payload);
  }

  // Log the error for debugging
  console.error(err);

  // Fallback for unexpected errors
  return res.status(500).json({
    statusCode: 500,
    error: "Internal Server Error",
    message: err.message || "Something went wrong",
  });
};

export default globalErrorHandler;
