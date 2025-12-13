// src/pages/Request.jsx
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  useGetDemoRequestByIdQuery,
  useUpdateDemoRequestMutation,
  useDeleteDemoRequestMutation,
} from '../../store/api/requestsApi';
import { useAuth } from '../../hooks/useAuth';
import moment from 'moment';
import {
  CircularProgress,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
} from '@mui/material';
import { Call, Download, Preview } from '@mui/icons-material';
import './Request.css';

const Request = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Current admin

  const { data: request, isLoading, error } = useGetDemoRequestByIdQuery(id);
  const [updateRequest, { isLoading: updating }] = useUpdateDemoRequestMutation();
  const [deleteRequest, { isLoading: deleting }] = useDeleteDemoRequestMutation();

  const [status, setStatus] = useState('');
  const [success, setSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Pre-fill status when request loads
  React.useEffect(() => {
    if (request) {
      setStatus(request.status || 'pending');
    }
  }, [request]);

  const handleUpdate = async () => {
    if (!status) {
      alert('Please select a status');
      return;
    }

    try {
      await updateRequest({
        id,
        status,
        respondedBy: user._id, // Auto-set current admin as responder
      }).unwrap();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
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
      await deleteRequest(id).unwrap();
      navigate('/requests');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (isLoading) return <div className="loading">Loading request...</div>;
  if (error || !request) return <div className="error">Request not found</div>;

  return (
    <div className="product">
      {/* Header */}
      <div className="productTitleContainer">
        <h1 className="productTitle">Demo Request Details</h1>
        <Link to="/requests">
          <Button variant="outlined">All Requests</Button>
        </Link>
      </div>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Request updated successfully!
        </Alert>
      )}

      <div className="request-body">
        {/* Left: Details */}
        <div className="request-left">
          <Typography variant="h6" gutterBottom>Sender Details</Typography>
          <Box className="request_item">
            <strong>Name:</strong> {request.fullName}
          </Box>
          <Box className="request_item">
            <strong>Email:</strong> {request.email}
          </Box>
          <Box className="request_item">
            <strong>Phone:</strong> {request.phone}
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Institute Details</Typography>
          <Box className="request_item">
            <strong>Institute:</strong> {request.instituteName}
          </Box>
          <Box className="request_item">
            <strong>Designation:</strong> {request.designation}
          </Box>
          <Box className="request_item">
            <strong>Student Strength:</strong> {request.studentStrength}
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Request Info</Typography>
          <Box className="request_item">
            <strong>Status:</strong>
            <Button variant="contained" size="small" color={
              request.status === 'completed' ? 'success' :
              request.status === 'rejected' ? 'error' : 'warning'
            }>
              {request.status?.toUpperCase() || 'PENDING'}
            </Button>
          </Box>
          <Box className="request_item">
            <strong>Responded By:</strong> {request.respondedBy?.username || '—'}
          </Box>
          <Box className="request_item">
            <strong>Created:</strong> {moment(request.createdAt).fromNow()}
          </Box>
          <Box className="request_item">
            <strong>Updated:</strong> {moment(request.updatedAt).fromNow()}
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Message</Typography>
          <Box>
            <Typography variant="body1">{request.message}</Typography>
          </Box>
        </div>

        {/* Right: Update + Actions */}
        <div className="request-right">
          {/* Update Section */}
          <Box className="requestRight-top">
            <Typography variant="h6" gutterBottom>Update Status</Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              fullWidth
              onClick={handleUpdate}
              disabled={updating}
              sx={{
                mb: 2,
                background: '#126865',
                '&:hover': { background: '#0d9488' },
              }}
            >
              {updating ? <CircularProgress size={24} color="inherit" /> : 'UPDATE STATUS'}
            </Button>

            <Button
              variant="contained"
              fullWidth
              color={deleteConfirm ? 'error' : 'secondary'}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <CircularProgress size={24} color="inherit" /> : deleteConfirm ? 'CONFIRM DELETE' : 'DELETE REQUEST'}
            </Button>

            {deleteConfirm && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Click <strong>CONFIRM DELETE</strong> again to permanently delete.
              </Alert>
            )}
          </Box>

          {/* Extra Actions */}
          <Box className="requestRight-bottom">
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Box className="requestInfos">
              <Button startIcon={<Download />} fullWidth variant="outlined" sx={{ mb: 1 }}>
                Export Details
              </Button>
              <Button startIcon={<Preview />} fullWidth variant="outlined" sx={{ mb: 1 }}>
                Previous Requests
              </Button>
              <Button startIcon={<Call />} fullWidth variant="outlined" color="success">
                Contact Sender
              </Button>
            </Box>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Request;