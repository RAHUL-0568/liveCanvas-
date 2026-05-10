import React from 'react';
import { Layers, PenTool, Users, Zap } from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time on any document or diagram.",
      icon: <Users className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Advanced Whiteboarding",
      description: "Powerful tools for sketching out complex architectures and flows.",
      icon: <PenTool className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Smart Documentation",
      description: "Rich text editing with support for code snippets, checklists, and more.",
      icon: <Layers className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Instant Sync",
      description: "Everything you do is instantly saved and synced across all devices.",
      icon: <Zap className="w-8 h-8 text-blue-500" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">
          Our <span className="text-primary">Services</span>
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Everything you need to streamline your engineering workflow.
        </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((service, index) => (
          <div key={index} className="bg-card p-8 rounded-xl border border-border hover:border-primary transition-colors">
            <div className="mb-4">{service.icon}</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{service.title}</h3>
            <p className="text-muted-foreground text-lg">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;
