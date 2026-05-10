import React from "react";
import { Command, Instagram, Send, Mail } from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const Footer = () => {
  const footerLinks: FooterColumn[] = [
    {
      title: "Services",
      links: [
        {
          label: "Real-time Collaboration",
          href: "/services",
        },
        {
          label: "Whiteboarding",
          href: "/services",
        },
        {
          label: "Documentation",
          href: "/services",
        },
        {
          label: "Instant Sync",
          href: "/services",
        },
      ],
    },
    {
      title: "Company",
      links: [
        {
          label: "About",
          href: "/about",
        },
        {
          label: "Careers",
          href: "/careers",
        },
        {
          label: "History",
          href: "/history",
        },
        {
          label: "Projects",
          href: "/projects",
        },
      ],
    },
    {
      title: "Social",
      links: [
        {
          label: "Instagram",
          href: "https://www.instagram.com/rahulx.568",
          icon: <Instagram size={16} className="mr-2" />,
        },
        {
          label: "Telegram",
          href: "https://t.me/+916230271530",
          icon: <Send size={16} className="mr-2" />,
        },
      ],
    },
    {
      title: "Support",
      links: [
        {
          label: "Email Me",
          href: "mailto:rahulx.568@gmail.com",
          icon: <Mail size={16} className="mr-2" />,
        },
      ],
    },
  ];
  return (
    <footer className="bg-muted/40 border-t border-border/60">
      <div className="mx-auto max-w-screen-xl space-y-8 px-4 py-16 sm:px-6 lg:space-y-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <Command className="text-primary" size={60} />
            <p className="mt-4 max-w-xs text-muted-foreground">
              Documents & diagrams for engineering teams. Created with passion by Rahul.
            </p>
            <div className="flex gap-4 mt-6">
               <a href="https://www.instagram.com/rahulx.568" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram size={20} />
               </a>
               <a href="https://t.me/+916230271530" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Send size={20} />
               </a>
               <a href="mailto:rahulx.568@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                  <Mail size={20} />
               </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4">
            {footerLinks.map((column, index) => (
              <div key={index}>
                <p className="font-medium text-foreground">{column.title}</p>

                <ul className="mt-6 space-y-4 text-sm">
                  {column.links.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="text-muted-foreground transition hover:text-foreground flex items-center"
                      >
                        {link.icon}
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">© 2026 LiveCanvas, Inc. Built by Rahul.</p>
      </div>
    </footer>
  );
};

export default Footer;
