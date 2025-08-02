require 'rails_helper'

RSpec.describe "comments/destroy.html.tailwindcss", type: :view do
  let(:blog_post) { Post.create!(title: "Test Post", content: "Test content", published: true) }
  let(:comment) { Comment.create!(author_name: "Test Author", content: "This is a test comment.", post: blog_post) }

  before do
    assign(:post, blog_post)
    assign(:comment, comment)
  end

  it "renders the destroy turbo_stream template" do
    render template: "comments/destroy", formats: :turbo_stream

    expect(rendered).to include("turbo-stream")
    expect(rendered).to include("remove")
    expect(rendered).to include("comment_#{comment.id}")
  end
end
