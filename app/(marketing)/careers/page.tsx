import React from 'react';

const CareersPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">
          Join our <span className="text-primary">Team</span>
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Help us shape the future of collaborative engineering.
        </p>
      </div>

      <div className="mt-16 text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
        <h2 className="text-2xl font-bold text-foreground mb-4">Currently we don&apos;t have any empty post</h2>
        <p className="text-muted-foreground">
          Thank you for your interest in LiveCanvas. Please check back later or follow us for updates.
        </p>
      </div>
    </div>
  );
};

export default CareersPage;
