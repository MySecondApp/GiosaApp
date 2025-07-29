require "rubocop/rake_task"

RuboCop::RakeTask.new

namespace :rubocop do
  desc "Run RuboCop with auto-correct"
  task :fix do
    sh "bundle exec rubocop -A"
  end

  desc "Run RuboCop and generate report"
  task :report do
    sh "bundle exec rubocop --format html --out tmp/rubocop_report.html"
    puts "RuboCop report generated at tmp/rubocop_report.html"
  end
end
