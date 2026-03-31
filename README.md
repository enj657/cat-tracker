# Cat Care Tracker 🐈

A full-stack app for tracking daily cat care including grooming, food, flea treatments, litter box activity, and reminders — because remembering your cat’s last nail trim shouldn’t require detective work.

Built with React (TypeScript) frontend and Ruby on Rails backend.

## Features

- 🧼 Grooming logs with reminders
- 🍽️ Food tracking and diet changes
- 🐜 Flea/tick treatment tracking
- 🧻 Litter box activity logging
- ⏰ Smart reminders and due-date alerts
- 📊 Organized daily life dashboard

## Tech Stack

**Frontend**
- React
- TypeScript
- Tailwind CSS

**Backend**
- Ruby on Rails
- PostgreSQL

**Other**
- REST API
- Git / GitHub

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/cat-tracker.git
cd cat-tracker

cd server
bundle install
rails db:create db:migrate
rails s

cd client
npm install
npm run dev
```

## Environment Variables
Create a .env file in the backend:
DATABASE_URL=your_database_url

## Future Improvements 
Notifications system
Multi-pet support
Data visualization (charts)