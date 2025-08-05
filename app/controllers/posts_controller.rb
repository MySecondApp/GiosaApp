class PostsController < ApplicationController
  before_action :set_post, only: [ :show, :edit, :update, :destroy ]

  def index
    @posts = Post.all.order(created_at: :desc)
  end

  def show
  end

  def new
    @post = Post.new
  end

  def create
    @post = Post.new(post_params)

    if @post.save
      respond_to do |format|
        format.html { redirect_to @post, notice: t("messages.post_created") }
        format.turbo_stream {
          render turbo_stream: turbo_stream.append("body") do
            render partial: "posts/notification", locals: {
              message: t("messages.post_created"),
              type: "success",
              title: "✍️ Post creado",
              redirect_url: post_path(@post)
            }
          end
        }
      end
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @post.update(post_params)
      respond_to do |format|
        format.html { 
          redirect_to @post, notice: t("messages.post_updated")
        }
        format.turbo_stream {
          Rails.logger.info "🔔 Rendering turbo stream notification for post update"
          render turbo_stream: turbo_stream.append("body") do
            "<script>
              console.log('🚀 Executing post update notification script');
              setTimeout(function() {
                console.log('📢 Dispatching notification event');
                var event = new CustomEvent('notification:show', {
                  detail: {
                    message: '#{j(t('messages.post_updated'))}',
                    type: 'success',
                    title: '✅ Post actualizado',
                    duration: 3000
                  }
                });
                window.dispatchEvent(event);
                console.log('Event dispatched:', event);
                setTimeout(function() { 
                  console.log('Redirecting to post...');
                  window.location.href = '#{post_path(@post)}'; 
                }, 2000);
              }, 500);
            </script>".html_safe
          end
        }
      end
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    post_title = @post.title
    @post.destroy

    respond_to do |format|
      format.html { redirect_to posts_path, notice: "\"#{post_title}\" #{t('messages.post_deleted')}" }
      format.turbo_stream {
        render turbo_stream: turbo_stream.append("body") do
          "<script>
            setTimeout(function() {
              var event = new CustomEvent('notification:show', {
                detail: {
                  message: '#{j("\"#{post_title}\" #{t('messages.post_deleted')}")}',
                  type: 'success',
                  title: '🗑️ Post eliminado',
                  duration: 3000
                }
              });
              window.dispatchEvent(event);
              setTimeout(function() { window.location.href = '#{posts_path}'; }, 1500);
            }, 100);
          </script>".html_safe
        end
      }
    end
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end

  def post_params
    params.require(:post).permit(:title, :content, :published)
  end
end
