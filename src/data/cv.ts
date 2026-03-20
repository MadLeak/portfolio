export const cv = {
    name: "Adhonys Diaz",
    brand: "MadLeak.com",
    role: "Backend & Systems Engineer",
    tagline: "I build solutions I use in my daily life.",
    location: "Santo Domingo, DR",
    github: "https://github.com/madleak",
    linkedin: "https://linkedin.com/in/adhonysdiaz",
    email: "adhonysdiaz@madleak.com",

    about: `Backend engineer with 3.5 years of experience designing type-safe APIs,
automation pipelines, and data-driven systems. Currently pursuing a Master's
in Data Science at INTEC. I don't just build software — I apply it to real
problems: from optimizing insulin dosing with regression models to running a
self-hosted homelab as a product. My stack is precise, my systems are intentional.`,

    skills: [
        { name: "TypeScript", category: "lang" },
        { name: "Python", category: "lang" },
        { name: "FastAPI", category: "backend" },
        { name: "PostgreSQL", category: "backend" },
        { name: "Prisma ORM", category: "backend" },
        { name: "tRPC", category: "backend" },
        { name: "React", category: "backend" },
        { name: "Docker", category: "infra" },
        { name: "Proxmox", category: "infra" },
        { name: "Nginx", category: "infra" },
        { name: "n8n", category: "automation" },
        { name: "SnapLogic", category: "automation" },
        { name: "Data Modeling", category: "data" },
        { name: "Regression", category: "data" },
    ],

    experience: [
        {
            company: "Current Company",
            role: "Software Engineer",
            period: "2023 — Present",
            description: "Designing and maintaining backend systems and integration pipelines using TypeScript, FastAPI, and SnapLogic. Led migration of EDI workflows and implemented type-safe API layers.",
            tags: ["TypeScript", "FastAPI", "SnapLogic", "PostgreSQL"],
        },
        {
            company: "Previous Company",
            role: "Fullstack Developer",
            period: "2021 — 2023",
            description: "Built REST APIs and internal tools with Node.js and React. Implemented automated data pipelines and contributed to database architecture decisions.",
            tags: ["Node.js", "React", "PostgreSQL", "Docker"],
        },
    ],

    projects: [
        {
            name: "Glucose Optimization Model",
            type: "Data Science · HealthTech",
            description: "Predictive regression model for insulin optimization using personal biometric data. Built to solve a real daily problem.",
            tags: ["Python", "Regression", "Data Modeling"],
            url: null,
        },
        {
            name: "Digital Signatures System",
            type: "Backend · Security",
            description: "Blockchain-like public verification layer for digital documents, built with FastAPI and cryptographic signing.",
            tags: ["FastAPI", "PostgreSQL", "TypeScript"],
            url: null,
        },
        {
            name: "Homelab as a Product",
            type: "DevOps · Infrastructure",
            description: "Fully automated personal infrastructure: self-hosted services, network management, reverse proxy, and monitoring.",
            tags: ["Proxmox", "Docker", "Nginx", "n8n"],
            url: null,
        },
        {
            name: "Life & Finance Automation",
            type: "Productivity · Data",
            description: "Financial trackers, consumption dashboards, and automated workflows connecting personal data to actionable insights.",
            tags: ["n8n", "Python", "Data Modeling"],
            url: null,
        },
    ],
}