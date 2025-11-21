# Contributing Guide

Thank you for your interest in contributing to Subscription Tracker! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a branch** for your feature or fix
4. **Make your changes**
5. **Test your changes**
6. **Submit a pull request**

## Development Setup

Follow the setup instructions in the main [README.md](../README.md):

1. Install dependencies: `npm install`
2. Set up environment variables (`.env.local`)
3. Set up Supabase database (run SQL from `db/init.sql`)
4. Run the dev server: `npm run dev`

## Code Style

### Formatting

We use Prettier for code formatting. Run before committing:

```bash
npm run format
```

### Linting

We use ESLint for code quality. Check for issues:

```bash
npm run lint
```

### Code Style Guidelines

- Use functional components with hooks
- Prefer named exports for components
- Use descriptive variable and function names
- Add JSDoc comments for complex functions
- Keep components small and focused
- Extract reusable logic into custom hooks

## Git Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages

Follow conventional commits:

- `feat: add export functionality`
- `fix: correct date calculation in renewal reminders`
- `docs: update API documentation`
- `refactor: simplify subscription card component`
- `test: add tests for useSubscriptions hook`

### Pull Request Process

1. **Update your branch** with the latest main:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run tests and linting**:
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

3. **Create a pull request** using the PR template
4. **Fill out the PR template** completely
5. **Request review** from maintainers

## Testing

### Writing Tests

- Write tests for new features and bug fixes
- Use Vitest and React Testing Library
- Test user interactions, not implementation details
- Aim for good test coverage

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test:ui
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/       # React contexts
├── hooks/         # Custom hooks
├── lib/           # Utilities and clients
├── pages/         # Page components
└── test/          # Test setup files
```

## Adding New Features

1. **Plan your feature** - Consider the user experience
2. **Update the database** if needed (add migration script)
3. **Create components** following existing patterns
4. **Add tests** for your feature
5. **Update documentation** if needed
6. **Test manually** in the browser

## Reporting Bugs

When reporting bugs, please include:

- **Description** of the bug
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** if applicable
- **Environment** (browser, OS, Node version)

## Feature Requests

Feature requests are welcome! Please:

- Check if the feature already exists
- Describe the use case
- Explain why it would be useful
- Consider implementation complexity

## Code Review

All code must be reviewed before merging. Reviewers will check:

- Code quality and style
- Test coverage
- Functionality
- Performance implications
- Security considerations

## Questions?

Feel free to open an issue for questions or discussions. We're happy to help!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

