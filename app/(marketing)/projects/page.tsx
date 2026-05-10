import React from 'react';

const ProjectsPage = () => {
  const projects = [
    {
      name: "Canvas Engine v2",
      description: "A major rewrite of our core rendering engine for improved performance.",
      status: "In Progress",
      category: "Infrastructure",
      image: "https://lh3.googleusercontent.com/aida/ADBb0ujyoDl8amk2iOD9sgUpR7Xxd3GBmIFphIl3VJxhTiMEOyhGBA6GjWRfOtDTFoIooLjASXLiA5K7V7RDhXvo1hUa_Flscj5yc_9auZxZuSekYBW4Cf9lVPB4vueKERPRg20jE_TQWemlEew1rqbUQti5X7o6Tvur2x62FgaPzMpBdfYLs8ESZlJE121iVejRJjTCOphLsdh0q4fS3vZQG1qB4f2ylPdHHw2pJMrmsYgJSnsySK3RSzYnHQ"
    },
    {
      name: "Mobile App Beta",
      description: "Bringing the power of LiveCanvas to iOS and Android devices.",
      status: "Beta",
      category: "Mobile",
      image: "https://lh3.googleusercontent.com/aida/ADBb0uhqGARpaGm9xp5q64f76ILAXbsUPcz5XIoF2IsGhAXY_rd53rxqYfgu44KgZJbk1NViqxsTOfCk3He0XCBssD4JZZ8DdzJstJO6VK_6cXFn4kZFzJfAgP_CEIPpwHg1FlDgJLbX6Xhtx-RdUFDQj3r7aEq7ut5HQEEmMDelvbYU9hC1zeaminsUdKd0dz0gKvd0mpGuM20jQ3vjaOI0PlU19SfbxdamS4dKE9ucWiwsh2mrDN_458uJW-Y"
    },
    {
      name: "Plugin Marketplace",
      description: "Allowing developers to build and share their own LiveCanvas extensions.",
      status: "Planned",
      category: "Ecosystem",
      image: "https://lh3.googleusercontent.com/aida/ADBb0ujETRDnDtB3aacDFfXuEP_SYVmttof9w19KqCh4t3BtMfY5_hIxxl9VgJlwxtjeeVtwRAhkpBJMQ6VImrFYlggsJq3zhjavibmtSVSs7-n_cJbJbWjTIorvtM07YGudvf9OZydXGLS5QqUmqWENtXsa6DusexOrWIAk5sLvLJ70T7kCTTDf1LF7u_KdZREQLFZLFlpaKrf6pyNxehHVFvxJ_Af221H8Dtskx9ICJG97ugt7eJ2IykLj3gI"
    },
    {
      name: "Enterprise Admin Console",
      description: "Advanced management tools for large-scale engineering organizations.",
      status: "Released",
      category: "Enterprise",
      image: "https://lh3.googleusercontent.com/aida/ADBb0uj6N6JXJisiDz7HHBSjBjbjO-ly_SumxvOdHu1PE7Vir8HqBJotP2zZTdnQKH9amGIv7ly9k5KRgo-B2z8sDof4dY2EY5B_6VG6PUG7RtL97d4dTijX0Neuu-DwGSZ7wWOsZ2mxR4sRUu7AaOfkhbL6YD4QlNYo7F_Nc03_7XRn-1NfZOPgTHCxdB_1CzQwMt3AYERMY1n0PJmu2SAfCotpk0UDUtXf4F5HxHCiVCpS7dIdMAkiu62CvQ"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">
          Our <span className="text-primary">Projects</span>
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          A glimpse into what we&apos;re currently working on at LiveCanvas.
        </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <div key={index} className="bg-card rounded-xl overflow-hidden border border-border group">
            <div className="h-48 overflow-hidden bg-secondary">
              <img 
                src={project.image} 
                alt={project.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-foreground">{project.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  project.status === 'Released' ? 'bg-green-500/20 text-green-600' : 
                  project.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-600' :
                  project.status === 'Beta' ? 'bg-blue-500/20 text-blue-600' : 'bg-gray-500/20 text-gray-600'
                }`}>
                  {project.status}
                </span>
              </div>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
