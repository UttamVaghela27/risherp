import { Box, Card, CardContent, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Grid, Paper, Stack } from '@mui/material';

export const CardSkeleton = () => (
  <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 'none', border: 1, borderColor: 'divider' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Skeleton variant="text" width={100} height={20} />
          <Skeleton variant="text" width={150} height={40} sx={{ mt: 1 }} />
        </Box>
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="text" width={80} height={20} />
      </Box>
    </CardContent>
  </Card>
);

export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
  <Table>
    <TableHead>
      <TableRow>
        {Array.from({ length: columns }).map((_, i) => (
          <TableCell key={i}>
            <Skeleton variant="text" width={i === 0 ? 40 : 100} />
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r}>
          {Array.from({ length: columns }).map((_, c) => (
            <TableCell key={c}>
              <Skeleton variant="text" width={c === 0 ? 40 : '100%'} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export const FormSkeleton = () => (
  <Paper sx={{ p: 3, borderRadius: 2 }}>
    <Stack spacing={3}>
      <Box>
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="text" width={300} height={20} />
      </Box>
      <Grid container spacing={3}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Skeleton variant="text" width={120} height={20} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
      </Box>
    </Stack>
  </Paper>
);
