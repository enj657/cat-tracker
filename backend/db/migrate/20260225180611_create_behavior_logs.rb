class CreateBehaviorLogs < ActiveRecord::Migration[7.2]
  def change
    create_table :behavior_logs do |t|
      t.references :cat, null: false, foreign_key: true
      t.date :date, null: false
      t.string :category, null: false
      t.text :description
      t.string :severity, default: "mild"
      t.timestamps
    end

    add_index :behavior_logs, [:cat_id, :date]
  end
end
