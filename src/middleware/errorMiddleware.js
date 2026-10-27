const errorMiddleware = (err, req, res, next) => {
    console.error(err);
  
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map(
          (error) => error.message
        );
      
        return res.status(400).json({
          message: messages.join(", "),
        });
      }
  
    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }
  
    const statusCode = err.statusCode || 500;
  
    const message =
      statusCode === 500
        ? "Something went wrong"
        : err.message;
  
    res.status(statusCode).json({
      message,
    });
  };
  
  export default errorMiddleware;