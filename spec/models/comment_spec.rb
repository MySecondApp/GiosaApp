require 'rails_helper'

RSpec.describe Comment, type: :model do
  let(:published_post) { Post.create!(title: "Test Post", content: "Test content", published: true) }
  let(:draft_post) { Post.create!(title: "Draft Post", content: "Draft content", published: false) }

  describe "associations" do
    it "belongs to a post" do
      expect(Comment.reflect_on_association(:post).macro).to eq(:belongs_to)
    end
  end

  describe "validations" do
    subject { Comment.new(author_name: "Test Author", content: "Test comment content", post: published_post) }

    it "is valid with valid attributes" do
      expect(subject).to be_valid
    end

    it "requires an author_name" do
      subject.author_name = nil
      expect(subject).not_to be_valid
      expect(subject.errors[:author_name]).to be_present
    end

    it "requires author_name to be at least 2 characters" do
      subject.author_name = "A"
      expect(subject).not_to be_valid
      expect(subject.errors[:author_name]).to be_present
    end

    it "requires content" do
      subject.content = nil
      expect(subject).not_to be_valid
      expect(subject.errors[:content]).to be_present
    end

    it "requires content to be at least 5 characters" do
      subject.content = "Hi"
      expect(subject).not_to be_valid
      expect(subject.errors[:content]).to be_present
    end

    it "validates that post must be published" do
      comment = Comment.new(author_name: "Test Author", content: "Test comment content", post: draft_post)
      expect(comment).not_to be_valid
      expect(comment.errors[:post]).to include("no permite comentarios porque está en borrador")
    end
  end

  describe "creation" do
    it "can be created with valid attributes" do
      expect {
        Comment.create!(author_name: "Test Author", content: "Test comment content", post: published_post)
      }.to change(Comment, :count).by(1)
    end
  end
end
