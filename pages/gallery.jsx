import React from 'react';
import SeoMeta from '../src/components/SeoMeta';

const GalleryPage = () => {
  return (
    <>
      <SeoMeta
        title="Gallery"
        description="See happy moments from dog walks, check-ins, stays, and adventures."
      />
      <main className="section">
        <div className="container">
          <h1 className="heading_h2">Gallery</h1>
          <p className="paragraph_large text-color_secondary">
            The live gallery has been retired during the platform cleanup.
          </p>
        </div>
      </main>
    </>
  );
};

export default GalleryPage;
