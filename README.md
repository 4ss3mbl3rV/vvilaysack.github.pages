# Personal Portfolio Website

A modern, responsive personal portfolio website built for cybersecurity professionals. Features a dark/light theme toggle, smooth animations, and automatic blog integration with Medium.

## Features

- **Single Page Application** - Smooth navigation without page reloads
- **Dark/Light Theme** - Toggle between themes with preference saved to localStorage
- **Responsive Design** - Looks great on desktop, tablet, and mobile
- **Cybersecurity Aesthetic** - Grid overlay background with blue glow effects
- **Medium Blog Integration** - Automatically fetches posts from your Medium profile
- **YAML-Based Projects** - Add projects via a simple YAML file, no HTML editing required
- **Zero Build Tools** - Pure HTML, CSS, and JavaScript - no frameworks needed
- **GitHub Pages Ready** - Deploy instantly with zero configuration

## File Structure

```
├── index.html              # Main HTML file (all pages in one SPA)
├── styles.css              # Complete stylesheet with themes
├── app.js                  # JavaScript for routing, theme, blog, and projects
├── projects.yml            # Your projects data (YAML format)
├── profile.jpg             # Your profile photo (optional)
├── README.md               # This documentation
└── .github/
    └── workflows/
        └── rebuild.yml     # GitHub Actions for daily rebuild
```

## Quick Start

### 1. Clone or Download

```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
```

### 2. Customize Your Information

Open `app.js` and update the `CONFIG` object at the top:

```javascript
const CONFIG = {
    // Replace with your Medium username (without @)
    MEDIUM_USERNAME: 'yourusername',

    // Replace with your actual social links
    GITHUB_URL: 'https://github.com/yourusername',
    LINKEDIN_URL: 'https://linkedin.com/in/yourusername',
    MEDIUM_URL: 'https://medium.com/@yourusername',

    // User info
    USER_NAME: 'Your Name',
    USER_INITIALS: 'YN',
};
```

### 3. Update Your Profile

In `index.html`, find and replace:

- `Your Name` - Your full name (appears in hero section and footer)
- `YN` - Your initials (appears in navbar logo and avatar fallback)
- `Cybersecurity Professional` - Your job title
- Update the subtitle, about section, and certifications with your own content

### 4. Add Your Projects

Edit `projects.yml` to add your projects. See the [Projects (YAML-Based)](#projects-yaml-based) section for details.

### 4. Add Your Profile Photo

Add a file named `profile.jpg` to the root directory. If no photo is found, your initials will be displayed instead.

Recommended specifications:
- Square aspect ratio (e.g., 400x400 pixels)
- JPEG or PNG format
- File size under 500KB for fast loading

### 5. Update Social Links

In `index.html`, search for these placeholder URLs and replace them:
- `https://github.com/yourusername`
- `https://linkedin.com/in/yourusername`
- `https://medium.com/@yourusername`

## Deployment

### Option A: GitHub Pages (Recommended)

1. Create a new repository on GitHub
2. Push your customized files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/portfolio.git
   git push -u origin main
   ```
3. Go to repository **Settings** → **Pages**
4. Under "Source", select **Deploy from a branch**
5. Select the `main` branch and `/ (root)` folder
6. Click **Save**
7. Your site will be live at `https://yourusername.github.io/portfolio/`

**For a custom domain:**
- Add a `CNAME` file with your domain name
- Configure DNS settings with your domain provider

### Option B: Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Workers & Pages** → **Create application** → **Pages**
3. Connect your GitHub account and select the repository
4. Configure the build settings:
   - **Build command:** Leave empty (static site)
   - **Build output directory:** `/` or leave empty
5. Click **Save and Deploy**
6. Your site will be live at `https://your-project.pages.dev`

**For a custom domain:**
- Go to your Pages project → **Custom domains**
- Add your domain and follow the DNS configuration steps

## Projects (YAML-Based)

Projects are managed via the `projects.yml` file. Simply edit this file to add, remove, or update your projects - no HTML editing required.

### Adding a New Project

Open `projects.yml` and add a new entry under `projects:`:

```yaml
projects:
  - name: My New Project
    category: Tool          # Options: Open Source, Personal, Lab, Tool
    status: Active          # Options: Active, Completed
    tags:
      - Python
      - Docker
      - API
    links:
      github: https://github.com/username/project
      demo: https://project-demo.com    # Optional
```

### Project Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | The project title |
| `category` | Yes | Category badge (Open Source, Personal, Lab, Tool) |
| `status` | Yes | Status indicator (Active or Completed) |
| `description` | Yes | Brief description (1-2 sentences) |
| `tags` | No | List of technology tags |
| `links.github` | No | GitHub repository URL |
| `links.demo` | No | Live demo URL |

### Example projects.yml

```yaml
projects:
  - name: Security Scanner
    category: Open Source
    status: Active
    description: An automated vulnerability scanner for web applications.
    tags:
      - Python
      - Flask
      - OWASP
    links:
      github: https://github.com/user/scanner

  - name: Home Lab Setup
    category: Lab
    status: Completed
    description: Documentation and scripts for my home cybersecurity lab.
    tags:
      - VMware
      - Splunk
      - Docker
    links:
      github: https://github.com/user/homelab
      demo: https://homelab-docs.example.com
```

## Medium Blog Integration

The blog page automatically fetches your latest posts from Medium using the RSS2JSON API.

### How It Works

1. Your Medium RSS feed (`https://medium.com/feed/@username`) is converted to JSON
2. Posts are fetched and cached in localStorage
3. The cache is refreshed once per browser session
4. GitHub Actions triggers a daily rebuild to keep posts fresh

### Configuration

Update your Medium username in `app.js`:

```javascript
MEDIUM_USERNAME: 'yourusername',
```

### Requirements

- Your Medium profile must be **public**
- You need at least one published article for posts to appear

### Troubleshooting

If blog posts don't load:
1. Verify your username is correct (without the @ symbol)
2. Check that your Medium profile is public
3. Ensure you have published articles (drafts won't appear)
4. Check browser console for error messages

## Customization

### Colors

The color scheme is defined in CSS variables in `styles.css`. The main accent colors:

```css
/* Dark theme */
--accent-primary: #3b82f6;      /* Main blue */
--accent-secondary: #2563eb;    /* Darker blue for hover */

/* Light theme */
--accent-primary: #2563eb;
--accent-secondary: #1d4ed8;
```

### Fonts

The site uses three Google Fonts:
- **Orbitron** - Display headings (cybersecurity/tech aesthetic)
- **JetBrains Mono** - Code/monospace text
- **Space Grotesk** - Body text

To change fonts, update the Google Fonts link in `index.html` and the CSS variables in `styles.css`.

### Adding New Sections

1. Add a new `<section>` in `index.html`:
   ```html
   <section id="newpage" class="page">
       <div class="container">
           <!-- Your content -->
       </div>
   </section>
   ```

2. Add a navigation link:
   ```html
   <li><a href="#newpage" class="nav-link" data-link>New Page</a></li>
   ```

3. Register the page in `app.js`:
   ```javascript
   pages: ['home', 'about', 'certifications', 'projects', 'blog', 'newpage'],
   ```

## GitHub Actions

The included workflow (`.github/workflows/rebuild.yml`) automatically:
- Runs daily at 3:00 AM UTC
- Creates an empty commit to trigger a GitHub Pages rebuild
- Can be manually triggered from the Actions tab

This ensures your blog posts are refreshed daily.

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

The site uses modern CSS features like CSS Grid, CSS Variables, and backdrop-filter with appropriate fallbacks.

## Performance

- No external JavaScript frameworks
- Optimized CSS with minimal specificity
- Lazy loading for blog images
- Cached blog posts to reduce API calls
- Minimal DOM manipulation

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built with passion for the cybersecurity community.
