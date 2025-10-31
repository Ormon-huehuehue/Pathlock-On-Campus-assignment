# Environment Configuration

## API URL Configuration

The frontend uses environment variables to configure the API URL:

### Environment Files

1. **`.env`** - Production/default environment
   - Contains: `REACT_APP_API_URL=https://basic-task-manager-5e7x.onrender.com/api/tasks`
   - Used when no local override exists

2. **`.env.local`** - Local development (gitignored)
   - Contains: `REACT_APP_API_URL=http://localhost:5000/api/tasks`
   - Takes precedence over `.env` for local development

### Fallback Behavior

If no environment variable is set, the app defaults to `http://localhost:5000/api/tasks`.

### Usage

The API URL is configured in `App.tsx`:
```typescript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/tasks';
```

### Development vs Production

- **Local Development**: Uses `.env.local` → `http://localhost:5000/api/tasks`
- **Production Build**: Uses `.env` → `https://basic-task-manager-5e7x.onrender.com/api/tasks`
- **Fallback**: If neither exists → `http://localhost:5000/api/tasks`

### Note

- Environment variables must be prefixed with `REACT_APP_` to be accessible in React
- `.env.local` is gitignored for security and local customization
- Restart the development server after changing environment variables