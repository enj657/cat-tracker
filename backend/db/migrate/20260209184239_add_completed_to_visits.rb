class AddCompletedToVisits < ActiveRecord::Migration[7.2]
  def change
    add_column :visits, :completed, :boolean, default: false
  end
end