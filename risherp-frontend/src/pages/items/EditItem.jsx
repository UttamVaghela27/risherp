import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent } from '@mui/material';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import ItemForm from '../../components/item/ItemForm';
import { FormSkeleton } from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import itemService from '../../services/itemService';
import categoryService from '../../services/categoryService';
import { DEFAULT_UNITS } from '../../utils/constants';

/**
 * EditItem Page
 * Update product pricing, category, and threshold info.
 * Enforces currentStock immutability.
 */
const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState(DEFAULT_UNITS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemRes, catRes, unitRes] = await Promise.all([
        itemService.getItemById(id),
        categoryService.getAllActiveCategories(),
        itemService.getUnits().catch(() => ({ success: false })),
      ]);

      if (itemRes?.success) {
        setItem(itemRes.data);
      } else {
        setError('Item record not found.');
      }

      if (catRes?.success) {
        setCategories(catRes.data || []);
      }

      if (unitRes?.success && unitRes.data?.length > 0) {
        setUnits(unitRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load item record.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await itemService.updateItem(id, formData);
      if (res?.success) {
        toast.success(`Item "${res.data.itemName}" updated successfully`);
        navigate(`/items/${id}`);
      }
    } catch {
      // Handled by Axios interceptor
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
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
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <PageHeader
        title={`Edit: ${item.itemName}`}
        description={`Update product specifications, pricing, and safety stock for ${item.itemCode}.`}
        breadcrumbs={[
          { label: 'Inventory' },
          { label: 'Items', onClick: () => navigate('/items') },
          { label: item.itemName, onClick: () => navigate(`/items/${id}`) },
          { label: 'Edit', active: true },
        ]}
      />

      <ItemForm
        initialValues={item}
        isEdit={true}
        categories={categories}
        units={units}
        loading={submitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/items/${id}`)}
      />
    </Box>
  );
};

export default EditItem;
