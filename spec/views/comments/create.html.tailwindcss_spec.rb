require 'rails_helper'

RSpec.describe "comments/create.html.tailwindcss", type: :view do
  let(:blog_post) { Post.create!(title: "Test Post", content: "Test content", published: true) }
  let(:comment) { Comment.create!(author_name: "Test Author", content: "This is a test comment.", post: blog_post) }

  before do
    # Mock the helper methods that the view expects
    def view.theme_classes(light_classes, dark_classes)
      light_classes
    end

    assign(:post, blog_post)
    assign(:comment, comment)
  end

  it "renders the create turbo_stream template" do
    render template: "comments/create", formats: :turbo_stream

    expect(rendered).to include("turbo-stream")
    expect(rendered).to include("replace")
  end
end
