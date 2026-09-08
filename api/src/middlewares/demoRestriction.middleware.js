const demoRestrictionMiddleware = (req, res, next) => {
  if (req.isDemo) {
    return res.status(403).json({
      message:
        'This feature is not available in demo mode. Sign up for a free trial to unlock all features.',
      isDemo: true,
    });
  }
  next();
};

export default demoRestrictionMiddleware;
