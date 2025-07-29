require 'rails_helper'

RSpec.describe Post, type: :model do
  let(:post) { build(:post) }

  describe 'validations' do
    it 'is valid with valid attributes' do
      expect(post).to be_valid
    end

    it 'is not valid without a title' do
      post.title = nil
      expect(post).to_not be_valid
    end

    it 'is not valid without content' do
      post.content = nil
      expect(post).to_not be_valid
    end

    it 'is valid with published as true' do
      post.published = true
      expect(post).to be_valid
    end

    it 'is valid with published as false' do
      post.published = false
      expect(post).to be_valid
    end
  end

  describe 'scopes' do
    let!(:published_post) { create(:published_post) }
    let!(:draft_post) { create(:draft_post) }

    it 'returns only published posts' do
      published_posts = Post.where(published: true)
      expect(published_posts).to include(published_post)
      expect(published_posts).to_not include(draft_post)
    end
  end

  describe '#published?' do
    it 'returns true when published is true' do
      post.published = true
      expect(post.published?).to eq(true)
    end

    it 'returns false when published is false' do
      post.published = false
      expect(post.published?).to eq(false)
    end
  end
end
