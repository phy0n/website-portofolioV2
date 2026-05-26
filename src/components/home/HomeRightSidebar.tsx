'use client';

import React from 'react';
import ProfileFactsCard from './ProfileFactsCard';
import SpokenLanguagesCard from './SpokenLanguagesCard';
import EducationCard from './EducationCard';
import LatestPostsCard from './LatestPostsCard';

export default function HomeRightSidebar() {
  return (
    <div className="space-y-12">
      <ProfileFactsCard className="hidden lg:block" />
      <SpokenLanguagesCard className="hidden lg:block" />
      <EducationCard className="hidden lg:block" />
      <LatestPostsCard />
    </div>
  );
}
