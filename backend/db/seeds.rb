# Remove for production - using only locally
# Clear old data
Photo.destroy_all
Reminder.destroy_all
Visit.destroy_all
CatUser.destroy_all
Cat.destroy_all
User.destroy_all
Household.destroy_all

# Remove for production - using only locally
ActiveRecord::Base.connection.reset_pk_sequence!('households')
ActiveRecord::Base.connection.reset_pk_sequence!('users')
ActiveRecord::Base.connection.reset_pk_sequence!('cats')
ActiveRecord::Base.connection.reset_pk_sequence!('cat_users')
ActiveRecord::Base.connection.reset_pk_sequence!('visits')
ActiveRecord::Base.connection.reset_pk_sequence!('reminders')
ActiveRecord::Base.connection.reset_pk_sequence!('photos')

# Households
h1 = Household.create!(name: "Jacobs Family")
h2 = Household.create!(name: "Smith Family")

# Users
u1 = User.create!(
  name: "Elle", 
  email: "elle@example.com", 
  household: h1,
  password: "password",
  password_confirmation: "password"
)

u2 = User.create!(
  name: "Alex", 
  email: "alex@example.com", 
  household: h1,
  password: "password",
  password_confirmation: "password"
)

u3 = User.create!(
  name: "Sam", 
  email: "sam@example.com", 
  household: h2,
  password: "password",
  password_confirmation: "password"
)

# Cats (added breed!)
c1 = Cat.create!(name: "Whiskers", age: 3, breed: "Siamese")
c2 = Cat.create!(name: "Mittens", age: 2, breed: "Tabby")
c3 = Cat.create!(name: "Shadow", age: 4, breed: "Black Domestic")
c4 = Cat.create!(name: "Smokey", age: 1, breed: "Gray Domestic")

# Assign multiple owners
c1.users << [ u1, u2 ]
c2.users << u1
c3.users << u2
c4.users << u3

# Visits
Visit.create!(cat: c1, visit_type: "Annual Checkup", date: "2025-06-01", notes: "Healthy")
Visit.create!(cat: c2, visit_type: "Vaccination", date: "2025-07-15", notes: "Rabies shot given")
Visit.create!(cat: c3, visit_type: "Flea Treatment", date: "2025-08-20", notes: "Frontline applied")

# Reminders
Reminder.create!(cat: c1, title: "Give flea medicine", due_date: 1.week.from_now, completed: false)
Reminder.create!(cat: c2, title: "Schedule vet visit", due_date: 2.weeks.from_now, completed: false)
Reminder.create!(cat: c3, title: "Trim nails", due_date: Date.today, completed: true)

# Photos
Photo.create!(cat: c1, image_url: "https://placecats.com/300/200", caption: "Whiskers playing")
Photo.create!(cat: c2, image_url: "https://placecats.com/300/200", caption: "Mittens sleeping")
Photo.create!(cat: c3, image_url: "https://placecats.com/300/200", caption: "Shadow on the couch")

puts "Seeding complete!"
