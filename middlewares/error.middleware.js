// Intercepting the error thrown when accesing multiple services and operations
const errorMiddleware = (err, req, res, next) => {
  try {
    let error = { ...err };
    error.message = err.message;
    console.error(error);

    // Mongoose bad ObjectId
    if (error.name === "CastError") {
      const message = "Resource not found!";
      // Create new error
      error = new Error(message);
      error.statusCode = 404;
    }

    // Mongoose duplicate key (id)
    if (error.name === 11000) {
      const message = "Duplicate field value entered!";
      error = new Error(message);
      error.statusCode = 400;
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      // multiple validation errors and show all messsages
      const message = Object.values(err.errors).map((val) => val.message);
      error = new Error(message.join(", "));
      error.statusCode = 400;
    }

    // Send back one of the status codes and the equivalent message/s
    res
      .status(error.statusCode || 500)
      .json({
        success: false,
        error: error.message || "Internal server error!",
      });
  } catch (error) {
    // Send the error to the next step to know actually happened
    next(error);
  }
};

export default errorMiddleware;
