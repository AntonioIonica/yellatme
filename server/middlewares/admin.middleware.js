const admin = async (req, res, next) => {
  try {
    // Catch any normal user trying to do any admin command
    if (req.user.role !== "admin") {
      res.status(403).json({ message: "Not authorized for this action!" });
    }

    // Let the request pass in case of admin permission
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized!", error: error.message });
  }
};

export default admin;
