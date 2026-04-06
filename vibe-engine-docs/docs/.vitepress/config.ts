import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "VibeEngine",
  description: "Modern, AI-Native 3D Game Engine",
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'API', link: '/api/classes' },
      { text: 'Studio', link: '/studio/index' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Basics',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Quick Start', link: '/guide/quick-start' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'ECS Architecture', link: '/guide/ecs-architecture' },
            { text: 'Scene Management', link: '/guide/scene-management' },
            { text: 'Components', link: '/guide/components' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Core Classes', link: '/api/classes' },
            { text: 'Components', link: '/api/components' },
            { text: 'Utilities', link: '/api/utilities' }
          ]
        }
      ],
      '/studio/': [
        {
          text: 'VibeEngine Studio',
          items: [
            { text: 'Overview', link: '/studio/index' },
            { text: 'Project Manager', link: '/studio/project-manager' },
            { text: 'Quantum Fluid UI', link: '/studio/ui' },
            { text: 'Neural Copilot', link: '/studio/ai' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/halilogia/VibeEngine' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 VibeEngine Team'
    }
  },
  appearance: 'dark',
  lastUpdated: true
})
