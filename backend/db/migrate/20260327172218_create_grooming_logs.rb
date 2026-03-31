class CreateGroomingLogs < ActiveRecord::Migration[7.2]
  def change
    create_table :grooming_logs do |t|
      t.references :cat, null: false, foreign_key: true
      t.date :date, null: false
      t.string :grooming_type, null: false
      t.string :performed_by
      t.date :next_due_date
      t.text :notes
      t.timestamps
    end
    add_index :grooming_logs, [:cat_id, :date]
  end
end