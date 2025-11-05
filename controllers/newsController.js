import New from '../models/New.js';

export const createNews = async (req, res) => {
  const { header, img, desc } = req.body;
  const userId = req.user.id;

  try {
    const news = new New({
      userId,
      header,
      img,
      desc,
    });
    await news.save();

    res.status(201).json({
      success: true,
      data: news,
      message: 'News created successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const getAllNews = async (req, res) => {
  try {
    const news = await New.find().populate('userId');
    res.status(200).json({
      success: true,
      data: news,
      message: 'News fetched successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const getNews = async (req, res) => {
  try {
    const newItem = await New.findById(req.params.id);
    if (!newItem) {
      return res.status(404).json({ success: false, message: 'New not found', error: 'not_found' });
    }

    res.status(200).json({
      success: true,
      data: newItem,
      message: 'News fetched successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const updateNews = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const news = await New.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found', error: 'not_found' });
    }
    res.json({
      success: true,
      data: news,
      message: 'News updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const deleteNews = async (req, res) => {
  const { id } = req.params;

  try {
    const news = await New.findByIdAndDelete(id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found', error: 'not_found' });
    }
    res.json({
      success: true,
      message: 'News deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const likeNews = async (req, res) => {
  try {
    const newsItem = await New.findById(req.params.id);
    if (!newsItem) {
        return res.status(404).json({ success: false, message: 'News not found', error: 'not_found' });
    }

    const userId = req.user.id;
    const hasLiked = newsItem.likes.includes(userId);
    const hasDisliked = newsItem.dislikes.includes(userId);

    // Case 1: If already liked → unlike
    if (hasLiked) {
      await newsItem.updateOne({ $pull: { likes: userId } });
      return res.status(200).json({
        success: true,
        message: "You unliked the news"
      });
    }

    // Case 2: If previously disliked → remove from dislikes, then like
    if (hasDisliked) {
      await newsItem.updateOne({
        $pull: { dislikes: userId },
        $push: { likes: userId }
      });
      return res.status(200).json({
        success: true,
        message: "You liked the news (removed from dislikes)"
      });
    }

    // Case 3: Normal like
    await newsItem.updateOne({ $push: { likes: userId } });
    return res.status(200).json({
      success: true,
      message: "You liked the news"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};

export const dislikeNews = async (req, res) => {
  try {
    const newsItem = await New.findById(req.params.id);
    if (!newsItem) {
        return res.status(404).json({ success: false, message: 'News not found', error: 'not_found' });
    }

    const userId = req.user.id;
    const hasLiked = newsItem.likes.includes(userId);
    const hasDisliked = newsItem.dislikes.includes(userId);

    // Case 1: If already disliked → undislike
    if (hasDisliked) {
      await newsItem.updateOne({ $pull: { dislikes: userId } });
      return res.status(200).json({
        success: true,
        message: "You removed your dislike"
      });
    }

    // Case 2: If previously liked → remove from likes, then dislike
    if (hasLiked) {
      await newsItem.updateOne({
        $pull: { likes: userId },
        $push: { dislikes: userId }
      });
      return res.status(200).json({
        success: true,
        message: "You disliked the news (removed from likes)"
      });
    }

    // Case 3: Normal dislike
    await newsItem.updateOne({ $push: { dislikes: userId } });
    return res.status(200).json({
      success: true,
      message: "You disliked the news"
    });

  } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const viewNews = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id.toString(); // Ensure string

  try {
    // Use $addToSet to prevent duplicates
    const news = await New.findByIdAndUpdate(
      id,
      { $addToSet: { views: userId } },
      { new: true }
    );

    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found', error: 'not_found' });
    }

    res.json({
      success: true,
      message: `News: "${news.header}", viewed`,
    });
  } catch (error) {
    console.error('viewNews error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};