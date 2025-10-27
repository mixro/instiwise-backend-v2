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

export const getUserProjects = async (req, res) => {
  const userId = req.user.id;

  try {
    const projects = await Project.find({ userId });
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
  const { id } = req.params;
  const updates = req.body;

  try {
    const project = await Project.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found', error: 'not_found' });
    }
    res.json({
      success: true,
      data: project,
      message: 'Project updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found', error: 'not_found' });
    }
    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};