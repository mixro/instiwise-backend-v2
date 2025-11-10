import Project from '../models/Project.js';

export const createProject = async (req, res) => {
  const { title, description, img, category, problem, collaborators, duration, goals, resources, budget, scope, plan, challenges } = req.body;
  const userId = req.user.id;

  try {
    const existingProject = await Project.findOne({ title });
    if (existingProject) {
      return res.status(400).json({ success: false, message: 'Project with this title already exists', error: 'validation_error' });
    }

    const project = new Project({
      title,
      userId,
      description,
      img,
      category,
      problem,
      collaborators,
      duration,
      goals,
      resources,
      budget,
      scope,
      plan,
      challenges,
    });
    await project.save();

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate('userId', '-password');
        res.status(200).json({
            success: true,
            data: projects,
            message: 'Projects fetched successfully'
        });
    } catch (error) {
        res.status(500).json({success: false, message: 'Server error', error: 'server_error'})
    }
}

export const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('userId', '-password');
        res.status(200).json({
            success: true,
            data: project,
            message: 'Project fetched successfully'
        });
    } catch (error) {
        res.status(500).json({success: false, message: 'Server error', error: 'server_error'})
    }
}

export const getMyProjects = async (req, res) => {
  const userId = req.user.id;

  try {
    const projects = await Project.find({ userId }).populate('userId', '-password');
    res.json({
      success: true,
      data: projects,
      message: 'Projects fetched successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const getUserProjects = async (req, res) => {
  const userId = req.params.userId;

  try {
    const projects = await Project.find({ userId }).populate('userId', '-password');
    res.json({
      success: true,
      data: projects,
      message: 'Projects fetched successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const updateProject = async (req, res) => {
  const updates = req.body;
  const project = req.project; // From middleware

  try {
    Object.assign(project, updates);
    await project.save();

    const updatedProject = await Project.findById(project._id); // Re-fetch if needed

    res.json({
      success: true,
      data: updatedProject,
      message: 'Project updated successfully',
    });
  } catch (error) {
    console.error('updateProject error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const deleteProject = async (req, res) => {
  const project = req.project;

  try {
    await Project.findByIdAndDelete(project._id);

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('deleteProject error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const likeProject = async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found', error: 'not_found' });
      }
      const userId = req.user.id;

    if (!project.likes.includes(userId)) {
        await project.updateOne({ $push: { likes: userId } });
        res.status(200).json({
            success: true,
            message: "The project has been liked"
        });
    } else {
        await project.updateOne({ $pull: { likes: userId } });
        res.status(200).json({
            success: true,
            message: "The project has been unliked"
        });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};