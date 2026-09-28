import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent } from '@mui/material';
import toast from 'react-hot-toast';

import ItemDetailsComponent from '../../components/item/ItemDetails';
import ItemDialog from '../../components/item/ItemDialog';
import { FormSkeleton } from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import itemService from '../../services/itemService';

/**
 * ItemDetails Page
 * View product overview, pricing, stock alerts, and future transaction tabs.
 */
const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchItem = useCallback(async () => {
    setLoading(true);
    try {
      const res = await itemService.getItemById(id);
      if (res?.success) {
        setItem(res.data);
      } else {
        setError('Item record not found.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load item profile.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleToggleStatus = async (itemToToggle) => {
    setStatusUpdating(true);
    const newStatus = itemToToggle.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await itemService.updateItemStatus(itemToToggle.id, newStatus);
      if (res?.success) {
        toast.success(`Item marked as ${newStatus}`);
        setItem(res.data);
      }
    } catch {
      // Handled by Axios interceptor
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleBack = () => {
    navigate('/items');
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <FormSkeleton fields={6} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error || !item) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <ErrorState
          title="Item Not Found"
          message={error || 'The requested product profile could not be found.'}
          onRetry={() => navigate('/items')}
          retryLabel="Back to Items"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <ItemDetailsComponent
        item={item}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onBack={handleBack}
        statusUpdating={statusUpdating}
      />

      <ItemDialog
        open={editDialogOpen}
        item={item}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={(updatedItem) => {
          setItem(updatedItem);
          fetchItem();
        }}
      />
    </Box>
  );
};

export default ItemDetailsPage;
