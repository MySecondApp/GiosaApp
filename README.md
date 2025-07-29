# GiosaApp

A Rails application with Hotwire and Tailwind CSS for interactive and modern web development.

## Setup

* Ruby version: 3.3.x
* Rails version: 8.0.2
* Database: PostgreSQL
* CSS Framework: Tailwind CSS
* JavaScript: Hotwire (Turbo + Stimulus)

## Getting Started

1. Install dependencies:
   ```bash
   bundle install
   ```

2. Setup database:
   ```bash
   rails db:create
   rails db:migrate
   rails db:seed
   ```

3. Start the development server:
   ```bash
   bin/dev
   ```

## Code Quality

This project uses RuboCop with Rails Omakase configuration for code linting and formatting.

### Linting Commands

```bash
# Check for style violations
bin/lint
# or
bundle exec rubocop

# Auto-fix correctable issues
bin/lint fix
# or
bundle exec rubocop -A

# Generate HTML report
bin/lint report

# Show available lint commands
bin/lint help
```

### Available Rake Tasks

```bash
# Run RuboCop
rake rubocop

# Run RuboCop with auto-correct
rake rubocop:fix

# Generate RuboCop report
rake rubocop:report
```

## Testing

Run the test suite:
```bash
rails test
```

## Features

* Modern Rails 8.0 setup
* Hotwire integration for SPA-like experience
* Tailwind CSS for utility-first styling
* Dark/Light theme toggle
* Posts CRUD functionality
* Code quality with RuboCop
* Docker support with Kamal deployment
