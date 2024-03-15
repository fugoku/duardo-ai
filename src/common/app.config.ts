/**
 * Application Identity (Brand)
 *
 * Also note that the 'Brand' is used in the following places:
 *  - README.md               all over
 *  - package.json            app-slug and version
 *  - [public/manifest.json]  name, short_name, description, theme_color, background_color
 */
export const Brand = {
  Title: {
    Base: 'Duardo-ai',
    Common: (process.env.NODE_ENV === 'development' ? '[DEV] ' : '') + 'duardo-ai',
  },
  Meta: {
    Description: 'Launch duardo-ai to unlock the full potential of AI, with precise control over your data and models. Voice interface, AI personas, advanced features, and fun UX.',
    SiteName: 'duardo-ai | Precision AI for You',
    ThemeColor: 'blue',
    TwitterSite: '@fugoku',
  },
  URIs: {
    Home: 'https://duardo-ai.com',
    // App: 'https://get.duardo-ai.com',
    CardImage: 'https://duardo-ai.com/icons/card-dark-1200.png',
    OpenRepo: 'https://github.com/fugoku/duardo-ai',
    OpenProject: 'https://github.com/users/fugoku/projects/4',
    SupportInvite: '',
    // Twitter: 'https://www.twitter.com/fugoku',
    PrivacyPolicy: 'https://duardo-ai.com/privacy',
  },
} as const;