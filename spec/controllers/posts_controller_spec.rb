require 'rails_helper'

RSpec.describe PostsController, type: :controller do
  let!(:test_post) { create(:post) }

  describe 'GET index' do
    it 'responds successfully' do
      get :index
      expect(response).to have_http_status(:success)
    end

    it 'renders the index template' do
      get :index
      expect(response).to render_template(:index)
    end
  end

  describe 'GET show' do
    it 'responds successfully' do
      get :show, params: { id: test_post.id }
      expect(response).to have_http_status(:success)
    end

    it 'renders the show template' do
      get :show, params: { id: test_post.id }
      expect(response).to render_template(:show)
    end
  end

  describe 'POST create' do
    context 'with valid attributes' do
      it 'creates a new post' do
        expect {
          post :create, params: { post: attributes_for(:post) }
        }.to change(Post, :count).by(1)
      end

      it 'redirects to the new post' do
        post :create, params: { post: attributes_for(:post) }
        expect(response).to redirect_to(Post.last)
      end
    end

    context 'with invalid attributes' do
      it 'does not create a new post' do
        expect {
          post :create, params: { post: attributes_for(:post, title: nil) }
        }.to_not change(Post, :count)
      end

      it 're-renders the new template' do
        post :create, params: { post: attributes_for(:post, title: nil) }
        expect(response).to render_template(:new)
      end
    end
  end

  # Similar tests can be written for update and destroy actions.
end
