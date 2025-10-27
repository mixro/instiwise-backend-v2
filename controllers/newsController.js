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

export const getUserNews = async (req, res) => {
  const userId = req.user.id;

  try {
    const newsItems = await New.find({ userId });
    res.json({
      success: true,
      data: newsItems,
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