class AddHasIssueToLitterBoxLogs < ActiveRecord::Migration[7.2]
  def change
    add_column :litter_box_logs, :has_issue, :boolean, default: false, null: false
  end
end