import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Terminal,
  Cloud,
  Container,
  Network,
  Shield,
  Code2,
  Database,
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Award,
  Briefcase,
  GraduationCap,
  ChevronRight,
  ChevronUp,
  Server,
  Download,
  Menu,
  X,
  Send,
  CheckCircle,
  Cpu,
  Cog,
  Globe,
  Wrench,
  Play,
  Maximize2,
  Minimize2,
  Eye,
} from "lucide-react";

// --- Types ---
interface Project {
  title: string;
  description: string;
  tech: string[];
  achievements: string[];
  icon: React.ReactNode;
  demoUrl?: string;
  imageUrl?: string;
}

interface ExperienceResponsibility {
  summary: string;
  details?: React.ReactNode;
}

interface Experience {
  role: string;
  company: string;
  period: string;
  responsibilities: ExperienceResponsibility[];
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  validUntil?: string;
  credentialId?: string;
  verifyUrl?: string;
  badgeUrl?: string;
}

// --- Data ---
const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

const SKILLS = {
  "Cloud & DevOps": {
    icon: <Cloud className="w-5 h-5" />,
    items: ["AWS (EC2, ECS, ALB, VPC)", "Docker", "Kubernetes", "CI/CD Pipelines", "CodePipeline", "Fargate"],
  },
  "System Admin": {
    icon: <Server className="w-5 h-5" />,
    items: ["Linux (Ubuntu, CentOS, RHEL)", "Windows Server", "RAID Configuration", "NIC Bonding", "HP iLO", "VMware"],
  },
  "Networking": {
    icon: <Network className="w-5 h-5" />,
    items: ["DNS Configuration", "NFS", "Load Balancing", "Security Groups", "Subnet Architecture", "Sophos Firewall"],
  },
  "Scripting & Tools": {
    icon: <Code2 className="w-5 h-5" />,
    items: ["Bash Scripting", "Python", "Ansible", "Git", "Node.js", "Automation"],
  },
};

const PROJECTS: Project[] = [
  {
    title: "ISTQServer — IT Infrastructure Management",
    description:
      "Built a full-stack IT infrastructure management platform to monitor and manage 85+ servers across 4 datacenters, with real-time dashboards, network analysis, order tracking, and iLO integration.",
    tech: ["React", "Node.js", "MongoDB", "REST API", "Recharts", "iLO"],
    achievements: [
      "Real-time dashboard for 85+ servers across 4 datacenters",
      "Network/subnet analysis with switch port mapping",
      "Order management with priority tracking & Excel import",
      "Role-based access control & user management",
    ],
    icon: <Server className="w-6 h-6" />,
    demoUrl: "/demo/index.html",
  },
  {
    title: "AWS High Availability Infrastructure",
    description:
      "Designed and implemented a highly available, fault-tolerant cloud architecture on AWS with auto-scaling groups, load balancers, and multi-AZ deployments.",
    tech: ["EC2", "ASG", "ALB", "NLB", "VPC", "CloudWatch"],
    achievements: [
      "Multi-AZ deployment for 99.9% uptime",
      "Auto-scaling for dynamic traffic handling",
      "Secure VPC with subnet segmentation",
    ],
    icon: <Cloud className="w-6 h-6" />,
    imageUrl: "/AWS High Availability Infrastructure.png",
  },
  {
    title: "Node.js Microservices Migration",
    description:
      "Successfully migrated a monolithic Node.js application to a cloud-native microservices architecture with Docker containers deployed on Amazon ECS.",
    tech: ["Docker", "Amazon ECS", "Node.js", "CI/CD"],
    achievements: [
      "Dockerized application for portable deployment",
      "Independent service scaling and fault isolation",
      "Streamlined CI/CD with containerization",
    ],
    icon: <Container className="w-6 h-6" />,
    imageUrl: "/Node.js Microservices Migration.png",
  },
  {
    title: "Active Directory Enterprise Network",
    description:
      "Collaborated with a team to set up and manage a full enterprise network environment, including web servers, domain controllers, DNS, and security configurations.",
    tech: ["Active Directory", "DNS", "Windows Server", "RODIC"],
    achievements: [
      "Configured ITI.LOCAL and Alex.ITI.LOCAL domains",
      "Implemented DNS for web server resolution",
      "Managed user permissions across multiple PCs",
    ],
    icon: <Network className="w-6 h-6" />,
    imageUrl: "/Active Directory Enterprise Network.png",
  },
];

const EXPERIENCE: Experience[] = [
  {
    role: "Linux System Administrator",
    company: "ISTQServer",
    period: "Oct 2024 — Present",
    responsibilities: [
      {
        summary: "Maintain and install software across Linux-based environments, including Ubuntu and CentOS, ensuring server stability and performance",
        details: (
          <div className="space-y-4">
            <p className="text-zinc-300">You are responsible for managing Linux servers and making sure the required software is installed, updated, and running correctly.</p>
            <div>
              <strong className="text-white block mb-2">What you actually do:</strong>
              <div className="space-y-2 text-sm">
                <p>Install packages using: <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary">apt</code> on Ubuntu, <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary">yum</code> or <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary">dnf</code> on CentOS</p>
                <p>Update servers: <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary">sudo apt update && apt upgrade</code></p>
                <p>Install services like: Nginx, Docker, Monitoring tools</p>
                <p>Monitor: CPU usage, RAM usage, Disk space, Running services</p>
              </div>
            </div>
            <div>
              <strong className="text-white block mb-2">Why it matters:</strong>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Servers do not crash</li>
                <li>Applications run smoothly</li>
                <li>Security patches are applied regularly</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        summary: "Automate server installations and configurations using tools like Netplan and VMware for HP ProLiant Gen8 and Gen9 servers",
        details: (
          <div className="space-y-4">
            <p className="text-zinc-300">Instead of manually configuring every server, you automate setup processes.</p>
            <div>
              <strong className="text-white block mb-2">Network Configuration (Netplan)</strong>
              <pre className="bg-black/50 p-3 rounded-lg text-xs font-mono text-zinc-300 overflow-x-auto border border-white/5">
                {`network:
  version: 2
  ethernets:
    ens160:
      addresses:
        - 192.168.1.10/24
      gateway4: 192.168.1.1`}
              </pre>
              <p className="text-sm mt-2">Apply config: <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary">netplan apply</code></p>
            </div>
            <div>
              <strong className="text-white block mb-2">Virtualization & Hardware</strong>
              <p className="text-sm">Using VMware to create virtual machines, test environments, and deploy servers faster on HP ProLiant Gen8 and Gen9 servers.</p>
            </div>
            <div>
              <strong className="text-white block mb-2">Benefits:</strong>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Reduces manual errors</li>
                <li>Reduces setup time</li>
                <li>Prevents configuration inconsistencies</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        summary: "Manage server infrastructure through HP Integrated Lights-Out (iLO), enhancing server accessibility and monitoring",
        details: (
          <div className="space-y-4">
            <p className="text-zinc-300">You manage servers remotely even if the OS is down using HP iLO.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <strong className="text-white block mb-2">Remote server control:</strong>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Power ON / OFF servers</li>
                  <li>Restart servers</li>
                  <li>Open remote console</li>
                  <li>Mount ISO remotely</li>
                  <li>Install OS remotely</li>
                </ul>
              </div>
              <div>
                <strong className="text-white block mb-2">Hardware monitoring:</strong>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>CPU temperature</li>
                  <li>Fan speed</li>
                  <li>Power supply status</li>
                  <li>Disk health</li>
                </ul>
              </div>
            </div>
          </div>
        )
      },
      {
        summary: "Conduct troubleshooting and diagnostics to identify and resolve system issues efficiently",
        details: (
          <div className="space-y-4">
            <p className="text-zinc-300">When something breaks, you find the problem and fix it quickly.</p>
            <div className="space-y-3">
              <div>
                <strong className="text-white block mb-1">Server not reachable:</strong>
                <p className="text-sm">Check: <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary mr-1">ping</code> <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary mr-1">ip a</code> <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary">ip route</code></p>
              </div>
              <div>
                <strong className="text-white block mb-1">Service not running:</strong>
                <p className="text-sm code mb-1">Example:</p>
                <div className="font-mono text-xs bg-black/50 p-2 rounded border border-white/5 space-y-1 text-zinc-300">
                  <div>systemctl status nginx</div>
                  <div>systemctl restart nginx</div>
                </div>
              </div>
              <div>
                <strong className="text-white block mb-1">Disk full:</strong>
                <p className="text-sm">Check: <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary mr-1">df -h</code> <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary">du -sh *</code></p>
              </div>
              <div>
                <strong className="text-white block mb-1">System logs:</strong>
                <p className="text-sm">Analyze logs: <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary mr-1">journalctl -xe</code> <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary">cat /var/log/syslog</code></p>
              </div>
            </div>
            <p className="text-sm text-zinc-400 mt-2 italic">Fast troubleshooting reduces downtime, service interruptions, and business impact.</p>
          </div>
        )
      },
      {
        summary: "Implement RAID configurations and NIC bonding to optimize server performance and data redundancy",
        details: (
          <div className="space-y-4">
            <p className="text-sm text-brand-primary font-mono uppercase tracking-wider">Data center level system administration</p>

            <div>
              <strong className="text-white block mb-2">RAID Configuration (mdadm)</strong>
              <p className="text-sm mb-2">Redundant Array of Independent Disks — Protects data & improves performance.</p>
              <div className="overflow-hidden rounded-lg border border-white/10">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 text-xs uppercase font-mono text-zinc-300">
                    <tr><th className="px-4 py-2">RAID</th><th className="px-4 py-2">Purpose</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-black/20 text-zinc-400">
                    <tr><td className="px-4 py-2 font-mono text-white">RAID0</td><td className="px-4 py-2">Speed</td></tr>
                    <tr><td className="px-4 py-2 font-mono text-white">RAID1</td><td className="px-4 py-2">Mirroring</td></tr>
                    <tr><td className="px-4 py-2 font-mono text-white">RAID5</td><td className="px-4 py-2">Balance</td></tr>
                    <tr><td className="px-4 py-2 font-mono text-white">RAID10</td><td className="px-4 py-2">Speed + redundancy</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <strong className="text-white block mb-2">NIC Bonding</strong>
              <p className="text-sm mb-2">Combining multiple network cards into one logical interface (e.g., <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary">bond0</code>).</p>
              <p className="text-xs text-zinc-400 font-mono mb-2">Example: 2 × 1Gbps NIC → bonded → 2Gbps logical interface.</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-300">
                <li>Higher network speed</li>
                <li>Network redundancy</li>
                <li>Failover protection</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        summary: "Ensure compliance with organizational policies by proactively maintaining secure and robust systems",
        details: (
          <div className="space-y-4">
            <p className="text-zinc-300">You maintain servers according to security and operational standards.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                <strong className="text-white block">Security tasks:</strong>
                <div>User management: <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary text-xs">useradd</code> <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary text-xs">passwd</code></div>
                <div>Permissions: <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary text-xs">chmod</code> <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary text-xs">chown</code></div>
                <div>Firewall: <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary text-xs">ufw</code> <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary text-xs">iptables</code></div>
                <div>Updates: <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary text-xs">apt upgrade</code></div>
              </div>
              <div className="space-y-2 text-sm">
                <strong className="text-white block">Access control:</strong>
                <ul className="list-disc pl-5 space-y-1">
                  <li>SSH key authentication</li>
                  <li>Disabling root login</li>
                  <li>Restricted sudo access</li>
                </ul>
              </div>
            </div>
          </div>
        )
      },
    ],
  },
  {
    role: "IT Specialist",
    company: "TICO for Touristic Investments",
    period: "May 2024 — Oct 2024",
    responsibilities: [
      {
        summary: "Provided technical support for restaurants utilizing a restaurant management system, ensuring seamless operations",
        details: (
          <div className="space-y-4">
            <p className="text-zinc-300">You supported restaurants that depend on a restaurant management / POS system to run their daily operations.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <strong className="text-white block mb-2">Systems handled:</strong>
                <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-300">
                  <li>Orders</li>
                  <li>Billing</li>
                  <li>Kitchen tickets</li>
                  <li>Inventory & Reports</li>
                  <li>Payment systems</li>
                </ul>
              </div>
              <div>
                <strong className="text-white block mb-2">Typical tasks:</strong>
                <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-300">
                  <li>Fix POS terminals</li>
                  <li>Connect printers</li>
                  <li>Fix order synchronization</li>
                  <li>Restore system when it stops</li>
                  <li>Support branches remotely</li>
                </ul>
              </div>
            </div>
            <div>
              <strong className="text-white block mb-2">Example real scenario:</strong>
              <p className="text-sm mb-1 italic">"A restaurant cannot print orders in the kitchen."</p>
              <p className="text-sm">You would check: POS system status, Printer connection, Network connectivity, Application configuration.</p>
              <p className="text-sm text-brand-primary mt-1 font-mono">Goal: restore service quickly so restaurant operations continue.</p>
            </div>
          </div>
        )
      },
      {
        summary: "Diagnosed and resolved hardware, software, and network issues, improving system reliability and performance",
        details: (
          <div className="space-y-4">
            <p className="text-zinc-300">Worked on multiple layers of IT troubleshooting.</p>
            <div className="space-y-4">
              <div>
                <strong className="text-white block mb-1">Hardware issues</strong>
                <p className="text-sm text-zinc-400 mb-1">Examples: POS terminal not powering on, Printer not working, Network switch failure, Hard disk failure.</p>
                <p className="text-sm">Actions: Replace hardware, Reconnect cables, Check power supplies.</p>
              </div>
              <div>
                <strong className="text-white block mb-1">Software issues</strong>
                <p className="text-sm text-zinc-400 mb-1">Examples: POS application crashes, Database errors, Windows service stopped.</p>
                <p className="text-sm">Troubleshooting: <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary mr-1">services.msc</code> <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary mr-1">eventvwr</code> <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary">task manager</code></p>
              </div>
              <div>
                <strong className="text-white block mb-1">Network issues</strong>
                <p className="text-sm text-zinc-400 mb-1">Examples: POS terminals cannot reach server, Branch cannot connect to main server.</p>
                <p className="text-sm">Check: <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary mr-1">ping</code> <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary mr-1">ipconfig</code> <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-primary">tracert</code></p>
              </div>
            </div>
            <p className="text-sm text-zinc-400 mt-2 italic">This improves uptime, application performance, and network reliability.</p>
          </div>
        )
      },
      {
        summary: "Collaborated with vendors and team members to implement system upgrades and troubleshoot application-related problems",
        details: (
          <div className="space-y-4">
            <p className="text-zinc-300">Worked with external vendors (software providers) and internal IT teams.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <strong className="text-white block mb-2">Example upgrade scenario:</strong>
                <p className="text-sm text-zinc-400 mb-1 italic">"A vendor releases a new POS system update."</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-300">
                  <li>Scheduling update time</li>
                  <li>Installing update on server</li>
                  <li>Testing POS terminals</li>
                  <li>Checking database compatibility</li>
                  <li>Monitoring system after deployment</li>
                </ul>
              </div>
              <div>
                <strong className="text-white block mb-2">Example troubleshooting scenario:</strong>
                <p className="text-sm text-zinc-400 mb-1 italic">"If a bug appears in the POS system."</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-300">
                  <li>Collect logs</li>
                  <li>Reproduce the issue</li>
                  <li>Send data to the vendor</li>
                  <li>Apply patches</li>
                </ul>
              </div>
            </div>
          </div>
        )
      },
      {
        summary: "Configured and maintained Windows Server environments and managed connectivity through Sophos firewalls and VNC tools",
        details: (
          <div className="space-y-4">
            <p className="text-sm text-brand-primary font-mono uppercase tracking-wider">Infrastructure administration</p>

            <div className="space-y-4">
              <div>
                <strong className="text-white block mb-2">Windows Server Administration</strong>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-zinc-300 block mb-1">User Management (AD)</span>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-400">
                      <li>Create users & reset passwords</li>
                      <li>Manage permissions</li>
                    </ul>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-zinc-300 block mb-1">File Sharing & Services</span>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-400">
                      <li>Shared folders & network drives</li>
                      <li>Monitor DB & print services</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <strong className="text-white block mb-2">Firewall Management (Sophos)</strong>
                <p className="text-sm mb-2 text-zinc-300">Purpose: connect restaurant branches securely, protect network, manage VPNs.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-400">
                    <li>Configure firewall rules</li>
                    <li>Allow application ports</li>
                    <li>Monitor traffic</li>
                  </ul>
                  <p className="text-sm text-brand-primary/80 font-mono bg-black/20 p-2 rounded border border-white/5">
                    Example: Branch → Main server via VPN tunnel on Sophos
                  </p>
                </div>
              </div>

              <div>
                <strong className="text-white block mb-1">Remote Access (VNC)</strong>
                <p className="text-sm text-zinc-300">Purpose: Remote control computers in restaurants to troubleshoot POS, install updates, and restart services without physical presence.</p>
              </div>
            </div>
          </div>
        )
      },
    ],
  },
];

const CERTIFICATIONS: Certification[] = [
  {
    name: "Red Hat Certified System Administrator (RHCSA)",
    issuer: "Red Hat",
    date: "September 2024",
    validUntil: "September 2027",
    credentialId: "240-175-729",
    verifyUrl: "https://rhtapps.redhat.com/verify?certId=240-175-729",
    badgeUrl: "https://images.credly.com/images/572de0ba-2c59-4816-a59d-b0e1687e45ee/image.png",
  },
  {
    name: "AWS Academy Cloud Architecting",
    issuer: "Amazon Web Services",
    date: "September 2024",
    badgeUrl: "https://images.credly.com/images/fcafd0c9-42da-4703-a191-0c397203dc1b/blob",
  },
  {
    name: "AWS Academy Cloud Foundations",
    issuer: "Amazon Web Services",
    date: "August 2024",
    badgeUrl: "https://images.credly.com/images/e3541a0c-dd4a-4820-8052-5001006efc85/blob",
  },
  {
    name: "Cloud and Virtualization Concepts",
    issuer: "Broadcom (VMware IT Academy)",
    date: "July 2024",
    badgeUrl: "https://images.credly.com/images/8ca28f8d-5ac0-49d7-b783-608cd4a61072/image.png",
  },
  {
    name: "CCNA: Introduction to Networks",
    issuer: "Cisco",
    date: "June 2024",
    badgeUrl: "https://images.credly.com/images/70d71df5-f3dc-4380-9b9d-f22513a70417/CCNAITN__1_.png",
  },
  {
    name: "Networking Basics",
    issuer: "Cisco",
    date: "January 2024",
    badgeUrl: "https://images.credly.com/images/5bdd6a39-3e03-4444-9510-ecff80c9ce79/image.png",
  },
  {
    name: "Introduction to Cybersecurity",
    issuer: "Cisco",
    date: "December 2023",
    badgeUrl: "https://images.credly.com/images/af8c6b4e-fc31-47c4-8dcb-eb7a2065dc5b/I2CS__1_.png",
  },
  {
    name: "Jr Penetration Tester",
    issuer: "TryHackMe",
    date: "February 2024",
    verifyUrl: "https://tryhackme.com/p/0x3l3ri4n?tab=certificates",
    badgeUrl: "https://assets.tryhackme.com/img/paths/jr-penetration-tester.svg",
  },
];

const STATS = [
  { value: "2+", label: "Years Experience" },
  { value: "4+", label: "Major Projects" },
  { value: "8", label: "Certifications" },
  { value: "10+", label: "Technologies" },
];

// --- Components ---

const Section = ({
  id,
  label,
  title,
  children,
  className = "",
}: {
  id: string;
  label: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section id={id} className={`py-24 border-b border-brand-border relative overflow-hidden ${className}`}>
    <div className="container mx-auto px-6 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="section-label">{label}</div>
        <h2 className="text-3xl md:text-5xl mb-14">{title}</h2>
      </motion.div>
      {children}
    </div>
  </section>
);

const MobileMenu = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-72 bg-brand-surface border-l border-brand-border z-50 p-8"
        >
          <button onClick={onClose} className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <nav className="mt-16 flex flex-col gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="font-mono text-sm uppercase tracking-widest text-zinc-400 hover:text-brand-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/Ahmed-Elerian-CV.pdf"
              download
              className="mt-4 bg-brand-primary text-black px-4 py-3 rounded-lg font-mono text-xs font-bold text-center hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> DOWNLOAD CV
            </a>
          </nav>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", toggle);
    return () => window.removeEventListener("scroll", toggle);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 w-12 h-12 bg-brand-surface border border-brand-border rounded-xl flex items-center justify-center hover:border-brand-primary hover:text-brand-primary transition-all z-40 shadow-lg"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const ContactForm = () => {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoLink = `mailto:ahmedelerian1@gmail.com?subject=${encodeURIComponent(
      formData.subject || "Portfolio Inquiry"
    )}&body=${encodeURIComponent(
      `Hi Ahmed,\n\nMy name is ${formData.name}.\n\n${formData.message}\n\nBest regards,\n${formData.name}\n${formData.email}`
    )}`;
    window.open(mailtoLink, "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <form className="glass-card p-8 space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider">Name</label>
          <input
            type="text"
            required
            className="input-field"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider">Email</label>
          <input
            type="email"
            required
            className="input-field"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider">Subject</label>
        <input
          type="text"
          className="input-field"
          placeholder="Project Inquiry"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider">Message</label>
        <textarea
          rows={4}
          required
          className="input-field resize-none"
          placeholder="Tell me about your project..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-brand-primary text-black font-mono font-bold py-4 rounded-lg hover:bg-white transition-all duration-300 uppercase text-xs tracking-widest flex items-center justify-center gap-2 group"
      >
        {sent ? (
          <>
            <CheckCircle className="w-4 h-4" /> MESSAGE SENT
          </>
        ) : (
          <>
            SEND MESSAGE <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
};

// --- Main App ---
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [demoModal, setDemoModal] = useState<{ open: boolean; url: string; title: string }>({ open: false, url: "", title: "" });
  const [imageModal, setImageModal] = useState<{ open: boolean; url: string; title: string }>({ open: false, url: "", title: "" });
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen tech-grid">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-brand-bg/90 backdrop-blur-xl border-b border-brand-border shadow-lg shadow-black/20" : "bg-transparent"
          }`}
      >
        <div className="container mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <a href="#" className="font-mono font-bold text-white tracking-tighter flex items-center gap-2 group">
            <Terminal className="w-5 h-5 text-brand-primary group-hover:rotate-12 transition-transform" />
            <span>ELERIAN<span className="text-brand-primary">.DEV</span></span>
          </a>
          <div className="hidden md:flex gap-8 font-mono text-[11px] uppercase tracking-widest">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="nav-link text-zinc-400">
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/Ahmed-Elerian-CV.pdf"
              download
              className="hidden sm:flex bg-brand-primary text-black px-4 py-2 rounded-lg font-mono text-[11px] font-bold hover:bg-white transition-all duration-300 items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" /> CV
            </a>
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden text-zinc-400 hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Hero Section */}
      <header className="pt-32 pb-24 border-b border-brand-border relative hero-gradient">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-block border border-brand-primary/30 bg-brand-primary/5 px-4 py-1.5 rounded-full mb-8">
              <span className="text-brand-primary font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                </span>
                Available for new opportunities
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl mb-8 leading-[0.9]">
              Ahmed <br />
              <span className="gradient-text">Elerian</span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl font-mono leading-relaxed mb-12">
              DevOps Engineer & System Administrator specializing in scalable infrastructure, cloud automation, and
              high-availability systems.
            </p>

            <div className="flex flex-wrap gap-4 mb-16">
              <a
                href="#contact"
                className="bg-brand-primary text-black px-6 py-3 rounded-lg font-mono text-xs font-bold hover:bg-white transition-all duration-300 flex items-center gap-2 group"
              >
                GET IN TOUCH <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/Ahmed-Elerian-CV.pdf"
                download
                className="border border-brand-border px-6 py-3 rounded-lg font-mono text-xs font-bold text-zinc-300 hover:border-brand-primary hover:text-brand-primary transition-all duration-300 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> DOWNLOAD CV
              </a>
            </div>

            <div className="flex flex-wrap gap-8">
              {[
                { icon: <MapPin className="w-4 h-4" />, text: "Cairo, Egypt" },
                { icon: <Award className="w-4 h-4" />, text: "RHCSA Certified" },
                { icon: <Cloud className="w-4 h-4" />, text: "AWS Cloud Architecting" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2 text-zinc-500 font-mono text-sm"
                >
                  <span className="text-brand-primary">{item.icon}</span>
                  {item.text}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative floating elements */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none hidden lg:block">
          <Terminal className="w-[400px] h-[400px] floating" />
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-brand-border bg-brand-surface/30">
        <div className="container mx-auto px-6 lg:px-12 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-mono font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <Section id="about" label="01 — Profile" title="Professional Summary">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          <div className="space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-lg text-zinc-400 leading-relaxed"
            >
              I am a DevOps Engineer and System Administrator with hands-on experience in Linux systems, cloud
              infrastructure, containerization, and automation. I specialize in building and maintaining scalable, secure
              infrastructure.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-zinc-400 leading-relaxed"
            >
              My background includes managing Linux servers in data center environments, automating deployments with CI/CD
              pipelines, working with AWS cloud services, and containerizing applications with Docker and Kubernetes.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-zinc-400 leading-relaxed"
            >
              I have the skills and knowledge to contribute effectively to IT operations and DevOps environments,
              bringing a strong commitment to reliability, security, and continuous improvement.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 space-y-8"
          >
            <div>
              <h3 className="text-xl mb-5 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-brand-primary" />
                Education
              </h3>
              <div className="border-l-2 border-brand-border pl-5 space-y-5">
                <div>
                  <div className="text-white font-semibold">Bachelor's in Computer Science</div>
                  <div className="text-sm text-zinc-500 mt-0.5">Misr University for Science and Technology</div>
                </div>
                <div>
                  <div className="text-white font-semibold">System Admin & DevOps Track</div>
                  <div className="text-sm text-zinc-500 mt-0.5">Information Technology Institute (ITI)</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Certifications & Badges Section */}
      <Section id="certifications" label="02 — Credentials" title="Certifications & Badges">
        <div className="flex items-center justify-end mb-8 -mt-4">
          <a
            href="https://www.credly.com/users/ahmed-elerian.48c4709e"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-zinc-500 hover:text-brand-primary transition-colors flex items-center gap-1.5 border border-brand-border px-4 py-2 rounded-lg hover:border-brand-primary/30"
          >
            View Credly Profile <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CERTIFICATIONS.map((cert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 flex flex-col items-center text-center group hover:border-brand-primary/30 transition-all"
            >
              {cert.badgeUrl && (
                <img
                  src={cert.badgeUrl}
                  alt={cert.name}
                  className="w-20 h-20 object-contain mb-4 group-hover:scale-110 transition-transform duration-300"
                />
              )}
              <div className="text-white font-mono text-xs font-medium mb-1">{cert.name}</div>
              <div className="text-[10px] text-zinc-500 mb-1">{cert.issuer}</div>
              <div className="text-[10px] text-zinc-600 font-mono">{cert.date}</div>
              {cert.credentialId && (
                <div className="text-[9px] text-zinc-600 font-mono mt-1">ID: {cert.credentialId}</div>
              )}
              {cert.validUntil && (
                <div className="text-[9px] text-brand-primary/60 font-mono mt-1">Valid until {cert.validUntil}</div>
              )}
              {cert.verifyUrl && (
                <a
                  href={cert.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-[9px] font-mono text-brand-primary border border-brand-primary/30 px-3 py-1 rounded-full hover:bg-brand-primary/10 transition-colors flex items-center gap-1"
                >
                  VERIFY <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Skills Section */}
      <Section id="skills" label="03 — Expertise" title="Technical Skills">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(SKILLS).map(([category, { icon, items }], idx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 group"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  {icon}
                </div>
                <h3 className="text-brand-primary font-mono text-sm !normal-case !tracking-normal">{category}</h3>
              </div>
              <ul className="space-y-3">
                {items.map((skill) => (
                  <li key={skill} className="text-zinc-400 text-sm flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 bg-brand-primary/40 rounded-full flex-shrink-0" />
                    {skill}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Projects Section */}
      <Section id="projects" label="04 — Portfolio" title="Key Projects">
        <div className="grid md:grid-cols-2 gap-8">
          {PROJECTS.map((project, idx) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card overflow-hidden flex flex-col group"
            >
              <div className="p-8 flex-1">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-5 group-hover:bg-brand-primary/20 transition-colors">
                  {project.icon}
                </div>
                <h3 className="text-lg mb-3 !tracking-normal">{project.title}</h3>
                <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{project.description}</p>

                <div className="space-y-5">
                  <div>
                    <div className="text-[10px] uppercase text-zinc-600 mb-3 font-mono tracking-wider">
                      Key Achievements
                    </div>
                    <ul className="space-y-2">
                      {project.achievements.map((a, i) => (
                        <li key={i} className="text-xs text-zinc-400 flex gap-2 leading-relaxed">
                          <ChevronRight className="w-3 h-3 text-brand-primary mt-0.5 flex-shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t) => (
                      <span key={t} className="skill-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {project.demoUrl && (
                <div className="p-4 border-t border-brand-border bg-black/20 flex items-center justify-between">
                  <button
                    onClick={() => setDemoModal({ open: true, url: project.demoUrl!, title: project.title })}
                    className="flex items-center gap-2 text-xs font-mono text-brand-primary hover:text-white transition-colors group/btn"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center group-hover/btn:bg-brand-primary/20 transition-colors">
                      <Play className="w-4 h-4 fill-brand-primary" />
                    </div>
                    INTERACTIVE PREVIEW
                  </button>
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 hover:text-brand-primary transition-colors border border-brand-border px-3 py-1.5 rounded-lg hover:border-brand-primary/30"
                  >
                    OPEN FULL DEMO <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {project.imageUrl && (
                <div className="p-4 border-t border-brand-border bg-black/20">
                  <button
                    onClick={() => setImageModal({ open: true, url: project.imageUrl!, title: project.title })}
                    className="flex items-center gap-2 text-xs font-mono text-brand-primary hover:text-white transition-colors group/btn"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center group-hover/btn:bg-brand-primary/20 transition-colors">
                      <Eye className="w-4 h-4" />
                    </div>
                    VIEW INFOGRAPHIC
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Demo Modal */}
      <AnimatePresence>
        {demoModal.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60]"
              onClick={() => setDemoModal({ open: false, url: "", title: "" })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-4 md:inset-8 z-[60] flex flex-col bg-brand-surface rounded-2xl border border-brand-border overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-3 border-b border-brand-border bg-black/40">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="font-mono text-xs text-zinc-400">{demoModal.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={demoModal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-brand-primary transition-colors p-1"
                    title="Open in new tab"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setDemoModal({ open: false, url: "", title: "" })}
                    className="text-zinc-500 hover:text-white transition-colors p-1"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-white">
                <iframe
                  src={demoModal.url}
                  title={demoModal.title}
                  className="w-full h-full border-0"
                  allow="fullscreen"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {imageModal.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[60]"
              onClick={() => setImageModal({ open: false, url: "", title: "" })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-4 md:inset-12 z-[60] flex flex-col items-center justify-center"
              onClick={() => setImageModal({ open: false, url: "", title: "" })}
            >
              <div className="flex items-center justify-between w-full max-w-4xl mb-4 px-2">
                <span className="font-mono text-sm text-zinc-400">{imageModal.title}</span>
                <button
                  onClick={() => setImageModal({ open: false, url: "", title: "" })}
                  className="text-zinc-500 hover:text-white transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <img
                src={imageModal.url}
                alt={imageModal.title}
                className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl border border-white/10 object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Experience Section */}
      <Section id="experience" label="05 — History" title="Professional Experience">
        <div className="max-w-4xl space-y-16">
          {EXPERIENCE.map((exp, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="relative pl-8 border-l-2 border-brand-border hover:border-brand-primary/40 transition-colors"
            >
              <div className="absolute -left-[7px] top-0 w-3 h-3 bg-brand-primary rounded-full pulse-glow" />
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-3">
                <div>
                  <h3 className="text-2xl text-white !tracking-normal">{exp.role}</h3>
                  <div className="text-brand-primary font-mono text-sm mt-1">{exp.company}</div>
                </div>
                <div className="text-zinc-500 font-mono text-xs bg-brand-surface px-4 py-2 rounded-lg border border-brand-border whitespace-nowrap">
                  {exp.period}
                </div>
              </div>
              <ul className="space-y-3">
                {exp.responsibilities.map((resp, i) => {
                  const accordionId = `exp-${idx}-resp-${i}`;
                  const isOpen = activeAccordion === accordionId;
                  const hasDetails = !!resp.details;

                  return (
                    <li key={i} className="text-sm leading-relaxed">
                      <div
                        className={`flex gap-3 px-4 py-3 rounded-lg border transition-all ${hasDetails ? "cursor-pointer hover:bg-white/5" : ""
                          } ${isOpen ? "bg-white/5 border-brand-primary/30" : "border-transparent"}`}
                        onClick={() => hasDetails && setActiveAccordion(isOpen ? null : accordionId)}
                      >
                        <span className="text-brand-primary mt-0.5 flex-shrink-0 transition-transform duration-300">
                          {hasDetails ? (
                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 mt-0.5" />
                          )}
                        </span>
                        <div className="flex-1 text-zinc-300 leading-relaxed font-medium">
                          {resp.summary}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isOpen && hasDetails && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="pl-12 pr-4 py-4 mt-1 bg-black/20 rounded-lg border border-white/5">
                              {resp.details}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Contact Section */}
      <Section id="contact" label="05 — Connect" title="Get In Touch">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xl text-zinc-400 mb-10 leading-relaxed">
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
              Let's build something great together.
            </p>
            <div className="space-y-5">
              <a href="mailto:ahmedelerian1@gmail.com" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center group-hover:border-brand-primary group-hover:bg-brand-primary/5 transition-all">
                  <Mail className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <div className="text-[10px] uppercase text-zinc-600 font-mono tracking-wider">Email</div>
                  <div className="text-white group-hover:text-brand-primary transition-colors">
                    ahmedelerian1@gmail.com
                  </div>
                </div>
              </a>
              <a href="tel:+201093029138" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center group-hover:border-brand-primary group-hover:bg-brand-primary/5 transition-all">
                  <Phone className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <div className="text-[10px] uppercase text-zinc-600 font-mono tracking-wider">Phone</div>
                  <div className="text-white group-hover:text-brand-primary transition-colors">+20 1093029138</div>
                </div>
              </a>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <div className="text-[10px] uppercase text-zinc-600 font-mono tracking-wider">Location</div>
                  <div className="text-white">Cairo, Egypt</div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-3">
              <a
                href="https://github.com/Ahmedelerian12"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-zinc-400 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/ahmed-elerian-110372364/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-zinc-400 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:ahmedelerian1@gmail.com"
                className="w-11 h-11 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-zinc-400 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="https://tryhackme.com/p/0x3l3ri4n"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-zinc-400 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all"
                aria-label="TryHackMe"
              >
                <Shield className="w-5 h-5" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="py-12 border-t border-brand-border bg-black/40">
        <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
            © {new Date().getFullYear()} Ahmed Abdelmonem Elerian. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a
              href="https://github.com/Ahmedelerian12"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-brand-primary transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/ahmed-elerian-110372364/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-brand-primary transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="mailto:ahmedelerian1@gmail.com"
              className="text-zinc-600 hover:text-brand-primary transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
            <a
              href="https://tryhackme.com/p/0x3l3ri4n"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-brand-primary transition-colors"
              aria-label="TryHackMe"
            >
              <Shield className="w-4 h-4" />
            </a>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-600">
            <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
            SYSTEM ONLINE
          </div>
        </div>
      </footer>

      <ScrollToTop />
    </div>
  );
}
