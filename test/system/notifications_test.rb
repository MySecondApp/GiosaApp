require "application_system_test_case"

class NotificationsTest < ApplicationSystemTestCase
  driven_by :selenium, using: :headless_chrome, screen_size: [ 1920, 1080 ]

  setup do
    @post = posts(:published_post) # Assuming you have fixtures
  end

  test "shows notification when creating a post" do
    visit new_post_path

    fill_in "post_title", with: "Test Post Title"
    fill_in "post_content", with: "This is test content for the post"

    click_button "Crear Post"

    # Should redirect to posts index
    assert_current_path posts_path

    # Should show notification
    assert_selector "#flash-notifications-container .max-w-lg",
                   text: "Post fue creado exitosamente", wait: 5

    # Notification should have success styling
    assert_selector "#flash-notifications-container .border-green-400"
  end

  test "shows notification when updating a post" do
    visit edit_post_path(@post)

    fill_in "post_title", with: "Updated Post Title"

    click_button "Actualizar Post"

    assert_current_path posts_path
    assert_selector "#flash-notifications-container .max-w-lg",
                   text: "Post fue actualizado exitosamente", wait: 5
  end

  test "shows notification when deleting a post" do
    visit posts_path

    # Find delete button for the post
    within "#post_#{@post.id}" do
      accept_confirm do
        click_button "Eliminar"
      end
    end

    assert_current_path posts_path
    assert_selector "#flash-notifications-container .max-w-lg",
                   text: "Post fue eliminado exitosamente", wait: 5

    # Post should be removed from DOM
    assert_no_selector "#post_#{@post.id}"
  end

  test "shows notification when creating a comment via Turbo Stream" do
    visit post_path(@post)

    fill_in "comment_author_name", with: "Test Author"
    fill_in "comment_content", with: "This is a test comment"

    click_button "Publicar Comentario"

    # Should show notification without page refresh (Turbo Stream)
    assert_selector "#flash-notifications-container .max-w-lg",
                   text: "Comentario agregado", wait: 5

    # Comment should appear in the list
    assert_selector "##{dom_id(@post, :comments)}", text: "Test Author"
    assert_selector "##{dom_id(@post, :comments)}", text: "This is a test comment"

    # Comments count should update
    assert_selector "#comments_count_#{@post.id}", text: "1"
  end

  test "shows notification when deleting a comment via Turbo Stream" do
    # First create a comment
    comment = @post.comments.create!(
      author_name: "Author to Delete",
      content: "Comment to be deleted"
    )

    visit post_path(@post)

    # Click delete button and confirm
    within "##{dom_id(comment)}" do
      find('[data-controller="delete-confirmation"]').click

      # Wait for modal and confirm
      find('[data-action="delete-confirmation#confirm"]', wait: 3).click
    end

    # Should show deletion notification
    assert_selector "#flash-notifications-container .max-w-lg",
                   text: "Comentario eliminado", wait: 5

    # Comment should be removed from the list
    assert_no_selector "##{dom_id(comment)}"

    # Comments count should update
    assert_selector "#comments_count_#{@post.id}", text: "0"
  end

  test "notification appears in correct position" do
    visit post_path(@post)

    # Execute JavaScript to create a test notification
    execute_script("window.showNotification('Position Test', 'Test Title', 'info');")

    # Check that container appears with correct positioning
    container = find("#flash-notifications-container", wait: 3)

    # Should be fixed positioned
    assert_equal "fixed", container.style("position")["position"]

    # Should be in bottom-right area
    right_value = container.style("right")["right"]
    bottom_value = container.style("bottom")["bottom"]

    assert_equal "20px", right_value
    assert_equal "20px", bottom_value
  end

  test "notification auto-dismisses after timeout" do
    visit post_path(@post)

    execute_script("window.showNotification('Auto-dismiss Test', 'Test', 'info');")

    # Should appear
    assert_selector "#flash-notifications-container .max-w-lg",
                   text: "Auto-dismiss Test", wait: 3

    # Should disappear after timeout (5 seconds + animation)
    assert_no_selector "#flash-notifications-container .max-w-lg",
                      text: "Auto-dismiss Test", wait: 7
  end

  test "notification can be manually closed" do
    visit post_path(@post)

    execute_script("window.showNotification('Manual Close Test', 'Test', 'info');")

    # Should appear
    notification = find("#flash-notifications-container .max-w-lg",
                       text: "Manual Close Test", wait: 3)

    # Click close button
    within(notification) do
      find(".close-btn").click
    end

    # Should disappear quickly
    assert_no_selector "#flash-notifications-container .max-w-lg",
                      text: "Manual Close Test", wait: 1
  end

  test "multiple notifications stack correctly" do
    visit post_path(@post)

    # Create multiple notifications
    execute_script("""
      window.showNotification('First notification', 'First', 'success');
      setTimeout(() => window.showNotification('Second notification', 'Second', 'info'), 100);
      setTimeout(() => window.showNotification('Third notification', 'Third', 'warning'), 200);
    """)

    # All three should be visible
    assert_selector "#flash-notifications-container .max-w-lg", count: 3, wait: 3

    # Should contain expected text
    assert_selector "#flash-notifications-container", text: "First notification"
    assert_selector "#flash-notifications-container", text: "Second notification"
    assert_selector "#flash-notifications-container", text: "Third notification"
  end

  test "different notification types have correct styling" do
    visit post_path(@post)

    notification_types = [
      { type: "success", color: "border-green-400" },
      { type: "error", color: "border-red-400" },
      { type: "warning", color: "border-yellow-400" },
      { type: "info", color: "border-blue-400" },
      { type: "comment", color: "border-indigo-400" }
    ]

    notification_types.each do |notification_type|
      execute_script("window.showNotification('#{notification_type[:type]} message', '#{notification_type[:type]} title', '#{notification_type[:type]}');")

      assert_selector "#flash-notifications-container .#{notification_type[:color]}", wait: 3
      assert_selector "#flash-notifications-container", text: "#{notification_type[:type]} message"

      # Clean up for next iteration
      execute_script("document.getElementById('flash-notifications-container').remove();")
    end
  end

  test "handles missing showNotification function gracefully" do
    visit post_path(@post)

    # Remove the global function to test error handling
    execute_script("delete window.showNotification;")

    # Try to create a comment (should use fallback methods)
    assert_nothing_raised do
      fill_in "comment_author_name", with: "Error Test Author"
      fill_in "comment_content", with: "Error test comment"
      click_button "Publicar Comentario"

      # Comment should still be created even without the notification function
      assert_selector "##{dom_id(@post, :comments)}", text: "Error Test Author", wait: 5
    end
  end

  test "notification container is created only once" do
    visit post_path(@post)

    # Create multiple notifications
    3.times do |i|
      execute_script("window.showNotification('Notification #{i}', 'Test', 'info');")
    end

    # Should have only one container
    assert_selector "#flash-notifications-container", count: 1

    # But multiple notifications within it
    assert_selector "#flash-notifications-container .max-w-lg", count: 3
  end

  test "notification survives Turbo navigation" do
    visit posts_path

    execute_script("window.showNotification('Navigation Test', 'Test', 'info');")

    # Navigate to another page using Turbo
    click_link @post.title

    # Notification should still be visible (since it's positioned fixed)
    assert_selector "#flash-notifications-container .max-w-lg",
                   text: "Navigation Test", wait: 3
  end

  private

  def wait_for_turbo_stream
    # Helper method to wait for Turbo Stream actions to complete
    sleep 0.1 # Small delay to allow Turbo Stream to process
  end
end
