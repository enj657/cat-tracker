class CreateReminders < ActiveRecord::Migration[7.2]
  def change
    create_table :reminders do |t|
      t.references :cat, null: false, foreign_key: true
      t.string :title
      t.date :due_date
      t.boolean :completed

      t.timestamps
    end
  end
end
