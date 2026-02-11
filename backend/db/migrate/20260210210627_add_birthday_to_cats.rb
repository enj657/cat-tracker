class AddBirthdayToCats < ActiveRecord::Migration[7.2]
  def change
    add_column :cats, :birthday, :date
  end
end
