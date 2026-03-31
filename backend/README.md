# Backend (Ruby on Rails API)

This is the Rails API for the Cat Care Tracker app.

## Tech
- Ruby on Rails
- PostgreSQL

## Setup

```bash
bundle install
rails db:create db:migrate
rails s
```

## API Structure
- /cats
- /cats/:id/grooming_logs
- /cats/:id/food_logs
- /cats/:id/flea_treatments
- /cats/:id/litter_box_logs


## Notes
- Uses RESTful, nested API routes
- Includes model-level validations and custom validation logic
- Authorization enforced at the controller level