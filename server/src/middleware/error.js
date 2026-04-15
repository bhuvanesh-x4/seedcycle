export function notFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);

  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {})
  });
}
