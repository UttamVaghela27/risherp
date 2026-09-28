import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent } from '@mui/material';
import toast from 'react-hot-toast';

import PartyDetails from '../../components/party/PartyDetails';
import PartyDialog from '../../components/party/PartyDialog';
import { FormSkeleton } from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import partyService from '../../services/partyService';

/**
 * PartyView Page
 * Profile view presenting complete contact, address, financial info, and future module tabs.
 */
const PartyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchParty = useCallback(async () => {
    setLoading(true);
    try {
      const res = await partyService.getPartyById(id);
      if (res?.success) {
        setParty(res.data);
      } else {
        setError('Party not found.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load party profile.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchParty();
  }, [fetchParty]);

  const handleToggleStatus = async (partyToToggle) => {
    setStatusUpdating(true);
    const newStatus = partyToToggle.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await partyService.updatePartyStatus(partyToToggle.id, newStatus);
      if (res?.success) {
        toast.success(`Party marked as ${newStatus}`);
        setParty(res.data);
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
    navigate('/parties');
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

  if (error || !party) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <ErrorState
          title="Party Not Found"
          message={error || 'The requested party record could not be found.'}
          onRetry={() => navigate('/parties')}
          retryLabel="Back to Parties"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <PartyDetails
        party={party}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onBack={handleBack}
        statusUpdating={statusUpdating}
      />

      <PartyDialog
        open={editDialogOpen}
        party={party}
        defaultPartyType={party?.partyType || 'CUSTOMER'}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={(updatedParty) => {
          setParty(updatedParty);
          fetchParty();
        }}
      />
    </Box>
  );
};

export default PartyView;
