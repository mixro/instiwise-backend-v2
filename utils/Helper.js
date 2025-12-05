// src/pages/NewsDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  useGetNewsByIdQuery,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
} from '../../store/api/newsApi';
import { useImageUpload } from '../../hooks/useImageUpload';
import {
  CircularProgress,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import moment from 'moment';
import './NewsDetails.css';

const NewsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: news, isLoading, error } = useGetNewsByIdQuery(id);
  const [updateNews, { isLoading: updating }] = useUpdateNewsMutation();
  const [deleteNews, { isLoading: deleting }] = useDeleteNewsMutation();
  const { pickImage, uploadImage, uploading: isUploading, progress } = useImageUpload();

  const [formData, setFormData] = useState({
    header: '',
    category: '',
    desc: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [success, setSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Populate form when news loads
  useEffect(() => {
    if (news) {
      setFormData({
        header: news.header || '',
        category: news.category || '',
        desc: news.desc || '',
      });
      setPreviewUrl(news.img || '');
    }
  }, [news]);

  const handlePickImage = async () => {
    const file = await pickImage();
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    let imageUrl = news.img; // Keep old image by default

    if (selectedFile) {
      const result = await uploadImage(selectedFile);
      if (!result?.url) {
        alert('Image upload failed. Update will proceed without new image.');
      } else {
        imageUrl = result.url;
      }
    }

    const payload = {
      header: formData.header.trim(),
      category: formData.category.trim(),
      desc: formData.desc.trim(),
      ...(imageUrl !== news.img && { img: imageUrl }), // Only send if changed
    };

    try {
      await updateNews({ id, ...payload }).unwrap();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      setSelectedFile(null);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 8000);
      return;
    }

    try {
      await deleteNews(id).unwrap();
      navigate('/news');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (isLoading) return <div className="loading">Loading news...</div>;
  if (error || !news) return <div className="error">News not found</div>;

  return (
    <div className="product">
      {/* Header */}
      <div className="productTitleContainer">
        <h1 className="productTitle">Edit News</h1>
        <Link to="/create-news">
          <Button variant="outlined" color="primary">Create New</Button>
        </Link>
      </div>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>News updated successfully!</Alert>
      )}

      {/* News Details */}
      <div className="productTop">
        <div className="productTopLeft">
          <img
            src={news.img || '/placeholder-news.jpg'}
            alt={news.header}
            className="newsDetailImg"
          />
        </div>

        <div className="productTopRight">
          <h2>{news.header}</h2>
          <div className="infoGrid">
            <div><strong>ID:</strong> {news._id}</div>
            <div><strong>Category:</strong> {news.category}</div>
            <div><strong>Likes:</strong> {news.likes?.length || 0}</div>
            <div><strong>Views:</strong> {news.views?.length || 0}</div>
            <div><strong>Created:</strong> {moment(news.createdAt).fromNow()}</div>
            <div><strong>Updated:</strong> {moment(news.updatedAt).fromNow()}</div>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>{news.desc}</p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="productBottom">
        <form onSubmit={handleUpdate} className="productForm">
          <div className="formGrid">
            {/* Left: Form */}
            <div>
              <TextField
                label="Title"
                fullWidth
                required
                value={formData.header}
                onChange={(e) => setFormData({ ...formData, header: e.target.value })}
                sx={{ mb: 3 }}
              />
              <TextField
                label="Category"
                fullWidth
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                sx={{ mb: 3 }}
              />
              <TextField
                label="Description"
                multiline
                rows={10}
                fullWidth
                required
                value={formData.desc}
                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              />
            </div>

            {/* Right: Image */}
            <div className="addProduct_Image">
              <div
                onClick={handlePickImage}
                style={{
                  border: '3px dashed #126865',
                  borderRadius: '16px',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f0fdfa',
                }}
              >
                <PhotoCamera sx={{ fontSize: 60, color: '#126865' }} />
                <p style={{ fontWeight: 'bold', marginTop: '1rem' }}>
                  Click to Change Image (Optional)
                </p>
              </div>

              {previewUrl && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      maxHeight: '320px',
                      width: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    }}
                  />
                  {isUploading && (
                    <div style={{ marginTop: '1rem' }}>
                      <CircularProgress />
                      <p>Uploading... {progress}%</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="actionButtons" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={updating || isUploading}
              sx={{ minWidth: '180px', background: '#126865', '&:hover': { background: '#0d9488' } }}
            >
              {updating ? <CircularProgress size={24} /> : 'UPDATE NEWS'}
            </Button>

            <Button
              variant="contained"
              size="large"
              color={deleteConfirm ? 'error' : 'secondary'}
              onClick={handleDelete}
              disabled={deleting}
              sx={{ minWidth: '180px' }}
            >
              {deleting ? <CircularProgress size={24} /> : deleteConfirm ? 'CONFIRM DELETE' : 'DELETE NEWS'}
            </Button>
          </div>

          {deleteConfirm && (
            <Alert severity="warning" sx={{ mt: 2, textAlign: 'center' }}>
              Click <strong>CONFIRM DELETE</strong> again to permanently remove this news.
            </Alert>
          )}
        </form>
      </div>
    </div>
  );
};

export default NewsDetails;