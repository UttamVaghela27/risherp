import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent } from '@mui/material';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import PartyForm from '../../components/party/PartyForm';
import { FormSkeleton } from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import partyService from '../../services/partyService';

/**
 * PartyEdit Page
 * Modify an existing business party profile.
 */
const PartyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParty = async () => {
      setLoading(true);
      try {
        const res = await partyService.getPartyById(id);
        if (res?.success) {
          setParty(res.data);
        } else {
          setError('Party not found.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load party details.');
      } finally {
        setLoading(false);
      }
    };

    fetchParty();
  }, [id]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      const res = await partyService.updateParty(id, formData);
      if (res?.success) {
        toast.success(`Party "${formData.partyName}" updated successfully!`);
        navigate(`/parties/${id}`);
      }
    } catch {
      // Axios interceptor handles toast notifications
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/parties/${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        <PageHeader title="Edit Party Profile" description="Loading party records..." />
        <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <FormSkeleton fields={6} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error || !party) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <ErrorState
          title="Party Not Found"
          message={error || 'The requested party record does not exist or has been removed.'}
          onRetry={() => navigate('/parties')}
          retryLabel="Back to Parties"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <PageHeader
        title={`Edit Party: ${party.partyName}`}
        description={`Modify party code ${party.partyCode}, contact details, and financial parameters.`}
      />

      <PartyForm
        initialValues={party}
        isEdit={true}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={saving}
      />
    </Box>
  );
};

export default PartyEdit;
