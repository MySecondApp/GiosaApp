class AddDefaultToPostsPublished < ActiveRecord::Migration[8.0]
  def change
    change_column_default :posts, :published, false
  end
end
