import React from 'react';
import { useParams } from 'react-router-dom';
import { SiteBuilder } from '../../components/site-builder/SiteBuilder';

export const EditMiniSitePage: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();

  return (
    <div className="h-screen">
      <SiteBuilder siteId={siteId} />
    </div>
  );
};
