import React from 'react';

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          About <span className="text-primary">LiveCanvas</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground">
          We are dedicated to building the best collaborative tools for engineering teams.
        </p>
        </div>

        <div className="mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              LiveCanvas was born out of the frustration of switching between multiple tools to document and visualize complex systems. Our mission is to provide a unified workspace where teams can brainstorm, design, and document their ideas in real-time.
            </p>
          </div>
          <div className="h-64 rounded-xl overflow-hidden border border-border">
             <img 
               src="https://lh3.googleusercontent.com/aida/ADBb0ujO-PLBpTxQ3m_ziG1_Ry511mtpZgWY3zS9cGYAmLFV8lNOMX00uxBjTiALeFNEDLAgAgp9s3T3FtGsgm_Ie88wY4fJI-XacfzpuG7YbMuhP_zERB2rFUAsLMPJdOC9yds89y2ri6-nJEC0eY-oOhGRIH8eht0Cg9bOc_dFJnO1DxJEl-DoXr9OHvtoFjQU1da2YprDI75SzYBybjE989RRN5RODnzEo0Z-ak4Rjl1g3dsTaZ37_Do4Fg" 
               alt="LiveCanvas Mission Illustration" 
               className="w-full h-full object-cover"
             />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
