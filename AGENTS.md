# AI Agent Skills Guide

## Overview

This document provides a comprehensive guide to all installed skills for the Mizuki Design System project. These skills enhance the capabilities of AI coding agents (Claude, Cline, Codex, GitHub Copilot) to provide specialized knowledge and workflows.

**Project Stack:**
- Astro 5 with Svelte 5
- TypeScript
- Vite build tool
- Design System components
- Focus on accessibility, performance, and quality

---

## Installation Summary

**Total Skills Installed:** 38
**Newly Installed (this session):** 25
**Pre-existing:** 13

All skills are installed globally in `~/.agents/skills/` and symlinked to various AI agents.

---

## Quick Reference Table

| Skill | Category | Best For | Installs |
|-------|----------|----------|----------|
| astro | Framework | Astro development | 6.2K |
| svelte-code-writer | Framework | Svelte 5 coding | 4.8K |
| svelte5-best-practices | Framework | Svelte 5 patterns | 3.4K |
| vite | Tooling | Build configuration | 22.8K |
| vitest | Testing | Unit testing | 19.1K |
| extract-design-system | Design | Token extraction | 100.9K |
| web-design-guidelines | Design | UI patterns | 328.9K |
| tailwind-design-system | Design | Tailwind integration | 42.8K |
| design-system-patterns | Design | Architecture | 9.5K |
| accessibility | A11y | WCAG compliance | 22.7K |
| accessibility-compliance | A11y | A11y auditing | 8.9K |
| typescript-advanced-types | TypeScript | Advanced types | 41.9K |
| typescript-expert | TypeScript | Expert patterns | 8.5K |
| webapp-testing | Testing | E2E strategy | 73K |
| javascript-testing-patterns | Testing | Unit patterns | 13.1K |
| e2e-testing-patterns | Testing | E2E implementation | 15.9K |
| requesting-code-review | Code Quality | PR preparation | 89.8K |
| receiving-code-review | Code Quality | Feedback response | 71.2K |
| code-review-excellence | Code Quality | Conducting reviews | 18.7K |
| documentation-writer | Docs | Documentation | 18.2K |
| documentation-and-adrs | Docs | ADRs | 3.3K |
| performance | Performance | Web vitals | 12.7K |
| convex-performance-audit | Performance | Auditing | 48.8K |
| fixing-motion-performance | Performance | Animation perf | 14.8K |
| deploy-to-vercel | DevOps | Vercel deployment | 53.3K |
| azure-deploy | DevOps | Azure deployment | 326.7K |
| gsap-performance | Performance | GSAP animation performance | 11.1K |
| mcp-builder | MCP Integration | Build MCP servers | 56.6K |
| mcp-apps-builder | MCP Integration | Build MCP applications | 11.6K |
| github-actions-docs | DevOps | CI/CD | 149.5K |

---

## Detailed Skill Documentation

### Framework & Tooling

#### `astro`
**Installs:** 6.2K  
**Source:** astrolicious/agent-skills  
**Purpose:** Astro-specific guidance, best practices, and component patterns

**When to use:**
- Building Astro components and layouts
- Setting up Astro integrations
- Optimizing Astro builds
- Working with Astro's island architecture

**Examples:**
- "How do I create a partial hydration component?"
- "Best practices for Astro image optimization"
- "Setting up Svelte in Astro"

---

#### `svelte-code-writer`
**Installs:** 4.8K  
**Source:** sveltejs/ai-tools  
**Purpose:** Write idiomatic Svelte 5 code following official patterns

**When to use:**
- Creating Svelte components
- Implementing reactive statements
- Using Svelte 5 runes ($state, $derived, $effect)
- Event handling and prop passing

**Examples:**
- "Write a Svelte component with a click counter"
- "How do I use $derived for computed values?"
- "Best practices for Svelte component composition"

---

#### `svelte-core-bestpractices`
**Installs:** 1.6K  
**Source:** sveltejs/ai-tools  
**Purpose:** Svelte core best practices and anti-patterns

**When to use:**
- Code review of Svelte components
- Ensuring Svelte best practices
- Avoiding common Svelte pitfalls

**Examples:**
- "Review this Svelte component for best practices"
- "Is this reactive declaration correct?"
- "How should I structure my Svelte store?"

---

#### `svelte5-best-practices`
**Installs:** 3.4K  
**Source:** ejirocodes/agent-skills  
**Purpose:** Svelte 5 specific patterns and migration from Svelte 4

**When to use:**
- Migrating from Svelte 4 to Svelte 5
- Understanding Svelte 5 runes
- Using new Svelte 5 features

**Examples:**
- "How do I convert this Svelte 4 component to Svelte 5?"
- "What are the differences between Svelte 4 and Svelte 5?"
- "Best practices for Svelte 5 runes"

---

#### `vite`
**Installs:** 22.8K  
**Source:** antfu/skills  
**Purpose:** Vite configuration and optimization

**When to use:**
- Configuring Vite for Astro projects
- Setting up plugins and dependencies
- Optimizing build performance
- Debugging Vite issues

**Examples:**
- "How do I configure Vite for TypeScript?"
- "Best practices for Vite plugin configuration"
- "Optimizing Vite build speed"

---

#### `vitest`
**Installs:** 19.1K  
**Source:** antfu/skills  
**Purpose:** Vitest testing framework setup and best practices

**When to use:**
- Setting up unit tests
- Configuring test environments
- Writing test suites for components
- Mocking and stubbing

**Examples:**
- "How do I set up Vitest for Svelte components?"
- "Best practices for testing Svelte stores"
- "Configuring coverage reporting with Vitest"

---

### Design System & UI

#### `extract-design-system`
**Installs:** 100.9K  
**Source:** arvindrk/extract-design-system  
**Purpose:** Extract and document design tokens from existing code

**When to use:**
- Creating a design system from existing components
- Documenting colors, spacing, typography
- Identifying reusable UI patterns

**Examples:**
- "Extract design tokens from my component library"
- "Find all color values in my codebase"
- "Create a token system from existing styles"

---

#### `web-design-guidelines`
**Installs:** 328.9K  
**Source:** vercel-labs/agent-skills  
**Purpose:** Modern web design patterns and Vercel's design guidelines

**When to use:**
- UI/UX design decisions
- Layout and spacing recommendations
- Visual hierarchy and typography
- Responsive design patterns

**Examples:**
- "What's the recommended spacing scale?"
- "How should I design this form layout?"
- "Best practices for typography in design systems"

---

#### `tailwind-design-system`
**Installs:** 42.8K  
**Source:** wshobson/agents  
**Purpose:** Build design systems with Tailwind CSS patterns

**When to use:**
- Creating Tailwind-based design tokens
- Setting up Tailwind config for design systems
- Component styling strategies

**Examples:**
- "How do I set up Tailwind for a design system?"
- "Best practices for Tailwind component classes"
- "Managing design tokens in Tailwind"

---

#### `design-system-patterns`
**Installs:** 9.5K  
**Source:** wshobson/agents  
**Purpose:** Design system architecture and component patterns

**When to use:**
- Planning design system structure
- Component API design
- Token organization
- Documentation patterns

**Examples:**
- "How should I structure my design system?"
- "What are common component patterns?"
- "Best practices for design token naming"

---

#### `css-animations`
**Installs:** 28K  
**Source:** heyen-com/hyperframes  
**Purpose:** CSS animations and motion design patterns

**When to use:**
- Adding smooth transitions
- Creating animation states
- Performance-optimized animations
- Micro-interactions

**Examples:**
- "How do I create a fade-in animation?"
- "Best practices for CSS transitions"
- "Animating Svelte component state changes"

---

### Accessibility (a11y)

#### `accessibility`
**Installs:** 22.7K  
**Source:** addyosmani/web-quality-skills  
**Purpose:** Web accessibility guidelines and WCAG compliance

**When to use:**
- Ensuring WCAG 2.1 AA compliance
- Screen reader optimization
- Keyboard navigation
- Color contrast checks

**Examples:**
- "How do I make this button accessible?"
- "Check this component for a11y issues"
- "ARIA labels for custom components"

---

#### `accessibility-compliance`
**Installs:** 8.9K  
**Source:** wshobson/agents  
**Purpose:** Comprehensive accessibility compliance auditing

**When to use:**
- A11y audits and testing
- Compliance reporting
- Fixing accessibility violations
- Automated a11y testing setup

**Examples:**
- "Audit this page for accessibility issues"
- "How to set up automated a11y testing?"
- "Fixing common a11y problems"

---

### TypeScript

#### `typescript-advanced-types`
**Installs:** 41.9K  
**Source:** wshobson/agents  
**Purpose:** Advanced TypeScript patterns and type system mastery

**When to use:**
- Complex type definitions
- Utility types and generics
- Type inference optimization
- Advanced type guards

**Examples:**
- "How do I type this complex function?"
- "Best practices for TypeScript generics"
- "Creating type-safe component props"

---

#### `typescript-expert`
**Installs:** 8.5K  
**Source:** sickn33/antigravity-awesome-skills  
**Purpose:** Expert-level TypeScript guidance and optimization

**When to use:**
- Advanced type gymnastics
- Performance type optimization
- Library type definitions
- Complex type constraints

**Examples:**
- "How to create a strongly-typed event system?"
- "TypeScript performance best practices"
- "Advanced conditional types"

---

### Testing

#### `webapp-testing`
**Installs:** 73K  
**Source:** anthropics/skills  
**Purpose:** End-to-end web application testing strategies

**When to use:**
- Planning test coverage
- E2E test architecture
- Testing strategies for web apps
- Test environment setup

**Examples:**
- "How should I test this user flow?"
- "Best practices for E2E testing"
- "Setting up Playwright for my Astro app"

---

#### `javascript-testing-patterns`
**Installs:** 13.1K  
**Source:** wshobson/agents  
**Purpose:** JavaScript/TypeScript testing patterns and best practices

**When to use:**
- Unit test architecture
- Mocking strategies
- Test organization
- Coverage optimization

**Examples:**
- "How do I test this async function?"
- "Best practices for mocking in tests"
- "Test-driven development patterns"

---

#### `e2e-testing-patterns`
**Installs:** 15.9K  
**Source:** wshobson/agents  
**Purpose:** End-to-end testing patterns and Playwright/Puppeteer workflows

**When to use:**
- E2E test implementation
- Browser automation patterns
- Test data management
- CI/CD integration

**Examples:**
- "How do I test authentication flows?"
- "Best practices for Playwright tests"
- "Managing test fixtures and factories"

---

### Code Review & Quality

#### `requesting-code-review`
**Installs:** 89.8K  
**Source:** obra/superpowers  
**Purpose:** Prepare code for review and request effective feedback

**When to use:**
- Before submitting PRs
- Creating review checklists
- Writing clear descriptions
- Identifying areas needing feedback

**Examples:**
- "How should I prepare for code review?"
- "What should I include in my PR description?"
- "Create a review checklist for this feature"

---

#### `receiving-code-review`
**Installs:** 71.2K  
**Source:** obra/superpowers  
**Purpose:** Effectively respond to and implement feedback

**When to use:**
- Processing review comments
- Responding to feedback professionally
- Disagreeing constructively
- Tracking review feedback

**Examples:**
- "How do I respond to critical feedback?"
- "Best practices for addressing review comments"
- "When to push back on review suggestions?"

---

#### `code-review-excellence`
**Installs:** 18.7K  
**Source:** wshobson/agents  
**Purpose:** Conduct thorough and constructive code reviews

**When to use:**
- Reviewing others' code
- Creating review templates
- Identifying common issues
- Providing actionable feedback

**Examples:**
- "What should I look for in a PR review?"
- "How to give constructive feedback?"
- "Code review checklist for Svelte components"

---

### Git & Version Control

#### `git-commit`
**Installs:** 31.5K (pre-existing)  
**Source:** github/awesome-copilot  
**Purpose:** Write conventional commits and manage Git workflow

**When to use:**
- Creating commit messages
- Following Conventional Commits
- Git workflow planning
- Rebase and merge strategies

**Examples:**
- "Write a conventional commit for this change"
- "Best practices for commit messages"
- "How to structure Git history?"

---

#### `gh-cli`
**Installs:** 21.3K (pre-existing)  
**Source:** github/awesome-copilot  
**Purpose:** GitHub CLI commands and workflows

**When to use:**
- GitHub CLI operations
- PR creation and management
- Issue tracking
- Repository administration

**Examples:**
- "How do I create a PR using gh CLI?"
- "GitHub CLI commands for workflows"
- "Managing issues with gh"

---

#### `github-actions-docs`
**Installs:** 149.5K  
**Source:** xixu-me/skills  
**Purpose:** GitHub Actions workflows and CI/CD patterns

**When to use:**
- Setting up CI/CD pipelines
- GitHub Actions syntax and best practices
- Workflow optimization
- Matrix builds and caching

**Examples:**
- "How do I set up CI for my Astro project?"
- "Best practices for GitHub Actions"
- "Optimizing workflow execution time"

---

### Documentation

#### `documentation-writer`
**Installs:** 18.2K (pre-existing)  
**Source:** github/awesome-copilot  
**Purpose:** Write clear, comprehensive documentation

**When to use:**
- Creating README files
- Documenting APIs and components
- Writing tutorials and guides
- Maintaining documentation quality

**Examples:**
- "Write documentation for this component"
- "Best practices for README files"
- "How to structure API documentation?"

---

#### `documentation-and-adrs`
**Installs:** 3.3K  
**Source:** addyosmani/agent-skills  
**Purpose:** Documentation and Architecture Decision Records

**When to use:**
- Creating ADRs (Architecture Decision Records)
- Technical decision documentation
- Project documentation strategy
- Maintaining decision logs

**Examples:**
- "Write an ADR for this architectural decision"
- "Best practices for technical documentation"
- "How to structure ADRs?"

---

### Performance

#### `performance`
**Installs:** 12.7K  
**Source:** addyosmani/web-quality-skills  
**Purpose:** Web performance optimization techniques

**When to use:**
- Improving page load speed
- Core Web Vitals optimization
- Resource loading strategies
- Performance auditing

**Examples:**
- "How do I improve LCP for this page?"
- "Best practices for reducing CLS"
- "Optimizing image loading strategies"

---

#### `convex-performance-audit`
**Installs:** 48.8K  
**Source:** get-convex/agent-skills  
**Purpose:** Performance auditing and optimization workflows

**When to use:**
- Performance budgets
- Lighthouse audits
- Performance monitoring
- Optimization prioritization

**Examples:**
- "Audit this page for performance issues"
- "How to set up performance budgets?"
- "Interpreting Lighthouse scores"

---

#### `fixing-motion-performance`
**Installs:** 14.8K  
**Source:** ibelick/ui-skills  
**Purpose:** Optimize animations and motion for performance

**When to use:**
- Animation performance issues
- Reducing jank and dropped frames
- GPU-accelerated animations
- scroll-linked animations

**Examples:**
- "Why is my animation choppy?"
- "Best practices for performant CSS animations"
- "Optimizing scroll-based animations"

---

#### `gsap-performance`
**Installs:** 11.1K  
**Source:** greensock/gsap-skills  
**Purpose:** GSAP animation performance optimization

**When to use:**
- Optimizing GSAP animations for smooth 60fps
- Reducing jank in complex timelines
- Memory management for long-running animations
- GPU acceleration with transform and opacity

**Examples:**
- "How do I optimize this GSAP timeline for performance?"
- "Best practices for GSAP on mobile devices"
- "Reducing memory leaks in GSAP animations"

---

### MCP Integration

#### `mcp-builder`
**Installs:** 56.6K  
**Source:** anthropics/skills  
**Purpose:** Build MCP (Model Context Protocol) servers and integrations

**When to use:**
- Creating custom MCP servers
- Integrating with Claude Desktop
- Building AI tool integrations
- Extending agent capabilities via MCP

**Examples:**
- "How do I create an MCP server for my API?"
- "Best practices for MCP server implementation"
- "Connecting Claude to custom data sources with MCP"

---

#### `mcp-apps-builder`
**Installs:** 11.6K  
**Source:** mcp-use/mcp-use  
**Purpose:** Build complete MCP applications and workflows

**When to use:**
- End-to-end MCP application development
- Composing multiple MCP servers
- Deploying MCP solutions
- Testing MCP integrations

**Examples:**
- "How to structure an MCP app?"
- "Deploying MCP servers to production"
- "Testing MCP client connections"

---

### Deployment & DevOps

#### `deploy-to-vercel`
**Installs:** 53.3K  
**Source:** vercel-labs/agent-skills  
**Purpose:** Deploy to Vercel platform with best practices

**When to use:**
- Deploying Astro/Vite projects to Vercel
- Vercel configuration
- Edge function deployment
- Environment variable management

**Examples:**
- "How do I deploy my Astro site to Vercel?"
- "Vercel configuration for SPA mode"
- "Setting up preview deployments"

---

#### `azure-deploy`
**Installs:** 326.7K  
**Source:** microsoft/azure-skills  
**Purpose:** Deploy to Azure cloud platform

**When to use:**
- Azure deployment strategies
- Azure Static Web Apps
- Azure Functions integration
- Azure configuration management

**Examples:**
- "How to deploy to Azure Static Web Apps?"
- "Azure configuration for Astro projects"
- "Setting up Azure CDN"

---

## Usage Guidelines

### Before Using a Skill

1. **Check relevance:** Ensure the skill matches your task domain
2. **Read documentation:** Each skill has detailed instructions in its directory
3. **Scope appropriately:** Skills work best when given focused, specific tasks

### Skill Invocation

Skills are automatically invoked when you:
- Mention a relevant technology (e.g., "astro", "svelte", "vite")
- Ask about specific patterns (e.g., "accessibility", "performance", "design system")
- Request certain workflows (e.g., "code review", "deploy", "documentation")

### Combining Skills

Multiple skills can work together. For example:
- `astro` + `svelte-code-writer` → Astro component with Svelte
- `web-design-guidelines` + `accessibility` → Accessible UI design
- `typescript-advanced-types` + `code-review-excellence` → TypeScript code review

---

## Best Practices for This Project

### For Design System Development

1. **Start with** `design-system-patterns` for architecture decisions
2. **Use** `extract-design-system` to identify existing patterns
3. **Apply** `web-design-guidelines` for visual consistency
4. **Ensure** `accessibility` and `accessibility-compliance` for all components
5. **Follow** `svelte5-best-practices` for component implementation

### For Performance

1. **Reference** `performance` for core web vitals
2. **Use** `fixing-motion-performance` for animations
3. **Apply** `convex-performance-audit` for auditing
4. **Configure** `vite` for optimal builds
5. **Test** with `vitest` for performance regression

### For Testing

1. **Plan** with `webapp-testing` for E2E strategy
2. **Implement** unit tests with `vitest` and `javascript-testing-patterns`
3. **Write** E2E tests using `e2e-testing-patterns`
4. **Review** test coverage regularly
5. **Integrate** with `github-actions-docs` for CI

### For Code Quality

1. **Request** reviews using `requesting-code-review`
2. **Provide** reviews using `code-review-excellence`
3. **Respond** to feedback with `receiving-code-review`
4. **Apply** `typescript-advanced-types` for type safety
5. **Follow** `svelte-core-bestpractices` consistently

### For Deployment

1. **Choose** `deploy-to-vercel` or `azure-deploy` based on platform
2. **Configure** `astro` and `vite` for production
3. **Set up** `github-actions-docs` for CI/CD
4. **Monitor** with `performance` and `convex-performance-audit`
5. **Document** changes with `documentation-and-adrs`

---

## Troubleshooting

### Skill Not Activating

If a skill doesn't seem to be active:

1. Check it's installed: `ls ~/.agents/skills/`
2. Verify the skill directory exists
3. Ensure you're using relevant keywords in your request
4. Some skills require explicit invocation with skill name

### Performance Issues

If skills are slow to load:

1. Check network connectivity (skills download updates)
2. Large skill sets (like `wshobson/agents` with 155 skills) may take time
3. Consider disabling unused skills

### Updates

To update all skills:
```bash
npx skills update
```

To check for updates:
```bash
npx skills check
```

---

## Additional Resources

- **Skills Directory:** `~/.agents/skills/`
- **Skills Marketplace:** https://skills.sh/
- **Skill Source Repositories:** Each skill's installation output includes the GitHub URL
- **Project Documentation:** See individual skill directories for markdown docs

---

## Notes

- All skills are installed globally with `-g` flag
- Skills are symlinked to Claude Code, Cline, Codex, and GitHub Copilot
- Skills run with full agent permissions - only install from trusted sources
- Regular security reviews are performed (Socket, Snyk, Gen)
- Most skills have "Safe" ratings with 0 alerts

---

**Last Updated:** 2026-05-19
**Total Skills:** 38
**Newly Installed:** 25
**Project:** Mizuki Design System (Astro + Svelte 5)