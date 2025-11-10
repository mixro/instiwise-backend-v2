import Project from '../models/Project.js';

const ownsProject = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id; // From authenticateToken

  try {
    const project = await Project.findById(id).select('userId');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found', error: 'not_found' });
    }

    if (project.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You do not own this project', error: 'forbidden' });
    }

    // Attach project to request for use in controller
    req.project = project;
    next();
  } catch (error) {
    console.error('ownsProject middleware error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export default ownsProject;