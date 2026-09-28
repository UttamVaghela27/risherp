import React from 'react';
import ReportFilterDrawer from './ReportFilterDrawer';

/**
 * FilterDrawer
 * Unified wrapper pointing to the master ReportFilterDrawer.
 * Provides 100% backward compatibility for existing pages while enforcing
 * standardized dimensions (580px), colors, typography, and controls.
 */
const FilterDrawer = (props) => {
  return <ReportFilterDrawer {...props} />;
};

export default FilterDrawer;
