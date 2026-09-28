import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import PartyForm from '../../components/party/PartyForm';
import partyService from '../../services/partyService';

/**
 * PartyCreate Page
 * Register a new customer, supplier, or dual-trading party.
 */
const PartyCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || 'CUSTOMER';

  const [saving, setSaving] = useState(false);

  const initialType = ['CUSTOMER', 'SUPPLIER', 'BOTH'].includes(typeParam.toUpperCase())
    ? typeParam.toUpperCase()
    : 'CUSTOMER';

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      const res = await partyService.createParty(formData);
      if (res?.success) {
        toast.success(`Party "${formData.partyName}" created successfully!`);
        if (formData.partyType === 'CUSTOMER') {
          navigate('/customers');
        } else if (formData.partyType === 'SUPPLIER') {
          navigate('/suppliers');
        } else {
          navigate('/parties');
        }
      }
    } catch {
      // Errors handled by Axios interceptor
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (initialType === 'CUSTOMER') {
      navigate('/customers');
    } else if (initialType === 'SUPPLIER') {
      navigate('/suppliers');
    } else {
      navigate('/parties');
    }
  };

  const pageTitle =
    initialType === 'CUSTOMER'
      ? 'Add Customer'
      : initialType === 'SUPPLIER'
      ? 'Add Supplier'
      : 'Add Party';

  const pageDescription =
    initialType === 'CUSTOMER'
      ? 'Register a new customer account, credit limit, and address.'
      : initialType === 'SUPPLIER'
      ? 'Register a new supplier or vendor account.'
      : 'Create a new business contact profile.';

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <PageHeader title={pageTitle} description={pageDescription} />

      <PartyForm
        defaultPartyType={initialType}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={saving}
      />
    </Box>
  );
};

export default PartyCreate;
