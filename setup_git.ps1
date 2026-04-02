# setup_git.ps1
# Clean up existing git state to ensure a fresh start
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue

# Initialize new repository
git init

# Add the remote
git remote add origin https://github.com/mikehike171-droid/restaurantapp.git

# Stage ONLY the frontend and backend folders
git add frontend backend .gitignore package-lock.json

# Commit the changes
git commit -m "Initial commit: Frontend and Backend management system"

# Set branch name to main and FORCE push to overwrite remote
git branch -M main
git push -u origin main -f

Write-Host "Git migration complete! Your code has been force-pushed to https://github.com/mikehike171-droid/restaurantapp.git"
