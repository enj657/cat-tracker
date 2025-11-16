class CreateVisits < ActiveRecord::Migration[7.2]
  def change
    create_table :visits do |t|
      t.references :cat, null: false, foreign_key: true
      t.string :visit_type
      t.date :date
      t.text :notes

      t.timestamps
    end
  end
end
