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

export const getProjectTimelyAnalytics = async (req, res) => {
  try {
    const now = new Date();

    // Helper: Stats in a date range
    const getStatsInRange = async (startDate, endDate = now) => {
      const projects = await Project.find({
        createdAt: { $gte: startDate, $lte: endDate }
      }).select('views likes createdAt');

      const count = projects.length;
      const totalViews = projects.reduce((sum, p) => sum + p.views.length, 0);
      const totalLikes = projects.reduce((sum, p) => sum + p.likes.length, 0);

      return { count, totalViews, totalLikes };
    };

    // === ALL-TIME GROSS METRICS ===
    const allProjects = await Project.find().select('views likes').lean();
    const gross = {
      totalProjects: allProjects.length,
      totalViews: allProjects.reduce((sum, p) => sum + p.views.length, 0),
      totalLikes: allProjects.reduce((sum, p) => sum + p.likes.length, 0),
      averageViewsPerProject: allProjects.length > 0
        ? Math.round(allProjects.reduce((sum, p) => sum + p.views.length, 0) / allProjects.length)
        : 0,
      averageLikesPerProject: allProjects.length > 0
        ? Math.round(allProjects.reduce((sum, p) => sum + p.likes.length, 0) / allProjects.length)
        : 0
    };

    // === PERIODIC STATS ===
    const today = await getStatsInRange(startOfDay(now));
    const yesterday = await getStatsInRange(startOfDay(subDays(now, 1)), startOfDay(now));

    const thisWeek = await getStatsInRange(startOfWeek(now));
    const lastWeek = await getStatsInRange(startOfWeek(subWeeks(now, 1)), startOfWeek(now));

    const thisMonth = await getStatsInRange(startOfMonth(now));
    const lastMonth = await getStatsInRange(startOfMonth(subMonths(now, 1)), startOfMonth(now));

    // Helper: % change
    const percentChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    res.json({
      success: true,
      data: {
        grossMetrics: {
          totalProjects: gross.totalProjects,
          totalViews: gross.totalViews,
          totalLikes: gross.totalLikes,
          averageViewsPerProject: gross.averageViewsPerProject,
          averageLikesPerProject: gross.averageLikesPerProject
        },
        summary: {
          today: {
            projectsCount: today.count,
            views: today.totalViews,
            likes: today.totalLikes,
            projectsGrowth: percentChange(today.count, yesterday.count),
            viewsGrowth: percentChange(today.totalViews, yesterday.totalViews),
            likesGrowth: percentChange(today.totalLikes, yesterday.totalLikes)
          },
          thisWeek: {
            projectsCount: thisWeek.count,
            views: thisWeek.totalViews,
            likes: thisWeek.totalLikes,
            projectsGrowth: percentChange(thisWeek.count, lastWeek.count),
            viewsGrowth: percentChange(thisWeek.totalViews, lastWeek.totalViews),
            likesGrowth: percentChange(thisWeek.totalLikes, lastWeek.totalLikes)
          },
          thisMonth: {
            projectsCount: thisMonth.count,
            views: thisMonth.totalViews,
            likes: thisMonth.totalLikes,
            projectsGrowth: percentChange(thisMonth.count, lastMonth.count),
            viewsGrowth: percentChange(thisMonth.totalViews, lastMonth.totalViews),
            likesGrowth: percentChange(thisMonth.totalLikes, lastMonth.totalLikes)
          }
        },
        generatedAt: now.toISOString()
      },
      message: 'Project analytics fetched successfully'
    });
  } catch (error) {
    console.error('getProjectTimelyAnalytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: 'server_error'
    });
  }
};