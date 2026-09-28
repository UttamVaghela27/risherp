import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent } from '@mui/material';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import ItemForm from '../../components/item/ItemForm';
import { FormSkeleton } from '../../components/common/Loading';
import itemService from '../../services/itemService';
import categoryService from '../../services/categoryService';
import { DEFAULT_UNITS } from '../../utils/constants';

/**
 * CreateItem Page
 * Page for registering a new item in the catalog.
 */
const CreateItem = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState(DEFAULT_UNITS);
  const [initLoading, setInitLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, unitRes] = await Promise.all([
          categoryService.getAllActiveCategories(),
          itemService.getUnits().catch(() => ({ success: false })),
        ]);

        if (catRes?.success) {
          setCategories(catRes.data || []);
        }
        if (unitRes?.success && unitRes.data?.length > 0) {
          setUnits(unitRes.data);
        }
      } catch {
        // Handled by Axios interceptor
      } finally {
        setInitLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await itemService.createItem(formData);
      if (res?.success) {
        toast.success(`Item "${res.data.itemName}" created with code ${res.data.itemCode}`);
        navigate('/items');
      }
    } catch {
      // Axios error interceptor displays backend error message
    } finally {
      setSubmitting(false);
    }
  };

  if (initLoading) {
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

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <PageHeader
        title="Add New Item"
        description="Register a product with pricing, initial stock, and classification."
        breadcrumbs={[
          { label: 'Inventory' },
          { label: 'Items', onClick: () => navigate('/items') },
          { label: 'New Item', active: true },
        ]}
      />

      <ItemForm
        isEdit={false}
        categories={categories}
        units={units}
        loading={submitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/items')}
      />
    </Box>
  );
};

export default CreateItem;
