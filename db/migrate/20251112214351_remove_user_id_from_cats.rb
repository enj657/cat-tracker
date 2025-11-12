class RemoveUserIdFromCats < ActiveRecord::Migration[7.2]
  def change
    remove_column :cats, :user_id, :integer
  end
end
