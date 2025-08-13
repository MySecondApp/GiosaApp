class AddLikesToPosts < ActiveRecord::Migration[8.0]
  def change
    add_column :posts, :likes, :integer, default: 0, null: false
  end
end
